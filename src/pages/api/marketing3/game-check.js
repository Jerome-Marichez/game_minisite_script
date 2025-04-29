import fs from 'fs/promises';

export default async function handler(req, res) {
  const gameDataPath = './gameData3.json';
  const gameWinPath = './gameWin3.json';

  try {
    const gameData = JSON.parse(await fs.readFile(gameDataPath, 'utf-8'));
    const { gagnants1 = [], gagnants2 = [], gagnants3 = [], gagnants4 = [], gagnants5 = [], gagnants6 = [], links = {} } = gameData;

    const { siteLotGagnant1, siteLotGagnant2, siteLotGagnant3, siteLotGagnant4, siteLotGagnant5, siteLotGagnant6, sitePerdant, siteFinJeu } = links;

    if (!siteLotGagnant1 || !siteLotGagnant2 || !siteLotGagnant3 || !siteLotGagnant4 || !siteLotGagnant5 || !siteLotGagnant6 || !sitePerdant || !siteFinJeu) {
      console.log("🚨 Missing redirect links. Redirecting to Google.");
      res.redirect(302, "https://www.google.fr/");
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // 🛠 Get the max allowed wins per type for today
    const maxWins1 = gagnants1.find((e) => e.date === today)?.gagnants1 ?? 0;
    const maxWins2 = gagnants2.find((e) => e.date === today)?.gagnants2 ?? 0;
    const maxWins3 = gagnants3.find((e) => e.date === today)?.gagnants3 ?? 0;

    const maxWins4 = gagnants4.find((e) => e.date === today)?.gagnants4 ?? 0;
    const maxWins5 = gagnants5.find((e) => e.date === today)?.gagnants5 ?? 0;
    const maxWins6 = gagnants6.find((e) => e.date === today)?.gagnants6 ?? 0;

    console.log(`📅 Date: ${today}`);
    console.log(`🎁 Max wins allowed -> gagnants1: ${maxWins1}, gagnants2: ${maxWins2}, gagnants3: ${maxWins3}, gagnants4: ${maxWins4}, gagnants5: ${maxWins5}, gagnants6: ${maxWins6}`);

    if (maxWins1 === 0 && maxWins2 === 0 && maxWins3 === 0 && maxWins4 === 0 && maxWins5 === 0 && maxWins6 ===0) {
      console.log("🏁 No wins allowed for today. Redirecting to siteFinJeu.");
      res.redirect(302, siteFinJeu);
      return;
    }

    // 🛠 Load game win data
    let gameWinData = [];
    try {
      const fileData = await fs.readFile(gameWinPath, 'utf-8');
      gameWinData = fileData ? JSON.parse(fileData) : [];
    } catch {
      console.log("⚠️ No existing gameWin data. Initializing empty array.");
      gameWinData = [];
    }

    console.log("📂 Current gameWin.json data:", gameWinData);

    // 🛠 Count existing wins per category
    const winsToday1 = gameWinData.filter((e) => e.date === today && e.type === "gagnants1").length;
    const winsToday2 = gameWinData.filter((e) => e.date === today && e.type === "gagnants2").length;
    const winsToday3 = gameWinData.filter((e) => e.date === today && e.type === "gagnants3").length;

    const winsToday4 = gameWinData.filter((e) => e.date === today && e.type === "gagnants4").length;
    const winsToday5 = gameWinData.filter((e) => e.date === today && e.type === "gagnants5").length;
    const winsToday6 = gameWinData.filter((e) => e.date === today && e.type === "gagnants6").length;
    

    console.log(`🏆 Current wins -> gagnants1: ${winsToday1}, gagnants2: ${winsToday2}, gagnants3: ${winsToday3}, gagnants4: ${winsToday4}, gagnants5: ${winsToday5}, gagnants6: ${winsToday6}`);

    // 🛠 Check if any prizes are still available
    const availablePrizes = [];
    if (winsToday1 < maxWins1) availablePrizes.push("gagnants1");
    if (winsToday2 < maxWins2) availablePrizes.push("gagnants2");
    if (winsToday3 < maxWins3) availablePrizes.push("gagnants3");

    if (winsToday4 < maxWins4) availablePrizes.push("gagnants4");
    if (winsToday5 < maxWins5) availablePrizes.push("gagnants5");
    if (winsToday6 < maxWins6) availablePrizes.push("gagnants6");


    console.log("✅ Available prizes:", availablePrizes);

    if (availablePrizes.length === 0) {
      console.log("🚫 All prizes for today are gone. Redirecting to sitePerdant.");
      res.redirect(302, siteFinJeu);
      return;
    }

    // 🛠 Select a random available prize
    const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

    let siteGagnant;
    if (selectedPrize === "gagnants1") siteGagnant = siteLotGagnant1;
    if (selectedPrize === "gagnants2") siteGagnant = siteLotGagnant2;
    if (selectedPrize === "gagnants3") siteGagnant = siteLotGagnant3;

    if (selectedPrize === "gagnants4") siteGagnant = siteLotGagnant4;
    if (selectedPrize === "gagnants5") siteGagnant = siteLotGagnant5;
    if (selectedPrize === "gagnants6") siteGagnant = siteLotGagnant6;



    // 🛠 50% chance to win
    const isWin = Math.random() < 0.4;

    if (isWin) {
      console.log(`🎉 Winner! Selected prize: ${selectedPrize}. Redirecting to ${siteGagnant}`);

      gameWinData.push({ date: today, type: selectedPrize });

      await fs.writeFile(gameWinPath, JSON.stringify(gameWinData, null, 2));

      res.redirect(302, siteGagnant);
    } else {
      console.log("😢 Lost. Redirecting to sitePerdant.");
      res.redirect(302, sitePerdant);
    }
  } catch (error) {
    console.error('🔥 Error processing game logic:', error);
    res.status(500).send('Internal Server Error');
  }
}
