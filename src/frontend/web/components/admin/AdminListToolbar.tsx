"use client";

import { Search, X } from "lucide-react";

export type AdminListToolbarControls = {
  query: string;
  setQuery: (query: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalCount: number;
  filteredCount: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
};

type AdminListToolbarProps = {
  controls: AdminListToolbarControls;
  placeholder?: string;
  className?: string;
};

export function AdminListToolbar({
  controls,
  placeholder = "Search…",
  className = "",
}: AdminListToolbarProps) {
  const {
    query,
    setQuery,
    page,
    setPage,
    totalCount,
    filteredCount,
    totalPages,
    showingFrom,
    showingTo,
  } = controls;

  const showPagination = filteredCount > 0 && totalPages > 1;
  const showToolbar = totalCount > 0;

  if (!showToolbar) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="field-input w-full py-2 pl-9 pr-9"
          aria-label={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <p>
          {query ? (
            <>
              Showing {showingFrom}–{showingTo} of {filteredCount} match{filteredCount === 1 ? "" : "es"}
              {filteredCount !== totalCount && (
                <span className="text-stone-400"> (from {totalCount} total)</span>
              )}
            </>
          ) : (
            <>
              Showing {showingFrom}–{showingTo} of {totalCount}
            </>
          )}
        </p>

        {showPagination && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="tabular-nums text-stone-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
