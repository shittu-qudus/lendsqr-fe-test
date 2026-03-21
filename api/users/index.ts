const fs = require('fs');
const path = require('path');

module.exports = function handler(_req, res) {
    const filePath = path.join(process.cwd(), 'db.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    res.status(200).json(db.users);
};
