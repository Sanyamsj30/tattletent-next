import Complaint from '../models/Complaint.js';
import { callGemini } from '../services/ai.service.js';

/**
 * Check if a newly submitted complaint is a semantic duplicate of another active complaint.
 */
export const checkDuplicateComplaint = async (newComplaintData) => {
  try {
    const { title, description, category, location, latitude, longitude, currentId } = newComplaintData;

    // Filter active complaints (NEW or IN_PROGRESS) in same category
    const query = {
      category,
      status: { $in: ['NEW', 'IN_PROGRESS'] },
      is_deleted: { $ne: true }
    };

    // Geospatial pre-filter (100-meter radius)
    if (latitude != null && longitude != null) {
      query.geolocation = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: 100
        }
      };
    }

    // If we have an existing ID (e.g. updating), exclude it
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const candidates = await Complaint.find(query).limit(10).lean();

    if (!candidates || candidates.length === 0) {
      return { isDuplicate: false, similarityScore: 0, duplicateOf: null, explanation: "No similar complaints found within geographic proximity." };
    }

    // Prepare prompt comparing new complaint with existing candidates
    const candidateListStr = candidates.map(c => 
      `ID: ${c._id.toString()}\nTitle: ${c.title}\nDescription: ${c.description}\nLocation: ${c.location}`
    ).join('\n---\n');

    const prompt = `
      You are an expert AI City Governance Assistant at TattleTent.
      Analyze whether the following newly submitted complaint is a duplicate of one of the existing active complaints in our list.
      Two complaints are duplicates if they refer to the EXACT SAME physical incident or problem at the same location, even if phrased differently.

      NEW COMPLAINT:
      Title: ${title}
      Description: ${description}
      Location: ${location}

      EXISTING CANDIDATES:
      ${candidateListStr}

      Respond strictly in JSON format as follows:
      {
        "isDuplicate": true or false,
        "similarityScore": 0 to 100 integer representing the confidence,
        "duplicateOf": "ID of the matched duplicate complaint (or null if none)",
        "explanation": "Brief explanation of your duplicate assessment and why you recommend merging them."
      }
    `;

    const systemInstruction = "You are a strict duplicate grievance validator. Only output valid JSON matching the requested structure.";
    const responseText = await callGemini(prompt, systemInstruction, true);

    try {
      const parsedResult = JSON.parse(responseText);
      return {
        isDuplicate: !!parsedResult.isDuplicate,
        similarityScore: Number(parsedResult.similarityScore || 0),
        duplicateOf: parsedResult.duplicateOf || null,
        explanation: parsedResult.explanation || ''
      };
    } catch (parseErr) {
      console.error('Failed to parse duplicate detection response:', responseText, parseErr);
      return { isDuplicate: false, similarityScore: 0, duplicateOf: null, explanation: 'Failed to parse AI response.' };
    }
  } catch (err) {
    console.error('Error in duplicateDetectionAgent:', err);
    return { isDuplicate: false, similarityScore: 0, duplicateOf: null, explanation: 'Error during duplicate analysis.' };
  }
};
