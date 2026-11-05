import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ShopSection() {
  const sectionRef = useRef(null);

  const [eggType, setEggType] = useState("Brown");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // PRODUCT DETAILS

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
        {
          y: 60,
          opacity: 0,
          scale: 0.9,
        },
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

    setLoading(true);
    setMessage("");

    const orderData = {
      customerName,
      email,
      phone,
      items: cart,
      totalAmount: cartTotal,
      address,
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

      {/* SHOP HEADING */}

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

      {/* CART BUTTON */}

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

      {/* EGG TYPE BUTTONS */}

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

      {/* PRODUCT CARDS */}

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

      {/* SHOPPING CART POPUP */}

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

            {/* CART ITEMS */}

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

            {/* CHECKOUT FORM */}

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

                  <textarea
                    placeholder="Delivery address"
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

            {/* SUCCESS OR ERROR MESSAGE */}

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