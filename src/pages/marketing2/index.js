import { useState, useEffect } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { MiddlewareNotFoundError } from 'next/dist/shared/lib/utils';

export default function GameManager({ initialData }) {
  
  const [links, setLinks] = useState(initialData.links || {
    siteLotGagnant1: '/site-lot-gagnant',
    siteLotGagnant2: '/site-lot-gagnant-2',
    siteLotGagnant3: '/site-lot-gagnant-3',
    siteLotGagnant4: '/site-lot-gagnant-4',
    siteLotGagnant5: '/site-lot-gagnant-5',
    siteLotGagnant6: '/site-lot-gagnant-6',
    sitePerdant: '/site-perdant',
    siteFinJeu: '/site-fin-jeu',
  });

  const [startDate, setStartDate] = useState(initialData.startDate || '');
  const [endDate, setEndDate] = useState(initialData.endDate || '');
  const [gagnants1, setGagnants1] = useState(initialData.gagnants1 || []);
  const [gagnants2, setGagnants2] = useState(initialData.gagnants2 || []);
  const [gagnants3, setGagnants3] = useState(initialData.gagnants3 || []);
  const [gagnants4, setGagnants4] = useState(initialData.gagnants4 || []);
  const [gagnants5, setGagnants5] = useState(initialData.gagnants5 || []);
  const [gagnants6, setGagnants6] = useState(initialData.gagnants6 || []);


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
      const dateStr = new Date(d).toISOString().split('T')[0];
      inputs.push({
        date: dateStr,
        gagnants1: gagnants1.find((g) => g.date === dateStr)?.gagnants1 || '',
        gagnants2: gagnants2.find((g) => g.date === dateStr)?.gagnants2 || '',
        gagnants3: gagnants3.find((g) => g.date === dateStr)?.gagnants3 || '',
        
        gagnants4: gagnants4.find((g) => g.date === dateStr)?.gagnants4 || '',
        gagnants5: gagnants5.find((g) => g.date === dateStr)?.gagnants5 || '',
        gagnants6: gagnants6.find((g) => g.date === dateStr)?.gagnants6 || '',
      });
    }


    return inputs;
  };

  useEffect(() => {
    if (startDate && endDate) {
      const inputs = generateInputs();
      setGagnants1(inputs.map(({ date, gagnants1 }) => ({ date, gagnants1 })));
      setGagnants2(inputs.map(({ date, gagnants2 }) => ({ date, gagnants2 })));
      setGagnants3(inputs.map(({ date, gagnants3 }) => ({ date, gagnants3 })));
      setGagnants4(inputs.map(({ date, gagnants4 }) => ({ date, gagnants4 })));
      setGagnants5(inputs.map(({ date, gagnants5 }) => ({ date, gagnants5 })));
      setGagnants6(inputs.map(({ date, gagnants6 }) => ({ date, gagnants6 })));
    }
  }, [startDate, endDate]);

  const handleGagnantsChange = (index, field, value) => {
    if (field === 'gagnants1') {
      const updated = [...gagnants1];
      updated[index].gagnants1 = value;
      setGagnants1(updated);
    } else if (field === 'gagnants2') {
      const updated = [...gagnants2];
      updated[index].gagnants2 = value;
      setGagnants2(updated);
    } else if (field === 'gagnants3') {
      const updated = [...gagnants3];
      updated[index].gagnants3 = value;
      setGagnants3(updated);
    }
    else if (field === 'gagnants4') {
      const updated = [...gagnants4];
      updated[index].gagnants4 = value;
      setGagnants4(updated);
    }
    else if (field === 'gagnants5') {
      const updated = [...gagnants5];
      updated[index].gagnants5 = value;
      setGagnants5(updated);
    }
    else if (field === 'gagnants6') {
      const updated = [...gagnants6];
      updated[index].gagnants6 = value;
      setGagnants6(updated);
    }
  };
  
  const handleLinkChange = (key) => (event) => {
    setLinks((prevLinks) => ({
      ...prevLinks,
      [key]: event.target.value,
    }));
  };


  const convertData = (testValue) => {
    const k = Number(testValue);

    return k;
  }

  const handleSave = async () => {
    const { siteLotGagnant1, siteLotGagnant2, siteLotGagnant3, siteLotGagnant4, siteLotGagnant5, siteLotGagnant6, sitePerdant, siteFinJeu } = links;
    
    if (
      !validateURL(siteLotGagnant1) ||
      !validateURL(siteLotGagnant2) ||
      !validateURL(siteLotGagnant3) ||
      !validateURL(siteLotGagnant4) ||
      !validateURL(siteLotGagnant5) ||
      !validateURL(siteLotGagnant6) ||
      !validateURL(sitePerdant) ||
      !validateURL(siteFinJeu)
    ) {
      alert('Un ou plusieures liens ne sont pas valide');
      return;
    }

    console.log(gagnants1);

    try {
      const response = await fetch('/api/marketing2/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          gagnants1: gagnants1.map((e) => ({...e, gagnants1: convertData(e.gagnants1)})),
          gagnants2: gagnants2.map((e) => ({...e, gagnants2: convertData(e.gagnants2)})),
          gagnants3: gagnants3.map((e) => ({...e, gagnants3: convertData(e.gagnants3)})), 
          gagnants4: gagnants4.map((e) => ({...e, gagnants4: convertData(e.gagnants4)})), 
          gagnants5: gagnants5.map((e) => ({...e, gagnants5: convertData(e.gagnants5)})), 
          gagnants6: gagnants6.map((e) => ({...e, gagnants6: convertData(e.gagnants6)})), 
          links
        }),
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
    setGagnants1([]);
    setGagnants2([]);
    setGagnants3([]);
    setGagnants4([]);
    setGagnants5([]);
    setGagnants6([]);
  };


  const commonStyleBg = {backgroundColor: "rgba(0,0,0,0.05)", padding: "10px", gap: "5px", borderRadius: "10px", display: "flex", flexDirection: "column"}

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "20px", justifyContent: "center", alignItems: "center"}}>
      <h1>Script - Jeu Gagnant / Perdant</h1>
      <label style={{backgroundColor: "lightgrey", padding: "5px", borderRadius: "10px"}}>Info: Le QR-Code doit être lié au lien suivant: <b>https://minisite.vocalsms.com/api/marketing2/game-check/</b>
      </label>
      <nav style={{display: "flex", flexDirection: "column", alignItems:"center", gap: "10px", marginBottom: "10px"}}>
        
        <div style={{...commonStyleBg}}>
          <label style={{display: "flex", gap: "5px"}}> 
              Site Lot Gagnant 1: 
              <input type="text" value={links.siteLotGagnant1} onChange={handleLinkChange('siteLotGagnant1')} style={{width: "250px"}}/>
          </label>
          <label style={{display: "flex", gap: "5px"}}> 
              Site Lot Gagnant 2: 
              <input type="text" value={links.siteLotGagnant2} onChange={handleLinkChange('siteLotGagnant2')} style={{width: "250px"}}/>
          </label>
          <label style={{display: "flex", gap: "5px"}}> 
              Site Lot Gagnant 3: 
              <input type="text" value={links.siteLotGagnant3} onChange={handleLinkChange('siteLotGagnant3')} style={{width: "250px"}}/>
          </label>

          <label style={{display: "flex", gap: "5px"}}> 
              Site Lot Gagnant 4: 
              <input type="text" value={links.siteLotGagnant4} onChange={handleLinkChange('siteLotGagnant4')} style={{width: "250px"}}/>
          </label>

          <label style={{display: "flex", gap: "5px"}}> 
              Site Lot Gagnant 5: 
              <input type="text" value={links.siteLotGagnant5} onChange={handleLinkChange('siteLotGagnant5')} style={{width: "250px"}}/>
          </label>

          <label style={{display: "flex", gap: "5px"}}> 
              Site Lot Gagnant 6: 
              <input type="text" value={links.siteLotGagnant6} onChange={handleLinkChange('siteLotGagnant6')} style={{width: "250px"}}/>
          </label>
        </div>
        
        <div style={{...commonStyleBg}}>
          <label style={{display: "flex", gap: "5px"}}> 
              Site Perdant: 
              <input type="text" value={links.sitePerdant} onChange={handleLinkChange('sitePerdant')} style={{width: "250px"}}/>
            </label>
          <label style={{display: "flex", gap: "5px"}}> 
              Site Fin du jeu: 
              <input type="text" value={links.siteFinJeu} onChange={handleLinkChange('siteFinJeu')} style={{width: "250px"}}/>
          </label>
        </div> 
      </nav>

 <div style={{...commonStyleBg}}>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "center", padding:"10px", gap: "10px"}}>
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
        <div style={{textAlign: "center", marginBottom: "10px", borderBottom: "1px solid black", paddingBottom: "5px"}}>Nombre de gagnants maximum / Jour</div>
        }


