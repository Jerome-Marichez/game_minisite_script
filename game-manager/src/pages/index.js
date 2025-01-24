import { useState, useEffect } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { MiddlewareNotFoundError } from 'next/dist/shared/lib/utils';

export default function GameManager({ initialData }) {
  
  const [links, setLinks] = useState(initialData.links || {
    siteGagnant: '/site-gagnant',
    sitePerdant: '/site-perdant',
    siteFinJeu: '/site-fin-jeu',
  });

  const [startDate, setStartDate] = useState(initialData.startDate || '');
  const [endDate, setEndDate] = useState(initialData.endDate || '');
  const [Gagnantss, setGagnantss] = useState(initialData.Gagnantss || []);

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };
const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
  const generateInputs = () => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const inputs = [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      inputs.push({ date: new Date(d).toISOString().split('T')[0], Gagnants: '' });
    }

    return inputs;
  };

  useEffect(() => {
    if (startDate && endDate) {
      const inputs = generateInputs();
      setGagnantss(inputs.map(({ date }) => ({ date, Gagnants: Gagnantss.find(w => w.date === date)?.Gagnants || '' })));
    }
  }, [startDate, endDate]);

  const handleGagnantsChange = (index, value) => {
    const updatedGagnantss = [...Gagnantss];
    updatedGagnantss[index].Gagnants = value;
    setGagnantss(updatedGagnantss);
  };
  
  const handleLinkChange = (key) => (event) => {
    setLinks((prevLinks) => ({
      ...prevLinks,
      [key]: event.target.value,
    }));
  };

  const handleSave = async () => {
    const { siteGagnant, sitePerdant, siteFinJeu } = links;
    
    if (
      !validateURL(siteGagnant) ||
      !validateURL(sitePerdant) ||
      !validateURL(siteFinJeu)
    ) {
      alert('Un ou plusieures liens ne sont pas valide');
      return;
    }
    const data = { startDate, endDate, Gagnantss, links };

    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save data.');
      alert('Donnée sauvegardée');
    } catch (err) {
      console.error(err);
      alert('Erreur en sauvegardant les données');
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setGagnantss([]);
  };

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "20px", justifyContent: "center", alignItems: "center"}}>
      <h1>Script - Jeu Gagnant / Perdant</h1>
      <label style={{backgroundColor: "lightgrey", padding: "5px", borderRadius: "10px"}}>Info: Le QR-Code doit être lié au lien suivant: <b>https://game-minisite-script.vercel.app/api/game-check/</b>
      </label>
      <nav style={{display: "flex", flexDirection: "column", alignItems:"center", gap: "10px", marginBottom: "10px"}}>
        <label style={{display: "flex", gap: "5px"}}> 
            Site Gagnant: 
            <input type="text" value={links.siteGagnant} onChange={handleLinkChange('siteGagnant')} style={{width: "250px"}}/>
          </label>
        <label style={{display: "flex", gap: "5px"}}> 
            Site Perdant: 
            <input type="text" value={links.sitePerdant} onChange={handleLinkChange('sitePerdant')} style={{width: "250px"}}/>
          </label>
        <label style={{display: "flex", gap: "5px"}}> 
            Site Fin Jeu: 
            <input type="text" value={links.siteFinJeu} onChange={handleLinkChange('siteFinJeu')} style={{width: "250px"}}/>
          </label>
      </nav>

      <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
        <label style={{display: "flex", flexDirection: "row", gap: "5px"}}> 
          Début:
          <input type="date" value={startDate} onChange={handleDateChange(setStartDate)} />
        </label>
        <label style={{display: "flex", gap: "5px"}}> 
          Fin:
          <input type="date" value={endDate} onChange={handleDateChange(setEndDate)} />
        </label>
      </div>

      <div>
        {startDate && endDate &&
        <div style={{textAlign: "center", marginBottom: "10px"}}>Nombre de gagnants maximum / Jour</div>
        }
        {Gagnantss.map((day, index) => (
          <div key={day.date}>
            <label>
              <b>{day.date.split("-").reverse().join("-")} </b>
              <input
                type="number"
                value={day.Gagnants}
                onChange={(e) => handleGagnantsChange(index, e.target.value)}
              />
              
            </label>
          </div>
        ))}
      </div>

<div style={{display: "flex", flexDirection: "row", gap: "20px"}}>
      <button style={{maxWidth: "200px"}} onClick={handleSave}>Sauvegarder les modifications</button>
      <button style={{maxWidth: "200px"}} onClick={handleReset}>Réinitialiser les champs</button>
    </div>
    </div>
  );
}

export async function getServerSideProps() {
  const filePath = path.join('./gameData.json');

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return { props: { initialData: JSON.parse(fileContents) } };
  } catch {
    return { props: { initialData: { startDate: '', endDate: '', Gagnantss: [] } } };
  }
}

