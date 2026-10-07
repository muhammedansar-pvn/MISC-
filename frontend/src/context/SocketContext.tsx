'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getToken } from '@/utils/token';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

// =========================================================================
// SINGLETON SOCKET INSTANCE
// Holds one persistent connection per browser session.
// Survives React StrictMode double-mounting, component rerenders,
// and Next.js App Router client navigation.
// =========================================================================
let activeSocket: Socket | null = null;
let activeToken: string | null = null;
let wasConnected = false;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token: authToken, isAuthenticated, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(() => activeSocket);
  const [isConnected, setIsConnected] = useState<boolean>(() => !!activeSocket?.connected);

  useEffect(() => {
    // 1. Wait until AuthContext finishes initial token/user restoration
    if (loading) {
      return;
    }

    const token = authToken || getToken();

    // 2. User is unauthenticated or has logged out: clean up socket
    if (!isAuthenticated || !token) {
      if (activeSocket) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Socket.IO] User unauthenticated/logged out. Disconnecting socket.');
        }
        activeSocket.disconnect();
        activeSocket = null;
        activeToken = null;
        wasConnected = false;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 3. Socket already exists for this exact token: reuse it
    if (activeSocket && activeToken === token) {
      setSocket(activeSocket);
      setIsConnected(activeSocket.connected);

      const handleConnect = () => {
        setIsConnected(true);
        if (wasConnected && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('socket:reconnected'));
        }
        wasConnected = true;
      };

      const handleDisconnect = (reason: string) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Socket.IO] Disconnected: ${reason}`);
        }
        setIsConnected(false);
      };

      const handleConnectError = (error: Error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[Socket.IO] Connection error: ${error.message}`);
        }
        setIsConnected(false);
      };

      activeSocket.on('connect', handleConnect);
      activeSocket.on('disconnect', handleDisconnect);
      activeSocket.on('connect_error', handleConnectError);

      return () => {
        activeSocket?.off('connect', handleConnect);
        activeSocket?.off('disconnect', handleDisconnect);
        activeSocket?.off('connect_error', handleConnectError);
      };
    }

    // 4. Token changed or socket stale: cleanly disconnect previous session
    if (activeSocket) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Socket.IO] Token changed. Reinitializing socket connection...');
      }
      activeSocket.disconnect();
      activeSocket = null;
      activeToken = null;
    }

    const socketUrl = getSocketUrl();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Initializing single authenticated connection to ${socketUrl}...`);
    }

    // 5. Establish single Socket.IO instance with reliable transport negotiation
    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    activeSocket = newSocket;
    activeToken = token;
    setSocket(newSocket);
    setIsConnected(newSocket.connected);

    // 6. Bind event listeners
    const handleConnect = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Socket.IO] Connected successfully with ID: ${newSocket.id}`);
      }
      setIsConnected(true);

      // Notify components if recovering from network disconnection
      if (wasConnected && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('socket:reconnected'));
      }
      wasConnected = true;
    };

    const handleDisconnect = (reason: string) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Socket.IO] Disconnected: ${reason}`);
      }
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Socket.IO] Connection error: ${error.message}`);
      }
      setIsConnected(false);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect_error', handleConnectError);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('connect_error', handleConnectError);
    };
  }, [authToken, isAuthenticated, loading]);

  // Memoize context value to prevent unnecessary consumer rerenders
  const value = useMemo(
    () => ({
      socket,
      isConnected,
    }),
    [socket, isConnected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext);
};

export default SocketContext;
