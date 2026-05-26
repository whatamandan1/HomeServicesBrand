"use client";

import { useEffect, useMemo, useState } from "react";

export const DEFAULT_ADMIN_PAGE_SIZE = 10;
export const DEFAULT_ADMIN_TABLE_PAGE_SIZE = 15;

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export function matchesSearch(
  query: string,
  ...parts: (string | number | boolean | null | undefined)[]
) {
  if (!query) return true;
  const haystack = parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function useAdminListControls<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  pageSize = DEFAULT_ADMIN_PAGE_SIZE
) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const normalizedQuery = normalizeSearchQuery(query);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => searchFn(item, normalizedQuery));
  }, [items, normalizedQuery, searchFn]);

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, items.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, filtered.length);

  return {
    query,
    setQuery,
    page: safePage,
    setPage,
    pageSize,
    filtered,
    pageItems,
    totalCount: items.length,
    filteredCount: filtered.length,
    totalPages,
    showingFrom,
    showingTo,
  };
}

/** Keep a selected row visible even when it falls off the current results page. */
export function withPinnedItem<T extends { id: string }>(
  pageItems: T[],
  filtered: T[],
  pinnedId: string | null
) {
  if (!pinnedId || pageItems.some((item) => item.id === pinnedId)) return pageItems;
  const pinned = filtered.find((item) => item.id === pinnedId);
  return pinned ? [pinned, ...pageItems] : pageItems;
}
