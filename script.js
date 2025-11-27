// const WEATHER_API_ENDPOINT = 'https://auraai-12.onrender.com/api/chat'; 
// // ⭐ NOTE: REPLACE 'YOUR_GEOCODING_API_KEY' with your actual API key!
// // यह Key OpenCage Data से है और इसे client-side पर इस्तेमाल किया जा सकता है।
// const GEOCODING_API_KEY = '9a571351ccb74e2aa233f574e9801767'; // ⚠️ अपनी Key यहाँ डालें

// // 💾 Global State & Memory
// let currentUnit = 'celsius'; 
// let currentWeatherData = null; 
// let mapInstance = null;
// let aqiChartInstance = null; 
// const cityCoordinatesCache = {}; 
// // --- DOM Elements ---
// const weatherContent = document.getElementById('weatherContent');
// const unitToggle = document.getElementById('unitToggle');
// const cityNameEl = document.getElementById('cityName');
// const temperatureEl = document.getElementById('temperature');
// const currentDateEl = document.getElementById('currentDate'); 
// const currentTimeEl = document.getElementById('currentTime'); 
// const descriptionEl = document.getElementById('description');
// const feelsLikeEl = document.getElementById('feelsLike');
// const humidityEl = document.getElementById('humidity');
// const windSpeedEl = document.getElementById('windSpeed');
// const pressureEl = document.getElementById('pressure');
// const aqiIndexEl = document.getElementById('aqiIndex');
// const uvIndexEl = document.getElementById('uvIndex');
// const aqiDescriptionEl = document.getElementById('aqiDescription');
// const uvAdviceEl = document.getElementById('uvAdvice');
// const weatherIconEl = document.getElementById('weatherIcon');
// const hourlyForecastContainer = document.getElementById('hourlyForecastContainer');
// const dailyForecastContainer = document.getElementById('dailyForecastContainer');
// const searchCityInput = document.getElementById('searchCityInput'); 
// const searchCityButton = document.getElementById('searchCityButton'); 
// const errorMsg = document.getElementById('errorMsg');

// // ⭐ SCROLL TARGETS from HTML
// const hourlyTabButton = document.getElementById('hourlyTabButton');
// const dailyTabButton = document.getElementById('dailyTabButton');
// const hourlyForecastSection = document.getElementById('hourlyForecastSection');
// const weeklyForecastSection = document.getElementById('weeklyForecastSection');


// // ======================================================================
// // === 2. UTILITY & UI UPDATE FUNCTIONS ===
// // ======================================================================

// const getAqiDescription = (aqiIndex) => {
//     const index = parseInt(aqiIndex);
//     if (isNaN(index)) return { description: 'N/A', classes: 'bg-gray-500 text-white' };

//     if (index <= 50) return { description: 'Good (Accha)', classes: 'bg-green-500 text-white' };
//     if (index <= 100) return { description: 'Moderate (Theek)', classes: 'bg-yellow-500 text-gray-900' };
//     if (index <= 150) return { description: 'Unhealthy for Sensitive Groups (Nuksaandeh)', classes: 'bg-orange-500 text-white' };
//     if (index <= 200) return { description: 'Unhealthy (Kharab)', classes: 'bg-red-500 text-white' };
//     if (index <= 300) return { description: 'Very Unhealthy (Bahut Kharab)', classes: 'bg-purple-600 text-white' };
//     return { description: 'Hazardous (Khatarnaak)', classes: 'bg-red-700 text-white' };
// };

// const getUVAdvice = (uvIndex) => {
//     const index = parseFloat(uvIndex);
//     if (isNaN(index)) return 'UV data not available.';

//     if (index <= 2) return 'Low: Protection not needed.';
//     if (index <= 5) return 'Moderate: Wear sun protection.';
//     if (index <= 7) return 'High: Seek shade and wear protection.';
//     if (index <= 10) return 'Very High: Avoid midday sun.';
//     return 'Extreme: Take all precautions.';
// };

// const updateClock = () => {
//     const now = new Date();
//     const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true }; 

//     if (currentDateEl) currentDateEl.textContent = now.toLocaleDateString(undefined, dateOptions);
//     if (currentTimeEl) currentTimeEl.textContent = now.toLocaleTimeString(undefined, timeOptions);
// };

// const formatTemperature = (tempBase, unitSymbol) => {
//     let displayTemp;
//     const baseTempCelsius = parseFloat(tempBase);

//     // Assume input temperature is Celsius unless explicitly converted elsewhere
//     let tempC = baseTempCelsius; 
    
//     if (isNaN(tempC)) return 'N/A'; 

//     if (currentUnit === 'celsius') {
//         displayTemp = tempC;
//         unitSymbol = '°C';
//     } else {
//         // Convert Celsius to Fahrenheit
//         displayTemp = (tempC * 9/5) + 32;
//         unitSymbol = '°F';
//     }
//     return `${displayTemp.toFixed(0)}${unitSymbol}`; 
// };

// const getWeatherIconName = (description) => {
//     const desc = (description || '').toLowerCase();
//     if (desc.includes('sun') || desc.includes('clear')) return { icon: 'sun' };
//     if (desc.includes('cloud') || desc.includes('overcast')) return { icon: 'cloud' };
//     if (desc.includes('rain') || desc.includes('drizzle')) return { icon: 'cloud-rain' };
//     if (desc.includes('thunder') || desc.includes('storm')) return { icon: 'cloud-lightning' };
//     if (desc.includes('snow') || desc.includes('freezing')) return { icon: 'snowflake' };
//     if (desc.includes('mist') || desc.includes('haze') || desc.includes('fog')) return { icon: 'cloud-fog' };
//     if (desc.includes('partly')) return { icon: 'cloud-sun' };
//     return { icon: 'thermometer' }; 
// };

