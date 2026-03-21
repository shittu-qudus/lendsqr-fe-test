import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../../db.json';

type User = (typeof db.users)[number];

export default function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;
    const user = db.users.find((u: User) => String(u.id) === String(id));

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
}