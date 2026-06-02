import { callGroq } from '../services/ai.service.js';
import Complaint from '../models/Complaint.js';

/**
 * Chatbot Agent: Answers citizen questions in natural language.
 * Inject active complaints context to answer questions like "What's the status of my pathway report?"
 */
export const handleChatbotMessage = async (userId, userMessage) => {
  try {
    let complaintsContext = '';

    if (userId) {
      const activeComplaints = await Complaint.find({
        user_id: userId,
        status: { $in: ['NEW', 'IN_PROGRESS'] }
      }).limit(5).lean();

      if (activeComplaints && activeComplaints.length > 0) {
        complaintsContext = activeComplaints.map(c => 
          `- ID: #${c._id.toString().substring(18)}\n  Category: ${c.category}\n  Title: ${c.title}\n  Status: ${c.status}\n  Submitted: ${c.submitted_at?.toLocaleDateString()}`
        ).join('\n');
      } else {
        complaintsContext = "You currently have no active complaints.";
      }
    } else {
      complaintsContext = "User is not logged in. Active complaints cannot be retrieved.";
    }

    const systemInstruction = `
      You are Tenty, the friendly Citizen AI Assistant for the TattleTent governance platform.
      You help citizens check their complaint status, guide them on how to submit a new complaint, explain the SLA guidelines (Low = 72 hrs, Medium = 48 hrs, High = 24 hrs), and resolve city FAQs.
      
      Respond directly, warmly, and clearly. Keep replies concise and formatted beautifully using markdown.
      Always support multilingual responses if the user greets you in Spanish, Hindi, French, or any other language.
      
      CITIZEN'S CURRENT ACTIVE COMPLAINTS CONTEXT:
      ${complaintsContext}
      
      TATTLETENT COMPLAINT CATEGORIES:
      - Pathway Damage (e.g. broken pavers, tiles)
      - Water Leak (e.g. leaking pipes, water burst)
      - Garbage (e.g. overflowing waste bin)
      - Electrical (e.g. street light out, electrical spark)
    `;

    const response = await callGroq(userMessage, systemInstruction);
    return response;
  } catch (err) {
    console.error('Error in citizenChatbotAgent:', err);
    return "Hi there! I'm Tenty. I'm experiencing a small connection delay, but rest assured our municipal teams are working round the clock to resolve all civic complaints. You can track status directly on your dashboard!";
  }
};
