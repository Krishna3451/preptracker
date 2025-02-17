import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PenTool, Trophy, BarChart2, GraduationCap, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/learn', icon: BookOpen, label: 'Learn' },
    { path: '/test', icon: PenTool, label: 'Test Yourself' },
    { path: '/rank', icon: Trophy, label: 'Rank' },
    { path: '/reports', icon: BarChart2, label: 'Reports' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-4 py-6">
      <div className="flex items-center gap-2 mb-8 px-2">
        <GraduationCap className="w-8 h-8 text-indigo-600" />
        <span className="text-xl font-bold text-gray-800">PrepTrack</span>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;