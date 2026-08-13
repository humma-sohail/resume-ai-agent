import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Bot,
  Sparkles,
  Crown,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard
  },
  {
    id: "parser",
    name: "Resume Parser",
    icon: FileText
  },
  {
    id: "chat",
    name: "RAG AI Chat",
    icon: Bot
  }
];

function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const ToggleIcon = collapsed ? ChevronsRight : ChevronsLeft;

  return (
    <aside className={`flex h-screen max-h-screen shrink-0 flex-col justify-between overflow-hidden ${collapsed ? 'w-16' : 'w-[260px]'} bg-[#111827] border-r border-white/10 transition-all duration-300 ease-in-out`}>
      <div className="flex h-full min-h-0 flex-col justify-between px-3 py-5">
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center text-white shadow-lg shadow-[#7C5CFC]/30">
                <Sparkles size={20} />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                    FutureCV AI
                  </h1>
                  <p className="text-[11px] text-[#A78BFA] font-medium tracking-wide uppercase">
                    RAG AI Assistant
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-xl bg-white/5 p-2 text-gray-300 hover:bg-white/10 transition"
            >
              <ToggleIcon size={18} />
            </button>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const buttonClass = `w-full text-left flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/25' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-pressed={isActive}
                  className={buttonClass}
                >
                  <Icon size={19} />
                  {!collapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`mt-auto shrink-0 rounded-2xl ${collapsed ? 'p-3' : 'p-4'} bg-gradient-to-b from-[#7C5CFC]/20 to-[#1A1F35] border border-[#7C5CFC]/30 text-center relative overflow-hidden transition-all duration-300`}>
          <div className="w-8 h-8 rounded-full bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 flex items-center justify-center mx-auto mb-2 text-[#A78BFA]">
            <Crown size={18} />
          </div>
          {!collapsed ? (
            <>
              <h3 className="font-semibold text-white text-sm">Active Services</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Gateway (5000) • Resume (5001) • AI (5002)
              </p>
            </>
          ) : (
            <span className="sr-only">Active Services</span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
