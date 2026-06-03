const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data', 'harry-potter.json');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Archivo no encontrado');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function getHarryPotterData() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    return sendFile(res, path.join(publicDir, 'index.html'), 'text/html; charset=utf-8');
  }

  if (req.method === 'GET' && url.pathname === '/styles.css') {
    return sendFile(res, path.join(publicDir, 'styles.css'), 'text/css; charset=utf-8');
  }

  if (req.method === 'GET' && url.pathname === '/app.js') {
    return sendFile(res, path.join(publicDir, 'app.js'), 'application/javascript; charset=utf-8');
  }

  if (req.method === 'GET' && url.pathname === '/api/characters') {
    const data = getHarryPotterData();
    return sendJson(res, 200, data.characters);
  }

  if (req.method === 'GET' && url.pathname === '/api/houses') {
    const data = getHarryPotterData();
    const houses = [...new Set(data.characters.map((character) => character.house))];
    return sendJson(res, 200, houses);
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/characters/')) {
    const id = Number(url.pathname.split('/').pop());
    const data = getHarryPotterData();
    const character = data.characters.find((item) => item.id === id);

    if (!character) {
      return sendJson(res, 404, { message: 'Personaje no encontrado' });
    }

    return sendJson(res, 200, character);
  }

  if (req.method === 'GET' && url.pathname === '/api') {
    return sendJson(res, 200, {
      message: 'API de Harry Potter funcionando',
      endpoints: [
        'GET /api/characters',
        'GET /api/houses',
        'GET /api/characters/:id',
      ],
    });
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Ruta no encontrada');
});

server.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
