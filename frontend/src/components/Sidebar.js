import React from 'react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'pos', label: 'Terminal', icon: 'terminal' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'menu', label: 'Menu', icon: 'menu' },
];

const icons = {
  terminal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  history: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
};

export default function Sidebar({ activeView, setActiveView }) {
  return (
    <div
      className="w-20 xl:w-64 h-screen fixed left-0 top-0 border-r border-cafe-border bg-cafe-bg flex flex-col z-40"
      data-testid="sidebar"
    >
      <div className="p-4 xl:p-6 border-b border-cafe-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cafe-primary flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5A2,2 0 0,0 20,3Z"/>
            </svg>
          </div>
          <span className="hidden xl:block font-heading font-medium text-lg text-cafe-text tracking-tight">
            Cafe POS
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 xl:p-4 flex flex-col gap-1" data-testid="sidebar-nav">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            data-testid={`nav-${item.id}`}
            className={`relative flex items-center gap-3 px-3 py-3 xl:px-4 rounded-xl transition-colors duration-200 group
              ${activeView === item.id
                ? 'bg-cafe-text text-white'
                : 'text-cafe-text-muted hover:bg-cafe-border/50'
              }`}
            whileTap={{ scale: 0.97 }}
          >
            <span className="flex-shrink-0">{icons[item.icon]}</span>
            <span className="hidden xl:block font-heading font-medium text-sm">
              {item.label}
            </span>
          </motion.button>
        ))}
      </nav>

      <div className="p-4 xl:p-6 border-t border-cafe-border">
        <p className="hidden xl:block text-xs text-cafe-text-muted font-body">
          Cafe Bill Generator
        </p>
      </div>
    </div>
  );
}
