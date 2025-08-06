import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";
import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  className?: string;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    showFirstLast = true,
    showPrevNext = true,
    siblingCount = 1,
    className 
  }, ref) => {
    const generatePageNumbers = () => {
      const pages: (number | string)[] = [];
      
      // Always show first page
      if (totalPages <= 1) return [1];
      
      // Calculate range
      const leftSibling = Math.max(currentPage - siblingCount, 1);
      const rightSibling = Math.min(currentPage + siblingCount, totalPages);
      
      // Show first page
      if (leftSibling > 2) {
        pages.push(1);
        if (leftSibling > 3) {
          pages.push('...');
        }
      }
      
      // Show page numbers in range
      for (let i = leftSibling; i <= rightSibling; i++) {
        pages.push(i);
      }
      
      // Show last page
      if (rightSibling < totalPages - 1) {
        if (rightSibling < totalPages - 2) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
      
      return pages;
    };

    const pageNumbers = generatePageNumbers();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center space-x-2",
          className
        )}
      >
        {/* First Page Button */}
        {showFirstLast && currentPage > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            className="text-gray-400 hover:text-white"
          >
            First
          </Button>
        )}

        {/* Previous Page Button */}
        {showPrevNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-8 h-8 text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={page === currentPage ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "w-8 h-8 p-0",
                  page === currentPage
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page Button */}
        {showPrevNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        )}

        {/* Last Page Button */}
        {showFirstLast && currentPage < totalPages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="text-gray-400 hover:text-white"
          >
            Last
          </Button>
        )}
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export { Pagination };