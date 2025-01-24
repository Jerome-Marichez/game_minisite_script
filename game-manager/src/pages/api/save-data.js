import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const filePath = path.join('/tmp', 'gameData.json');

    try {
      await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ message: 'Donnée sauvegardée !' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur en sauvegardant les données' });
    }
  } else {
    res.status(405).json({ message: 'Méthode non autorisée' });
  }
}