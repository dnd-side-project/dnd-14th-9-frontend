import { existsSync } from "fs";

import { defineConfig } from "orval";

const SWAGGER_FILE_PATH = "./swagger.json";
const DEFAULT_OPENAPI_TARGET = "https://api.gak.today/v3/api-docs";
const ENV_OPENAPI_TARGET = process.env.ORVAL_OPENAPI_TARGET;
const USE_LOCAL_SWAGGER = process.env.ORVAL_USE_LOCAL_SWAGGER === "true";

const resolveOpenApiTarget = () => {
  if (ENV_OPENAPI_TARGET) {
    return ENV_OPENAPI_TARGET;
  }

  if (USE_LOCAL_SWAGGER && existsSync(SWAGGER_FILE_PATH)) {
    return SWAGGER_FILE_PATH;
  }

  return DEFAULT_OPENAPI_TARGET;
};

const API_GENERATED_TARGET = "./src/api/generated";
const API_GENERATED_SCHEMAS = "./src/api/generated/models";
const API_MUTATOR_PATH = "./src/lib/api/custom-instance.ts";
const REACT_QUERY_OPTIONS = {
  useQuery: true,
  useMutation: true,
  usePrefetch: true,
  useInvalidate: true,
  shouldExportQueryKey: true,
  shouldSplitQueryKey: true,
  signal: true,
  version: 5,
} as const;

export default defineConfig({
  api: {
    input: {
      target: resolveOpenApiTarget(),
    },
    output: {
      clean: true,
      mode: "tags-split",
      target: API_GENERATED_TARGET,
      schemas: API_GENERATED_SCHEMAS,
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: API_MUTATOR_PATH,
          name: "customInstance",
        },
        query: REACT_QUERY_OPTIONS,
      },
    },
  },
});
