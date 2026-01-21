import { defineConfig } from "orval";

export default defineConfig({
  gak: {
    input: {
      // TODO: 백엔드에서 제공하는 Swagger/OpenAPI 명세 URL 또는 파일 경로로 변경
      target: "./swagger.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      schemas: "./src/api/generated/models",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/lib/api-client.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
