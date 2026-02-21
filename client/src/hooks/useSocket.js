import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? undefined // connects to same origin
    : process.env.REACT_APP_SERVER_URL || "http://localhost:4000";

export default function useSocket() {
  const [users, setUsers] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setCurrentUserId(socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("users-updated", (updatedUsers) => {
      setUsers(updatedUsers);
    });

    // Watch geolocation
    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit("update-location", { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Erro de geolocalização:", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      socket.disconnect();
    };
  }, []);

  return { users, currentUserId, connected };
}