<div style={{display: "flex", gap: "50px", flexDirection: "row"}}>
  <div style={{minWidth: "52px"}}></div>
  <div>Lot 1</div>
  <div>Lot 2</div>
  <div>Lot 3</div>
  <div>Lot 4</div>
  <div>Lot 5</div>
  <div>Lot 6</div>
</div>
        <div>
   {gagnants1.map((day, index) => (
  <div key={day.date} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
    <b>{day.date.split("-").reverse().join("-")}</b>

   
    <input
      type="number"
      style={{maxWidth: "70px"}}
      value={day.gagnants1}
      placeholder={0}
      onChange={(e) => handleGagnantsChange(index, "gagnants1", Number(e.target.value))}
    />

    <input
      type="number"
      style={{maxWidth: "70px"}}
      value={gagnants2[index]?.gagnants2 || ""}
      defaultValue={0}
      placeholder={0}
      onChange={(e) => handleGagnantsChange(index, "gagnants2", Number(e.target.value))}
    />

    <input
      type="number"
      placeholder={0}
      style={{maxWidth: "70px"}}
      value={gagnants3[index]?.gagnants3 || ""}
      onChange={(e) => handleGagnantsChange(index, "gagnants3", Number(e.target.value))}
    />

    <input
      type="number"
      placeholder={0}
      style={{maxWidth: "70px"}}
      value={gagnants4[index]?.gagnants4 || ""}
      onChange={(e) => handleGagnantsChange(index, "gagnants4", Number(e.target.value))}
    />

    <input
      type="number"
      placeholder={0}
      style={{maxWidth: "70px"}}
      value={gagnants5[index]?.gagnants5 || ""}
      onChange={(e) => handleGagnantsChange(index, "gagnants5", Number(e.target.value))}
    />

    <input
      type="number"
      placeholder={0}
      style={{maxWidth: "70px"}}
      value={gagnants6[index]?.gagnants6 || ""}
      onChange={(e) => handleGagnantsChange(index, "gagnants6", Number(e.target.value))}
    />
    
  </div>
))}

        </div>
 
      </div>
</div>

<div style={{display: "flex", flexDirection: "row", gap: "20px", marginBottom: "40px"}}>
      <button style={{maxWidth: "150px", padding: "5px"}} onClick={handleSave}>Sauvegarder les modifications</button>
      <button style={{maxWidth: "150px", padding: "5px"}} onClick={handleReset}>Réinitialiser les champs</button>
    </div>
    </div>
  );
}

export async function getServerSideProps() {
  const filePath = path.join('./gameData2.json');

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return { props: { initialData: JSON.parse(fileContents) } };
  } catch {
    return { props: { initialData: { startDate: '', endDate: '', Gagnantss: [] } } };
  }
}

