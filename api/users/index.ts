import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(_req: VercelRequest, res: VercelResponse) {
    const filePath = join(process.cwd(), 'db.json');
    const raw = readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    res.status(200).json(db.users);
}
