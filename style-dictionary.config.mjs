import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import { tailwindV4Format } from "./style-dictionary/formats/tailwind-v4.mjs";

// Tokens Studio transforms 등록
register(StyleDictionary, { excludeParentKeys: true });

// Tailwind v4 커스텀 포맷 등록
StyleDictionary.registerFormat(tailwindV4Format);

// Style Dictionary 설정
const sd = new StyleDictionary({
  source: ["token/**/*.json"],
  preprocessors: ["tokens-studio"], // Tokens Studio 전처리기

  platforms: {
    tailwind: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab"],
      buildPath: "src/styles/tokens/",
      files: [
        {
          destination: "theme.css",
          format: "css/tailwind-theme",
          options: {
            outputReferences: true,
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
