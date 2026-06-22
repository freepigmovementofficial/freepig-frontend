import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home/home";
import Store from "./pages/store/Store";
import Custom from "./pages/custom/Custom";
import Volume from "./pages/volume/Volume";
import Contact from "./pages/contact/Contact";
import About from "./pages/about/About";
import Login from "./pages/login/Login";
import Location from "./pages/location/Location";
import ProductDetail from "./pages/product/ProductDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Gallery from "./pages/gallery/Gallery";
import Customer from "./pages/customer/Customer";
import Riders from "./pages/riders/Riders";
import RiderDetail from "./pages/riders/RiderDetail";
import ContactPopup from "./components/ContactPopup";
import ErrorPage from "./pages/error/ErrorPage";
import ScrollToTop from "./components/ScrollToTop";

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="overflow-x-hidden flex flex-col min-h-screen w-full relative">
        <ScrollToTop />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#00e5ff', secondary: '#000' },
              style: {
                background: '#1a1a1a',
                border: '1px solid rgba(0,229,255,0.2)',
                color: '#fff',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: {
                background: '#1a1a1a',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/store" element={<PublicRoute><Store /></PublicRoute>} />
          <Route path="/product/:slug" element={<PublicRoute><ProductDetail /></PublicRoute>} />
          <Route path="/custom" element={<PublicRoute><Custom /></PublicRoute>} />
          <Route path="/volume" element={<PublicRoute><Volume /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
          <Route path="/location/:shopId?" element={<PublicRoute><Location /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/gallery" element={<PublicRoute><Gallery /></PublicRoute>} />
          <Route path="/customer" element={<PublicRoute><Customer /></PublicRoute>} />
          <Route path="/riders" element={<PublicRoute><Riders /></PublicRoute>} />
          <Route path="/riders/:id" element={<PublicRoute><RiderDetail /></PublicRoute>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        <Footer />
        <ContactPopup />
      </div>
    </BrowserRouter>
  );
}

export default App;
