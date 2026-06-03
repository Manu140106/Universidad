const grid = document.getElementById('characterGrid');
const statusText = document.getElementById('status');
const reloadBtn = document.getElementById('reloadBtn');
const searchInput = document.getElementById('searchInput');
const houseFilter = document.getElementById('houseFilter');
const API_BASE = 'http://localhost:3000';

let allCharacters = [];

function getPortraitColor(house) {
  if (house === 'Gryffindor') return '#d4af37';
  if (house === 'Slytherin') return '#7c8c44';
  if (house === 'Ravenclaw') return '#4d6fa8';
  return '#c79b52';
}

function getCharacterPortrait(character) {
  const initials = character.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const fill = getPortraitColor(character.house);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b2133"/>
          <stop offset="100%" stop-color="#0d111b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="800" rx="36" fill="url(#bg)"/>
      <circle cx="300" cy="250" r="140" fill="${fill}" fill-opacity="0.18"/>
      <text x="300" y="275" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="700" fill="${fill}">${initials}</text>
      <text x="300" y="560" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#f5f7ff">${character.name}</text>
      <text x="300" y="615" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#b9c2e0">${character.house}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCharacterImage(character) {
  return character.image && character.image.trim() ? character.image : getCharacterPortrait(character);
}

function renderCharacters(characters) {
  if (!characters.length) {
    grid.innerHTML = '<p>No hay personajes que coincidan con la búsqueda.</p>';
    return;
  }

  grid.innerHTML = characters
    .map(
      (character) => `
        <article class="card">
          <img src="${getCharacterImage(character)}" alt="${character.name}" onerror="this.onerror=null;this.src='${getCharacterPortrait(character)}'" />
          <div class="card-content">
            <h3>${character.name}</h3>
            <p>${character.description}</p>
            <span class="badge">${character.house}</span>
          </div>
        </article>
      `,
    )
    .join('');
}

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();
  const selectedHouse = houseFilter.value;

  const filteredCharacters = allCharacters.filter((character) => {
    const matchesName = character.name.toLowerCase().includes(search);
    const matchesHouse = selectedHouse === 'all' || character.house === selectedHouse;
    return matchesName && matchesHouse;
  });

  statusText.textContent = `${filteredCharacters.length} personajes visibles`;
  renderCharacters(filteredCharacters);
}

async function loadCharacters() {
  statusText.textContent = 'Cargando...';
  grid.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE}/api/characters`);
    const characters = await response.json();

    if (!response.ok) {
      throw new Error(characters.message || 'No se pudieron cargar los personajes');
    }

    allCharacters = characters;
    applyFilters();
  } catch (error) {
    statusText.textContent = 'Error al cargar';
    grid.innerHTML = `<p>${error.message}</p>`;
  }
}

reloadBtn.addEventListener('click', loadCharacters);
searchInput.addEventListener('input', applyFilters);
houseFilter.addEventListener('change', applyFilters);
loadCharacters();
