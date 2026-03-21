import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const filePath = join(process.cwd(), 'db.json');
    const raw = readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    const { id } = req.query;
    const user = db.users.find((u: { id: unknown }) => String(u.id) === String(id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
}
