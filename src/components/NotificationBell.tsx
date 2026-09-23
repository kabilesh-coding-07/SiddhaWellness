'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface NotificationItem {
    id: string;
    type: 'APPOINTMENT_CONFIRMED' | 'BOOKING_RECEIVED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_REJECTED';
    title: string;
    message: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorName: string;
    date: string;
    time: string;
    timestamp: string;
    channel?: {
        smsStatus: string;
        emailStatus: string;
    };
    read?: boolean;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState<NotificationItem | null>(null);
    const prevIdsRef = useRef<Set<string>>(new Set());
    const panelRef = useRef<HTMLDivElement>(null);

    const loadNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications/send');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.notifications)) {
                    setNotifications(data.notifications);

                    // Check for new notifications to trigger live toast
                    if (prevIdsRef.current.size > 0) {
                        for (const n of data.notifications) {
                            if (!prevIdsRef.current.has(n.id)) {
                                setToast(n);
                                setTimeout(() => setToast(null), 6000);
                                break;
                            }
                        }
                    }

                    const newSet = new Set<string>();
                    data.notifications.forEach((n: NotificationItem) => newSet.add(n.id));
                    prevIdsRef.current = newSet;
                }
            }
        } catch { }
    }, []);

    useEffect(() => {
        loadNotifications();

        const onSync = () => loadNotifications();
        window.addEventListener('siddha_sync', onSync);
        window.addEventListener('storage', onSync);
        window.addEventListener('focus', onSync);

        const timer = setInterval(() => {
            loadNotifications();
        }, 4000);

        return () => {
            window.removeEventListener('siddha_sync', onSync);
            window.removeEventListener('storage', onSync);
            window.removeEventListener('focus', onSync);
            clearInterval(timer);
        };
    }, [loadNotifications]);

    // Close panel on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl transition-all cursor-pointer hover:bg-emerald-950/40"
                style={{
                    background: open ? 'rgba(4,120,87,0.2)' : 'rgba(4,120,87,0.08)',
                    border: '1px solid rgba(4,120,87,0.2)',
                    color: '#34d399',
                }}
                title="Notifications & Alerts"
            >
                <span className="text-lg">🔔</span>
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {open && (
                <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                        background: '#0d1411',
                        border: '1px solid rgba(4,120,87,0.3)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'rgba(4,120,87,0.15)' }}>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>Notification Center</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(4,120,87,0.2)', color: '#34d399' }}>
                                SMS & Email Logs
                            </span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-xs text-gray-400 hover:text-white cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                            <p className="text-xs text-center py-6" style={{ color: '#6b8f7e' }}>
                                No notifications yet.
                            </p>
                        ) : (
                            notifications.map((n) => {
                                const isConfirmed = n.type === 'APPOINTMENT_CONFIRMED';
                                const isCancelled = n.type === 'APPOINTMENT_CANCELLED' || n.type === 'APPOINTMENT_REJECTED';
                                const badgeColor = isConfirmed ? '#22c55e' : isCancelled ? '#ef4444' : '#eab308';

                                return (
                                    <div
                                        key={n.id}
                                        className="p-3 rounded-xl transition-all text-left"
                                        style={{
                                            background: 'rgba(4,120,87,0.06)',
                                            border: `1px solid ${badgeColor}33`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-xs" style={{ color: badgeColor }}>
                                                {n.title}
                                            </span>
                                            <span className="text-[10px]" style={{ color: '#6b8f7e' }}>
                                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs line-clamp-2" style={{ color: '#f0fdf4' }}>
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t text-[10px]" style={{ borderColor: 'rgba(4,120,87,0.1)', color: '#a7c4b8' }}>
                                            <span>📱 SMS: {n.patientPhone || 'Sent'}</span>
                                            <span>·</span>
                                            <span>✉️ Mail: {n.patientEmail || 'Sent'}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Live Floating Toast Popup */}
            {toast && (
                <div
                    className="fixed bottom-6 right-6 max-w-sm rounded-2xl shadow-2xl p-4 z-50 flex items-start gap-3 animate-bounce-short"
                    style={{
                        background: '#0d1411',
                        border: '1px solid #059669',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    }}
                >
                    <span className="text-2xl">
                        {toast.type === 'APPOINTMENT_CONFIRMED' ? '🎉' : toast.type.includes('CANCEL') ? '⚠️' : '📋'}
                    </span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm" style={{ color: '#34d399' }}>
                                {toast.title}
                            </h4>
                            <button onClick={() => setToast(null)} className="text-xs text-gray-400 hover:text-white cursor-pointer">
                                ✕
                            </button>
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#f0fdf4' }}>
                            {toast.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: '#6b8f7e' }}>
                            <span>SMS to {toast.patientPhone}</span>
                            <span>·</span>
                            <span>Email to {toast.patientEmail}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
