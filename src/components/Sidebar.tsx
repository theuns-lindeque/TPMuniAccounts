'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Upload, 
  FilePieChart, 
  Settings, 
  Users,
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Reports', href: '/reports', icon: FilePieChart },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Handle mounting to avoid hydration mismatch for theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col relative z-20 group"
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <div className="w-6 h-6 border-2 border-teal-500 rounded-sm flex items-center justify-center font-mono font-bold text-teal-500 text-[10px] tracking-tighter shrink-0">
                TP
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">MuniAccounts</span>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
            >
                <div className="w-8 h-8 border-2 border-teal-500 rounded-sm flex items-center justify-center font-mono font-bold text-teal-500 text-xs tracking-tighter shrink-0">
                    TP
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Toggle (Top Right) */}
      <div className={`absolute top-4 right-[-14px] z-30`}>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:text-teal-500 transition-colors shadow-sm"
        >
          {mounted && (theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />)}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => onNavigate?.()}
            >
              <div className={`
                flex items-center gap-4 px-3 py-2.5 rounded-md transition-all group/item relative
                ${isActive 
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'}
              `}>
                <Icon size={18} className={`${isActive ? 'text-teal-500' : 'text-slate-400 group-hover/item:text-teal-500'} transition-colors shrink-0`} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-4 bg-teal-500 rounded-r-full" 
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Collapse Toggle */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-teal-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-all"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={16} /> Hide Sidebar</span>}
        </button>
      </div>

      {/* Blueprint decorative lines for sidebar */}
      <div className="absolute bottom-0 right-0 w-[1px] h-24 bg-teal-500/10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-24 h-[1px] bg-teal-500/10 pointer-events-none"></div>
    </motion.aside>
  );
};
