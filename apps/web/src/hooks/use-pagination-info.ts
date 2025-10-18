interface UsePaginationInfoProps<T> {
  results: T[];
  status: "CanLoadMore" | "LoadingMore" | "LoadingFirstPage" | "Exhausted";
  search: {
    page: number;
    limit: number;
  };
  isLoading?: boolean;
}

export function usePaginationInfo<T>({
  results,
  status,
  search,
  isLoading,
}: UsePaginationInfoProps<T>) {
  const totalLoadedItems = results.length ?? 0;

  const currentPageItems = results.slice(
    (search.page - 1) * search.limit,
    search.page * search.limit
  );

  const canLoadMoreFromConvex = status === "CanLoadMore";
  const isExhausted = status === "Exhausted";

  let pageCount: number | undefined;

  if (isExhausted) {
    pageCount = Math.max(1, Math.ceil(totalLoadedItems / search.limit));
  } else {
    // Unknown total count yet, still loading from Convex
    pageCount = -1;
  }

  const canGoPrevious = search.page > 1;
  const canGoNext =
    (pageCount !== -1 && search.page < pageCount) ||
    (pageCount === -1 && canLoadMoreFromConvex);

  return {
    currentPageItems,
    isLoading,
    totalLoadedItems,
    canGoNext,
    canGoPrevious,
    pageCount,
    isExhausted,
    canLoadMoreFromConvex,
  };
}
