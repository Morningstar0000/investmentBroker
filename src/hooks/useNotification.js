// hooks/useNotifications.js
import { useState, useEffect } from 'react';

export const useNotifications = (supabase, userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (!error) setUnreadCount(count);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          // Update unread count
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: `You have a new message from support`,
              icon: '/favicon.ico'
            });
          }
          
          // Add to notifications list
          setNotifications(prev => [...prev, {
            id: payload.new.id,
            message: 'New message from support',
            timestamp: new Date(),
            read: false
          }]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, userId]);

  return { notifications, unreadCount, setUnreadCount };
};