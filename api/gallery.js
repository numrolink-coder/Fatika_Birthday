import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

export default function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const files = fs
      .readdirSync(uploadsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name))
      .sort();

    const gallery = files.slice(0, 12).map((fileName) => ({
      title: fileName.replace(/\.[^/.]+$/, '') || 'Uploaded Memory',
      desc: 'Your uploaded memory.',
      src: `/uploads/${fileName}`,
    }));

    res.status(200).json(gallery);
  } catch (error) {
    res.status(200).json([]);
  }
}
