"use client";

import { UserButton } from "@clerk/nextjs";
import qs from "query-string";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation"; // Updated import for Next.js 13+
import { ChangeEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

// Custom useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    // Only proceed if debouncedValue is a valid string
    if (typeof debouncedValue === "string") {
      const url = qs.stringifyUrl(
        {
          url: "/",
          query: {
            search: debouncedValue,
          },
        },
        { skipEmptyString: true, skipNull: true }
      );

      router.push(url);
    }
  }, [debouncedValue, router]);

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        className="w-full max-w-[516px] pl-9"
        placeholder="Search boards"
        onChange={handleChange}
        value={value}
      />
    </div>
  );
};
