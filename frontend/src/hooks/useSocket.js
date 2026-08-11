import { useEffect, useRef, useState } from'react';
import { io } from'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ||'http://localhost:5000';

export const useSocket = (hostelId) => {
 const socketRef = useRef(null);
 const [isConnected, setIsConnected] = useState(false);

 useEffect(() => {
 if (!hostelId) return;

 // Connect to the socket server
 socketRef.current = io(SOCKET_URL, {
 withCredentials: true,
 transports: ['polling','websocket']
 });

 socketRef.current.on('connect', () => {
 setIsConnected(true);
 // Join the hostel room automatically
 socketRef.current.emit('join_hostel_room', hostelId);
 });

 socketRef.current.on('disconnect', () => {
 setIsConnected(false);
 });

 return () => {
 if (socketRef.current) {
 socketRef.current.disconnect();
 }
 };
 }, [hostelId]);

 return { socket: socketRef.current, isConnected };
};
