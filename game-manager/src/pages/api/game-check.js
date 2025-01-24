import fs from 'fs/promises';
import path from 'path';


export default async function handler(req, res) {
  
  const gameDataPath = path.join(process.cwd(), 'data', 'gameData.json');
  const gameWinPath = path.join(process.cwd(), 'data', 'gameWin.json');

  try {
    const gameData = JSON.parse(await fs.readFile(gameDataPath, 'utf-8'));
    const { Gagnantss = [], links = {} } = gameData;

    const { siteGagnant, sitePerdant, siteFinJeu } = links;

    if (!siteGagnant || !sitePerdant || !siteFinJeu) {
      res.redirect(302,"https://www.google.fr/");
      return;
    }

    const dateOfTheDay = new Date().toISOString().split('T')[0]; 
    const totalWinsAllowed = Gagnantss.filter((e) => e.date === dateOfTheDay).map(e => e.Gagnants) || 0;
    const totalWinsAllowedNumber = Number(totalWinsAllowed);

    if (totalWinsAllowedNumber === 0){
      res.redirect(302, siteFinJeu);
      return;
    }


    let gameWinData = [];
    try {
      gameWinData = JSON.parse(await fs.readFile(gameWinPath, 'utf-8'));
    } catch {
      gameWinData = [];
    }


    const gameWinDataTotal = gameWinData.filter((e) => e.date === dateOfTheDay).map(e => e.date) ?? null;
    console.log("____");
    console.log(gameWinDataTotal);
    console.log("____");

    // Check if wins have reached the maximum
    if (gameWinDataTotal.length >= totalWinsAllowed) {
      res.redirect(302, sitePerdant);
      return;
    }

    // Randomize win or loss
    const isWin = Math.random() < 0.5; // 50% chance to win

    if (isWin) {
      const currentDate = new Date().toISOString().split('T')[0];
      gameWinData.push({ date: currentDate });

      await fs.writeFile(gameWinPath, JSON.stringify(gameWinData, null, 2));

      res.redirect(302, siteGagnant);
    } else {
      res.redirect(302, sitePerdant);
    }
  } catch (error) {
    console.error('Error processing game logic:', error);
    res.status(500).send('Internal Server Error');
  }

}
