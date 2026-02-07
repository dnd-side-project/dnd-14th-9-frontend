// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: ["**/node_modules/**", ".next/**", "src/api/generated/**", "storybook-static/**"],
  },
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off", // TypeScript handles this
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
  prettierConfig,
]);

export default eslintConfig;