// const showMessage = (message, isError = true) => {
//     if (!errorMsg) return;
//     errorMsg.textContent = message;
//     errorMsg.classList.toggle('hidden', !message);
//     errorMsg.classList.toggle('text-red-400', isError);
//     errorMsg.classList.toggle('text-green-400', !isError);
// };

// const smoothScrollTo = (element) => {
//     if (element) {
//         element.scrollIntoView({
//             behavior: 'smooth',
//             block: 'start' 
//         });
//     }
// };

// const clearWeatherUI = (isInitial = false) => {
//     currentWeatherData = null;

//     cityNameEl.textContent = '...';
//     temperatureEl.textContent = '...';
//     descriptionEl.textContent = '...';
//     feelsLikeEl.textContent = '...';
    
//     humidityEl.textContent = 'N/A';
//     windSpeedEl.textContent = 'N/A';
//     pressureEl.textContent = 'N/A';
//     aqiIndexEl.textContent = 'N/A';

//     aqiDescriptionEl.textContent = '...';
//     aqiDescriptionEl.className = 'aqi-pill py-1 px-3 rounded-full text-white shadow-lg bg-gray-500';
//     uvAdviceEl.textContent = 'N/A';
//     uvIndexEl.textContent = 'N/A';
    
//     weatherIconEl.innerHTML = `<i data-lucide="sun" class="lucide-icon-glow text-aurora-blue" style="width: 120px; height: 120px;"></i>`;

//     const placeholderText = isInitial ? 'Enter a city name to see the forecast.' : 'Forecast data N/A.';
//     hourlyForecastContainer.innerHTML = `<p id="hourlyPlaceholder" class="text-gray-500 text-center w-full">${placeholderText}</p>`;
//     dailyForecastContainer.innerHTML = `<p id="dailyPlaceholder" class="text-gray-500 text-center w-full">${placeholderText}</p>`;
//     showMessage("");
    
//     if (mapInstance) { mapInstance.remove(); mapInstance = null; }
//     if (aqiChartInstance) { aqiChartInstance.destroy(); aqiChartInstance = null; }
// };

// const updateWeatherUI = (data, lat, lon) => {
//     if (!data) {
//         clearWeatherUI();
//         return;
//     }
    
//     const currentTemp = parseFloat(data.temp.current);
//     // Use current temp as fallback for feelsLike if N/A
//     const feelsLikeTemp = parseFloat(data.temp.feelsLike !== 'N/A' ? data.temp.feelsLike : data.temp.current);

//     cityNameEl.textContent = data.city || 'Location Unknown';
//     temperatureEl.textContent = formatTemperature(currentTemp, '°C'); 
//     descriptionEl.textContent = data.description || 'N/A';
//     feelsLikeEl.textContent = formatTemperature(feelsLikeTemp, '°C');

//     const iconData = getWeatherIconName(data.description || '');
//     weatherIconEl.innerHTML = `<i data-lucide="${iconData.icon}" class="lucide-icon-glow text-aurora-blue" style="width: 120px; height: 120px;"></i>`;

//     humidityEl.textContent = data.details.humidity || 'N/A';
//     // Assuming windSpeed input is in m/s or km/h and stored with units
//     windSpeedEl.textContent = data.details.windSpeed || 'N/A'; 
//     pressureEl.textContent = data.details.pressure || 'N/A';
    
//     const aqiInfo = getAqiDescription(data.details.aqiIndex || 'N/A');
//     aqiIndexEl.textContent = data.details.aqiIndex || 'N/A';
//     aqiDescriptionEl.textContent = aqiInfo.description;
//     aqiDescriptionEl.className = `aqi-pill py-1 px-3 rounded-full text-white shadow-lg ${aqiInfo.classes}`;
    
//     uvIndexEl.textContent = data.details.uvIndex || 'N/A';
//     uvAdviceEl.textContent = getUVAdvice(data.details.uvIndex);
    
//     displayForecast(hourlyForecastContainer, data.forecasts.hourly, true);
//     displayForecast(dailyForecastContainer, data.forecasts.daily, false);
    
//     // ⭐ DYNAMIC CALLS: Pass dynamic lat/lon to renderMap
//     renderMap(lat, lon, data.city); 
//     renderAqiChart(data.details.aqiIndex);

//     if (typeof lucide !== 'undefined' && lucide.createIcons) {
//         lucide.createIcons();
//     }
// };

// const displayForecast = (container, forecastArray, isHourly) => {
//     container.innerHTML = '';
//     if (!forecastArray || forecastArray.length === 0) {
//         container.innerHTML = `<p class="text-gray-500 text-center w-full">Forecast data N/A.</p>`;
//         return;
//     }

//     const htmlContent = forecastArray.map(item => {
//         const timeOrDay = isHourly ? item.time : item.day;
//         const tempDisplay = isHourly 
//             ? formatTemperature(item.temp, '°C') 
//             : `${formatTemperature(item.tempMax, '°C')} / ${formatTemperature(item.tempMin, '°C')}`; 
        
//         const iconData = getWeatherIconName(item.description);
        
//         return `
//             <div class="flex-shrink-0 p-3 bg-aurora-dark/70 rounded-xl border border-aurora-frame/10 text-center transition duration-300 hover:bg-aurora-dark/90 ${isHourly ? 'w-28' : 'w-32'}">
//                 <p class="text-sm font-medium text-gray-400">${timeOrDay}</p>
//                 <div class="my-2"><i data-lucide="${iconData.icon}" class="text-aurora-blue mx-auto" style="width: ${isHourly ? '32px' : '40px'}; height: ${isHourly ? '32px' : '40px'};"></i></div>
//                 <p class="${isHourly ? 'text-lg font-bold' : 'text-xl font-bold mt-1'}">${tempDisplay}</p>
//                 ${!isHourly ? `<p class="text-xs text-gray-400 mt-0.5">${item.description.split(' ')[0]}</p>` : ''}
//             </div>
//         `;
//     }).join('');
    
//     container.innerHTML = htmlContent;

