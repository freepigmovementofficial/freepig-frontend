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
import CtaPopup from "./components/CTAPopup";
import ErrorPage from "./pages/error/ErrorPage";

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
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
      <CtaPopup />
    </BrowserRouter>
  );
}

export default App;
