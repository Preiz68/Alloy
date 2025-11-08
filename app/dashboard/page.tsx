"use client";

import React, { JSX, useEffect, useState } from "react";
import ProjectGroupsSection from "@/components/dashboard/ProjectGroup";
import CommunitySection from "@/components/dashboard/Community";
import Topbar from "@/components/dashboard/Topbar";
import Sidebar from "@/components/dashboard/Sidebar";
import FeedSection from "@/components/dashboard/Feed";
import ProgressSection from "@/components/dashboard/Progress";
import ProfileSection from "@/components/dashboard/Profile";
import SidebarWidgets from "@/components/dashboard/RightbarWidget";
import { useThemeStore } from "@/store/usePostStore";
import { Sparkles, Flame, Filter, Compass, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { redirect } from "next/navigation";

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { initializeTheme } = useThemeStore();

  const user = useAuth();

  useEffect(() => {
    if (!user) {
      redirect("/login");
    }
  }, [user]);

  const [filters] = useState([
    "Beginner Friendly",
    "Remote",
    "Frontend",
    "Open Roles",
  ]);

  const projects = [
    "Building a Landing Page",
    "Change UI of an existing Dashboard",
    "Working on One pipe website",
  ];

  const suggestedGroups = [
    { id: 1, name: "React Dev Hub", roleNeeded: "Frontend Developer" },
    { id: 2, name: "AI UI Designers", roleNeeded: "Product Designer" },
  ];

  const trendingCommunities = [
    { id: 1, name: "Next.js Masters", members: 240 },
    { id: 3, name: "Freelance Squad", members: 80 },
  ];

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // ---------- Expanded Sidebar ----------
  const ExpandedSidebar = () => {
    switch (activeSection) {
      case "home":
        return (
          <aside className="hidden lg:block lg:w-80 bg-white text-gray-800 p-4 shadow-lg border border-gray-200 backdrop-blur-md max-h-full h-screen mt-20 overflow-y-auto">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg border border-purple-200 px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400 transition">
              <Compass size={18} className="text-purple-500 shrink-0" />
              <input
                type="text"
                placeholder="Find matching roles, communities..."
                className="bg-transparent focus:outline-none w-full text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="mt-5">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Filter size={16} />
                <span className="text-sm font-semibold">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-medium transition"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="mt-7">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-purple-700">
                  AI Matches for You
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {suggestedGroups.map((group) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={group.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <p className="font-medium text-gray-800 text-sm">
                      {group.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {group.roleNeeded}
                    </span>
                    <button className="text-xs text-purple-600 hover:underline mt-1 block">
                      View Group
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trending Communities */}
            <div className="mt-7">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-orange-700">
                  Trending Communities
                </h3>
              </div>
              {trendingCommunities.map((c) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={c.id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-2 mb-2 hover:shadow-sm transition"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {c.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {c.members} members
                    </span>
                  </div>
                  <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md">
                    Join
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-10 space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Start New Project
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-purple-700 py-2 rounded-lg font-medium transition"
              >
                Invite Teammates
              </motion.button>
            </div>
          </aside>
        );
      // case "projectGroup":
      //   return (
      //     <aside className="hidden lg:block lg:w-80 bg-white text-gray-800 p-4 shadow-lg border border-gray-200 backdrop-blur-md max-h-full h-screen mt-20 overflow-y-auto">
      //       <div>
      //         <ul>
      //           {projects.map((project) => (
      //             <li className="text-gray-400" key={project}>
      //               #{project}
      //             </li>
      //           ))}
      //         </ul>
      //       </div>
      //     </aside>
      //   );
      default:
        break;
    }
  };

  // ---------- Main Section Components ----------
  const sectionComponents: Record<string, JSX.Element> = {
    home: <FeedSection />,
    community: <CommunitySection />,
    progress: <ProgressSection />,
    projectGroup: <ProjectGroupsSection />,
    profile: <ProfileSection />,
    projects: (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        Projects coming soon.
      </div>
    ),
    leaderboard: (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        Leaderboard coming soon.
      </div>
    ),
  };

  const renderMainContent = (): JSX.Element => sectionComponents[activeSection];

  // ---------- Layout ----------
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar active={activeSection} onChange={setActiveSection} />

      {/* Expanded Sidebar (hidden on mobile) */}
      <ExpandedSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Feed / Main Area */}
            <div className="xl:col-span-2">{renderMainContent()}</div>

            {/* Right Sidebar Widgets */}
            <div className="hidden md:block">
              <SidebarWidgets />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
