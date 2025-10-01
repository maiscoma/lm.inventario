// frontend/src/contexts/NotificationContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Necesitarás exportar 'db' desde tu firebase-config.js
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', user.id),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const userNotifications = [];
                let unread = 0;
                querySnapshot.forEach((doc) => {
                    const notification = { id: doc.id, ...doc.data() };
                    userNotifications.push(notification);
                    if (!notification.read) {
                        unread++;
                    }
                });
                setNotifications(userNotifications);
                setUnreadCount(unread);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (notificationId) => {
        const docRef = doc(db, 'notifications', notificationId);
        await updateDoc(docRef, { read: true });
    };

    const markAllAsRead = async () => {
        notifications.forEach(notif => {
            if (!notif.read) markAsRead(notif.id);
        })
    }

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};