//     if (typeof lucide !== 'undefined' && lucide.createIcons) {
//         lucide.createIcons();
//     }
// };


// // ======================================================================
// // === 3. MAP AND CHART RENDERING LOGIC ===
// // ======================================================================

// const renderMap = (lat, lon, city) => {
//     if (typeof L === 'undefined') {
//         console.error("Leaflet not loaded. Cannot render map.");
//         return;
//     }

//     if (mapInstance) {
//         mapInstance.remove(); 
//     }

//     const mapElement = document.getElementById('weatherMap');
//     if (!mapElement) return;

//     mapInstance = L.map('weatherMap').setView([lat, lon], 13);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//         maxZoom: 19
//     }).addTo(mapInstance);

//     L.marker([lat, lon]).addTo(mapInstance)
//         .bindPopup(`<b>${city}</b><br>Current location.`)
//         .openPopup();
    
//     setTimeout(() => {
//         if (mapInstance) mapInstance.invalidateSize();
//     }, 100);
    
//     mapInstance.on('remove', () => { mapInstance = null; });
// };

// const renderAqiChart = (currentAqiIndex) => {
//     if (typeof Chart === 'undefined') {
//         return;
//     }

//     const ctx = document.getElementById('aqiChart');
//     if (!ctx) return;

//     if (aqiChartInstance) {
//         aqiChartInstance.destroy(); 
//     }
    
//     const baseAqi = parseFloat(currentAqiIndex) || 100;
//     const mockData = [baseAqi - 10, baseAqi + 5, baseAqi, baseAqi - 5, baseAqi + 15];

//     aqiChartInstance = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: ['Day -2', 'Day -1', 'Today', 'Tomorrow', 'Day +2'],
//             datasets: [{
//                 label: 'AQI Level',
//                 data: mockData,
//                 borderColor: '#00eaff',
//                 backgroundColor: 'rgba(0, 234, 255, 0.2)',
//                 borderWidth: 2,
//                 tension: 0.4,
//                 fill: true,
//                 pointBackgroundColor: '#00eaff'
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     min: Math.min(...mockData) - 10,
//                     max: Math.max(...mockData) + 10,
//                     title: { display: false },
//                     grid: { color: 'rgba(255, 255, 255, 0.1)' },
//                     ticks: { color: '#bbb' }
//                 },
//                 x: {
//                     grid: { display: false },
//                     ticks: { color: '#bbb' }
//                 }
//             },
//             plugins: {
//                 legend: { display: false },
//                 title: { display: false }
//             }
//         }
//     });
// };


// // ======================================================================
// // === 4. DATA FETCHING AND PARSING LOGIC ===
// // ======================================================================

// const getCoordinatesForCity = async (city) => {
//     const defaultCoords = { lat: 27.1751, lon: 78.0421 }; // Agra, India
    
//     if (cityCoordinatesCache[city]) {
//         return cityCoordinatesCache[city];
//     }
    
//     if (!GEOCODING_API_KEY || GEOCODING_API_KEY === 'YOUR_GEOCODING_API_KEY') {
//         console.warn("Using default coordinates. Please set GEOCODING_API_KEY.");
//         return defaultCoords;
//     }

//     const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${GEOCODING_API_KEY}&limit=1`;
    
//     try {
//         const geoResponse = await fetch(geoUrl);
//         const geoData = await geoResponse.json();

//         if (geoData.results && geoData.results.length > 0) {
//             const coords = { 
//                 lat: geoData.results[0].geometry.lat, 
//                 lon: geoData.results[0].geometry.lng // ✅ FIXED: Changed geoDataData to geoData
//             };
//             cityCoordinatesCache[city] = coords; 
//             return coords;
//         }
//     } catch (error) {
//         console.error("Geocoding Fetch Error:", error);
//     }

//     return defaultCoords;
// };

// const parseWeatherReport = (text) => {
//     // This is a robust mock parser to handle the chatbot's text-based output
//     const normalizedText = (text || '').toLowerCase(); 
//     if (!normalizedText.includes('current weather') && 
//         !normalizedText.includes('details:')) {
//         return null; 
//     }
    
//     const data = {
//         city: 'N/A',
//         temp: { current: 'N/A', feelsLike: 'N/A', unit: '°C' }, 
//         description: 'N/A',
//         details: { humidity: 'N/A', windSpeed: 'N/A', pressure: 'N/A', aqiIndex: 'N/A', uvIndex: 'N/A' },
//         forecasts: { hourly: [], daily: [] }
//     };
    
//     // 1. Summary (City, Current Temp, Description)
//     const summaryMatch = text.match(/Current weather in\s*(.+?)\s*is\s*(\d+)(?:°C|°F|\s*C|\s*F)\s*and\s*([^.]+)/i);
//     const tempUnitMatch = text.match(/(\d+)(°C|°F|\s*C|\s*F)/i);
    
//     if (summaryMatch) {
//         data.city = summaryMatch[1].trim();
//         data.temp.current = summaryMatch[2].trim();
//         data.description = summaryMatch[3].trim().replace(/[.,]$/g, ''); 
//     } else if (tempUnitMatch) {
//         data.temp.current = tempUnitMatch[1];
//     }

//     // 2. Details Block
//     const detailsBlockMatch = text.match(/Details\s*:\s*(.+)/i);
//     if (detailsBlockMatch) {
//         const detailsText = detailsBlockMatch[1];
        
//         const getMatch = (label) => {
//             const regex = new RegExp(`${label}\\s*:\\s*([^,]+?)`, 'i');
//             return detailsText.match(regex)?.[1]?.trim().replace(/[.,]$/g, '') || 'N/A';
//         };

//         data.details.humidity = getMatch('Humidity');
//         data.details.windSpeed = getMatch('Wind speed');
//         data.details.pressure = getMatch('Pressure');
        
//         const uvFull = getMatch('UV Index');
//         data.details.uvIndex = uvFull.split(' ')[0] || 'N/A'; 
        
