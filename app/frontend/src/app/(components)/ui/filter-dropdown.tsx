"use client";

import { Button } from "@/app/(components)/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/(components)/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  checked: boolean;
}

interface FilterDropdownProps {
  title: string;
  options: FilterOption[];
  onFilterChange: (value: string, checked: boolean) => void;
}

export function FilterDropdown({
  title,
  options,
  onFilterChange,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={option.checked}
            onCheckedChange={(checked: boolean) => onFilterChange(option.value, checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
