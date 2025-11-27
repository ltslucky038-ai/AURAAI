// // server.js (Final and Complete Backend Code with Accuracy Fixes)

// require('dotenv').config(); 
// const express = require('express');
// const cors = require('cors'); 
// const { GoogleGenAI } = require('@google/genai');

// // --- 2. CONFIGURATION & KEY CHECK ---
// const PORT = process.env.PORT || 3000;
// const app = express();
// const GEMINI_MODEL = 'gemini-2.5-flash'; 

// // API Key Environment Variable से ही लोड होगी
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// if (!GEMINI_API_KEY) {
//     console.error("❌ FATAL ERROR: GEMINI_API_KEY environment variable is NOT set.");
//     process.exit(1); 
// }
// console.log(`Debug Check: API Key loaded (Length): ${GEMINI_API_KEY.length > 5 ? GEMINI_API_KEY.length : 'Too Short!'}`);

// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 

// // --- 3. MIDDLEWARE SETUP ---
// app.use(cors()); 
// app.use(express.json()); 
// // 'public' फ़ोल्डर को static फ़ाइलों के रूप में serve करें
// app.use(express.static('public')); 

// // --- CRITICAL SYSTEM INSTRUCTION (अंतिम और कठोर निर्देश) ---
// const SYSTEM_INSTRUCTION = `
// You are 'Vision', an AI Assistant specializing in real-time information and conversational AI. Your primary goal is to be helpful, safe, and adhere strictly to all formatting requirements.

// 1. **TOOL USE & ACCURACY (CRITICAL FOCUS ON WEATHER - UPDATED FOR CURRENT DATA):**
//  * You MUST use the **Google Search** tool for all current and real-time information.
//  * **Highest Accuracy Weather (FINAL RULE):** You MUST provide the most accurate and correct weather information for *any* requested location, including large cities, small towns, and villages. Before finalizing the weather response:
//  a. **MANDATORY REFINEMENT:** Your search query MUST explicitly include the phrase "CURRENT weather for [City Name] NOW" to ensure the freshest data.
//  b. **CROSS-VERIFY:** You MUST cross-verify the data (especially temperature, city, and time/date) retrieved from Google Search to ensure it represents the requested location and **CURRENT conditions**. If the search results are ambiguous or contradictory (e.g., showing a forecast instead of current data), you MUST search again for clarification to ensure correctness.

// 2. **MANDATORY WEATHER STRUCTURE (VITAL for Parsing):**
//  * If the user asks for the weather, your response **MUST** start with a summary, followed immediately by the structured 'Details:' block.
//  * This structured block is **MANDATORY** for client-side parsing and **MUST** contain these 6 specific details exactly in this order: Humidity, Wind speed, Pressure, UV Index, and Air Quality (with AQI Index).
//  * **Air Quality Requirement:** The Air Quality detail **MUST** include both the descriptive level (e.g., Moderate, Unhealthy) and the numerical AQI index in parentheses (e.g., Moderate (105)).
//  * **Do NOT** use Celsius and Fahrenheit in the same sentence. Use the degree symbol (°C or °F) only once with the temperature value.
//  * The description part (e.g., 'sunny/cloudy') must be in **English** for consistent client-side icon parsing.

//  **MANDATORY OUTPUT EXAMPLE (Do NOT include this instruction in the final output):**
//  "Current weather in Delhi, India is 28°C and partly cloudy. Details: Humidity: 60%, Wind speed: 10 km/h, Pressure: 1012 hPa, UV Index: 5, Air Quality: Moderate (105)."
 
//  (Ensure all six detail labels are present.)

// 3. **Language:** Respond **STRICTLY** in **Hindi (Latin script) or English**, depending on the user's query language. Use relevant **Emojis** (sticker emotion) in your responses.
// `;
// // ---------------------------------------------


// // --- 4. API CALL FUNCTION using SDK ---
// // This function performs the actual call to Gemini, including Google Search Tooling.
// async function callGeminiApi(userQuery) {
//     // We make a stateless call (no history maintained on the server-side)
//     const contents = [{ role: 'user', parts: [{ text: userQuery }] }];

//     const config = {
//         tools: [{ googleSearch: {} }], 
//         systemInstruction: SYSTEM_INSTRUCTION,
//     };
    
//     // Using the models.generateContent for stateless requests
//     const result = await ai.models.generateContent({ 
//         model: GEMINI_MODEL, 
//         contents: contents, 
//         config: config
//     });
    
//     const botText = result.text;
//     let sources = [];

//     // Sources metadata निकालें (Grounding)
//     const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
//     if (groundingMetadata && groundingMetadata.groundingChunks) {
//         // Remove duplicate URIs
//         const uniqueSources = new Set();
//         sources = groundingMetadata.groundingChunks
//             .map(chunk => ({
//                 uri: chunk.web?.uri,
//                 title: chunk.web?.title,
//             }))
//             .filter(source => source.uri && source.title && !uniqueSources.has(source.uri) && uniqueSources.add(source.uri));
//     }
    
//     return { botText, sources };
// }


// // --- 5. CHAT ENDPOINT (Used by frontend to fetch weather) ---
// app.post('/api/chat', async (req, res) => {
//     // The frontend sends the city name in the 'message' field
//     const { message } = req.body; 
    
//     if (!message) {
//         return res.status(400).json({ error: 'City name (message) is required' });
//     }

//     // ⭐ CRITICAL CHANGE: Query modified to force "CURRENT weather NOW" search 
//     const query = `What is the CURRENT weather for ${message} NOW? Provide the details in the mandatory format.`;

//     try {
//         const response = await callGeminiApi(query);
        
