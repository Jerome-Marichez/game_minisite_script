import { useState, useEffect } from 'react';
import fs from 'fs/promises';
import path from 'path';

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
      alert('Data saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving data.');
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setGagnantss([]);
  };

  return (
    <div>
      <h1>Script - Jeu Gagnant / Perdant</h1>
      <nav>
        <label>
            Site Gagnant:
            <input type="text" value={links.siteGagnant} onChange={handleLinkChange('siteGagnant')} />
          </label>
          <label>
            Site Perdant:
            <input type="text" value={links.sitePerdant} onChange={handleLinkChange('sitePerdant')} />
          </label>
          <label>
            Site Fin Jeu:
            <input type="text" value={links.siteFinJeu} onChange={handleLinkChange('siteFinJeu')} />
          </label>
      </nav>

      <div>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={handleDateChange(setStartDate)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={handleDateChange(setEndDate)} />
        </label>
      </div>

      <div>
        {Gagnantss.map((day, index) => (
          <div key={day.date}>
            <label>
              {day.date} Gagnants:
              <input
                type="text"
                value={day.Gagnants}
                onChange={(e) => handleGagnantsChange(index, e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleSave}>Sauvegarder les modifications</button>
      <button onClick={handleReset}>Reset à 0</button>
    </div>
  );
}

export async function getServerSideProps() {
  const filePath = path.join(process.cwd(), 'data', 'gameData.json');

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return { props: { initialData: JSON.parse(fileContents) } };
  } catch {
    return { props: { initialData: { startDate: '', endDate: '', Gagnantss: [] } } };
  }
}

