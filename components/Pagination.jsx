import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ handlePageChange, currentPage, totalPages }) => {
  return (
    <nav aria-label="Page navigation">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={`flex items-center py-2 px-3 ml-0 leading-tight text-muted bg-surface rounded-l-lg border border-hairline hover:bg-surface-alt hover:text-ink ${
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-4 h-4" />
          </a>
        </li>
        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i + 1);
              }}
              className={`py-2 px-3 leading-tight text-muted bg-surface border border-hairline hover:bg-surface-alt hover:text-ink ${
                currentPage === i + 1 ? "bg-brass-light/40 text-ink font-semibold" : ""
              }`}
            >
              {i + 1}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={`flex items-center py-2 px-3 leading-tight text-muted bg-surface rounded-r-lg border border-hairline hover:bg-surface-alt hover:text-ink ${
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
