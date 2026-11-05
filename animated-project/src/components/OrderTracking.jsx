import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function OrderTracking() {
  const sectionRef = useRef(null);

  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // GSAP ANIMATION

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.from(".tracking-section h2", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tracking-section",
          start: "top 80%",
        },
      });

      gsap.from(".tracking-section > p", {
        y: 25,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: ".tracking-section",
          start: "top 80%",
        },
      });

      gsap.from(".tracking-form", {
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 0.9,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".tracking-form",
          start: "top 90%",
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // TRACK ORDER

  const trackOrder = async (e) => {
    e.preventDefault();

    setLoading(true);
    setOrder(null);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/track/${orderId}?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setOrder(data.order);

    } catch (error) {
      setMessage(error.message || "Unable to track order.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="tracking-section"
      id="tracking"
      ref={sectionRef}
    >

      <h2>
        Track Your <span>Order</span>
      </h2>

      <p>
        Enter your order details to check delivery status.
      </p>

      {/* TRACKING FORM */}

      <form
        className="tracking-form"
        onSubmit={trackOrder}
      >

        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value.trim())}
          required
        />

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Track Order"}
        </button>

      </form>

      {/* ERROR MESSAGE */}

      {message && (
        <p className="tracking-error">
          {message}
        </p>
      )}

      {/* ORDER DETAILS */}

      {order && (

        <div className="tracking-result">

          <h3>Order Details</h3>

          <p>
            <strong>Order ID:</strong> {order._id}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.totalAmount}
          </p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>

          <h4>Products</h4>

          {order.items.map((item) => (

            <p key={item._id}>
              {item.name} × {item.quantity}
            </p>

          ))}

        </div>

      )}

    </section>
  );
}

export default OrderTracking;