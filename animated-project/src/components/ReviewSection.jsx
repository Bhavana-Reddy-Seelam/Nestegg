import { useEffect, useState } from "react";
import "./ReviewSection.css";

const API = "http://localhost:5000/api";

function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(`${API}/reviews`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load reviews");
        }

        setReviews(
          Array.isArray(data)
            ? data
            : Array.isArray(data.reviews)
              ? data.reviews
              : []
        );
      } catch (error) {
        console.error("Review loading error:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name.trim(),
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Review submission failed");
      }

      setMessage("Thank you! Your review is waiting for admin approval.");
      setName("");
      setRating(5);
      setComment("");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  };

  return (
    <section className="review-section">
      <h2>Customer Reviews</h2>
      <p>Share your experience with Yolk & Co.</p>

      <form className="review-form" onSubmit={submitReview}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
        />

        <label>Rating</label>

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>★★★★★ - Excellent</option>
          <option value={4}>★★★★ - Very Good</option>
          <option value={3}>★★★ - Good</option>
          <option value={2}>★★ - Average</option>
          <option value={1}>★ - Poor</option>
        </select>

        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          required
        />

        <button type="submit">Submit Review</button>

        {message && <p>{message}</p>}
      </form>

      <div className="review-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet. Be the first to share your experience!</p>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review._id}>
              <h3>{review.customerName}</h3>
              <p>{"★".repeat(review.rating)}</p>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ReviewSection;