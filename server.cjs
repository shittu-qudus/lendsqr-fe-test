const http = require('http');
const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/users') {
    res.end(JSON.stringify(db.users));
  } else if (req.url?.startsWith('/api/users/')) {
    const id = req.url.split('/api/users/')[1];
    const user = db.users.find(u => String(u.id) === String(id));
    if (user) res.end(JSON.stringify(user));
    else { res.statusCode = 404; res.end(JSON.stringify({ message: 'Not found' })); }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

server.listen(3001, () => console.log('API running on http://localhost:3001'));
