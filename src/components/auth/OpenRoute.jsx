import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function OpenRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) {
    return children;
  }

  if (user?.role === 6) {
    return <Navigate to="/provider" />;
  }
  if (user?.role === 7) {
    return <Navigate to="/patient/dashboard" />;
  }
  if (user?.role === 1) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Navigate to="/" />;
}

export default OpenRoute;
