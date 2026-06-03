// NASA API Configuration
// Replace 'DEMO_KEY' with your NASA API key from https://api.nasa.gov/
//const NASA_API_KEY = 'I887Duq2DcG7apN3F9LhgBUxDuacRt5e1DcQLQl2'; // or 'YOUR_API_KEY_HERE'
const NASA_API_KEY = 'DEMO_KEY'; // or 'YOUR_API_KEY_HERE'

const NEO_API_BASE = 'https://api.nasa.gov/neo/rest/v1';

// Set default date range (last 7 days)
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const formatDate = (date) => date.toISOString().split('T')[0];

async function fetchNEOs(start, end) {
    const url = `${NEO_API_BASE}/feed?start_date=${start}&end_date=${end}&api_key=${NASA_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch NEO data:', error);
        return null;
    }
}

function extractNEOs(neoData) {
    if (!neoData || !neoData.near_earth_objects) return [];

    const allNEOS = [];
    const dates = Object.keys(neoData.near_earth_objects);

    dates.forEach(date => {
        const asteroids = neoData.near_earth_objects[date];
        asteroids.forEach(asteroid => {
            allNEOS.push({
                id: asteroid.id,
                name: asteroid.name,
                date: date,
                isHazardous: asteroid.is_potentially_hazardous_asteroid,
                diameterMin: Math.round(asteroid.estimated_diameter.meters.estimated_diameter_min),
                diameterMax: Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max),
                velocity: parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_hour || 0),
                missDistance: parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers || 0),
                orbitClass: asteroid.orbiting_body
            });
        });
    });

    return allNEOS;
}

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
}

function getDangerLevel(neo) {
    if (neo.isHazardous) return 'danger';
    if (neo.missDistance < 0.05) return 'warning';
    return 'safe';
}

async function renderNEOs() {
    const container = document.getElementById('neo-container');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    // Set input defaults
    startDateInput.value = formatDate(startDate);
    endDateInput.value = formatDate(endDate);

    container.innerHTML = '<div class="loading">Fetching Near Earth Objects from NASA...</div>';

    const start = startDateInput.value;
    const end = endDateInput.value;

    const data = await fetchNEOs(start, end);

    if (!data) {
        container.innerHTML = '<div class="error">Failed to load NEO data. Check your API key or try again later.</div>';
        return;
    }

    const neos = extractNEOs(data);

    // Update stats
    document.getElementById('total-neo').textContent = neos.length;
    document.getElementById('hazardous-count').textContent = neos.filter(n => n.isHazardous).length;

    const largestDiameter = Math.max(...neos.map(n => n.diameterMax));
    document.getElementById('largest-size').textContent = formatNumber(largestDiameter);

    if (neos.length === 0) {
        container.innerHTML = '<div class="empty">No Near Earth Objects found for this date range.</div>';
        return;
    }

    // Sort by closest approach (miss distance)
    neos.sort((a, b) => a.missDistance - b.missDistance);

    container.innerHTML = neos.map(neo => {
        const dangerClass = getDangerLevel(neo);
        const sizeBar = Math.min((neo.diameterMax / 1000) * 100, 100);

        return `
            <div class="neo-card ${dangerClass}">
                <div class="neo-header">
                    <h3 class="neo-name">${neo.name}</h3>
                    <span class="neo-date">${neo.date}</span>
                </div>

                <div class="neo-body">
                    <div class="neo-stats">
                        <div class="stat-row">
                            <span class="stat-label">Diameter</span>
                            <span class="stat-value">${formatNumber(neo.diameterMin)} - ${formatNumber(neo.diameterMax)} m</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Velocity</span>
                            <span class="stat-value">${formatNumber(Math.round(neo.velocity))} km/h</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Miss Distance</span>
                            <span class="stat-value ${neo.missDistance < 0.05 ? 'warning' : ''}">${neo.missDistance.toFixed(3)} km</span>
                        </div>
                    </div>

                    <div class="size-indicator">
                        <div class="size-label">Size</div>
                        <div class="size-bar-bg">
                            <div class="size-bar-fill" style="width: ${sizeBar}%"></div>
                        </div>
                    </div>
                </div>

                <div class="neo-footer">
                    ${neo.isHazardous
                        ? '<span class="badge hazardous">⚠️ Potentially Hazardous</span>'
                        : '<span class="badge safe">✓ Safe</span>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Event listeners
document.getElementById('fetch-btn').addEventListener('click', renderNEOs);

// Allow Enter key to trigger fetch
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') renderNEOs();
});

// Initial load
document.addEventListener('DOMContentLoaded', renderNEOs);
