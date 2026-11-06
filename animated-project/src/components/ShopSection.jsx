import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

gsap.registerPlugin(ScrollTrigger);

function ShopSection() {
  const sectionRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [eggType, setEggType] = useState("Brown");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const products = {
    Brown: [
      { pack: 6, price: 84, image: "/brown-6.png" },
      { pack: 10, price: 135, image: "/brown-10.png" },
    ],
    White: [
      { pack: 6, price: 80, image: "/white-6.png" },
      { pack: 10, price: 130, image: "/white-10.png" },
    ],
  };

  // SHOP HEADING ANIMATION
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".shop-heading > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".shop-heading",
          start: "top 80%",
        },
      });

      gsap.from(".cart-button-container, .egg-toggle", {
        y: 25,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".egg-toggle",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // PRODUCT CARD ANIMATION
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".shop-card",
        { y: 60, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".shop-cards",
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [eggType]);

  // CART POPUP ANIMATION
  useEffect(() => {
    if (!showCart) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".order-box",
        { scale: 0.8, y: 40, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
        }
      );

      gsap.from(".order-box > *", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.2,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [showCart]);

  // INITIALIZE OPENSTREETMAP
  useEffect(() => {
    if (!showCart || cart.length === 0 || !mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerRef.current = null;
    }

    const map = L.map(mapRef.current).setView(
      [20.5937, 78.9629],
      5
    );

    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (event) => {
      const { lat, lng } = event.latlng;

      setLatitude(lat);
      setLongitude(lng);
      setLocationMessage("Getting address...");

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        if (!response.ok) {
          throw new Error("Address lookup failed");
        }

        const data = await response.json();

        if (data.display_name) {
          setAddress(data.display_name);
          setLocationMessage("Location selected successfully!");
        } else {
          setLocationMessage(
            "Location selected. Please enter your full address manually."
          );
        }
      } catch {
        setLocationMessage(
          "Location selected. Please enter your full address manually."
        );
      }
    });

    // Restore previously selected marker
    if (latitude !== null && longitude !== null) {
      map.setView([latitude, longitude], 16);
      markerRef.current = L.marker([
        latitude,
        longitude,
      ]).addTo(map);
    }

    // Allow Leaflet to calculate the map size after popup appears
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, [showCart, cart.length]);

  // USE CURRENT LOCATION
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setLocationMessage("Finding your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 16);

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(
              mapInstance.current
            );
          }
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );

          if (!response.ok) {
            throw new Error("Address lookup failed");
          }

          const data = await response.json();

          if (data.display_name) {
            setAddress(data.display_name);
            setLocationMessage("Current location selected!");
          } else {
            setLocationMessage(
              "Location selected. Enter your full address manually."
            );
          }
        } catch {
          setLocationMessage(
            "Location selected. Enter your full address manually."
          );
        }
      },
      () => {
        setLocationMessage(
          "Unable to get location. Please allow location permission or select on the map."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ADD TO CART
  const addToCart = (product) => {
    const productName = `${eggType} Eggs Pack of ${product.pack}`;

    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.name === productName
      );

      if (existing) {
        return prevCart.map((item) =>
          item.name === productName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          name: productName,
          price: product.price,
          quantity: 1,
        },
      ];
    });

    setMessage("");
  };

  // INCREASE QUANTITY
  const increaseQuantity = (name) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.name === name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (name) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.name === name
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // REMOVE PRODUCT
  const removeItem = (name) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.name !== name)
    );
  };

  // CART TOTAL
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // PLACE ORDER
  const handleOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setMessage("Your cart is empty!");
      return;
    }

    if (latitude === null || longitude === null) {
      setMessage("Please select your delivery location on the map.");
      return;
    }

    setLoading(true);
    setMessage("");

    const orderData = {
      customerName,
      email,
      phone,
      items: cart,
      totalAmount: cartTotal,
      address,
      latitude,
      longitude,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

      setMessage(
        `Order placed successfully! ${
          data.order?._id
            ? "Order ID: " + data.order._id
            : ""
        }`
      );

      setCart([]);
      setCustomerName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setLatitude(null);
      setLongitude(null);
      setLocationMessage("");
    } catch (error) {
      setMessage(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="shop"
      className="shop-section"
      ref={sectionRef}
    >
      <div className="shop-heading">
        <p>SHOP OUR EGGS</p>

        <h2>
          Find your perfect
          <br />
          egg pack.
        </h2>

        <p>
          Brown or white, in boxes of 6 or 10,
          packed fresh from our flock.
        </p>
      </div>

      <div className="cart-button-container">
        <button
          className="cart-button"
          onClick={() => {
            setShowCart(true);
            setMessage("");
          }}
        >
          🛒 My Cart ({cartCount})
        </button>
      </div>

      <div className="egg-toggle">
        <button
          className={eggType === "Brown" ? "active" : ""}
          onClick={() => setEggType("Brown")}
        >
          🟤 Brown Eggs
        </button>

        <button
          className={eggType === "White" ? "active" : ""}
          onClick={() => setEggType("White")}
        >
          ⚪ White Eggs
        </button>
      </div>

      <p className="shop-caption">
        Fresh from our flock
      </p>

      <div className="shop-cards">
        {products[eggType].map((product) => (
          <div
            className="shop-card"
            key={`${eggType}-${product.pack}`}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                y: -8,
                duration: 0.3,
                ease: "power2.out",
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                y: 0,
                duration: 0.3,
                ease: "power2.out",
              });
            }}
          >
            <div className="product-image">
              <img
                src={product.image}
                alt={`${eggType} eggs pack of ${product.pack}`}
              />
            </div>

            <h3>
              {eggType} Eggs, Pack of {product.pack}
            </h3>

            <div className="product-bottom">
              <h4>₹{product.price}</h4>

              <button onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="order-popup">
          <div className="order-box">
            <button
              className="close-btn"
              onClick={() => setShowCart(false)}
              disabled={loading}
            >
              ×
            </button>

            <p className="section-label">
              YOUR SHOPPING CART
            </p>

            <h2>My Cart 🛒</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty. Add some eggs!</p>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.name}
                  >
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>₹{item.price} each</p>
                    </div>

                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.name)}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.name)}
                      >
                        +
                      </button>
                    </div>

                    <p>
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeItem(item.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <>
                <h3 className="cart-total">
                  Total Amount: ₹{cartTotal}
                </h3>

                <h3>Delivery Details</h3>

                <form onSubmit={handleOrder}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    required
                  />

                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    required
                  />

                  <h3>Select Delivery Location</h3>

                  <p>
                    Click anywhere on the map to select your delivery
                    location.
                  </p>

                  <button
                    type="button"
                    className="confirm-btn"
                    onClick={useCurrentLocation}
                  >
                    📍 Use My Current Location
                  </button>

                  <div
                    ref={mapRef}
                    style={{
                      width: "100%",
                      height: "300px",
                      margin: "15px 0",
                      borderRadius: "12px",
                      overflow: "hidden",
                      zIndex: 1,
                    }}
                  />

                  {locationMessage && (
                    <p className="order-message">
                      {locationMessage}
                    </p>
                  )}

                  {latitude !== null && longitude !== null && (
                    <p>
                      Selected coordinates: {latitude.toFixed(6)},{" "}
                      {longitude.toFixed(6)}
                    </p>
                  )}

                  <textarea
                    placeholder="Complete delivery address (house number, street, area)"
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    required
                  />

                  <button
                    type="submit"
                    className="confirm-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Placing Order..."
                      : "Place Order"}
                  </button>
                </form>
              </>
            )}

            {message && (
              <p className="order-message">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ShopSection;