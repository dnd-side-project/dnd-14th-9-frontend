import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  // 서버 전용 msw/node 는 브라우저 빌드에서 실행되지 않지만 동적 import 체인으로
  // 번들 그래프에 포함되어 해석에 실패한다. Storybook 빌드에서만 stub 으로 대체한다.
  viteFinal(viteConfig) {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      "msw/node": fileURLToPath(new URL("./msw-node-stub.ts", import.meta.url)),
    };
    return viteConfig;
  },
};
export default config;
