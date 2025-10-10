import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const demoComplaint = {
  id: 123,
  title: "Pothole on Main Street",
  description:
    "There is a large pothole near the intersection causing traffic issues.",
  category: "Road Maintenance",
  date: "2025-10-10T10:30:00Z",
  photo: "https://via.placeholder.com/400x200.png?text=Complaint+Photo",
};

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: Log feedback to console
    console.log({ complaintId: demoComplaint.id, rating, review });
    setSubmitted(true);

    // Redirect after 2 seconds
    setTimeout(() => {
      window.history.back(); // Go back to wherever the user clicked from
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] flex flex-col items-center pt-24 px-6">
      {/* Page Header */}
      <div className="max-w-4xl w-full mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#d55d1f] mb-2">Complaint Feedback</h1>
        <p className="text-gray-700 text-sm sm:text-base">
          Your complaint has been resolved! Please provide your feedback below.
        </p>
        <a
          href="https://tattletent.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline italic"
        >
          Visit TattleTent Website
        </a>
      </div>

      {/* Complaint Card */}
      <div className="w-full max-w-4xl bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#A0522D] mb-2">{demoComplaint.title}</h2>
        <p className="text-gray-500 text-sm mb-1">
          <span className="font-medium">Category:</span> {demoComplaint.category}
        </p>
        <p className="text-gray-500 text-sm mb-1">
          <span className="font-medium">Date:</span>{" "}
          {new Date(demoComplaint.date).toLocaleDateString()}
        </p>
        <p className="text-gray-700 mb-3">{demoComplaint.description}</p>
        {demoComplaint.photo && (
          <img
            src={demoComplaint.photo}
            alt="Complaint"
            className="w-full max-h-64 object-cover rounded-lg mb-3"
          />
        )}
      </div>

      {/* Feedback Form */}
      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white shadow-md rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#A0522D] mb-3">Rate the Resolution</h3>
          {/* Star Rating */}
          <div className="flex mb-6">
            {[...Array(5)].map((star, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    className="hidden"
                    onClick={() => setRating(ratingValue)}
                  />
                  <FaStar
                    size={32}
                    className="cursor-pointer transition-colors"
                    color={ratingValue <= (hover || rating) ? "#F59E0B" : "#d1d5db"}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>

          {/* Written Review */}
          <div className="mb-6">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review"
              required
              rows={5}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your feedback here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A0522D] outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#A0522D] hover:bg-[#8B4513] text-white font-medium rounded-lg transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      ) : (
        <div className="w-full max-w-4xl bg-white shadow-md rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-[#A0522D] mb-3">Thank You!</h3>
          <p className="text-gray-700">
            Your feedback has been submitted successfully.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
