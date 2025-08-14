import React from "react"

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role === 6) {
    return children;
  } else if (user?.role === 7) {
    return children;
  } else if (user?.role === 1) {
    return children;
  }

  return <Navigate to="/login" />;
}

export default PrivateRoute;
