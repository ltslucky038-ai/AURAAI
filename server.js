
// require('dotenv').config(); 
// const express = require('express');
// const cors = require('cors'); 
// const { GoogleGenAI, Type } = require('@google/genai'); // Type को इंपोर्ट किया गया है!

// // --- 2. CONFIGURATION & KEY CHECK ---
// const PORT = process.env.PORT || 3000;
// const app = express();
// // Tezi ke liye 'gemini-2.5-flash' hi best hai
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

// // --- 4. JSON SCHEMA DEFINITION (CRITICAL FOR SPEED AND ACCURACY) ---
// // Model ko pata chalega ki woh kis format mein jawab dega
// const WEATHER_SCHEMA = {
//     type: Type.OBJECT,
//     properties: {
//         city: {
//             type: Type.STRING,
//             description: "The name of the city and country for which the weather is reported."
//         },
//         temp: {
//             type: Type.OBJECT,
//             properties: {
//                 current: { type: Type.NUMBER, description: "Current temperature in Celsius." },
//                 feelsLike: { type: Type.NUMBER, description: "Real feel temperature in Celsius." },
//             },
//             required: ["current", "feelsLike"]
//         },
//         description: {
//             type: Type.STRING,
//             description: "A short English summary of current weather (e.g., 'Partly cloudy', 'Clear sky')."
//         },
//         details: {
//             type: Type.OBJECT,
//             properties: {
//                 humidity: { type: Type.STRING, description: "Current humidity percentage, e.g., '60%'." },
//                 windSpeed: { type: Type.STRING, description: "Wind speed with units, e.g., '10 km/h'." },
//                 pressure: { type: Type.STRING, description: "Atmospheric pressure with units, e.g., '1012 hPa'." },
//                 uvIndex: { type: Type.NUMBER, description: "UV Index number, e.g., 5." },
//                 aqiIndex: { type: Type.NUMBER, description: "Air Quality Index (AQI) number, e.g., 105." }
//             },
//             required: ["humidity", "windSpeed", "pressure", "uvIndex", "aqiIndex"]
//         }
//     },
//     required: ["city", "temp", "description", "details"],
//     description: "Current real-time weather data for the specified location."
// };

// // --- 5. SYSTEM INSTRUCTION FOR JSON ---
// // Instruction ko chhota aur to-the-point rakha gaya hai
// const SYSTEM_INSTRUCTION_JSON = `
// You are 'Vision', an AI Assistant specializing in accurate, real-time weather information. 
// 1. Use the **Google Search** tool for all current weather data. 
// 2. Your response MUST strictly adhere to the provided JSON Schema, containing the most current weather for the requested city. 
// 3. All temperatures MUST be in **Celsius**.
// `;


// // --- 6. API CALL FUNCTION for JSON Output ---
// async function callGeminiApiJson(userQuery) {
//     const contents = [{ role: 'user', parts: [{ text: userQuery }] }];

//     const config = {
//         tools: [{ googleSearch: {} }], 
//         systemInstruction: SYSTEM_INSTRUCTION_JSON,
//         responseMimeType: "application/json", // Jald aur nishchit format ke liye
//         responseSchema: WEATHER_SCHEMA,
//     };
    
//     // Using generateContent for structured output
//     const result = await ai.models.generateContent({ 
//         model: GEMINI_MODEL, 
//         contents: contents, 
//         config: config
//     });
    
//     // Response सीधे JSON object ke roop mein aayega
//     const jsonString = result.text.trim();
//     return JSON.parse(jsonString); 
// }


// // --- 7. CHAT ENDPOINT (JSON Response Dega) ---
// app.post('/api/chat', async (req, res) => {
//     const { message } = req.body; 
    
//     if (!message) {
//         return res.status(400).json({ error: 'City name (message) is required' });
//     }

//     // Query mein ab format ki zarurat nahi, sirf city ka naam
//     const query = `Provide the CURRENT weather for ${message} NOW.`;

//     try {
//         const weatherJson = await callGeminiApiJson(query);
        
//         console.log(`Gemini JSON Response for '${message}':`, JSON.stringify(weatherJson)); 
        
//         // JSON response client-side par bhej diya gaya
//         res.status(200).json(weatherJson); 

//     } catch (error) {
//         console.error('❌ Gemini API call failed:', error.message);
        
//         res.status(500).json({ 
//             error: true,
//             message: 'API call mein koi error hai. Server logs check karein.',
//             details: error.message
//         });
//     }
// });

// // --- 8. SERVER START ---
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     console.log("-----------------------------------------------------");
//     console.log(`✅ Server ready on port ${PORT}.`);
//     console.log("-----------------------------------------------------");
// });
require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const { GoogleGenAI, Type } = require('@google/genai');

// --- 2. CONFIGURATION & KEY CHECK ---
// Render, environment variable process.env.PORT को सेट करता है
const PORT = process.env.PORT || 3000; 
const app = express();
const GEMINI_MODEL = 'gemini-2.5-flash'; 

// Render Environment से API Key लोड करें
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

if (!GEMINI_API_KEY) {
    // यह Render logs में दिखेगा अगर API Key missing है
    console.error("❌ FATAL ERROR: GEMINI_API_KEY environment variable is NOT set on Render.");
    // Render को बताएँ कि प्रोसेस विफल हो गया है
    process.exit(1); 
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 
console.log(`✅ Gemini client initialized.`);

// --- 3. MIDDLEWARE SETUP ---
// ⭐ महत्वपूर्ण: CORS को सभी राउट्स के लिए सक्षम (enabled) करें
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// --- 4. JSON SCHEMA DEFINITION (Fast and Accurate Output) ---
const WEATHER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        city: {
            type: Type.STRING,
            description: "The name of the city and country for which the weather is reported, e.g., 'New Delhi, India'."
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

// --- 5. SYSTEM INSTRUCTION ---
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
        responseMimeType: "application/json", 
        responseSchema: WEATHER_SCHEMA,
    };
    
    const result = await ai.models.generateContent({ 
        model: GEMINI_MODEL, 
        contents: contents, 
        config: config
    });
    
    const jsonString = result.text.trim();
    
    // ⭐ सुधार: JSON parsing error को हैंडल करें
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("❌ JSON Parsing Failed. Raw text:", jsonString);
        throw new Error("Failed to parse weather data from API (Invalid JSON format received).");
    }
}


// --- 7. CHAT ENDPOINT ---
app.post('/api/chat', async (req, res) => {
    // Render पर POST requests को तेजी से प्रोसेस करें
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const { message } = req.body; 
    
    if (!message) {
        return res.status(400).json({ error: 'City name (message) is required' });
    }

    const query = `Provide the CURRENT weather for ${message} NOW.`;

    try {
        const weatherJson = await callGeminiApiJson(query);
        
        console.log(`✅ Success for '${message}'.`); 
        
        res.status(200).json(weatherJson); 

    } catch (error) {
        console.error('❌ API call or Processing failed:', error.message);
        
        res.status(500).json({ 
            error: true,
            message: 'API call mein error hai. Kya city valid hai?',
            details: error.message
        });
    }
});

// --- 8. SERVER START ---
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});