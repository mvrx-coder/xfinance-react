/**
 * FilterableHeader Component
 * 
 * Header com filtro e ordenação (via popover)
 */

import type { Column } from "@tanstack/react-table";
import type { Inspection } from "@shared/schema";
import { ColumnFilter } from "../ColumnFilter";

interface FilterableHeaderProps {
  column: Column<Inspection, unknown> | undefined;
  children: React.ReactNode;
  className?: string;
}

export function FilterableHeader({ column, children, className }: FilterableHeaderProps) {
  if (!column) return <>{children}</>;
  
  return (
    <ColumnFilter column={column} className={className}>
      {children}
    </ColumnFilter>
  );
}
