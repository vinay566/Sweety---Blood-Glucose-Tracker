import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, FileText, Calendar, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-teal-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-800 tracking-tight leading-none">Sweety</span>
                <span className="text-xs text-teal-600 font-medium tracking-wide">Glucose Tracker</span>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/readings"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/readings')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Readings</span>
              </Link>
              <Link
                to="/reports"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/reports')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <UserIcon className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex justify-around border-t border-slate-100 py-2 bg-slate-50/50">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center px-3 py-1 text-xs font-medium ${
            isActive('/dashboard') ? 'text-teal-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          Dashboard
        </Link>
        <Link
          to="/readings"
          className={`flex flex-col items-center px-3 py-1 text-xs font-medium ${
            isActive('/readings') ? 'text-teal-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5 mb-1" />
          Readings
        </Link>
        <Link
          to="/reports"
          className={`flex flex-col items-center px-3 py-1 text-xs font-medium ${
            isActive('/reports') ? 'text-teal-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          Reports
        </Link>
      </div>
    </header>
  );
}
