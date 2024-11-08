// SocketContext.js
import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';


export const SocketContext = React.createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(io());

  useEffect(() => {
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });
    return () => {
      socketRef.current.removeAllListeners("details")
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};