//         const aqiFull = getMatch('Air Quality');
//         if (aqiFull !== 'N/A') {
//             // Extracts number inside parentheses or first number found
//             data.details.aqiIndex = aqiFull.match(/\((\d+)\)/)?.[1] || aqiFull.match(/(\d+)/)?.[1] || 'N/A';
//         }
//     }
    
//     if (data.temp.current !== 'N/A' && data.temp.feelsLike === 'N/A') {
//         data.temp.feelsLike = data.temp.current; 
//     }
    
//     // --- Mock Forecast Data (Crucial for UI) ---
//     // Since Gemini only provides current weather, we mock the forecast for display purposes
//     if (data.temp.current !== 'N/A' && !isNaN(parseFloat(data.temp.current))) {
//         const baseTemp = parseFloat(data.temp.current);
//         const desc = data.description !== 'N/A' ? data.description : 'clear sky';
        
//         // Mock Hourly
//         const hourlyTimes = [12, 15, 18, 21, 24]; 
//         data.forecasts.hourly = hourlyTimes.map((h, index) => {
//             const tempChange = index > 2 ? -1 : index % 2; 
//             let timeLabel = h === 12 ? '12 PM' : h === 24 ? '12 AM' : `${h % 12} PM`;
//             if (h < 12) timeLabel = `${h} AM`;

//             return { time: timeLabel, temp: baseTemp + tempChange, description: index > 2 ? 'partly cloudy' : desc };
//         });

//         // Mock Daily
//         const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//         const todayIndex = new Date().getDay(); 
//         data.forecasts.daily = [];

//         for (let i = 1; i <= 5; i++) {
//             const nextDayIndex = (todayIndex + i) % 7;
//             const dayLabel = days[nextDayIndex];
            
//             const tempMax = baseTemp + (4 - (i / 2));
//             const tempMin = baseTemp - (3 + (i / 2));

//             let dayDesc = 'Clouds';
//             if (i === 1) dayDesc = 'Partly Cloudy';
//             if (i === 3) dayDesc = 'Rain';
//             if (i === 5) dayDesc = 'Clear Sky';

//             data.forecasts.daily.push({ 
//                 day: dayLabel, 
//                 tempMax: tempMax, 
//                 tempMin: tempMin, 
//                 description: dayDesc 
//             });
//         }
//     }
    
//     if (data.temp.current === 'N/A' && data.city === 'N/A') return null;
//     return data;
// };

// async function callWeatherApi(cityQuery) {
//     try {
//         const response = await fetch(WEATHER_API_ENDPOINT, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ 
//                 message: cityQuery,
//                 history: []
//             })
//         });

//         if (!response.ok) {
//             let errorDetails = `Server returned status ${response.status}.`;
//             const errorData = await response.json().catch(() => ({})); 
//             if (errorData.botText) {
//                 errorDetails = errorData.botText; 
//             }
//             throw new Error(`Connection Error: ${errorDetails}`);
//         }
        
//         const data = await response.json(); 
//         return data; 
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }

// const handleSearchSubmit = async () => {
//     const cityQuery = searchCityInput.value.trim();
//     if (cityQuery === '') {
//         showMessage("Kripya shehar ka naam darj karein. 🤔", true);
//         return;
//     }

//     searchCityButton.disabled = true;
//     searchCityInput.disabled = true;
//     showMessage(`Fetching weather for ${cityQuery}... ⏳`, false);

//     // Get coordinates first
//     const { lat, lon } = await getCoordinatesForCity(cityQuery);

//     try {
//         // Step 1: Call API (to a local server endpoint)
//         const responseData = await callWeatherApi(cityQuery);
//         const botText = responseData.botText || ''; 
        
//         // Step 2: Parse Chatbot's Text Output
//         const weatherData = parseWeatherReport(botText); 
        
//         if (weatherData) {
//             currentWeatherData = weatherData; 
//             // Step 3: Update UI
//             updateWeatherUI(weatherData, lat, lon); 
//             showMessage(`Weather successfully displayed for ${weatherData.city}. ✅`, false);

//             smoothScrollTo(weatherContent); 

//         } else {
//             showMessage(`Mausam ki jaankari nahi mil saki. Server response: "${botText}"`, true);
//             clearWeatherUI();
//         }
//     } 
//     catch (error) {
//         console.error("Weather Fetch Error:", error);
//         showMessage(`Error fetching data: ${error.message} 🛑`, true);
//         clearWeatherUI();
//     }
//     finally {
//         searchCityButton.disabled = false;
//         searchCityInput.disabled = false;
//         searchCityInput.focus();
//     }
// };
// // ======================================================================
// // === 5. EVENT LISTENERS AND INITIAL SETUP ===
// // ======================================================================
// // Toggle Celsius/Fahrenheit
// if (unitToggle) {
//     unitToggle.addEventListener('click', () => {
//         const spanEl = unitToggle.querySelector('span');
//         if (currentUnit === 'celsius') {
//             currentUnit = 'fahrenheit';
//             spanEl.textContent = 'Switch to °C';
//         } else {
//             currentUnit = 'celsius';
//             spanEl.textContent = 'Switch to °F';
//         }
//         // Re-render UI with saved data and new unit
//         if (currentWeatherData) {
//             const city = currentWeatherData.city;
//             const { lat, lon } = cityCoordinatesCache[city] || { lat: 27.1751, lon: 78.0421 };
//             updateWeatherUI(currentWeatherData, lat, lon); 
//         }
//     });
// }
// // Search Functionality
// if (searchCityButton && searchCityInput) {
//     searchCityButton.addEventListener('click', handleSearchSubmit);
//     searchCityInput.addEventListener('keypress', (event) => {
//         if (event.key === 'Enter') {
//             handleSearchSubmit();
//         }
//     });
// }
// // ⭐ SCROLLING LOGIC FOR HOURLY
// if (hourlyTabButton && hourlyForecastSection) {
//     hourlyTabButton.addEventListener('click', () => {
//         smoothScrollTo(hourlyForecastSection); 
//     });
// }
// //  SCROLLING LOGIC FOR DAILY/WEEKLY
// if (dailyTabButton && weeklyForecastSection) {
//     dailyTabButton.addEventListener('click', () => {
//         smoothScrollTo(weeklyForecastSection);
//     });
// }
// // Initial Load and Clock Setup
// window.onload = () => {
//     updateClock();
//     setInterval(updateClock, 1000); 
    
