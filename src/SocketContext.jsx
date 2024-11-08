// SocketContext.js
import React from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = io();

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};