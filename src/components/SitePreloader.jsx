import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PigLoader from './PigLoader';

/**
 * SitePreloader – Shows a fullscreen PigLoader once per session
 * (session-scoped, cleared on tab close)
 */
export default function SitePreloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem('sitePreloaderShown');
    if (!alreadyLoaded) {
      setShow(true);
      sessionStorage.setItem('sitePreloaderShown', 'true');
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && <PigLoader fullScreen text="Catching the perfect wave..." />}
    </AnimatePresence>
  );
}
