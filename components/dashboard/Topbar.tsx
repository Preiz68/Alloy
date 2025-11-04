"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import IconButton from "./IconButton";
import { useThemeStore } from "@/store/usePostStore";
import { Moon, Sun } from "lucide-react";

const Topbar = ({ onSearch }: { onSearch?: (q: string) => void }) => {
  const [q, setQ] = useState("");
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-16 dark:bg-gray-900 dark:text-white bg-white/60 backdrop-blur-md flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 w-1/2">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch?.(q)}
            placeholder="Search developers, groups, projects..."
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <IconButton>
          <Bell />
        </IconButton>
        <IconButton>
          {theme === "light" ? (
            <Sun onClick={toggleTheme} />
          ) : (
            <Moon onClick={toggleTheme} />
          )}
        </IconButton>
        <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white">
          J
        </div>
      </div>
    </header>
  );
};

export default Topbar;