//     clearWeatherUI(true); 
    
//     // Set a default city and run the initial search
//     searchCityInput.value = 'Agra, India';
//     handleSearchSubmit();
// };


const WEATHER_API_ENDPOINT = 'https://auraai-12.onrender.com/api/chat'; 
// ⭐ NOTE: REPLACE 'YOUR_GEOCODING_API_KEY' with your actual API key!
const GEOCODING_API_KEY = '9a571351ccb74e2aa233f574e9801767'; // ⚠️ अपनी Key यहाँ डालें

// 💾 Global State & Memory
let currentUnit = 'celsius'; 
let currentWeatherData = null; 
let mapInstance = null;
let aqiChartInstance = null; 
const cityCoordinatesCache = {}; 
// --- DOM Elements ---
const weatherContent = document.getElementById('weatherContent');
const unitToggle = document.getElementById('unitToggle');
const cityNameEl = document.getElementById('cityName');
const temperatureEl = document.getElementById('temperature');
const currentDateEl = document.getElementById('currentDate'); 
const currentTimeEl = document.getElementById('currentTime'); 
const descriptionEl = document.getElementById('description');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const pressureEl = document.getElementById('pressure');
const aqiIndexEl = document.getElementById('aqiIndex');
const uvIndexEl = document.getElementById('uvIndex');
const aqiDescriptionEl = document.getElementById('aqiDescription');
const uvAdviceEl = document.getElementById('uvAdvice');
const weatherIconEl = document.getElementById('weatherIcon');
const hourlyForecastContainer = document.getElementById('hourlyForecastContainer');
const dailyForecastContainer = document.getElementById('dailyForecastContainer');
const searchCityInput = document.getElementById('searchCityInput'); 
const searchCityButton = document.getElementById('searchCityButton'); 
const errorMsg = document.getElementById('errorMsg');

// ⭐ SCROLL TARGETS from HTML
const hourlyTabButton = document.getElementById('hourlyTabButton');
const dailyTabButton = document.getElementById('dailyTabButton');
const hourlyForecastSection = document.getElementById('hourlyForecastSection');
const weeklyForecastSection = document.getElementById('weeklyForecastSection');


// ======================================================================
// === 2. UTILITY & UI UPDATE FUNCTIONS ===
// ======================================================================

const getAqiDescription = (aqiIndex) => {
    const index = parseInt(aqiIndex);
    if (isNaN(index)) return { description: 'N/A', classes: 'bg-gray-500 text-white' };

    if (index <= 50) return { description: 'Good (Accha)', classes: 'bg-green-500 text-white' };
    if (index <= 100) return { description: 'Moderate (Theek)', classes: 'bg-yellow-500 text-gray-900' };
    if (index <= 150) return { description: 'Unhealthy for Sensitive Groups (Nuksaandeh)', classes: 'bg-orange-500 text-white' };
    if (index <= 200) return { description: 'Unhealthy (Kharab)', classes: 'bg-red-500 text-white' };
    if (index <= 300) return { description: 'Very Unhealthy (Bahut Kharab)', classes: 'bg-purple-600 text-white' };
    return { description: 'Hazardous (Khatarnaak)', classes: 'bg-red-700 text-white' };
};

const getUVAdvice = (uvIndex) => {
    const index = parseFloat(uvIndex);
    if (isNaN(index)) return 'UV data not available.';

    if (index <= 2) return 'Low: Protection not needed.';
    if (index <= 5) return 'Moderate: Wear sun protection.';
    if (index <= 7) return 'High: Seek shade and wear protection.';
    if (index <= 10) return 'Very High: Avoid midday sun.';
    return 'Extreme: Take all precautions.';
};

const updateClock = () => {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true }; 

    if (currentDateEl) currentDateEl.textContent = now.toLocaleDateString(undefined, dateOptions);
    if (currentTimeEl) currentTimeEl.textContent = now.toLocaleTimeString(undefined, timeOptions);
};

const formatTemperature = (tempBase, unitSymbol) => {
    let displayTemp;
    const baseTempCelsius = parseFloat(tempBase);

    // Assume input temperature is Celsius unless explicitly converted elsewhere
    let tempC = baseTempCelsius; 
    
    if (isNaN(tempC)) return 'N/A'; 

    if (currentUnit === 'celsius') {
        displayTemp = tempC;
        unitSymbol = '°C';
    } else {
        // Convert Celsius to Fahrenheit
        displayTemp = (tempC * 9/5) + 32;
        unitSymbol = '°F';
    }
    return `${displayTemp.toFixed(0)}${unitSymbol}`; 
};

const getWeatherIconName = (description) => {
    const desc = (description || '').toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return { icon: 'sun' };
    if (desc.includes('cloud') || desc.includes('overcast')) return { icon: 'cloud' };
    if (desc.includes('rain') || desc.includes('drizzle')) return { icon: 'cloud-rain' };
    if (desc.includes('thunder') || desc.includes('storm')) return { icon: 'cloud-lightning' };
    if (desc.includes('snow') || desc.includes('freezing')) return { icon: 'snowflake' };
    if (desc.includes('mist') || desc.includes('haze') || desc.includes('fog')) return { icon: 'cloud-fog' };
    if (desc.includes('partly')) return { icon: 'cloud-sun' };
    return { icon: 'thermometer' }; 
};

