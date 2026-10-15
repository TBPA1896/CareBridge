import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Bell, LogOut, User as UserIcon, ShieldAlert, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CLINICIAN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CAREGIVER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-navy-900 to-brand-700 bg-clip-text text-transparent">
              CareBridge
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-medium border-l border-slate-300 pl-2">
              Hospital to Home
            </span>
          </div>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-700 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 font-medium"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className={`p-3 text-xs cursor-pointer transition-colors ${
                              n.isRead ? 'bg-white opacity-70 hover:bg-slate-50' : 'bg-brand-50/40 hover:bg-brand-50/70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-semibold text-slate-900">{n.title}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-1">{n.message}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Tag */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.fullName}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border w-fit mt-0.5 ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors px-4 py-2 rounded-xl shadow-sm shadow-brand-600/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
