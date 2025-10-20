// frontend/src/components/NotificationBell.jsx

import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp?.seconds) return 'justo ahora';
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `hace ${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays}d`;
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-dark-card transition-colors"
                aria-label="Ver notificaciones"
            >
                <Bell size={20} className="text-text-secondary group-hover:text-text-primary" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white text-xs font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-10"></div>
                    <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20">
                        <div className="p-3 flex justify-between items-center border-b border-dark-border">
                            <h3 className="font-semibold text-text-primary">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <CheckCheck size={14} />
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <Link
                                        to={notif.link || '#'}
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`block p-3 hover:bg-dark-surface transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!notif.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>}

                                            {/* --- SOLUCIÓN PARA ALINEACIÓN --- */}
                                            <div className={`flex-1 ${notif.read ? 'pl-5' : ''}`}>
                                                <p className={`text-sm ${!notif.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-text-muted mt-1">{formatTimeAgo(notif.createdAt)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-6 text-center text-text-muted">
                                    <p>No tienes notificaciones.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;