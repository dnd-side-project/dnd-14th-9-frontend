type SearchParamsLike = Pick<URLSearchParams, "toString">;

export type SessionSearchParamUpdates = Record<string, string | null>;

interface UpdateSessionSearchParamsOptions {
  resetPage?: boolean;
  emptyPath?: string;
}

const DEFAULT_OPTIONS: Required<UpdateSessionSearchParamsOptions> = {
  resetPage: true,
  emptyPath: "/",
};

export function buildUpdatedSessionSearchHref(
  currentSearchParams: SearchParamsLike,
  updates: SessionSearchParamUpdates,
  options: UpdateSessionSearchParamsOptions = DEFAULT_OPTIONS
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const params = new URLSearchParams(currentSearchParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  if (mergedOptions.resetPage) {
    params.delete("page");
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : mergedOptions.emptyPath;
}
