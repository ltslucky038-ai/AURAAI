
const API_KEY = "de414a9b4341a549efd4b962de804908"; 
const BASE_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const BASE_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const DEFAULT_CITY = "New York";
// [Fix: Proper Proxy Server URL] 
const GEMINI_PROXY_URL = "http://localhost:3000/api/chat"; 
let unit = 'C'; // Default unit is Celsius
let currentLat = 40.7128; // Default New York Lat
let currentLon = -74.0060; // Default New York Lon
// --- 2. DOM ELEMENT REFERENCES ---
const cityNameEl = document.getElementById('cityName');
const currentDateEl = document.getElementById('currentDate');
const currentTimeEl = document.getElementById('currentTime');
const searchCityInput = document.getElementById('searchCityInput');
const searchCityButton = document.getElementById('searchCityButton');
const errorMsgEl = document.getElementById('errorMsg');
const unitToggle = document.getElementById('unitToggle');
// Main Content Elements
const tempEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const pressureEl = document.getElementById('pressure');
const aqiIndexEl = document.getElementById('aqiIndex');
const aqiDescriptionEl = document.getElementById('aqiDescription');
const uvIndexEl = document.getElementById('uvIndex');
const uvAdviceEl = document.getElementById('uvAdvice');
// Forecast Elements
const hourlyContainer = document.getElementById('hourlyForecastContainer');
const dailyContainer = document.getElementById('dailyForecastContainer');
// --- 3. HELPER FUNCTIONS ---
// Temperature conversion
const convertTemp = (temp, currentUnit) => {
    if (currentUnit === 'C') {
        // Convert Kelvin to Celsius (K - 273.15)
        return Math.round(temp - 273.15); 
    } else {
        // Convert Kelvin to Fahrenheit ((K - 273.15) * 9/5 + 32)
        return Math.round(((temp - 273.15) * 9 / 5) + 32); 
    }
};
// Weather condition to Lucide Icon mapping
const getWeatherIcon = (condition) => {
    condition = condition.toLowerCase();
    if (condition.includes('clear')) return 'sun';
    if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('partly cloudy')) return 'cloud';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'cloud-rain';
    if (condition.includes('thunderstorm')) return 'cloud-lightning';
    if (condition.includes('snow')) return 'cloud-snow';
    if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) return 'cloud-fog';
    return 'thermometer'; // Default icon
};
// UV Index Advice (Simplified)
const getUVAdvice = (index) => {
    index = parseFloat(index);
    if (isNaN(index)) return 'N/A';
    if (index < 3) return 'Low';
    if (index < 6) return 'Moderate';
    if (index < 8) return 'High';
    if (index < 11) return 'Very High';
    return 'Extreme';
};
// AQI Color and Description (Mocked as real AQI requires different API)
const getAqiInfo = (aqi) => {
    if (aqi <= 50) return { desc: 'Good', color: 'bg-green-600' };
    if (aqi <= 100) return { desc: 'Moderate', color: 'bg-yellow-600' };
    if (aqi <= 150) return { desc: 'Unhealthy for Sensitive Groups', color: 'bg-orange-600' };
    return { desc: 'Unhealthy', color: 'bg-red-600' };
};
// --- 4. MAP AND CHART INITIALIZATION ---
let map;
let aqiChartInstance;
// Initialize Leaflet Map
const initMap = (lat, lon) => {
    if (map) {
        map.remove(); // Remove existing map instance
    }
    map = L.map('weatherMap', { zoomControl: false }).setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(map);

    L.marker([lat, lon]).addTo(map);
};
// Initialize Chart.js Chart
const initAqiChart = (aqiData) => {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    // Destroy previous chart instance if exists
    if (aqiChartInstance) {
        aqiChartInstance.destroy();
    }
    aqiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: aqiData.labels,
            datasets: [{
                label: 'AQI',
                data: aqiData.data,
                borderColor: '#00eaff',
                backgroundColor: 'rgba(0, 234, 255, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#00eaff',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { min: 0, ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
};
// --- 5. DATA FETCHERS ---
// Real time and date updates
const updateTime = () => {
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    currentTimeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
setInterval(updateTime, 1000);
updateTime(); // Initial call
// Fetch main weather data (Current, Feels Like, Wind, Pressure, etc.)
async function fetchCurrentWeather(city) {
    if (API_KEY === "YOUR_API_KEY_HERE" || API_KEY.length < 10) {
        throw new Error("API Key not configured. Please get an OpenWeatherMap API key and replace it in script.js.");
    }
    const url = `${BASE_WEATHER_URL}?q=${city}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch current weather for ${city}. Status: ${response.status}`);
    }
    return response.json();
}
// Fetch forecast data (Hourly and Daily)
async function fetchForecast(city) {
    const url = `${BASE_FORECAST_URL}?q=${city}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.warn(`Could not fetch forecast for ${city}. Status: ${response.status}`);
        return null; 
    }
    return response.json();
}
// Fetch mock AQI data 
function getMockAqiData() {
    return {
        index: Math.floor(Math.random() * 150) + 10, // Mock AQI value
        chart: {
            labels: ['1AM', '4AM', '7AM', '10AM', '1PM', '4PM', '7PM'],
            data: [55, 60, 45, 70, 80, 75, 65] 
        },
        uvIndex: Math.floor(Math.random() * 11) + 1 // Mock UV index
    };
}
//  [FIXED: Gemini API Fallback Function with Parsing] 
// Helper function to extract structured details from Gemini text
const parseGeminiDetails = (text) => {
    const details = {};
    const detailsMatch = text.match(/Details:\s*([^.]*)/i); // Extract everything after 'Details:'
    if (detailsMatch && detailsMatch[1]) {
        // Split by comma and process each key:value pair
        const parts = detailsMatch[1].split(',').map(p => p.trim());
        parts.forEach(part => {
            const [key, value] = part.split(':').map(s => s.trim());
            if (key && value) {
                // Normalize key for easy access (e.g., 'Wind speed' -> 'windspeed')
                details[key.toLowerCase().replace(/\s/g, '')] = value;
            }
        });
    }
    // Extract Temperature and Description from the summary part before 'Details:'
    const summaryMatch = text.match(/(Current weather in [^,]+, [^ ]+.*)\s+Details:/i);
    if (summaryMatch && summaryMatch[1]) {
        // Extract temperature (e.g., "28°C")
        const tempMatch = summaryMatch[1].match(/is\s*([0-9.]+°[CF])/i);
        // Extract description (e.g., "partly cloudy") - must be in English from system instruction
        const descMatch = summaryMatch[1].match(/and\s*([a-zA-Z\s]+)\./i); 
        details.temperature = tempMatch ? tempMatch[1] : 'N/A';
        details.description = descMatch ? descMatch[1].trim() : 'N/A';
    }
    return details;
};
async function fetchWeatherFallbackFromGemini(city) {
    try {
        const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // The server expects the city name in the 'message' field
            body: JSON.stringify({ message: city }), 
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Proxy Server Error: ${errorData.botText || errorData.error || 'Unknown error'}`);
        }
        const data = await response.json();
        // --- CRITICAL STEP: Parse the structured text from Gemini ---
        const parsedDetails = parseGeminiDetails(data.botText);
        return {
            name: city, 
            isGemini: true,
            summary: data.botText, 
            details: parsedDetails, // Parsed structure for UI update
        };
    } catch (error) {
        console.error("Gemini Proxy Request Error:", error);
        return {
            isGemini: false,
            error: error.message
        };
    }
}
// --- 6. RENDER FUNCTIONS ---
// Render main current weather details (for OWM data)
const renderCurrentWeather = (data) => {
    const tempC = convertTemp(data.main.temp, 'C');
    const feelsLikeC = convertTemp(data.main.feels_like, 'C');
    currentLat = data.coord.lat;
    currentLon = data.coord.lon;
    // Main Section Update
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    tempEl.textContent = `${unit === 'C' ? tempC : convertTemp(data.main.temp, 'F')}°${unit}`;
    descriptionEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent = `${unit === 'C' ? feelsLikeC : convertTemp(data.main.feels_like, 'F')}°${unit}`;
    // Icon Update
    const iconName = getWeatherIcon(data.weather[0].main);
    document.getElementById('weatherIcon').innerHTML = `<i data-lucide="${iconName}" class="lucide-icon-glow" style="width: 120px; height: 120px;"></i>`;
    lucide.createIcons();
    // Metrics Update
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // m/s to km/h
    pressureEl.textContent = `${data.main.pressure} hPa`;
    // Mock AQI/UV Data Update (since OWM doesn't provide these easily)
    const aqiData = getMockAqiData();
    const aqiInfo = getAqiInfo(aqiData.index);
    aqiIndexEl.textContent = aqiData.index;
    aqiDescriptionEl.textContent = `Air Quality: ${aqiInfo.desc}`;
    aqiDescriptionEl.className = `aqi-pill py-1 px-3 rounded-full text-white shadow-lg ${aqiInfo.color}`;
    uvIndexEl.textContent = aqiData.uvIndex;
    uvAdviceEl.textContent = `(${getUVAdvice(aqiData.uvIndex)})`;
    // Map and Chart Update
    initMap(currentLat, currentLon);
    initAqiChart(aqiData.chart);
    errorMsgEl.classList.add('hidden');
};
// >>> [FIXED: Gemini Fallback Render Function] <<<
const renderGeminiFallback = (data) => {
    // Icon: AI Summary
    document.getElementById('weatherIcon').innerHTML = `<i data-lucide="sparkles" class="lucide-icon-glow" style="width: 120px; height: 120px;"></i>`;
    lucide.createIcons();
    const details = data.details || {};
    // 1. Main Section Update
    cityNameEl.textContent = `${data.name} (AI Summary)`; 
    // 2. Display Parsed Temperature and Description
    // We display Gemini's output as is, as we cannot reliably convert its text temp (e.g., 28°C) to F
    tempEl.textContent = details.temperature || 'AI Data'; 
    // Display the full description/summary in the description area
    descriptionEl.innerHTML = `<span class="text-lg text-yellow-300 font-normal">
        ${details.description || data.summary || 'Summary not available.'}
    </span>`;
    feelsLikeEl.textContent = `N/A`; // Gemini doesn't reliably provide feels like
    // 3. Metrics Update using Parsed Data
    humidityEl.textContent = details.humidity || `N/A`;
    windSpeedEl.textContent = details.windspeed || `N/A`;
    pressureEl.textContent = details.pressure || `N/A`;
    // AQI Update (Parse AQI index and description from Air Quality: Moderate (105))
    const aqiMatch = details.airquality ? details.airquality.match(/^([^ (]+)\s*\(([^)]+)\)/) : null;
    const aqiDescText = aqiMatch ? aqiMatch[1] : 'N/A'; // e.g., Moderate
    const aqiValue = aqiMatch ? aqiMatch[2] : 'N/A'; // e.g., 105
    aqiIndexEl.textContent = aqiValue;
    // Use aqiValue for color if numeric, otherwise default to grey
    const aqiInfo = getAqiInfo(parseInt(aqiValue) || 200); 
    aqiDescriptionEl.textContent = `Air Quality: ${aqiDescText}`;
    aqiDescriptionEl.className = `aqi-pill py-1 px-3 rounded-full text-white shadow-lg ${aqiValue === 'N/A' ? 'bg-gray-600' : aqiInfo.color}`;
    // UV Update
    uvIndexEl.textContent = details.uvindex || 'N/A';
    uvAdviceEl.textContent = `(${getUVAdvice(details.uvindex || 0)})`;
    // 4. Map and Chart initialization will use default/current values or can be cleared
    initMap(currentLat, currentLon); 
    initAqiChart({ labels: [], data: [] }); 
    errorMsgEl.textContent = 'Weather API failed to find the city. Using Gemini AI for general weather summary with parsed details.';
    errorMsgEl.classList.remove('hidden');
};
// Render hourly forecast
const renderHourlyForecast = (data) => {
    hourlyContainer.innerHTML = ''; // Clear previous content
    const hourlyList = data.list.slice(0, 5); 
    if (hourlyList.length === 0) {
        hourlyContainer.innerHTML = '<p class="text-gray-500 text-center w-full">No hourly data available.</p>';
        return;
    }
    hourlyList.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const temp = unit === 'C' ? convertTemp(item.main.temp, 'C') : convertTemp(item.main.temp, 'F');
        const iconName = getWeatherIcon(item.weather[0].main);
        const hourlyCard = document.createElement('div');
        hourlyCard.className = 'w-24 p-3 rounded-xl border border-aurora-frame/50 bg-aurora-dark/50 flex flex-col items-center flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:border-aurora-blue/50';
        hourlyCard.innerHTML = `
            <p class="text-sm font-semibold">${time}</p>
            <i data-lucide="${iconName}" class="w-6 h-6 my-2 text-aurora-blue lucide-icon-glow"></i>
            <p class="text-lg font-bold">${temp}°${unit}</p>
            <p class="text-xs text-gray-400 capitalize">${item.weather[0].description}</p>
        `;
        hourlyContainer.appendChild(hourlyCard);
    });
    lucide.createIcons(); // Re-render icons
};
// Render daily (weekly) forecast
const renderDailyForecast = (data) => {
    dailyContainer.innerHTML = ''; // Clear previous content
    const dailyData = {};
    const today = new Date().toDateString();
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayString = date.toDateString();
        if (dayString !== today && Object.keys(dailyData).length < 5) {
             // Only save if it's the first reading for the day
            if (!dailyData[dayString]) {
                dailyData[dayString] = {
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temp_max: item.main.temp_max,
                    temp_min: item.main.temp_min,
                    icon: getWeatherIcon(item.weather[0].main)
                };
            } else {
                // Update max/min for the day
                dailyData[dayString].temp_max = Math.max(dailyData[dayString].temp_max, item.main.temp_max);
                dailyData[dayString].temp_min = Math.min(dailyData[dayString].temp_min, item.main.temp_min);
            }
        }
    });
    Object.values(dailyData).forEach(day => {
        const maxTemp = unit === 'C' ? convertTemp(day.temp_max, 'C') : convertTemp(day.temp_max, 'F');
        const minTemp = unit === 'C' ? convertTemp(day.temp_min, 'C') : convertTemp(day.temp_min, 'F');
        const dailyCard = document.createElement('div');
        dailyCard.className = 'w-32 p-3 rounded-xl border border-aurora-frame/50 bg-aurora-dark/50 flex flex-col items-center flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:border-aurora-blue/50';
        dailyCard.innerHTML = `
            <p class="text-sm font-semibold">${day.day}</p>
            <i data-lucide="${day.icon}" class="w-8 h-8 my-2 text-aurora-blue lucide-icon-glow"></i>
            <p class="text-lg font-bold">${maxTemp}°${unit}</p>
            <p class="text-sm text-gray-400">Low: ${minTemp}°${unit}</p>
        `;
        dailyContainer.appendChild(dailyCard);
    });
    lucide.createIcons(); // Re-render icons
};
// --- 7. MAIN CONTROLLER ---
async function fetchAllWeatherData(city) {
    // Initial loading state setup...
    errorMsgEl.classList.add('hidden');
    errorMsgEl.textContent = '';
    tempEl.textContent = '...';
    descriptionEl.textContent = 'Fetching data...';
    hourlyContainer.innerHTML = '<p class="text-gray-400 text-center w-full">Loading hourly...</p>';
    dailyContainer.innerHTML = '<p class="text-gray-400 text-center w-full">Loading weekly...</p>';
    try {
        // 1. Attempt OpenWeatherMap Call
        const currentData = await fetchCurrentWeather(city);
        renderCurrentWeather(currentData);
        // 2. Fetch Forecast (If OWM succeeded)
        const forecastData = await fetchForecast(city);
        if (forecastData) {
            renderHourlyForecast(forecastData);
            renderDailyForecast(forecastData);
        } else {
            hourlyContainer.innerHTML = '<p class="text-gray-500 text-center w-full">Hourly forecast data unavailable.</p>';
            dailyContainer.innerHTML = '<p class="text-gray-500 text-center w-full">Weekly forecast data unavailable.</p>';
        }
    } catch (error) {
        console.warn(`OWM failed for ${city}: ${error.message}. Attempting Gemini fallback.`);
        // 3. OWM Failed: Attempt Gemini Fallback
        const geminiResult = await fetchWeatherFallbackFromGemini(city);
        if (geminiResult.isGemini) {
            // Gemini succeeded: Render the summary with parsed metrics
            renderGeminiFallback(geminiResult); 
            // Forecast is unavailable with AI summary
            hourlyContainer.innerHTML = '<p class="text-yellow-400 text-center w-full">Hourly forecast not available with AI summary.</p>';
            dailyContainer.innerHTML = '<p class="text-yellow-400 text-center w-full">Weekly forecast not available with AI summary.</p>';
        } else {
            // Both OWM and Gemini failed
            console.error("Fatal Error: Both APIs failed.", geminiResult.error);
            errorMsgEl.textContent = `Error: City not found, and AI fallback failed. Details: ${geminiResult.error || error.message}`;
            errorMsgEl.classList.remove('hidden');
            // Reset display on error
            cityNameEl.textContent = 'Location Error';
            tempEl.textContent = 'N/A';
            descriptionEl.textContent = 'Failed to load weather data.';
            hourlyContainer.innerHTML = '<p class="text-red-400 text-center w-full">Error loading data.</p>';
            dailyContainer.innerHTML = '<p class="text-red-400 text-center w-full">Error loading data.</p>';
        }
    }
}
// --- 8. EVENT LISTENERS ---
// Search button click or Enter key press
searchCityButton.addEventListener('click', () => {
    const city = searchCityInput.value.trim();
    if (city) {
        fetchAllWeatherData(city);
    }
});
searchCityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCityButton.click();
    }
});
// Unit Toggle
unitToggle.addEventListener('click', () => {
    // Only allow unit change if OWM data is currently displayed
    const currentCityText = cityNameEl.textContent.trim();
    if (!currentCityText.includes('(AI Summary)') && currentCityText !== 'Location Error') {
        unit = (unit === 'C') ? 'F' : 'C';
        unitToggle.querySelector('span').textContent = (unit === 'C') ? 'Switch to °F' : 'Switch to °C';
        // We need to re-fetch to get correct OWM data based on the original city name
        const cityParts = currentCityText.split(',')[0].trim();
        fetchAllWeatherData(cityParts);  
    } else {
        // Cannot change units for AI summary
        alert('Cannot change temperature units for AI-generated text summary. Please search a known city first.');
    }
});
// Navigation logic 
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', (e) => {
        const section = e.currentTarget.getAttribute('data-section');
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active-nav-item'));
        e.currentTarget.classList.add('active-nav-item');
        document.getElementById('todayDetailsSection').style.display = (section === 'TODAY' || section === 'HOURLY' || section === 'WEEKLY') ? 'grid' : 'none'; 
        document.getElementById('hourlyForecastSection').style.display = (section === 'HOURLY' || section === 'TODAY') ? 'block' : 'none';
        document.getElementById('weeklyForecastSection').style.display = (section === 'WEEKLY' || section === 'TODAY') ? 'block' : 'none';
        if (window.innerWidth < 1024) {
             const target = document.getElementById(section === 'TODAY' ? 'todayDetailsSection' : (section === 'HOURLY' ? 'hourlyForecastSection' : 'weeklyForecastSection'));
             if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
        }
    });
});
// --- 9. INITIALIZATION ---
window.onload = () => {
    // Initial UI setup (custom CSS for glow, etc.)
    const style = document.createElement('style');
    style.textContent = `
        .lucide-icon-glow {
            filter: drop-shadow(0 0 5px #00eaff) drop-shadow(0 0 10px #00eaff);
        }
        .detail-metric {
            padding: 1rem;
            border-radius: 0.5rem;
            background-color: rgba(5, 10, 15, 0.5); 
            border: 1px solid rgba(0, 255, 255, 0.1); 
            transition: all 0.3s ease;
        }
        .detail-metric:hover {
            background-color: rgba(0, 40, 60, 0.7);
            border-color: #00eaff;
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            text-decoration: none;
            color: #ccc;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .nav-item:hover {
            color: #fff;
            background-color: rgba(0, 255, 255, 0.1);
        }
        .active-nav-item {
            color: #00eaff;
            background-color: rgba(0, 255, 255, 0.2);
            font-weight: bold;
        }
        /* Fix for Leaflet dark theme */
        #weatherMap {
            filter: invert(90%) hue-rotate(180deg);
        }
    `;
    document.head.appendChild(style);
    // Load default city weather
    fetchAllWeatherData(DEFAULT_CITY);
};

