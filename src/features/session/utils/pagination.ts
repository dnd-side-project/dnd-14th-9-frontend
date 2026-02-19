export function parsePageParam(value: string | null | undefined): number {
  const parsedPage = Number(value);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return Math.floor(parsedPage);
}
