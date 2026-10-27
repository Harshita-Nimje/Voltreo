"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const getToken = () =>
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const fetchNotifications = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Unable to fetch notifications.");
            }

            const data = await response.json();

            setNotifications(data.notifications || []);
            setUnreadCount(Number(data.unread_count) || 0);
        } catch (error) {
            console.error("Notification fetch error:", error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        fetchNotifications();

        socket.auth = { token };

        if (!socket.connected) {
            socket.connect();
        }

        const handleNewNotification = (notification) => {
            setNotifications((previous) => {
                if (
                    previous.some(
                        (item) => String(item.id) === String(notification.id)
                    )
                ) {
                    return previous;
                }

                return [notification, ...previous].slice(0, 50);
            });

            if (!notification.is_read) {
                setUnreadCount((previous) => previous + 1);
            }
        };

        const handleConnect = () => {
            fetchNotifications();
        };

        socket.on("notification_new", handleNewNotification);
        socket.on("connect", handleConnect);

        return () => {
            socket.off("notification_new", handleNewNotification);
            socket.off("connect", handleConnect);
        };
    }, [fetchNotifications]);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    async function markAsRead(notificationId) {
        const token = getToken();
        if (!token) return;

        const selected = notifications.find(
            (item) => String(item.id) === String(notificationId)
        );

        if (!selected || selected.is_read) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/notifications/${notificationId}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to mark notification as read.");
            }

            setNotifications((previous) =>
                previous.map((item) =>
                    String(item.id) === String(notificationId)
                        ? { ...item, is_read: true }
                        : item
                )
            );

            setUnreadCount((previous) => Math.max(0, previous - 1));
        } catch (error) {
            console.error("Mark as read error:", error.message);
        }
    }

    async function markAllAsRead() {
        const token = getToken();
        if (!token || unreadCount === 0) return;

        try {
            const response = await fetch(
                "http://localhost:5000/api/notifications/read-all",
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to mark notifications as read.");
            }

            setNotifications((previous) =>
                previous.map((item) => ({ ...item, is_read: true }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error("Mark all as read error:", error.message);
        }
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    const nextOpen = !isOpen;
                    setIsOpen(nextOpen);

                    if (nextOpen) {
                        fetchNotifications();
                    }
                }}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={isOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/75 transition hover:border-[#B8F28B]/30 hover:bg-[#B8F28B]/[0.07] hover:text-[#B8F28B]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#080D0B] bg-[#B8F28B] px-1 text-[10px] font-bold text-[#080D0B]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed left-3 right-3 top-16 z-[100] mx-auto w-auto max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0D1510] shadow-2xl shadow-black/50 sm:left-auto sm:right-4 sm:mx-0 lg:absolute lg:left-auto lg:right-0 lg:top-12 lg:w-[360px]">
                    <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                Notifications
                            </h3>
                            <p className="mt-1 text-xs text-white/40">
                                {unreadCount} unread
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-[#B8F28B] transition hover:text-white"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-white/45">
                                Loading notifications...
                            </p>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-white/40">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        aria-hidden="true"
                                    >
                                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                        <path d="M10 21h4" />
                                    </svg>
                                </span>
                                <p className="mt-3 text-sm text-white/70">
                                    You&apos;re all caught up
                                </p>
                                <p className="mt-1 text-xs text-white/35">
                                    New booking updates will appear here.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() =>
                                        markAsRead(notification.id)
                                    }
                                    className={`flex w-full gap-3 border-b border-white/[0.05] px-4 py-4 text-left transition hover:bg-white/[0.035] ${notification.is_read
                                        ? "opacity-65"
                                        : "bg-[#B8F28B]/[0.035]"
                                        }`}
                                >
                                    <span
                                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.is_read
                                            ? "bg-white/15"
                                            : "bg-[#B8F28B]"
                                            }`}
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-white">
                                            {notification.title}
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-white/55">
                                            {notification.message}
                                        </span>
                                        <span className="mt-2 block text-[10px] text-white/30">
                                            {new Date(
                                                notification.created_at
                                            ).toLocaleString()}
                                        </span>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}