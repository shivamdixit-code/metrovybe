"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api";

function formatNotificationTime(date?: string) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const diff = Date.now() - value.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return value.toLocaleDateString();
}

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleNotificationClick(notification: AppNotification) {
    try {
      if (!notification.read) {
        await markNotificationRead(notification._id);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  async function handleMarkAllRead() {
    if (markingAll) return;

    setMarkingAll(true);

    try {
      await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="page profile-notifications-page notification-center-page">
      <Header />

      <main className="settings-page">
        <div className="settings-shell">
          <Link href="/profile" className="settings-back">
            <ArrowLeft size={17} />
            <span>Back to profile</span>
          </Link>

          <header className="settings-heading notification-center-heading">
            <div>
              <span className="settings-eyebrow">ACTIVITY</span>
              <h1>Notifications</h1>
              <p>Stay up to date with everything happening on MetroVybe.</p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-mark-all"
                onClick={handleMarkAllRead}
                disabled={markingAll}
              >
                {markingAll ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCheck size={16} />
                )}
                Mark all as read
              </button>
            )}
          </header>

          {loading ? (
            <div className="notification-center-loading">
              <Loader2 size={24} className="animate-spin" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty-state">
              <div className="notification-empty-icon">
                <Bell size={25} />
              </div>
              <h2>You&apos;re all caught up</h2>
              <p>New activity and updates will appear here.</p>
            </div>
          ) : (
            <section className="notification-list" aria-label="Notifications">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  className={`notification-item ${
                    notification.read ? "is-read" : "is-unread"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    <Bell size={18} />
                  </div>

                  <div className="notification-item-content">
                    <div className="notification-item-top">
                      <strong>{notification.title}</strong>
                      <time>{formatNotificationTime(notification.createdAt)}</time>
                    </div>
                    <p>{notification.body}</p>
                  </div>

                  {!notification.read && (
                    <span className="notification-unread-dot" aria-label="Unread" />
                  )}
                </button>
              ))}
            </section>
          )}
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
