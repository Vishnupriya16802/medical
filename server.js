const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'patients.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read patients
function readPatients() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

// Helper to write patients
function writePatients(patients) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2));
}

// Get all patients or search by name
app.get('/api/patients', (req, res) => {
  const { search } = req.query;
  let patients = readPatients();
  if (search) {
    patients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  res.json(patients);
});

// Add new patient
app.post('/api/patients', (req, res) => {
  const { name, age, gender } = req.body;
  if (!name || !age || !gender) {
    return res.status(400).json({ error: 'Name, age, and gender are required.' });
  }
  const patients = readPatients();
  const newPatient = {
    id: Date.now(),
    name,
    age,
    gender
  };
  patients.push(newPatient);
  writePatients(patients);
  res.status(201).json(newPatient);
});

// Get stats
app.get('/api/stats', (req, res) => {
  const patients = readPatients();
  const male = patients.filter(p => p.gender === 'Male').length;
  const female = patients.filter(p => p.gender === 'Female').length;
  res.json({ male, female, total: patients.length });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 