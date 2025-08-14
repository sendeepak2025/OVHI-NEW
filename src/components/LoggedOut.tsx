import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/operations/auth";
import { useDispatch } from "react-redux";
import { ringCentralStore } from "@/ringcentral/store/ringcentral";
import { Rnd } from "react-rnd";

const InactivityLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [inactiveSeconds, setInactiveSeconds] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_INACTIVE_SECONDS = 120;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setInactiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (inactiveSeconds >= MAX_INACTIVE_SECONDS) {
      handleLogout();
    }
  }, [inactiveSeconds]);

  useEffect(() => {
    const resetTimer = () => setInactiveSeconds(0);
    const events = ["click", "keypress", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  const handleLogout = () => {
    console.log("User auto-logged out due to inactivity.");
    // ringCentralStore.logout();
    // dispatch(logout(navigate) as any);
  };

  if (!visible) return null;

  const remaining = Math.max(MAX_INACTIVE_SECONDS - inactiveSeconds, 0);
  const percentage = (inactiveSeconds / MAX_INACTIVE_SECONDS) * 100;

  return (
   <>
    {/* <Rnd
      default={{
        x: 20,
        y: 20,
        width: 300,
        height: "auto",
      }}
      bounds="window"
      minWidth={260}
      minHeight={60}
      enableResizing={{
        bottom: true,
        right: true,
        bottomRight: true,
      }}
      dragHandleClassName="drag-handle"
      className="z-[999999999999999] fixed"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-4 text-sm w-full drag-handle relative animate-fadeIn">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-2 font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <span className="text-base">⏳</span>
          <span>Session Expiring</span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-snug">
          You’ll be logged out in <strong>{remaining}s</strong> due to
          inactivity.
        </p>

        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Rnd> */}


   </>
  );
};

export default InactivityLogout;
