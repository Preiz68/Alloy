"use client";

import { motion } from "framer-motion";
import { Home, BarChart3, PlusCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import CreateDropdown from "./CreateDropdown";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "create", label: "Create", icon: PlusCircle },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "more", label: "More", icon: MoreVertical },
];

const Sidebar = ({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handledropdownSelect = (selectedOption: string) => {
    setIsDropdownOpen(false);
    onChange(selectedOption);
  };

  return (
    <aside className="w-24 bg-white text-gray-700 p-6 flex flex-col items-center">
      <nav className="flex-1 flex flex-col mt-10 gap-3 p-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;

          if (id === "create") {
            return (
              <div key={id} className="relative">
                <motion.button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  whileHover={{ y: -2, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 250 }}
                  className="flex flex-col items-center gap-1 py-2 w-full"
                >
                  <Icon
                    className={`w-10 h-10 p-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-purple-100 text-purple-600 shadow-inner"
                        : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-purple-600" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </motion.button>

                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
                  >
                    <CreateDropdown
                      handledropdownSelect={handledropdownSelect}
                    />
                  </motion.div>
                )}
              </div>
            );
          }

          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                onChange(id);
              }}
              whileHover={{ y: -2, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="flex flex-col items-center gap-1 py-2 w-full"
            >
              <Icon
                className={`w-10 h-10 p-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-purple-100 text-purple-600 shadow-inner"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-purple-600" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
