import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiLogOut, FiChevronDown, FiChevronUp } from "react-icons/fi";
import fpWhiteLogo from "../assets/FPWHITE.webp";

export default function AdminSidebar({
  menuItems,
  activeMenu,
  onMenuClick,
  user,
  onLogout,
}) {
  // Load initial expanded state from localStorage or default to true on large screens
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("adminSidebarExpanded");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.innerWidth >= 1024;
  });

  // State for expanding/collapsing grouped menus
  const [openGroups, setOpenGroups] = useState({ "master-data": false });

  const toggleGroup = (groupId) => {
    if (!isExpanded) {
      setIsExpanded(true); // Automatically expand the whole sidebar if collapsed
    }
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Handle window resize for tablet default collapsed behavior
  useEffect(() => {
    const handleResize = () => {
      // If tablet, default to collapsed unless user explicitly expanded recently
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        if (localStorage.getItem("adminSidebarExpanded") === null) {
          setIsExpanded(false);
        }
      } else if (window.innerWidth >= 1024) {
        if (localStorage.getItem("adminSidebarExpanded") === null) {
          setIsExpanded(true);
        }
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("adminSidebarExpanded", JSON.stringify(newState));
  };

  return (
    <>
      {/* ── Desktop & Tablet Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 240 : 64,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-[#0f1117] border-r border-white/5 h-full shrink-0 relative z-20 overflow-visible"
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-[#1a1c23] border border-white/10 text-gray-400 hover:text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-lg z-30"
        >
          {isExpanded ? (
            <FiChevronLeft size={14} />
          ) : (
            <FiChevronRight size={14} />
          )}
        </button>

        {/* Brand */}
        <div className="h-20 flex items-center border-b border-white/5 shrink-0 overflow-hidden px-4">
          <div className="flex items-center min-w-[200px]">
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
              <img
                src={fpWhiteLogo}
                alt="FP Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 whitespace-nowrap"
                >
                  <p className="font-oswald text-lg font-bold tracking-[0.01em] text-accent-teal leading-none mt-3">
                    FREEPIG MOVEMENT
                  </p>
                  <p className="text-[9px] text-gray-500 tracking-widest mt-0.5 uppercase">
                    Admin Panel
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {menuItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isGroupActive = hasSubItems && item.subItems.some((sub) => sub.id === activeMenu);
            const isActive = !hasSubItems && activeMenu === item.id;
            const Icon = item.icon;
            
            return (
              <div key={item.id} className="flex flex-col gap-1">
                <button
                  onClick={() => hasSubItems ? toggleGroup(item.id) : onMenuClick(item.id)}
                  title={!isExpanded ? item.label : undefined}
                  className={`flex items-center rounded-xl p-3 transition-colors relative group ${
                    isActive || isGroupActive
                      ? "bg-accent-teal/10 text-accent-teal"
                      : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <div className="shrink-0 flex items-center justify-center w-5 h-5">
                    <Icon size={18} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 flex-1 flex justify-between items-center overflow-hidden whitespace-nowrap"
                      >
                        <span className="text-xs font-bold tracking-wide">
                          {item.label}
                        </span>
                        {hasSubItems && (
                          <div className="text-gray-500 ml-2">
                            {openGroups[item.id] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-[#1a1c23] border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>

                {/* SubItems Rendering */}
                <AnimatePresence>
                  {hasSubItems && isExpanded && openGroups[item.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-1 ml-4 border-l border-white/10 pl-2 overflow-hidden"
                    >
                      {item.subItems.map((subItem) => {
                        const isSubActive = activeMenu === subItem.id;
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => onMenuClick(subItem.id)}
                            className={`flex items-center rounded-xl p-2.5 transition-colors relative group ${
                              isSubActive
                                ? "text-white bg-white/5"
                                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                            }`}
                          >
                            <div className="shrink-0 flex items-center justify-center w-4 h-4 mr-3">
                              <SubIcon size={14} />
                            </div>
                            <span className="text-[11px] font-bold tracking-wide">
                              {subItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-white/5 shrink-0 overflow-hidden">
          <div className="flex items-center min-w-[200px] mb-2 p-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-xs shrink-0 uppercase">
              {user?.name?.charAt(0) || "A"}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3 overflow-hidden whitespace-nowrap"
                >
                  <p className="text-xs text-gray-300 font-medium truncate w-[140px]">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-gray-600 truncate w-[140px]">
                    {user?.email || ""}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onLogout}
            title={!isExpanded ? "Logout" : undefined}
            className={`w-full flex items-center p-3 rounded-xl transition-colors text-red-400 hover:bg-red-500/10 group ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <FiLogOut size={16} className="shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3 overflow-hidden whitespace-nowrap"
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    Logout
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f1117]/95 backdrop-blur-md border-t border-white/10 z-50 px-2 py-2 pb-safe flex justify-between items-center overflow-x-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg transition-colors ${
                isActive
                  ? "text-accent-teal"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <div
                className={`mb-1 transition-transform ${isActive ? "scale-110" : ""}`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[9px] font-bold tracking-wider truncate max-w-[56px] text-center">
                {item.label}
              </span>
            </button>
          );
        })}
        {/* Mobile Logout Button */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <div className="mb-1 transition-transform">
            <FiLogOut size={20} />
          </div>
          <span className="text-[9px] font-bold tracking-wider truncate max-w-[56px] text-center">
            LOGOUT
          </span>
        </button>
      </nav>
    </>
  );
}