const showMessage = (message, isError = true) => {
    if (!errorMsg) return;
    errorMsg.textContent = message;
    errorMsg.classList.toggle('hidden', !message);
    errorMsg.classList.toggle('text-red-400', isError);
    errorMsg.classList.toggle('text-green-400', !isError);
};

const smoothScrollTo = (element) => {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start' 
        });
    }
};

const clearWeatherUI = (isInitial = false) => {
    currentWeatherData = null;

    cityNameEl.textContent = '...';
    temperatureEl.textContent = '...';
    descriptionEl.textContent = '...';
    feelsLikeEl.textContent = '...';
    
    humidityEl.textContent = 'N/A';
    windSpeedEl.textContent = 'N/A';
    pressureEl.textContent = 'N/A';
    aqiIndexEl.textContent = 'N/A';

    aqiDescriptionEl.textContent = '...';
    aqiDescriptionEl.className = 'aqi-pill py-1 px-3 rounded-full text-white shadow-lg bg-gray-500';
    uvAdviceEl.textContent = 'N/A';
    uvIndexEl.textContent = 'N/A';
    
    weatherIconEl.innerHTML = `<i data-lucide="sun" class="lucide-icon-glow text-aurora-blue" style="width: 120px; height: 120px;"></i>`;

    const placeholderText = isInitial ? 'Enter a city name to see the forecast.' : 'Forecast data N/A.';
    hourlyForecastContainer.innerHTML = `<p id="hourlyPlaceholder" class="text-gray-500 text-center w-full">${placeholderText}</p>`;
    dailyForecastContainer.innerHTML = `<p id="dailyPlaceholder" class="text-gray-500 text-center w-full">${placeholderText}</p>`;
    showMessage("");
    
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    if (aqiChartInstance) { aqiChartInstance.destroy(); aqiChartInstance = null; }
};

const updateWeatherUI = (data, lat, lon) => {
    if (!data) {
        clearWeatherUI();
        return;
    }
    
    const currentTemp = parseFloat(data.temp.current);
    // Use current temp as fallback for feelsLike if N/A
    const feelsLikeTemp = parseFloat(data.temp.feelsLike !== 'N/A' ? data.temp.feelsLike : data.temp.current);

    cityNameEl.textContent = data.city || 'Location Unknown';
    temperatureEl.textContent = formatTemperature(currentTemp, '°C'); 
    descriptionEl.textContent = data.description || 'N/A';
    feelsLikeEl.textContent = formatTemperature(feelsLikeTemp, '°C');

    const iconData = getWeatherIconName(data.description || '');
    weatherIconEl.innerHTML = `<i data-lucide="${iconData.icon}" class="lucide-icon-glow text-aurora-blue" style="width: 120px; height: 120px;"></i>`;

    humidityEl.textContent = data.details.humidity || 'N/A';
    // Assuming windSpeed input is in m/s or km/h and stored with units
    windSpeedEl.textContent = data.details.windSpeed || 'N/A'; 
    pressureEl.textContent = data.details.pressure || 'N/A';
    
    const aqiInfo = getAqiDescription(data.details.aqiIndex || 'N/A');
    aqiIndexEl.textContent = data.details.aqiIndex || 'N/A';
    aqiDescriptionEl.textContent = aqiInfo.description;
    aqiDescriptionEl.className = `aqi-pill py-1 px-3 rounded-full text-white shadow-lg ${aqiInfo.classes}`;
    
    uvIndexEl.textContent = data.details.uvIndex || 'N/A';
    uvAdviceEl.textContent = getUVAdvice(data.details.uvIndex);
    
    displayForecast(hourlyForecastContainer, data.forecasts.hourly, true);
    displayForecast(dailyForecastContainer, data.forecasts.daily, false);
    
    // ⭐ DYNAMIC CALLS: Pass dynamic lat/lon to renderMap
    renderMap(lat, lon, data.city); 
    renderAqiChart(data.details.aqiIndex);

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
};

