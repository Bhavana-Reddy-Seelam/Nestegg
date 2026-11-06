import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api";

const statuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

function AdminDashboard() {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || ""
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ADMIN LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoginError("");

      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    setOrders([]);
    setReviews([]);
  };

  // FETCH DASHBOARD
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ordersResponse, statsResponse, reviewsResponse] =
        await Promise.all([
          fetch(`${API_URL}/orders`, { headers }),
          fetch(`${API_URL}/admin/dashboard`, { headers }),
          fetch(`${API_URL}/admin/reviews`, { headers }),
        ]);

      if (
        [ordersResponse, statsResponse, reviewsResponse].some(
          (response) =>
            response.status === 401 || response.status === 403
        )
      ) {
        handleLogout();
        return;
      }

      if (
        !ordersResponse.ok ||
        !statsResponse.ok ||
        !reviewsResponse.ok
      ) {
        throw new Error("Unable to load dashboard data.");
      }

      const ordersData = await ordersResponse.json();
      const statsData = await statsResponse.json();
      const reviewsData = await reviewsResponse.json();

      setOrders(ordersData.orders || []);
      setStats(statsData);
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE ORDER STATUS
  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      await fetchDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  // APPROVE OR REJECT REVIEW
  const updateReviewStatus = async (reviewId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/admin/reviews/${reviewId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Review update failed");
      }

      await fetchDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-box" onSubmit={handleLogin}>
          <h1>🥚 Yolk & Co.</h1>
          <h2>Admin Login</h2>
          <p>Sign in to manage your orders and reviews</p>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {loginError && (
            <p className="admin-error">{loginError}</p>
          )}

          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome to Yolk & Co. Management</p>
        </div>

        <div className="admin-actions">
          <button onClick={fetchDashboard} className="refresh-btn">
            Refresh
          </button>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <h2>{stats.totalOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <h2>{stats.totalCustomers}</h2>
        </div>

        <div className="stat-card">
          <h3>Delivered Orders</h3>
          <h2>{stats.deliveredOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <h2>{stats.pendingOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Delivered Revenue</h3>
          <h2>₹{stats.totalRevenue}</h2>
        </div>
      </div>

      {/* CUSTOMER ORDERS */}
      <div className="orders-container">
        <h2>Customer Orders</h2>

        {orders.length === 0 ? (
          <p className="no-orders">No orders available.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.customerName}</td>
                    <td>{order.email}</td>
                    <td>{order.phone}</td>

                    <td>
                      {order.items.map((item, index) => (
                        <div key={index}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </td>

                    <td>₹{order.totalAmount}</td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <select
                        className={`status-select ${order.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER REVIEWS */}
      <div className="admin-reviews-container">
        <h2>⭐ Customer Reviews</h2>

        <p>
          Review submissions: {reviews.length} | Pending:{" "}
          {reviews.filter((review) => review.status === "Pending").length}
        </p>

        {reviews.length === 0 ? (
          <p>No customer reviews submitted yet.</p>
        ) : (
          <div className="admin-review-grid">
            {reviews.map((review) => (
              <div className="admin-review-card" key={review._id}>
                <h3>{review.customerName}</h3>

                <div className="review-stars">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p>{review.comment}</p>

                <span
                  className={`review-status ${review.status.toLowerCase()}`}
                >
                  {review.status}
                </span>

                <small>
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>

                {review.status === "Pending" && (
                  <div className="review-admin-actions">
                    <button
                      className="approve-review-btn"
                      onClick={() =>
                        updateReviewStatus(review._id, "Approved")
                      }
                    >
                      ✓ Approve
                    </button>

                    <button
                      className="reject-review-btn"
                      onClick={() =>
                        updateReviewStatus(review._id, "Rejected")
                      }
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {review.status === "Approved" && (
                  <button
                    className="reject-review-btn"
                    onClick={() =>
                      updateReviewStatus(review._id, "Rejected")
                    }
                  >
                    Remove from Website
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;