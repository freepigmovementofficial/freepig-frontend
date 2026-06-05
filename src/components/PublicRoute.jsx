import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PublicRoute — hanya boleh diakses oleh user biasa (non-admin).
 * Jika yang login adalah ADMIN, langsung redirect ke /admin/dashboard.
 */
export default function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Admin yang masih punya sesi aktif → paksa ke dashboard
  if (token && user && user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
