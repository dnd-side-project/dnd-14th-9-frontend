export const ELLIPSIS = "..." as const;

const PAGE_SLOT_COUNT = 7;
const EDGE_VISIBLE_PAGE_COUNT = 5;
const EARLY_PAGE_THRESHOLD = 4;
const LATE_PAGE_OFFSET = 3;
const SIBLING_OFFSET = 1;

export type PageSlot = number | typeof ELLIPSIS;

export function getPageSlots(totalPage: number, currentPage: number): PageSlot[] {
  if (totalPage <= PAGE_SLOT_COUNT) {
    return Array.from({ length: totalPage }, (_, index) => index + 1);
  }

  // 항상 7개 슬롯을 유지해 페이지 전환 시 레이아웃 시프트를 방지한다.
  if (currentPage <= EARLY_PAGE_THRESHOLD) {
    const leadingPages = Array.from({ length: EDGE_VISIBLE_PAGE_COUNT }, (_, index) => index + 1);
    return [...leadingPages, ELLIPSIS, totalPage];
  }

  if (currentPage >= totalPage - LATE_PAGE_OFFSET) {
    const startPage = totalPage - EDGE_VISIBLE_PAGE_COUNT + 1;
    const trailingPages = Array.from(
      { length: EDGE_VISIBLE_PAGE_COUNT },
      (_, index) => startPage + index
    );
    return [1, ELLIPSIS, ...trailingPages];
  }

  return [
    1,
    ELLIPSIS,
    currentPage - SIBLING_OFFSET,
    currentPage,
    currentPage + SIBLING_OFFSET,
    ELLIPSIS,
    totalPage,
  ];
}
