import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-line pt-6"
    >
      <p className="text-sm text-ink-muted">
        Page <span className="font-medium text-ink">{page}</span> of{" "}
        <span className="font-medium text-ink">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
