import useDocumentTitle from '../../hooks/useDocumentTitle';
import React from 'react';

export default function Custom() {
  useDocumentTitle('Custom Board | FreePigMovement');
  return (
    <div className="bg-[#252525] min-h-screen font-poppins text-white flex flex-col items-center justify-center pt-24">
      <h1 className="font-oswald text-6xl font-bold tracking-widest">CUSTOM</h1>
      <p className="mt-4 text-gray-400 tracking-widest text-sm">Halaman Custom (Belum ada tampilan)</p>
    </div>
  );
}
