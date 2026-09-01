#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { writeAggregates } from "./lib/aggregate.mjs";
import { writeReport } from "./lib/report.mjs";

const outputDir = path.resolve(process.cwd(), "benchmarks/network-baseline");
const environment = JSON.parse(readFileSync(path.join(outputDir, "environment.json"), "utf8"));
const fixtures = JSON.parse(readFileSync(path.join(outputDir, "fixtures.json"), "utf8"));
const blockers = existsSync(path.join(outputDir, "blockers.json"))
  ? JSON.parse(readFileSync(path.join(outputDir, "blockers.json"), "utf8"))
  : [];
const notes = existsSync(path.join(outputDir, "notes.json"))
  ? JSON.parse(readFileSync(path.join(outputDir, "notes.json"), "utf8"))
  : ["Regenerated from existing raw JSONL."];
const summary = writeAggregates({
  outputDir,
  fixtures,
  blockers,
  environment,
});
writeReport({
  outputDir,
  summary,
  environment,
  fixtures,
  blockers,
  notes,
});
