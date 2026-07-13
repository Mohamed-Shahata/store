"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getPaginationRange } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  const t = useTranslations("common");

  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label={t("pagination")}
    >
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={buildUrl(currentPage - 1)} aria-label={t("previousPage")}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </span>
        )}
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="icon"
          asChild={page !== currentPage}
          className={cn(page === currentPage && "pointer-events-none")}
        >
          {page === currentPage ? (
            <span>{page}</span>
          ) : (
            <Link href={buildUrl(page)}>{page}</Link>
          )}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildUrl(currentPage + 1)} aria-label={t("nextPage")}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        )}
      </Button>
    </nav>
  );
}
