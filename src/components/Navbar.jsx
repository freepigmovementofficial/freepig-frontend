import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logotr from "../assets/logoPutihh.png";
import { authService } from "../api/auth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [location.pathname]);

  const handleLogout = () => {
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
  // This MUST be placed here (after all hooks) to avoid "Rules of Hooks" error
  if (location.pathname.startsWith("/admin")) return null;

  return (
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
          style={{ width: "80px", height: "60px" }}
          src={logotr}
          alt="Logo"
        />
      </Link>

      {/* NAV LINKS — kanan, hanya desktop */}
      <ul className="hidden md:flex ml-auto items-center gap-14 text-xs font-semibold tracking-widest uppercase">
        <Link to="/store">
          <li className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/store" ? "text-accent-teal border-accent-teal" : "text-gray-300 hover:text-white border-transparent hover:border-white/40"}`}>
            STORE
          </li>
        </Link>
        <Link to="/custom">
          <li className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/custom" ? "text-accent-teal border-accent-teal" : "text-gray-300 hover:text-white border-transparent hover:border-white/40"}`}>
            CUSTOM
          </li>
        </Link>
        <Link to="/volume">
          <li className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/volume" ? "text-accent-teal border-accent-teal" : "text-gray-300 hover:text-white border-transparent hover:border-white/40"}`}>
            VOLUME CALCULATE
          </li>
        </Link>

        {/* LOCATION WITH DROPDOWN */}
        <li className={`relative group cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname.startsWith("/location") ? "text-accent-teal border-accent-teal" : "text-gray-300 hover:text-white border-transparent hover:border-white/40"}`}>
          <div className="flex items-center gap-1">
            LOCATION
            <svg className="w-3 h-3 group-hover:rotate-180 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden flex flex-col">
            <Link to="/location/rpm" className={`block px-6 py-4 text-xs tracking-widest hover:text-accent-teal hover:bg-white/5 transition ${location.pathname === "/location/rpm" ? "text-accent-teal" : "text-gray-300"}`}>
              RPM SURF SHOP
            </Link>
            <Link to="/location/pit" className={`block px-6 py-4 text-xs tracking-widest hover:text-accent-teal hover:bg-white/5 transition border-t border-white/5 ${location.pathname === "/location/pit" ? "text-accent-teal" : "text-gray-300"}`}>
              THE PIT SURF SHOP
            </Link>
          </div>
        </li>

        <Link to="/contact">
          <li className={`cursor-pointer pb-0.5 transition duration-300 border-b-2 ${location.pathname === "/contact" ? "text-accent-teal border-accent-teal" : "text-gray-300 hover:text-white border-transparent hover:border-white/40"}`}>
            CONTACT US
          </li>
        </Link>
        {user ? (
          <li className="flex items-center gap-3">
            <span className="text-gray-300 capitalize text-[10px] tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hidden lg:inline-block">
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
              onClick={handleLogout}
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
        className="ml-auto md:hidden w-6 flex flex-col justify-center items-end gap-1.5 cursor-pointer group z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <div
          className={`w-full h-0.5 bg-gray-400 group-hover:bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
        ></div>
        <div
          className={`w-4 h-0.5 bg-gray-400 group-hover:bg-accent-teal group-hover:w-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
        ></div>
        <div
          className={`w-full h-0.5 bg-gray-400 group-hover:bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
        ></div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`absolute top-full left-0 w-full bg-[#1e1e1e]/95 backdrop-blur-xl flex flex-col items-center py-8 gap-8 md:hidden transition-all duration-300 origin-top border-t border-white/10 shadow-xl
          ${
            isMobileMenuOpen
              ? "opacity-100 scale-y-100 visible"
              : "opacity-0 scale-y-0 invisible"
          }`}
      >
        <Link to="/store" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/store" ? "text-accent-teal" : "text-gray-300 hover:text-white"}`}>STORE</Link>
        <Link to="/custom" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/custom" ? "text-accent-teal" : "text-gray-300 hover:text-white"}`}>CUSTOM</Link>
        <Link to="/volume" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/volume" ? "text-accent-teal" : "text-gray-300 hover:text-white"}`}>VOLUME CALCULATE</Link>
        
        {/* MOBILE LOCATION WITH DROPDOWN */}
        <div className="flex flex-col items-center gap-4 w-full">
          <span className={`text-sm font-semibold tracking-widest uppercase ${location.pathname.startsWith("/location") ? "text-accent-teal" : "text-gray-300"}`}>LOCATION</span>
          <div className="flex flex-col items-center gap-3">
            <Link to="/location/rpm" onClick={() => setIsMobileMenuOpen(false)} className={`text-xs font-semibold tracking-widest uppercase transition ${location.pathname === "/location/rpm" ? "text-white" : "text-gray-500 hover:text-white"}`}>
              - RPM SURF SHOP
            </Link>
            <Link to="/location/pit" onClick={() => setIsMobileMenuOpen(false)} className={`text-xs font-semibold tracking-widest uppercase transition ${location.pathname === "/location/pit" ? "text-white" : "text-gray-500 hover:text-white"}`}>
              - THE PIT SURF SHOP
            </Link>
          </div>
        </div>

        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-semibold tracking-widest uppercase transition duration-300 ${location.pathname === "/contact" ? "text-accent-teal" : "text-gray-300 hover:text-white"}`}>CONTACT US</Link>
        {user ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <span className="text-gray-400 capitalize text-xs tracking-widest">
              Hi, {user.name}
            </span>
            {user.role === "ADMIN" && (
              <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="px-8 py-3 bg-accent-teal text-black rounded-full hover:bg-white transition duration-300 font-bold tracking-[0.15em] uppercase text-xs">
                  Dashboard
                </button>
              </Link>
            )}
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
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
      </div>
    </nav>
  );
}
