import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/home';
import Store from './pages/store/Store';
import Custom from './pages/custom/Custom';
import Volume from './pages/volume/Volume';
import Contact from './pages/contact/Contact';
import Login from './pages/login/Login';
import Location from './pages/location/Location';
import ProductDetail from './pages/product/ProductDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Gallery from './pages/gallery/Gallery';
import ContactPopup from './components/ContactPopup';
import CtaPopup from './components/CtaPopup';


function App() {
  return (
    <BrowserRouter>

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/custom" element={<Custom />} />
        <Route path="/volume" element={<Volume />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/location/:shopId?" element={<Location />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ContactPopup />
      <CtaPopup />
    </BrowserRouter>
  );
}

export default App;
