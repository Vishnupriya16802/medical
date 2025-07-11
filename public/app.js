document.addEventListener('DOMContentLoaded', () => {
  const stats = {
    male: document.getElementById('male-count'),
    female: document.getElementById('female-count'),
    total: document.getElementById('total-count')
  };
  const patientList = document.getElementById('patient-list');
  const searchInput = document.getElementById('search-input');
  const addForm = document.getElementById('add-patient-form');
  const modal = document.getElementById('patient-modal');
  const modalDetails = document.getElementById('modal-details');
  const closeBtn = document.querySelector('.close-btn');

  function fetchStats() {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        stats.male.textContent = `Male: ${data.male}`;
        stats.female.textContent = `Female: ${data.female}`;
        stats.total.textContent = `Total: ${data.total}`;
      });
  }

  function fetchPatients(query = '') {
    let url = '/api/patients';
    if (query) url += `?search=${encodeURIComponent(query)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        patientList.innerHTML = '';
        if (data.length === 0) {
          patientList.innerHTML = '<li>No patients found.</li>';
          return;
        }
        data.forEach(patient => {
          const li = document.createElement('li');
          li.textContent = `${patient.name} (${patient.gender}, Age ${patient.age})`;
          li.addEventListener('click', () => showPatientDetails(patient));
          patientList.appendChild(li);
        });
      });
  }

  function showPatientDetails(patient) {
    modalDetails.innerHTML = `
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>Age:</strong> ${patient.age}</p>
      <p><strong>Gender:</strong> ${patient.gender}</p>
      <p><strong>ID:</strong> ${patient.id}</p>
    `;
    modal.classList.remove('hidden');
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value, 10);
    const gender = document.getElementById('gender').value;
    if (!name || !age || !gender) return;
    fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, gender })
    })
      .then(res => res.json())
      .then(() => {
        addForm.reset();
        fetchPatients(searchInput.value);
        fetchStats();
      });
  });

  searchInput.addEventListener('input', (e) => {
    fetchPatients(e.target.value);
  });

  // Initial load
  fetchStats();
  fetchPatients();
}); 