const displayForecast = (container, forecastArray, isHourly) => {
    container.innerHTML = '';
    if (!forecastArray || forecastArray.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center w-full">Forecast data N/A.</p>`;
        return;
    }

    const htmlContent = forecastArray.map(item => {
        const timeOrDay = isHourly ? item.time : item.day;
        const tempDisplay = isHourly 
            ? formatTemperature(item.temp, '°C') 
            : `${formatTemperature(item.tempMax, '°C')} / ${formatTemperature(item.tempMin, '°C')}`; 
        
        const iconData = getWeatherIconName(item.description);
        
        return `
            <div class="flex-shrink-0 p-3 bg-aurora-dark/70 rounded-xl border border-aurora-frame/10 text-center transition duration-300 hover:bg-aurora-dark/90 ${isHourly ? 'w-28' : 'w-32'}">
                <p class="text-sm font-medium text-gray-400">${timeOrDay}</p>
                <div class="my-2"><i data-lucide="${iconData.icon}" class="text-aurora-blue mx-auto" style="width: ${isHourly ? '32px' : '40px'}; height: ${isHourly ? '32px' : '40px'};"></i></div>
                <p class="${isHourly ? 'text-lg font-bold' : 'text-xl font-bold mt-1'}">${tempDisplay}</p>
                ${!isHourly ? `<p class="text-xs text-gray-400 mt-0.5">${item.description.split(' ')[0]}</p>` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = htmlContent;

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
};


// ======================================================================
// === 3. MAP AND CHART RENDERING LOGIC ===
// ======================================================================

const renderMap = (lat, lon, city) => {
    if (typeof L === 'undefined') {
        console.error("Leaflet not loaded. Cannot render map.");
        return;
    }

    if (mapInstance) {
        mapInstance.remove(); 
    }

    const mapElement = document.getElementById('weatherMap');
    if (!mapElement) return;

    mapInstance = L.map('weatherMap').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(mapInstance);

    L.marker([lat, lon]).addTo(mapInstance)
        .bindPopup(`<b>${city}</b><br>Current location.`)
        .openPopup();
    
    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
    }, 100);
    
    mapInstance.on('remove', () => { mapInstance = null; });
};

const renderAqiChart = (currentAqiIndex) => {
    if (typeof Chart === 'undefined') {
        return;
    }

    const ctx = document.getElementById('aqiChart');
    if (!ctx) return;

    if (aqiChartInstance) {
        aqiChartInstance.destroy(); 
    }
    
    const baseAqi = parseFloat(currentAqiIndex) || 100;
    const mockData = [baseAqi - 10, baseAqi + 5, baseAqi, baseAqi - 5, baseAqi + 15];

    aqiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day -2', 'Day -1', 'Today', 'Tomorrow', 'Day +2'],
            datasets: [{
                label: 'AQI Level',
                data: mockData,
                borderColor: '#00eaff',
                backgroundColor: 'rgba(0, 234, 255, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#00eaff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.min(...mockData) - 10,
                    max: Math.max(...mockData) + 10,
                    title: { display: false },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#bbb' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#bbb' }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false }
            }
        }
    });
};


// ======================================================================
// === 4. DATA FETCHING AND PARSING LOGIC (FIXED) ===
// ======================================================================

const getCoordinatesForCity = async (city) => {
    const defaultCoords = { lat: 27.1751, lon: 78.0421 }; // Agra, India
    
    if (cityCoordinatesCache[city]) {
        return cityCoordinatesCache[city];
    }
    
    if (!GEOCODING_API_KEY || GEOCODING_API_KEY === 'YOUR_GEOCODING_API_KEY') {
        console.warn("Using default coordinates. Please set GEOCODING_API_KEY.");
        return defaultCoords;
    }

    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${GEOCODING_API_KEY}&limit=1`;
    
    try {
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.results && geoData.results.length > 0) {
            const coords = { 
                lat: geoData.results[0].geometry.lat, 
                lon: geoData.results[0].geometry.lng
            };
            cityCoordinatesCache[city] = coords; 
            return coords;
        }
    } catch (error) {
        console.error("Geocoding Fetch Error:", error);
    }

    return defaultCoords;
};

// ⭐ PARSER में मुख्य सुधार यहाँ किए गए हैं ⭐
const parseWeatherReport = (text) => {
    const normalizedText = (text || '').trim();
    
    if (!normalizedText.includes('Details:') && 
        !normalizedText.match(/\d+(?:°C|°F|\s*C|\s*F)/i)) {
        console.warn("Parser: Text does not contain required weather structure or temperature.");
        return null; 
    }
    
    const data = {
        city: 'N/A',
        temp: { current: 'N/A', feelsLike: 'N/A', unit: '°C' }, 
        description: 'N/A',
        details: { humidity: 'N/A', windSpeed: 'N/A', pressure: 'N/A', aqiIndex: 'N/A', uvIndex: 'N/A' },
        forecasts: { hourly: [], daily: [] }
    };
    
    // 1. City, Temperature, and Description Extraction (Made more flexible)
    
    // a. Extract City (Look for "Current weather in [CITY]")
    const cityMatch = normalizedText.match(/weather in\s*(.+?)\s*(?:is|hai|mein)/i);
    if (cityMatch && cityMatch[1]) {
        // Clean up common endings like 'India' and ensure it stops before a short word like 'is'
        let city = cityMatch[1].trim().replace(/, India|,\s*is|\s*is|\.$/gi, '').trim();
        // Remove text after the word 'is' or 'hai' if mistakenly included
        city = city.split(' is ')[0].split(' hai ')[0].trim();
        data.city = city.charAt(0).toUpperCase() + city.slice(1);
    }
    
    // b. Extract Temperature (Look for any number followed by degree or C/F)
    const tempMatch = normalizedText.match(/(\d+)(?:°C|°F|\s*C|\s*F)/i);
    if (tempMatch) {
        data.temp.current = tempMatch[1];
    }
    
    // c. Extract Description (Look for text between temperature unit and 'Details:')
    const descriptionMatch = normalizedText.match(/(?:°C|°F|\s*C|\s*F)\s*and\s*([^.]+)\. Details:/i) ||
                             normalizedText.match(/(?:°C|°F|\s*C|\s*F)\s*aur\s*([^.]+)\.\s*Details:/i); // Hindi support
                             
    if (descriptionMatch) {
        data.description = descriptionMatch[1].trim();
    } else {
        // Fallback: If no match found, try to find description from summary sentence
        const summaryEndMatch = normalizedText.match(/and\s*([^.]+)/i);
        if (summaryEndMatch) {
             data.description = summaryEndMatch[1].trim().split('. Details:')[0].trim().replace(/[.,]$/g, '');
        }
    }


    // 2. Details Block Extraction (Six Required Fields)
    const detailsBlockMatch = normalizedText.match(/Details\s*:\s*(.+)/i);
    if (detailsBlockMatch) {
        const detailsText = detailsBlockMatch[1];
        
        const getMatch = (label) => {
            // Regex to match the label followed by a colon and capture everything until the next comma or end of string
            const regex = new RegExp(`${label}\\s*:\\s*([^,]+?)`, 'i');
            return detailsText.match(regex)?.[1]?.trim().replace(/[.,]$/g, '') || 'N/A';
        };

        // Extraction of the six details
        data.details.humidity = getMatch('Humidity');
        data.details.windSpeed = getMatch('Wind speed');
        data.details.pressure = getMatch('Pressure');
        
        const uvFull = getMatch('UV Index');
        // Extract only the number for UV Index
        data.details.uvIndex = uvFull.match(/(\d+\.?\d*)/)?.[1] || 'N/A';
        
        const aqiFull = getMatch('Air Quality');
        if (aqiFull !== 'N/A') {
            // Extracts number inside parentheses or first number found for AQI
            data.details.aqiIndex = aqiFull.match(/\((\d+)\)/)?.[1] || aqiFull.match(/(\d+)/)?.[1] || 'N/A';
        }
    }
    
    // Final check and fallback for Feels Like
    if (data.temp.current !== 'N/A' && data.temp.feelsLike === 'N/A') {
        data.temp.feelsLike = data.temp.current; 
    }
    
    // --- Mock Forecast Data (Using current temp for mock) ---
    if (data.temp.current !== 'N/A' && !isNaN(parseFloat(data.temp.current))) {
        const baseTemp = parseFloat(data.temp.current);
        const desc = data.description !== 'N/A' ? data.description : 'clear sky';
        
        // Mock Hourly
        const hourlyTimes = [12, 15, 18, 21, 24]; 
        data.forecasts.hourly = hourlyTimes.map((h, index) => {
            const tempChange = index > 2 ? -1 : index % 2; 
            let timeLabel = h === 12 ? '12 PM' : h === 24 ? '12 AM' : `${h % 12} PM`;
            if (h < 12) timeLabel = `${h} AM`;

            return { time: timeLabel, temp: baseTemp + tempChange, description: index > 2 ? 'partly cloudy' : desc };
        });

        // Mock Daily
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayIndex = new Date().getDay(); 
        data.forecasts.daily = [];

        for (let i = 1; i <= 5; i++) {
            const nextDayIndex = (todayIndex + i) % 7;
            const dayLabel = days[nextDayIndex];
            
            const tempMax = baseTemp + (4 - (i / 2));
            const tempMin = baseTemp - (3 + (i / 2));

            let dayDesc = 'Clouds';
            if (i === 1) dayDesc = 'Partly Cloudy';
            if (i === 3) dayDesc = 'Rain';
            if (i === 5) dayDesc = 'Clear Sky';

            data.forecasts.daily.push({ 
                day: dayLabel, 
                tempMax: tempMax, 
                tempMin: tempMin, 
                description: dayDesc 
            });
        }
    }
    
    if (data.temp.current === 'N/A' && data.city === 'N/A') return null;
    return data;
};

async function callWeatherApi(cityQuery) {
    try {
        const response = await fetch(WEATHER_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: cityQuery,
                history: []
            })
        });

        if (!response.ok) {
            let errorDetails = `Server returned status ${response.status}.`;
            const errorData = await response.json().catch(() => ({})); 
            if (errorData.botText) {
                errorDetails = errorData.botText; 
            }
            throw new Error(`Connection Error: ${errorDetails}`);
        }
        
        const data = await response.json(); 
        return data; 
    } catch (error) {
        throw new Error(error.message);
    }
}

