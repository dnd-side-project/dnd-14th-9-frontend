import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

export function writeJson(filePath, value) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeText(filePath, value) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

export function appendJsonl(filePath, value) {
  ensureDir(dirname(filePath));
  appendFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

export function readJsonl(filePath) {
  try {
    const text = readFileSync(filePath, "utf8").trim();
    if (!text) return [];
    return text.split("\n").map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

export function writeAtomicJson(filePath, value) {
  ensureDir(dirname(filePath));
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, `${JSON.stringify(value)}\n`, "utf8");
  renameSync(tmpPath, filePath);
}

export function toCsvRow(values) {
  return values
    .map((value) => {
      if (value === null || value === undefined) return "";
      const text = String(value);
      if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
      return text;
    })
    .join(",");
}
