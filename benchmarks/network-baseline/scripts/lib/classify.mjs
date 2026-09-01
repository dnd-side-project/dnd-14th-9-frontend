import { round, summarizeNumbers } from "./stats.mjs";

export const DUPLICATE_WINDOW_MS = 1500;
export const SELF_HOP_START_SLACK_MS = 25;

export function selfApiToBackendPath(selfPath) {
  if (typeof selfPath !== "string" || !selfPath.startsWith("/api/")) return null;
  const mapped = selfPath.slice(4);
  return mapped.startsWith("/") ? mapped : `/${mapped}`;
}

function eventStep(event) {
  return typeof event?.step === "string" && event.step.length > 0 ? event.step : "unassigned";
}

function identityKey(event) {
  return `${event.method} ${event.path}`;
}

function groupKey(event) {
  return `${event.scenario}::${event.run}::${event.method}::${event.path}`;
}

function collapseBy(items, keyFn) {
  const grouped = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, { ...item, runs: 1 });
      continue;
    }
    current.runs += 1;
    current.count = Math.max(current.count ?? 0, item.count ?? 0);
  }
  return [...grouped.values()].map((item) => {
    const copy = { ...item };
    delete copy.run;
    return copy;
  });
}

/**
 * Classify repeated method/path occurrences.
 *
 * - expectedRepeated: same run, different steps
 * - duplicateCandidate: same run, same step, count > 1
 * - retryCandidate: duplicateCandidate whose consecutive timestamps fall within 1500ms
 *
 * None of these labels assert that a retry or bug occurred.
 */
export function classifyRepeatedRequests(events, { windowMs = DUPLICATE_WINDOW_MS } = {}) {
  const byIdentity = new Map();
  for (const event of events) {
    const key = groupKey(event);
    if (!byIdentity.has(key)) byIdentity.set(key, []);
    byIdentity.get(key).push(event);
  }

  const expectedRepeated = [];
  const duplicateCandidates = [];
  const retryCandidates = [];

  for (const group of byIdentity.values()) {
    if (group.length < 2) continue;
    const steps = [...new Set(group.map(eventStep))];
    if (steps.length > 1) {
      expectedRepeated.push({
        key: identityKey(group[0]),
        scenario: group[0].scenario,
        run: group[0].run,
        steps,
        count: group.length,
      });
    }

    const byStep = new Map();
    for (const event of group) {
      const step = eventStep(event);
      if (!byStep.has(step)) byStep.set(step, []);
      byStep.get(step).push(event);
    }

    for (const [step, stepEvents] of byStep) {
      if (stepEvents.length < 2) continue;
      duplicateCandidates.push({
        key: identityKey(stepEvents[0]),
        scenario: stepEvents[0].scenario,
        run: stepEvents[0].run,
        step,
        count: stepEvents.length,
      });

      const sorted = [...stepEvents].sort((a, b) => a.startedAt - b.startedAt);
      for (let index = 1; index < sorted.length; index += 1) {
        const gapMs = sorted[index].startedAt - sorted[index - 1].startedAt;
        if (gapMs <= windowMs) {
          retryCandidates.push({
            key: identityKey(sorted[index]),
            scenario: sorted[index].scenario,
            run: sorted[index].run,
            step,
            gapMs,
            count: 2,
          });
        }
      }
    }
  }

  return {
    expectedRepeated: collapseBy(
      expectedRepeated,
      (item) => `${item.key}::${item.steps.join("|")}`
    ),
    duplicateCandidates: collapseBy(duplicateCandidates, (item) => `${item.key}::${item.step}`),
    retryCandidates: collapseBy(retryCandidates, (item) => `${item.key}::${item.step}`),
  };
}

function isNestedBackend(selfEvent, backendEvent, slackMs) {
  const selfEnd = selfEvent.startedAt + (selfEvent.durationMs ?? 0) + slackMs;
  return (
    backendEvent.startedAt >= selfEvent.startedAt - slackMs && backendEvent.startedAt <= selfEnd
  );
}

/**
 * Pair a self-api request with the backend request it likely caused.
 * Returns pairs only when exactly one backend event matches scenario/run/step/method/path/nesting.
 */
export function pairSelfHopEvents(
  selfEvents,
  backendEvents,
  { slackMs = SELF_HOP_START_SLACK_MS } = {}
) {
  const unused = backendEvents.map((event, index) => ({ event, index }));
  const pairs = [];
  let unmatchedSelfCount = 0;
  let ambiguousCount = 0;

  const sortedSelf = [...selfEvents].sort((a, b) => a.startedAt - b.startedAt);

  for (const selfEvent of sortedSelf) {
    const expectedPath = selfApiToBackendPath(selfEvent.path);
    if (!expectedPath) {
      unmatchedSelfCount += 1;
      continue;
    }

    const candidates = unused.filter(({ event }) => {
      if (event.scenario !== selfEvent.scenario) return false;
      if (event.run !== selfEvent.run) return false;
      if (eventStep(event) !== eventStep(selfEvent)) return false;
      if (event.method !== selfEvent.method) return false;
      if (event.path !== expectedPath) return false;
      return isNestedBackend(selfEvent, event, slackMs);
    });

    if (candidates.length !== 1) {
      if (candidates.length > 1) ambiguousCount += 1;
      else unmatchedSelfCount += 1;
      continue;
    }

    const matched = candidates[0];
    unused.splice(
      unused.findIndex((item) => item.index === matched.index),
      1
    );

    const selfApiDurationMs = selfEvent.durationMs ?? null;
    const backendDurationMs = matched.event.durationMs ?? null;
    const selfHopOverheadMs =
      typeof selfApiDurationMs === "number" && typeof backendDurationMs === "number"
        ? round(selfApiDurationMs - backendDurationMs)
        : null;

    pairs.push({
      scenario: selfEvent.scenario,
      run: selfEvent.run,
      step: eventStep(selfEvent),
      method: selfEvent.method,
      selfPath: selfEvent.path,
      backendPath: matched.event.path,
      selfApiDurationMs,
      backendDurationMs,
      selfHopOverheadMs,
    });
  }

  return {
    pairs,
    unmatchedSelfCount,
    ambiguousCount,
    pairingStatus:
      selfEvents.length === 0
        ? "no-self-api"
        : pairs.length === 0
          ? "Unable to pair reliably"
          : ambiguousCount > 0 && pairs.length < selfEvents.length
            ? "partial"
            : "paired",
  };
}

export function summarizeSelfHop(pairing) {
  if (!pairing || pairing.pairingStatus === "no-self-api") {
    return {
      pairingStatus: pairing?.pairingStatus ?? "no-self-api",
      count: 0,
      overheadMs: summarizeNumbers([]),
      pairs: [],
    };
  }
  if (pairing.pairingStatus === "Unable to pair reliably") {
    return {
      pairingStatus: "Unable to pair reliably",
      count: 0,
      overheadMs: summarizeNumbers([]),
      pairs: [],
    };
  }

  return {
    pairingStatus: pairing.pairingStatus,
    count: pairing.pairs.length,
    overheadMs: summarizeNumbers(
      pairing.pairs.map((pair) => pair.selfHopOverheadMs).filter((value) => value !== null)
    ),
    unmatchedSelfCount: pairing.unmatchedSelfCount,
    ambiguousCount: pairing.ambiguousCount,
    pairs: pairing.pairs,
  };
}

export function durationStats(events) {
  return summarizeNumbers(
    events.map((event) => event.durationMs).filter((value) => typeof value === "number")
  );
}