//         console.log(`Gemini Response for '${message}':`, response.botText); 
        
//         res.status(200).json(response); 

//     } catch (error) {
//         console.error('❌ Gemini API call failed:', error.message);
        
//         let clientStatus = 500;
//         let errorMsg = 'API call mein koi error hai: Internal Server Error. Kripya Gemini API Key aur server logs check karein.';

//         if (error.message.includes('API_KEY_INVALID') || error.message.includes('403') || error.message.includes('401')) {
//             clientStatus = 403; 
//             errorMsg = "API Access Denied (Status 403/401). कृपया अपनी GEMINI_API_KEY और Billing status की जाँच करें।"; 
//         }

//         res.status(clientStatus).json({ 
//             botText: errorMsg,
//             sources: [] 
//         });
//     }
// });

// // --- 6. SERVER START ---
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     console.log("-----------------------------------------------------");
//     console.log(`✅ Server ready on port ${PORT}.`);
//     console.log("-----------------------------------------------------");
//     // Remind user to restart the server after changes
//     console.log("💡 IMPORTANT: Restart the server (Ctrl+C, then 'node server.js') after any changes to .env or server.js!");
// });
// server.js (Final and Complete Backend Code with JSON Output Fixes)

require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const { GoogleGenAI, Type } = require('@google/genai'); // Type को इंपोर्ट किया गया है!

// --- 2. CONFIGURATION & KEY CHECK ---
const PORT = process.env.PORT || 3000;
const app = express();
// Tezi ke liye 'gemini-2.5-flash' hi best hai
const GEMINI_MODEL = 'gemini-2.5-flash'; 

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY environment variable is NOT set.");
    process.exit(1); 
}
console.log(`Debug Check: API Key loaded (Length): ${GEMINI_API_KEY.length > 5 ? GEMINI_API_KEY.length : 'Too Short!'}`);

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 

// --- 3. MIDDLEWARE SETUP ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// --- 4. JSON SCHEMA DEFINITION (CRITICAL FOR SPEED AND ACCURACY) ---
// Model ko pata chalega ki woh kis format mein jawab dega
const WEATHER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        city: {
            type: Type.STRING,
            description: "The name of the city and country for which the weather is reported."
        },
        temp: {
            type: Type.OBJECT,
            properties: {
                current: { type: Type.NUMBER, description: "Current temperature in Celsius." },
                feelsLike: { type: Type.NUMBER, description: "Real feel temperature in Celsius." },
            },
            required: ["current", "feelsLike"]
        },
        description: {
            type: Type.STRING,
            description: "A short English summary of current weather (e.g., 'Partly cloudy', 'Clear sky')."
        },
        details: {
            type: Type.OBJECT,
            properties: {
                humidity: { type: Type.STRING, description: "Current humidity percentage, e.g., '60%'." },
                windSpeed: { type: Type.STRING, description: "Wind speed with units, e.g., '10 km/h'." },
                pressure: { type: Type.STRING, description: "Atmospheric pressure with units, e.g., '1012 hPa'." },
                uvIndex: { type: Type.NUMBER, description: "UV Index number, e.g., 5." },
                aqiIndex: { type: Type.NUMBER, description: "Air Quality Index (AQI) number, e.g., 105." }
            },
            required: ["humidity", "windSpeed", "pressure", "uvIndex", "aqiIndex"]
        }
    },
    required: ["city", "temp", "description", "details"],
    description: "Current real-time weather data for the specified location."
};

// --- 5. SYSTEM INSTRUCTION FOR JSON ---
// Instruction ko chhota aur to-the-point rakha gaya hai
const SYSTEM_INSTRUCTION_JSON = `
You are 'Vision', an AI Assistant specializing in accurate, real-time weather information. 
1. Use the **Google Search** tool for all current weather data. 
2. Your response MUST strictly adhere to the provided JSON Schema, containing the most current weather for the requested city. 
3. All temperatures MUST be in **Celsius**.
`;


// --- 6. API CALL FUNCTION for JSON Output ---
async function callGeminiApiJson(userQuery) {
    const contents = [{ role: 'user', parts: [{ text: userQuery }] }];

    const config = {
        tools: [{ googleSearch: {} }], 
        systemInstruction: SYSTEM_INSTRUCTION_JSON,
        responseMimeType: "application/json", // Jald aur nishchit format ke liye
        responseSchema: WEATHER_SCHEMA,
    };
    
    // Using generateContent for structured output
    const result = await ai.models.generateContent({ 
        model: GEMINI_MODEL, 
        contents: contents, 
        config: config
    });
    
    // Response सीधे JSON object ke roop mein aayega
    const jsonString = result.text.trim();
    return JSON.parse(jsonString); 
}


// --- 7. CHAT ENDPOINT (JSON Response Dega) ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body; 
    
    if (!message) {
        return res.status(400).json({ error: 'City name (message) is required' });
    }

    // Query mein ab format ki zarurat nahi, sirf city ka naam
    const query = `Provide the CURRENT weather for ${message} NOW.`;

    try {
        const weatherJson = await callGeminiApiJson(query);
        
        console.log(`Gemini JSON Response for '${message}':`, JSON.stringify(weatherJson)); 
        
        // JSON response client-side par bhej diya gaya
        res.status(200).json(weatherJson); 

    } catch (error) {
        console.error('❌ Gemini API call failed:', error.message);
        
        res.status(500).json({ 
            error: true,
            message: 'API call mein koi error hai. Server logs check karein.',
            details: error.message
        });
    }
});

// --- 8. SERVER START ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("-----------------------------------------------------");
    console.log(`✅ Server ready on port ${PORT}.`);
    console.log("-----------------------------------------------------");
});