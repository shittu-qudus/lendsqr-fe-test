const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
    const filePath = path.join(process.cwd(), 'db.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    const { id } = req.query;
    const user = db.users.find((u) => String(u.id) === String(id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
};
