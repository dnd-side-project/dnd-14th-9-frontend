import { readFile } from "node:fs/promises";
import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import { tailwindV4Format } from "./style-dictionary/formats/tailwind-v4.mjs";

// Tokens Studio transforms 등록
register(StyleDictionary);

// Tailwind v4 커스텀 포맷 등록
StyleDictionary.registerFormat(tailwindV4Format);

const rawTokens = JSON.parse(await readFile("tokens/default-token.json", "utf-8"));
const primitiveTokens = rawTokens["primitive/value"];
const lightTokens = rawTokens["semantic/light"];
const darkTokens = rawTokens["semantic/dark"];

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const isTokenLeaf = (value) => isObject(value) && "value" in value && "type" in value;

const mergeDeep = (base, override) => {
  if (!isObject(base)) return structuredClone(override);
  const out = structuredClone(base);
  if (!isObject(override)) return out;

  for (const [key, value] of Object.entries(override)) {
    if (isTokenLeaf(value)) {
      out[key] = value;
      continue;
    }
    out[key] = mergeDeep(out[key] ?? {}, value);
  }

  return out;
};

const tagTokens = (tokens, setName) => {
  if (!isObject(tokens)) return tokens;
  const out = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (isTokenLeaf(value)) {
      const extensions = isObject(value.$extensions) ? structuredClone(value.$extensions) : {};
      out[key] = {
        ...value,
        $extensions: {
          ...extensions,
          dnd: { ...(extensions.dnd ?? {}), set: setName },
        },
      };
      continue;
    }

    out[key] = tagTokens(value, setName);
  }

  return out;
};

const buildTokens = async ({ tokens, destination, formatOptions }) => {
  const sd = new StyleDictionary({
    tokens,
    preprocessors: ["tokens-studio"], // Tokens Studio 전처리기

    platforms: {
      tailwind: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "src/styles/tokens/",
        files: [
          {
            destination,
            format: "css/tailwind-theme",
            options: {
              outputReferences: true,
              ...formatOptions,
            },
          },
        ],
      },
    },

    log: {
      warnings: "warn",
      verbosity: "verbose",
      errors: {
        brokenReferences: "console",
      },
    },
  });

  await sd.buildAllPlatforms();
};

// 다크 테마를 기본값으로 생성
await buildTokens({
  tokens: mergeDeep(primitiveTokens, darkTokens),
  destination: "theme.css",
  formatOptions: { useThemeAtRule: true },
});

// 라이트 테마 오버라이드
await buildTokens({
  tokens: mergeDeep(tagTokens(primitiveTokens, "primitive"), tagTokens(lightTokens, "light")),
  destination: "theme-light.css",
  formatOptions: {
    useThemeAtRule: false,
    selector: ".light",
    tokenFilter: (token) => token.$extensions?.dnd?.set === "light" && token.path?.[0] === "color",
  },
});
