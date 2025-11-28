// require('dotenv').config(); // Load environment variables from .env file

// const express = require('express');
// const cors = require('cors'); 
// const { GoogleGenAI } = require('@google/genai'); 

// // --- 2. CONFIGURATION & KEY CHECK ---
// const PORT = process.env.PORT || 3000;
// const app = express();
// const GEMINI_MODEL = 'gemini-2.5-flash'; 

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
// app.use(express.static('public')); 

// // --- CRITICAL SYSTEM INSTRUCTION (अंतिम और कठोर निर्देश) ---
// const SYSTEM_INSTRUCTION = `
// You are 'Vision', an AI Assistant specializing in real-time information and conversational AI. Your primary goal is to be helpful, safe, and adhere strictly to all formatting requirements.

// 1. **TOOL USE & ACCURACY (CRITICAL FOCUS ON WEATHER - UPDATED FOR CURRENT DATA):**
//     * You MUST use the **Google Search** tool for all current and real-time information.
//     * **Highest Accuracy Weather (FINAL RULE):** You MUST provide the most accurate and correct weather information for *any* requested location, including large cities, small towns, and villages. Before finalizing the weather response:
//     a. **MANDATORY REFINEMENT:** Your search query MUST explicitly include the phrase "CURRENT weather for [City Name] NOW" to ensure the freshest data.
//     b. **CROSS-VERIFY:** You MUST cross-verify the data (especially temperature, city, and time/date) retrieved from Google Search to ensure it represents the requested location and **CURRENT conditions**. If the search results are ambiguous or contradictory (e.g., showing a forecast instead of current data), you MUST search again for clarification to ensure correctness.

// 2. **MANDATORY WEATHER STRUCTURE (VITAL for Parsing):**
//     * If the user asks for the weather, your response **MUST** start with a summary, followed immediately by the structured 'Details:' block.
//     * This structured block is **MANDATORY** for client-side parsing and **MUST** contain these 6 specific details exactly in this order: Humidity, Wind speed, Pressure, UV Index, and Air Quality (with AQI Index).
//     * **Air Quality Requirement:** The Air Quality detail **MUST** include both the descriptive level (e.g., Moderate, Unhealthy) and the numerical AQI index in parentheses (e.g., Moderate (105)).
//     * **Do NOT** use Celsius and Fahrenheit in the same sentence. Use the degree symbol (°C or °F) only once with the temperature value.
//     * The description part (e.g., 'sunny/cloudy') must be in **English** for consistent client-side icon parsing.

//     **MANDATORY OUTPUT EXAMPLE (Do NOT include this instruction in the final output):**
//     "Current weather in Delhi, India is 28°C and partly cloudy. Details: Humidity: 60%, Wind speed: 10 km/h, Pressure: 1012 hPa, UV Index: 5, Air Quality: Moderate (105)."
    
//     (Ensure all six detail labels are present.)

// 3. **Language:** Respond **STRICTLY** in **Hindi (Latin script) or English**, depending on the user's query language. Use relevant **Emojis** (sticker emotion) in your responses.
// `;
// // ---------------------------------------------


// // --- 4. API CALL FUNCTION using SDK ---
// async function callGeminiApi(userQuery) {
//     const contents = [{ role: 'user', parts: [{ text: userQuery }] }];

//     const config = {
//         tools: [{ googleSearch: {} }], 
//         systemInstruction: SYSTEM_INSTRUCTION,
//     };
    
//     const result = await ai.models.generateContent({ 
//         model: GEMINI_MODEL, 
//         contents: contents, 
//         config: config
//     });
    
//     const botText = result.text;
//     let sources = [];

//     const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
//     if (groundingMetadata && groundingMetadata.groundingChunks) {
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
//     const { message } = req.body; 
    
//     if (!message) {
//         return res.status(400).json({ error: 'City name (message) is required' });
//     }

//     const query = `What is the CURRENT weather for ${message} NOW? Provide the details in the mandatory format.`;

//     try {
//         const response = await callGeminiApi(query);
        
//         console.log(`[Response] Gemini Response for '${message}':`, response.botText); 
        
//         res.status(200).json(response); 

//     } catch (error) {
//         console.error('❌ Gemini API call failed:', error.message);
        
//         let clientStatus = 500;
//         let errorMsg = 'API call mein koi error hai: Internal Server Error. Kripya Gemini API Key aur server logs check karein.';

//         if (error.message.includes('API_KEY_INVALID') || error.message.includes('403') || error.message.includes('401')) {
//             clientStatus = 403; 
//             errorMsg = "API Access Denied (Status 403/401). कृपया अपनी GEMINI_API_KEY और Billing status की जाँच करें।"; 
//         } else if (error.message.includes('TIMEOUT')) {
//             errorMsg = "Request timeout. Kripya apna network connection aur server ki availability check karein.";
//             clientStatus = 504;
//         }

//         res.status(clientStatus).json({ 
//             botText: errorMsg,
//             sources: [] 
//         });
//     }
// });

