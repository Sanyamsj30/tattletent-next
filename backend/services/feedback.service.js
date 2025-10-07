let feedbacks = [];

export const saveFeedbackToDB = async ({ complaint_id, rating, comment }) => {
  const newFeedback = {
    id: feedbacks.length + 1,
    complaint_id,
    rating,
    comment,
    created_at: new Date().toISOString(),
  };

  feedbacks.push(newFeedback);
  return newFeedback;
};

export const getFeedbacksFromDB = async () => {
  return feedbacks;
};

export const getFeedbacksForComplaintFromDB = async (complaint_id) => {
  return feedbacks.filter((f) => f.complaint_id === complaint_id);
};
