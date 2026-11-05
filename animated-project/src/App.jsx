import OrderTracking from "./components/OrderTracking";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import EggsSection from "./components/EggsSection";
import ShopSection from "./components/ShopSection";
import PackagingSection from "./components/PackagingSection";
import FarmSection from "./components/FarmSection";

function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <EggsSection />
      <ShopSection />
      <OrderTracking />
      <PackagingSection />
      <FarmSection />
    </div>
  );
}

export default App;