const handleSearchSubmit = async () => {
    const cityQuery = searchCityInput.value.trim();
    if (cityQuery === '') {
        showMessage("Kripya shehar ka naam darj karein. 🤔", true);
        return;
    }

    searchCityButton.disabled = true;
    searchCityInput.disabled = true;
    showMessage(`Fetching weather for ${cityQuery}... ⏳`, false);

    // Get coordinates first (This uses OpenCage)
    const { lat, lon } = await getCoordinatesForCity(cityQuery);

    try {
        // Step 1: Call API (to a local server endpoint)
        const responseData = await callWeatherApi(cityQuery);
        const botText = responseData.botText || ''; 
        
        // Step 2: Parse Chatbot's Text Output
        const weatherData = parseWeatherReport(botText); 
        
        if (weatherData) {
            currentWeatherData = weatherData; 
            // Step 3: Update UI
            updateWeatherUI(weatherData, lat, lon); 
            showMessage(`Weather successfully displayed for ${weatherData.city}. ✅`, false);

            smoothScrollTo(weatherContent); 

        } else {
            // Show the exact response text from Gemini if parsing fails
            showMessage(`Mausam ki jaankari nahi mil saki. Gemini Response: "${botText}"`, true);
            clearWeatherUI();
        }
    } 
    catch (error) {
        console.error("Weather Fetch Error:", error);
        showMessage(`Error fetching data: ${error.message} 🛑`, true);
        clearWeatherUI();
    }
    finally {
        searchCityButton.disabled = false;
        searchCityInput.disabled = false;
        searchCityInput.focus();
    }
};
// ======================================================================
// === 5. EVENT LISTENERS AND INITIAL SETUP ===
// ======================================================================
// Toggle Celsius/Fahrenheit
if (unitToggle) {
    unitToggle.addEventListener('click', () => {
        const spanEl = unitToggle.querySelector('span');
        if (currentUnit === 'celsius') {
            currentUnit = 'fahrenheit';
            spanEl.textContent = 'Switch to °C';
        } else {
            currentUnit = 'celsius';
            spanEl.textContent = 'Switch to °F';
        }
        // Re-render UI with saved data and new unit
        if (currentWeatherData) {
            const city = currentWeatherData.city;
            const { lat, lon } = cityCoordinatesCache[city] || { lat: 27.1751, lon: 78.0421 };
            updateWeatherUI(currentWeatherData, lat, lon); 
        }
    });
}
// Search Functionality
if (searchCityButton && searchCityInput) {
    searchCityButton.addEventListener('click', handleSearchSubmit);
    searchCityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    });
}
// ⭐ SCROLLING LOGIC FOR HOURLY
if (hourlyTabButton && hourlyForecastSection) {
    hourlyTabButton.addEventListener('click', () => {
        smoothScrollTo(hourlyForecastSection); 
    });
}
//  SCROLLING LOGIC FOR DAILY/WEEKLY
if (dailyTabButton && weeklyForecastSection) {
    dailyTabButton.addEventListener('click', () => {
        smoothScrollTo(weeklyForecastSection);
    });
}
// Initial Load and Clock Setup
window.onload = () => {
    updateClock();
    setInterval(updateClock, 1000); 
    
    clearWeatherUI(true); 
    
    // Set a default city and run the initial search
    searchCityInput.value = 'Agra, India';
    handleSearchSubmit();
};