"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import TradingPage from './AccountPage';
import { MessageCircle, Shield } from '../components/ui/Icons';
import ChatBox from './ChatBox';
import ChatTrigger from '../components/ChatTrigger'; // Add this import
import Footer from './Footer';

export default function Layout({ children, user, onLogout, onNavigate, currentPage, supabase }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Add this state
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] = useState();

  const navigation = [
    {
      name: 'Home',
      page: 'home',
      type: 'link'
    },
    {
      name: 'Company',
      page: 'company',
      type: 'dropdown',
      items: [
        { name: 'About Us', page: 'about' },
        { name: 'Regulations', page: 'regulations' },
        { name: 'Client Protection', page: 'clients-protection' },
      ]
    },
    {
      name: 'Trading',
      page: 'trading',
      type: 'dropdown',
      items: [
        { name: 'Copy Trading Account', page: 'accounts' },
        { name: 'Deposit and Withdrawal', page: 'deposit-withdrawal' },
      ]
    },
    {
      name: 'Markets',
      page: 'markets',
      type: 'dropdown',
      items: [
        { name: 'Forex', page: 'forex' },
        { name: 'Cryptocurrency', page: 'crypto' },
        { name: 'Commodities', page: 'commodities' }
      ]
    }
  ];

  const handleNavClick = (page) => {
    onNavigate(page);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const handleDropdownItemClick = (page) => {
    handleNavClick(page);
    setActiveDropdown(null);
  };

  // Function to fetch unread messages count
  const fetchUnreadCount = async () => {
    if (!user || !currentRoom) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('room_id', currentRoom.id)
        .eq('is_read', false)
        .neq('sender_id', user.id); // Only count messages NOT sent by current user

      if (error) throw error;
      
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Function to find or create chat room for the user
  const initializeUserRoom = async () => {
    if (!user) return;

    try {
      // Check for existing room
      const { data: existingRooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('last_message_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let room;
      if (existingRooms && existingRooms.length > 0) {
        room = existingRooms[0];
      } else {
        // Create new room if none exists
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert([{
            user_id: user.id,
            room_name: `Support - ${user.email}`,
            status: 'open',
            priority: 'normal'
          }])
          .select()
          .single();

        if (createError) throw createError;
        room = newRoom;
      }

      setCurrentRoom(room);
    } catch (error) {
      console.error('Error initializing user room:', error);
    }
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user || !currentRoom) return;

    // Fetch initial unread count
    fetchUnreadCount();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`unread_messages_${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        }, 
        (payload) => {
          // If new message is from someone else and chat is closed, increment count
          if (payload.new.sender_id !== user.id && !isChatOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, currentRoom, isChatOpen]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isChatOpen && unreadCount > 0) {
      // Mark messages as read when chat is opened
      const markMessagesAsRead = async () => {
        if (!currentRoom) return;
        
        try {
          const { error } = await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('room_id', currentRoom.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          if (error) throw error;
          
          setUnreadCount(0);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };

      markMessagesAsRead();
    }
  }, [isChatOpen]);

  // Initialize user room when user logs in
  useEffect(() => {
    if (user) {
      initializeUserRoom();
    } else {
      setCurrentRoom(null);
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 ">
        <div className="align-element px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => handleNavClick('home')} className="flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600">
                  <img src="Logo.png" alt="Logo" className='max-w-28' />
                </div>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-1 ">
                {navigation.map((item) => (
                  <div key={item.name} className="relative">
                    {item.type === 'link' ? (
                      <button
                        onClick={() => handleNavClick(item.page)}
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${currentPage === item.page
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                      >
                        {item.name}
                      </button>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          onMouseEnter={() => setActiveDropdown(item.name)}
                          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${currentPage === item.page || activeDropdown === item.name
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                          {item.name}
                          <svg
                            className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                              }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === item.name && (
                          <div
                            className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                            onMouseLeave={() => setActiveDropdown(null)}
                          >
                            <div className="py-1">
                              {item.items.map((subItem) => (
                                <button
                                  key={subItem.name}
                                  onClick={() => handleDropdownItemClick(subItem.page)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  {subItem.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}



                {/* Admin Panel Button */}
                {user?.email === 'admin@yourbroker.com' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                      }`}
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Welcome, {user.email}</span>
                  {user.role === 'admin' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                  <Button onClick={onLogout} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="hidden lg:flex space-x-2">
                  {/* Admin Login Button */}
                  <Button onClick={() => handleNavClick('login')} variant="outline" size="sm">
                    Login
                  </Button>
                  <Button onClick={() => handleNavClick('register')} size="sm">
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <div className="w-6 h-6 flex flex-col justify-center">
                  <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                    }`}></span>
                  <span className={`block h-0.5 w-6 bg-current transition duration-300 ease-in-out mt-1 ${isMenuOpen ? 'opacity-0' : ''
                    }`}></span>
                  <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                    }`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.type === 'link' ? (
                    <button
                      onClick={() => handleNavClick(item.page)}
                      className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${currentPage === item.page
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium text-left ${currentPage === item.page || activeDropdown === item.name
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-blue-400'
                          }`}
                      >
                        {item.name}
                        <svg
                          className={`h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {activeDropdown === item.name && (
                        <div className="pl-6 mt-1 space-y-1">
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.name}
                              onClick={() => handleDropdownItemClick(subItem.page)}
                              className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Admin Panel Button for Mobile */}
              {user?.email === 'admin@yourbroker.com' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${currentPage === 'admin'
                      ? 'bg-red-50 text-red-700'
                      : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                    }`}
                >
                  Admin Panel
                </button>
              )}

              {!user && (
                <>
                  <button
                    onClick={() => handleNavClick('login')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-blue-400 w-full text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:text-blue-800 hover:bg-blue-50 w-full text-left"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>
      <Footer onNavigate={onNavigate} />

      {/* Chat System - FIXED: Use ChatTrigger component */}
      <>
        <ChatTrigger
          onClick={() => setIsChatOpen(true)}
          unreadCount={unreadCount}
        />
        <ChatBox
          supabase={supabase}
          user={user}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </>
    </div>
  );
}