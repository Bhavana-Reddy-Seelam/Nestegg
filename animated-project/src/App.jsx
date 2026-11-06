import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import EggsSection from "./components/EggsSection";
import ShopSection from "./components/ShopSection";
import OrderTracking from "./components/OrderTracking";
import PackagingSection from "./components/PackagingSection";
import FarmSection from "./components/FarmSection";
import AdminDashboard from "./components/AdminDashboard";
import ReviewSection from "./components/ReviewSection";

function App() {
  if (window.location.pathname === "/admin") {
    return <AdminDashboard />;
  }

  return (
    <div>
      <Navbar />
      <Hero />
      <EggsSection />
      <ShopSection />
      <OrderTracking />
      <PackagingSection />
      <FarmSection />
      <ReviewSection />
    </div>
  );
}

export default App;