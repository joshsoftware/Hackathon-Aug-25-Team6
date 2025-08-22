"use client";

import type React from "react";

import { Input } from "@/app/(components)/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/app/(lib)/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchInput({
  className,
  onSearch,
  ...props
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className={cn("pl-10", className)}
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
