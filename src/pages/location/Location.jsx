import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiClock, FiPhone, FiGlobe } from "react-icons/fi";
import headingImg from "../../assets/Heading.png";

const shopsData = {
  rpm: {
    name: "RPM Surf Shop",
    rating: "5.0",
    reviews: "289 Reviews",
    type: "Toko Selancar",
    address:
      "Jl. Benesari No.55b, Legian, Kec. Kuta, Kabupaten Badung, Bali 80361",
    hours: "Buka · Tutup pukul 20.00",
    phone: "0812-2422-2380",
    website: "freepigmovement.com",
    mapLink:
      "https://www.google.com/maps/place/RPM+Surf+Shop/@-8.715316,115.1723369,710m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2dd246c09dad6f5b:0x3322c6c891fd323b!8m2!3d-8.715316!4d115.1723369!16s%2Fg%2F1pzw586l9!18m1!1e1?entry=ttu",
    iframeSrc:
      "https://maps.google.com/maps?q=RPM%20Surf%20Shop,%20Legian,%20Bali&t=&z=16&ie=UTF8&iwloc=&output=embed",
  },
  pit: {
    name: "The Pit Surf Shop",
    rating: "4.7",
    reviews: "50 Reviews",
    type: "Toko Selancar",
    address:
      "Jl. Raya Legian No.64, Kuta, Kec. Kuta, Kabupaten Badung, Bali 80361",
    hours: "Buka · Tutup pukul 20.00",
    phone: "0878-3911-9590",
    website: "freepigmovement.com",
    mapLink:
      "https://www.google.com/maps/place/The+Pit+Surf+Shop,+Jl.+Raya+Legian+No.64,+Kuta,+Kec.+Kuta,+Kabupaten+Badung,+Bali+80361/data=!4m2!3m1!1s0x2dd246b9a6778a4f:0xa1d362ac4aa28fb6!18m1!1e1?utm_source=mstt_1&entry=gps",
    iframeSrc:
      "https://maps.google.com/maps?q=The%20Pit%20Surf%20Shop,%20Legian,%20Bali&t=&z=16&ie=UTF8&iwloc=&output=embed",
  },
};

export default function Location() {
  const { shopId } = useParams();

  const shop = shopsData[shopId];

  if (!shop) {
    return <Navigate to="/location/rpm" replace />;
  }

  return (
    <div className="bg-[#1c1c1c] min-h-screen font-poppins text-white pb-24">
      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${headingImg})`, height: "350px" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.h1
          key={shop.name} // ensure animation triggers on route change
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 font-oswald text-6xl md:text-[96px] font-black tracking-[0.1em] uppercase text-white drop-shadow-2xl text-center px-4"
        >
          OUR LOCATION
        </motion.h1>
      </div>

      {/* ── LOCATION INFO SECTION ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
        <motion.div
          key={shopId} // trigger re-render and animation on shop change
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
        >
          {/* Shop Details */}
          <div className="bg-[#222] p-8 md:p-12 border border-[#333] shadow-2xl flex flex-col justify-center">
            <h2 className="font-oswald text-4xl md:text-5xl font-bold tracking-widest text-white mb-2 uppercase">
              {shop.name}
            </h2>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-yellow-500 text-lg">★ {shop.rating}</span>
              <span className="text-gray-400 text-sm tracking-widest">
                ({shop.reviews})
              </span>
              <span className="text-gray-500 text-sm ml-2 px-2 py-0.5 border border-gray-600 rounded-full tracking-wider">
                {shop.type}
              </span>
            </div>

            <div className="flex flex-col gap-6 text-gray-300">
              <div className="flex items-start gap-4 group">
                <FiMapPin className="text-white-teal text-2xl mt-0.5" />
                <div>
                  <h4 className="text-white font-bold tracking-widest uppercase mb-1">
                    Address
                  </h4>
                  <p className="text-sm leading-relaxed group-hover:text-white transition duration-300">
                    {shop.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <FiClock className="text-white-teal text-2xl mt-0.5" />
                <div>
                  <h4 className="text-white font-bold tracking-widest uppercase mb-1">
                    Opening Hours
                  </h4>
                  <p className="text-sm text-green-400 group-hover:text-green-300 transition duration-300">
                    {shop.hours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <FiPhone className="text-white-teal text-2xl mt-0.5" />
                <div>
                  <h4 className="text-white font-bold tracking-widest uppercase mb-1">
                    Contact
                  </h4>
                  <p className="text-sm group-hover:text-white transition duration-300">
                    {shop.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <FiGlobe className="text-white-teal text-2xl mt-0.5" />
                <div>
                  <h4 className="text-white font-bold tracking-widest uppercase mb-1">
                    Website
                  </h4>
                  <a
                    href={`https://${shop.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition duration-300 underline"
                  >
                    {shop.website}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <a
                href={shop.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-[12px] font-bold tracking-[0.15em] uppercase"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Map Image / Embedded Map */}
          <div className="h-full min-h-[500px] w-full bg-[#111] border border-[#333] shadow-2xl relative overflow-hidden group">
            <iframe
              src={shop.iframeSrc}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "500px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-125 group-hover:grayscale-0 transition duration-700"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