// // --- 6. SERVER START ---
// app.listen(PORT, () => {
//     console.log("-----------------------------------------------------");
//     console.log(`✅ Server is running on http://localhost:${PORT}`);
//     console.log("-----------------------------------------------------");
//     console.log("💡 IMPORTANT: Restart the server (Ctrl+C, then 'node server.js') after any changes to .env or server.js!");
// });
// server.js (Final and Complete Backend Code)

// --- 1. SETUP (CommonJS Require Syntax) ---
require('dotenv').config(); 

const express = require('express');
const cors = require('cors'); 
const { GoogleGenAI } = require('@google/genai'); 

// --- 2. CONFIGURATION & KEY CHECK ---
const PORT = process.env.PORT || 3000;
const app = express();
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

// --- CRITICAL SYSTEM INSTRUCTION ---
const SYSTEM_INSTRUCTION = `
You are 'Vision', an AI Assistant specializing in real-time information and conversational AI. Your primary goal is to be helpful, safe, and adhere strictly to all formatting requirements.

1. **TOOL USE & ACCURACY (CRITICAL FOCUS ON WEATHER):**
    * You MUST use the **Google Search** tool for all current and real-time information.
    * **Highest Accuracy Weather (FINAL RULE):** You MUST provide the most accurate and correct current weather information.
    a. **MANDATORY REFINEMENT:** Your search query MUST explicitly include the phrase "CURRENT weather for [City Name] NOW" to ensure the freshest data.
    b. **CROSS-VERIFY:** You MUST cross-verify the data retrieved from Google Search to ensure it represents the requested location and **CURRENT conditions**.

2. **MANDATORY WEATHER STRUCTURE (VITAL for Parsing):**
    * If the user asks for the weather, your response **MUST** start with a summary, followed immediately by the structured 'Details:' block.
    * This structured block is **MANDATORY** for client-side parsing and **MUST** contain these 6 specific details exactly in this order: **Humidity, Wind speed, Pressure, UV Index, and Air Quality (with AQI Index)**.
    * **Air Quality Requirement:** The Air Quality detail **MUST** include both the descriptive level (e.g., Moderate, Unhealthy) and the numerical AQI index in parentheses (e.g., Moderate (105)).
    * The description part (e.g., 'sunny/cloudy') must be in **English** for consistent client-side icon parsing.

    **MANDATORY OUTPUT EXAMPLE:**
    "Current weather in Delhi, India is 28°C and partly cloudy. Details: Humidity: 60%, Wind speed: 10 km/h, Pressure: 1012 hPa, UV Index: 5, Air Quality: Moderate (105)."
    
3. **Language:** Respond **STRICTLY** in **Hindi (Latin script) or English**, depending on the user's query language. Use relevant **Emojis** in your responses.
`;
// ---------------------------------------------


// --- 4. API CALL FUNCTION using SDK ---
async function callGeminiApi(userQuery) {
    const contents = [{ role: 'user', parts: [{ text: userQuery }] }];

    const config = {
        tools: [{ googleSearch: {} }], 
        systemInstruction: SYSTEM_INSTRUCTION,
    };
    
    const result = await ai.models.generateContent({ 
        model: GEMINI_MODEL, 
        contents: contents, 
        config: config
    });
    
    const botText = result.text;
    let sources = [];

    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata && groundingMetadata.groundingChunks) {
        const uniqueSources = new Set();
        sources = groundingMetadata.groundingChunks
            .map(chunk => ({
                uri: chunk.web?.uri,
                title: chunk.web?.title,
            }))
            .filter(source => source.uri && source.title && !uniqueSources.has(source.uri) && uniqueSources.add(source.uri));
    }
    
    return { botText, sources };
}


// --- 5. CHAT ENDPOINT (Used by frontend to fetch weather) ---
app.post('/api/chat', async (req, res) => {
    // Note: The frontend sends the city name in the 'message' field
    const { message } = req.body; 
    
    if (!message) {
        return res.status(400).json({ error: 'City name (message) is required' });
    }

    const query = `What is the CURRENT weather for ${message} NOW? Provide the details in the mandatory format.`;

    try {
        const response = await callGeminiApi(query);
        
        console.log(`[Response] Gemini Response for '${message}':`, response.botText); 
        
        res.status(200).json(response); 

    } catch (error) {
        console.error('❌ Gemini API call failed:', error.message);
        
        let clientStatus = 500;
        let errorMsg = 'API call mein koi error hai: Internal Server Error. Kripya Gemini API Key aur server logs check karein.';

        if (error.message.includes('API_KEY_INVALID') || error.message.includes('403') || error.message.includes('401')) {
            clientStatus = 403; 
            errorMsg = "API Access Denied (Status 403/401). कृपया अपनी GEMINI_API_KEY और Billing status की जाँच करें।"; 
        } else if (error.message.includes('TIMEOUT')) {
            errorMsg = "Request timeout. Kripya apna network connection aur server ki availability check karein.";
            clientStatus = 504;
        }

        res.status(clientStatus).json({ 
            botText: errorMsg,
            sources: [] 
        });
    }
});

// --- 6. SERVER START ---
app.listen(PORT, () => {
    console.log("-----------------------------------------------------");
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log("-----------------------------------------------------");
    console.log("💡 IMPORTANT: Restart the server (Ctrl+C, then 'node server.js') after any changes to .env or server.js!");
});