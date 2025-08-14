import { useEffect } from "react";
import io from "socket.io-client";

const useSocket = () => {
  const BASE_URL = import.meta.env.VITE_APP_SOCKET_URL;

  useEffect(() => {
    const socket = io(BASE_URL); // Update with your server URL

    socket.on("connect", () => {
      // console.log('Socket connected:', socket.id);
    });

    socket.on("disconnect", () => {
      // console.log('Disconnected from server');
    });
  }, []);

  return null;
};

export default useSocket;
