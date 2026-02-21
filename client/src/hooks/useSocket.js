import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? undefined
    : process.env.REACT_APP_SERVER_URL || "http://localhost:4000";

export default function useSocket() {
  const [users, setUsers] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [geoError, setGeoError] = useState(null);
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
    if (!navigator.geolocation) {
      setGeoError("O seu browser não suporta geolocalização.");
    } else {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGeoError(null);
          const { latitude, longitude } = position.coords;
          socket.emit("update-location", { lat: latitude, lng: longitude });
        },
        (error) => {
          if (error.code === 1) {
            setGeoError("Permissão de localização negada. Ative nas definições do browser.");
          } else if (error.code === 2) {
            setGeoError("Localização indisponível.");
          } else if (error.code === 3) {
            setGeoError("Tempo limite para obter localização. A tentar novamente...");
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      socket.disconnect();
    };
  }, []);

  return { users, currentUserId, connected, geoError };
}
