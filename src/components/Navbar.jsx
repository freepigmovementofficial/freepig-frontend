import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logotr from '../assets/logoPutihh.webp';
import { authService } from "../api/auth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [location.pathname]);

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    setIsMobileMenuOpen(false);
  };

  const doLogout = () => {
    setShowLogoutConfirm(false);
    authService.logout();
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar completely on Admin Dashboard to prevent layout overlap
  // Also hide on /login for a clean full-screen auth experience
  if (location.pathname.startsWith('/admin') || location.pathname === '/login') return null;

  return (
    <>
      {/* ── LOGOUT CONFIRM POPUP ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            key="logout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              key="logout-modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center"
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="font-oswald text-2xl font-bold tracking-widest text-white mb-2">LOGOUT?</h3>
              <p className="text-gray-400 text-sm tracking-wide leading-relaxed mb-8">
                Are you sure you want to log out from your account?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={doLogout}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold tracking-widest text-xs rounded-full transition duration-300"
                >
                  YES, LOGOUT
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 border border-gray-600 text-gray-400 hover:border-white hover:text-white font-bold tracking-widest text-xs rounded-full transition duration-300"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <nav
      className={`fixed top-0 left-0 w-full flex items-center px-10 md:px-20 z-50 transition-all duration-500
        ${
          scrolled
            ? "py-3 bg-black/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-white/5"
            : "py-6 bg-transparent"
        } text-white`}
    >
      {/* LOGO — kiri */}
      <Link
        to="/"
        className="flex-shrink-0 hover:opacity-80 transition duration-300"
      >
        <img
          style={{
            width: "90px",
            height: "70px",
            objectFit: "contain",
          }}
          src={logotr}
          alt="Logo"
        />
      </Link>

      {/* NAV LINKS — kanan, hanya desktop */}
      <ul className="hidden md:flex ml-auto items-center gap-14 text-xs font-semibold tracking-widest uppercase">
        <Link to="/store">
          <li
            className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/store" ? "text-accent-teal border-accent-teal" : "text-white hover:text-white border-transparent hover:border-white/40"}`}
          >
            STORE
          </li>
        </Link>
        <li
          onClick={() => window.dispatchEvent(new Event('openContactPopup'))}
          className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/custom" ? "text-accent-teal border-accent-teal" : "text-white hover:text-white border-transparent hover:border-white/40"}`}
        >
          CUSTOM
        </li>
        <Link to="/volume">
          <li
            className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/volume" ? "text-accent-teal border-accent-teal" : "text-white hover:text-white border-transparent hover:border-white/40"}`}
          >
            VOLUME CALCULATE
          </li>
        </Link>

        {/* LOCATION WITH DROPDOWN */}
        <li
          className={`relative group cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname.startsWith("/location") ? "text-accent-teal border-accent-teal" : "text-white hover:text-white border-transparent hover:border-white/40"}`}
        >
          <div className="flex items-center gap-1">
            LOCATION
            <svg
              className="w-3 h-3 group-hover:rotate-180 transition duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden flex flex-col">
            <Link
              to="/location/rpm"
              className={`block px-6 py-4 text-xs tracking-widest hover:text-accent-teal hover:bg-white/5 transition ${location.pathname === "/location/rpm" ? "text-accent-teal" : "text-white"}`}
            >
              RPM SURF SHOP
            </Link>
            <Link
              to="/location/pit"
              className={`block px-6 py-4 text-xs tracking-widest hover:text-accent-teal hover:bg-white/5 transition border-t border-white/5 ${location.pathname === "/location/pit" ? "text-accent-teal" : "text-white"}`}
            >
              THE PIT SURF SHOP
            </Link>
          </div>
        </li>

        <Link to="/about">
          <li
            className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/about" ? "text-accent-teal border-accent-teal" : "text-white hover:text-white border-transparent hover:border-white/40"}`}
          >
            ABOUT US
          </li>
        </Link>
        {user ? (
          <li className="flex items-center gap-3">
            <span className="text-white capitalize text-[10px] tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hidden lg:inline-block">
              {user.name}
            </span>
            {user.role === "ADMIN" && (
              <Link to="/admin/dashboard">
                <button className="px-4 py-2 bg-accent-teal text-black rounded-full hover:bg-white transition duration-300 font-bold tracking-[0.1em] uppercase text-[10px]">
                  Dashboard
                </button>
              </Link>
            )}
            <button
              onClick={confirmLogout}
              className="px-4 py-2 bg-transparent border border-white/60 rounded-full hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition duration-300 text-white font-bold tracking-[0.1em] uppercase text-[10px]"
            >
              Logout
            </button>
          </li>
        ) : (
          <Link to="/login">
            <button className="px-5 py-2 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white font-bold tracking-[0.15em] uppercase">
              Login
            </button>
          </Link>
        )}
      </ul>

      {/* HAMBURGER — hanya mobile, dorong ke kanan */}
      <div
        className="ml-auto md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <div className="w-6 flex flex-col items-end gap-1.5 group">
          <div
            className={`w-full h-0.5 bg-white group-hover:bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
          ></div>
          <div
            className={`w-4 h-0.5 bg-white group-hover:bg-accent-teal group-hover:w-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
          ></div>
          <div
            className={`w-full h-0.5 bg-white group-hover:bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          ></div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-full left-0 w-full h-screen bg-black flex flex-col items-center pt-10 pb-40 gap-8 md:hidden border-t border-white/10 shadow-2xl overflow-y-auto"
          >
        <Link
          to="/store"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/store" ? "text-accent-teal" : "text-white hover:text-white"}`}
        >
          STORE
        </Link>
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            window.dispatchEvent(new Event('openContactPopup'));
          }}
          className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/custom" ? "text-accent-teal" : "text-white hover:text-white"}`}
        >
          CUSTOM
        </button>
        <Link
          to="/volume"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/volume" ? "text-accent-teal" : "text-white hover:text-white"}`}
        >
          VOLUME CALCULATE
        </Link>

        {/* MOBILE LOCATION WITH DROPDOWN */}
        <div className="flex flex-col items-center gap-4 w-full">
          <span
            className={`text-sm font-semibold tracking-widest uppercase ${location.pathname.startsWith("/location") ? "text-accent-teal" : "text-white"}`}
          >
            LOCATION
          </span>
          <div className="flex flex-col items-center gap-3">
            <Link
              to="/location/rpm"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-xs font-semibold tracking-widest uppercase transition ${location.pathname === "/location/rpm" ? "text-white" : "text-gray-500 hover:text-white"}`}
            >
              - RPM SURF SHOP
            </Link>
            <Link
              to="/location/pit"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-xs font-semibold tracking-widest uppercase transition ${location.pathname === "/location/pit" ? "text-white" : "text-gray-500 hover:text-white"}`}
            >
              - THE PIT SURF SHOP
            </Link>
          </div>
        </div>

        <Link
          to="/about"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/about" ? "text-accent-teal" : "text-white hover:text-white"}`}
        >
          ABOUT US
        </Link>
        {user ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <span className="text-gray-400 capitalize text-xs tracking-widest">
              Hi, {user.name}
            </span>
            {user.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <button className="px-8 py-3 bg-accent-teal text-black rounded-full hover:bg-white transition duration-300 font-bold tracking-[0.15em] uppercase text-xs">
                  Dashboard
                </button>
              </Link>
            )}
            <button
              onClick={confirmLogout}
              className="px-8 py-3 bg-transparent border border-white/60 rounded-full hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition duration-300 text-white font-bold tracking-[0.15em] uppercase text-xs"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="mt-4 px-8 py-3 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white font-bold tracking-[0.15em] uppercase">
              Login
            </button>
          </Link>
        )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}
