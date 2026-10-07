'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notification.service';
import { NotificationItem, NotificationType } from '@/types/notification';
import { useSocket } from '@/context/SocketContext';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const router = useRouter();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count from REST API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      if (res?.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Graceful fallback for unauthenticated / network errors
    }
  }, []);

  // Fetch notifications list from REST API
  const fetchNotificationsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications({ limit: 15 });
      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Initial unread count fetch on component mount (REST fallback)
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // 2. Real-time Socket.IO delivery (replaces polling interval)
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif: NotificationItem) => {
      if (!newNotif || !newNotif._id) return;

      // Prepend to notifications list, avoiding duplicates
      setNotifications((prev) => {
        const alreadyPresent = prev.some((item) => item._id === newNotif._id);
        if (alreadyPresent) return prev;
        return [newNotif, ...prev];
      });

      // Instantly increment unread counter
      if (!newNotif.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  // 3. Reconnection sync: When socket recovers from network drop, refresh state from REST
  useEffect(() => {
    const handleReconnect = () => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotificationsList();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('socket:reconnected', handleReconnect);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('socket:reconnected', handleReconnect);
      }
    };
  }, [fetchUnreadCount, fetchNotificationsList, isOpen]);

  // 4. When dropdown opens, fetch latest list and refresh count
  useEffect(() => {
    if (isOpen) {
      fetchNotificationsList();
    }
  }, [isOpen, fetchNotificationsList]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle Mark as Read for single notification
  const handleMarkAsRead = async (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    if (notif.isRead) return;

    try {
      await markNotificationAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notif._id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  // Handle Mark All as Read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 && notifications.every((n) => n.isRead)) return;

    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Handle click on notification card
  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notif._id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }

    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Render type-specific icon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'EXAM_PUBLISHED':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'EXAM_REGISTRATION':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT_SUCCESS':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'HALL_TICKET':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'LEAVE_SUBMITTED':
        return <Clock className="w-4 h-4 text-sky-600" />;
      case 'LEAVE_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'LEAVE_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'RESULT_PUBLISHED':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'ATTENDANCE_WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'TIMETABLE_ASSIGNED':
      case 'TIMETABLE_UPDATED':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Notification Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#23804A]/20"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-in fade-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-[#F8FAF9] border-b border-[#E3EAE5] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#171D19]">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#23804A]/10 text-[#23804A] rounded-full">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200/70 text-slate-600 rounded-full">
                  Caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-[#23804A] hover:text-[#175C34] hover:underline flex items-center space-x-1 transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <div className="inline-block w-6 h-6 border-2 border-[#23804A] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You will be notified about exams, fees, results, and updates here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 flex items-start space-x-3 transition-colors cursor-pointer group hover:bg-slate-50 ${
                    !notif.isRead ? 'bg-emerald-50/30' : 'bg-white'
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100/80 shrink-0 group-hover:bg-white group-hover:shadow-xs transition-all">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs truncate ${!notif.isRead ? 'font-bold text-[#171D19]' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="mt-1 flex items-center text-[10px] font-semibold text-[#23804A] group-hover:underline">
                        <span>View details</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                      </div>
                    )}
                  </div>

                  {/* Actions / Read Indicator */}
                  <div className="shrink-0 flex items-center pl-1 pt-1">
                    {!notif.isRead ? (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notif)}
                        className="w-5 h-5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-all cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Markaz Integrated Studies Council (MISC)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
