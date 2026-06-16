import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { submitFeedback } from "../../api/feedback.api";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiStar, FiFileText, FiCalendar, FiArrowLeft, FiTag } from "react-icons/fi";

const FeedbackPage = () => {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const location = useLocation();
  const { complaint } = location.state || {}; 

  // Clean guard redirect hook
  useEffect(() => {
    if (!complaint) {
      navigate("/citizen-dashboard", { replace: true });
    }
  }, [complaint, navigate]);

  if (!complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { 
        complaint_id: complaint.id,
        rating,
        comment: review,
      };

      await submitFeedback(payload);
      setSubmitted(true);
      setTimeout(() => {
        navigate("/citizen-dashboard", { replace: true });
      }, 1800);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.response?.data?.message || "Failed to submit feedback.");
    }
  };

  return (
    <AppLayout requiredRole="Citizen">
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mt-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Resolution Feedback
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Rate your resolution and let us know how we can improve our community maintenance services.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/citizen-dashboard")} className="gap-2 text-xs">
            <FiArrowLeft /> Back to Console
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Target Complaint Summary Card */}
          <div className="md:col-span-5 space-y-6">
            <Card className="bg-white border border-slate-200/80 shadow-sm text-slate-800">
              <CardContent className="p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3.5">
                  <span className="text-[10px] font-extrabold text-primary-600 uppercase tracking-widest">Grievance Resolved</span>
                  <h3 className="text-lg font-black mt-1 text-slate-900">Complaint #{complaint.id}</h3>
                  <p className="text-xs text-indigo-600 font-extrabold mt-1.5 uppercase tracking-wider">{complaint.category}</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Narrative Summary</span>
                    <p className="text-slate-800 bg-slate-50/70 border border-slate-100 p-4 rounded-2xl leading-relaxed italic truncate-3-lines">
                      "{complaint.description}"
                    </p>
                  </div>

                  {complaint.update && (
                    <div className="pt-3 flex items-center gap-2 text-slate-550 font-bold text-[10px] uppercase tracking-wider">
                      <FiCalendar className="text-primary-500 text-sm" /> Resolved: {new Date(complaint.update).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form / Submitted Thank You Box */}
          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="feedback-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="border border-slate-100 shadow-sm bg-white">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Star Rating Section */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Rate the Resolution Experience <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2.5 py-1">
                            {[...Array(5)].map((star, index) => {
                              const ratingValue = index + 1;
                              const isLit = ratingValue <= (hover || rating);
                              return (
                                <label key={index} className="relative select-none">
                                  <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    className="hidden"
                                    onClick={() => setRating(ratingValue)}
                                  />
                                  <FaStar
                                    size={36}
                                    className="cursor-pointer transition-all duration-150 transform hover:scale-110 active:scale-95"
                                    color={isLit ? "#fbbf24" : "#e2e8f0"}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Review text field */}
                        <div className="space-y-1.5">
                          <label htmlFor="review" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Written Feedback Review <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="review"
                            required
                            rows={5}
                            name="comment"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience with the contractor assignment, resolution speed, and outcome quality..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none transition-all leading-relaxed"
                          />
                        </div>

                        {/* Submit Row */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={!rating || !review}
                            className="w-full shadow-md"
                          >
                            Submit Verification Review
                          </Button>
                        </div>

                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="thank-you"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                    <FiCheckCircle />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Feedback Submitted</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
                    Thank you! Your ratings have been logged. The SLA audit score of the contractor will update accordingly. Redirecting...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </AppLayout>
  );
};

export default FeedbackPage;
