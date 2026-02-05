import { existsSync } from "fs";
import { defineConfig } from "orval";

// Swagger/OpenAPI 명세 파일 경로
const SWAGGER_FILE_PATH = "./swagger.json";

// Fallback URL
const FALLBACK_OPENAPI_URL = "https://example.com/openapi.json";

export default defineConfig({
  api: {
    input: {
      // 로컬 파일이 있으면 사용, 없으면 fallback URL 사용
      target: existsSync(SWAGGER_FILE_PATH) ? SWAGGER_FILE_PATH : FALLBACK_OPENAPI_URL,
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      schemas: "./src/api/generated/models",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/lib/api/custom-instance.ts",
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
