import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import logotr from "../assets/logoPutihh.webp";

export default function Footer() {
  const location = useLocation();

  // Hide footer on admin and login pages
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login"
  ) {
    return null;
  }

  const handleContactPopup = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event("openContactPopup"));
  };

  return (
    <footer className="bg-[#121212] border-t border-white/10 pt-16 pb-8 font-poppins text-gray-400">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-4 hover:opacity-80 transition duration-300">
              <img
                src={logotr}
                alt="FreePig Movement"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed tracking-wide">
              Handcrafted premium surfboards from Bali, Indonesia. Built for
              reliability, peak performance, and durability that stands the test
              of time.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col">
            <h3 className="font-oswald text-lg font-bold tracking-widest text-white uppercase mb-6">
              Explore
            </h3>
            <ul className="flex flex-col gap-3 text-sm font-medium tracking-wider">
              <li>
                <Link
                  to="/store"
                  className="hover:text-accent-teal transition duration-300"
                >
                  Store
                </Link>
              </li>
              <li>
                <button
                  onClick={handleContactPopup}
                  className="hover:text-accent-teal transition duration-300 text-left"
                >
                  Custom Boards
                </button>
              </li>
              <li>
                <Link
                  to="/volume"
                  className="hover:text-accent-teal transition duration-300"
                >
                  Volume Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/riders"
                  className="hover:text-accent-teal transition duration-300"
                >
                  Meet the Riders
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="hover:text-accent-teal transition duration-300"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col">
            <h3 className="font-oswald text-lg font-bold tracking-widest text-white uppercase mb-6">
              Support
            </h3>
            <ul className="flex flex-col gap-3 text-sm font-medium tracking-wider">
              <li>
                <button
                  onClick={handleContactPopup}
                  className="hover:text-accent-teal transition duration-300 text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="flex flex-col">
            <h3 className="font-oswald text-lg font-bold tracking-widest text-white uppercase mb-6">
              Connect
            </h3>
            <p className="text-sm tracking-wide mb-4">
              Join the movement and stay updated on our latest shapes and rider
              clips.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-teal hover:text-black hover:border-accent-teal transition-all duration-300"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://wa.me/+6281224222380"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-teal hover:text-black hover:border-accent-teal transition-all duration-300"
              >
                <FaWhatsapp size={18} />
              </a>
              <a
                href="mailto:[freepigmovement@gmail.com]"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-teal hover:text-black hover:border-accent-teal transition-all duration-300"
              >
                <FaEnvelope size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs tracking-widest uppercase font-semibold">
            &copy; {new Date().getFullYear()} FreePigMovement. All rights
            reserved.
          </p>
          <div className="flex gap-2">
            <span className="text-[10px] font-black tracking-[0.2em] bg-white text-black px-3 py-1 rounded-sm uppercase">
              Bali
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] bg-white/10 text-white px-3 py-1 rounded-sm uppercase border border-white/10">
              Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
