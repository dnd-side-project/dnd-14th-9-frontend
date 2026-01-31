import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.join(__dirname, "token", "default-token.json");
const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

function isToken(node) {
  return (
    node &&
    typeof node === "object" &&
    (Object.prototype.hasOwnProperty.call(node, "value") ||
      Object.prototype.hasOwnProperty.call(node, "$value"))
  );
}

function flattenTokens(node, pathParts, out) {
  if (isToken(node)) {
    out.push({
      path: pathParts,
      type: node.type ?? node.$type,
    });
    return;
  }

  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    flattenTokens(value, [...pathParts, key], out);
  }
}

function toKebab(input) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function cssVar(pathParts) {
  return `var(--${toKebab(pathParts.join(" "))})`;
}

function lengthValue(token, varRef) {
  if (token.type === "dimension") return varRef;
  if (token.type === "number") return `calc(${varRef} * 1px)`;
  return varRef;
}

function setNested(target, pathParts, value) {
  if (pathParts.length === 0) return;
  let current = target;
  for (let i = 0; i < pathParts.length; i += 1) {
    const key = pathParts[i];
    if (i === pathParts.length - 1) {
      current[key] = value;
      return;
    }
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
}

const flat = [];
for (const [setName, setTokens] of Object.entries(tokens)) {
  if (setName.startsWith("$")) continue;
  if (!setTokens || typeof setTokens !== "object") continue;
  // Mirrors excludeParentKeys: drop the token-set name and merge contents.
  flattenTokens(setTokens, [], flat);
}

const colors = {};
const spacing = {};
const borderRadius = {};
const borderWidth = {};

for (const token of flat) {
  const [root, ...rest] = token.path;
  if (!root) continue;
  const varRef = cssVar(token.path);

  if (root === "color") {
    setNested(colors, rest, varRef);
    continue;
  }

  if (root === "layout" && rest[0] === "spacing") {
    setNested(spacing, rest.slice(1), lengthValue(token, varRef));
    continue;
  }

  if (root === "shape" && rest[0] === "radius") {
    setNested(borderRadius, rest.slice(1), lengthValue(token, varRef));
    continue;
  }

  if (root === "shape" && rest[0] === "border-width") {
    setNested(borderWidth, rest.slice(1), lengthValue(token, varRef));
  }
}

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius,
      borderWidth,
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default config;
