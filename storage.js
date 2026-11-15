/**
 * Blood Bridge - Core LocalStorage Database & State Management
 * File: storage.js
 */

const STORAGE_KEYS = {
  HOSPITALS: 'blood_bridge_hospitals',
  PATIENTS: 'blood_bridge_patients',
  REQUESTS: 'blood_bridge_requests',
  CURRENT_USER: 'blood_bridge_current_user'
};

// Blood Groups and Components Definition
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const BLOOD_COMPONENTS = ['Whole Blood', 'Plasma', 'RBC', 'WBC'];

// Blood Compatibility Matrix for Red Blood Cells / Whole Blood
const RBC_COMPATIBILITY = {
  'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
  'A-': { canReceiveFrom: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
  'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
  'B-': { canReceiveFrom: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
  'AB+': { canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], canDonateTo: ['AB+'] }, // Universal Recipient
  'AB-': { canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
  'O+': { canReceiveFrom: ['O+', 'O-'], canDonateTo: ['O+', 'A+', 'B+', 'AB+'] },
  'O-': { canReceiveFrom: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] } // Universal Donor
};

// Initial Seed Hospitals Data
const DUMMY_HOSPITALS = [
  {
    id: 'hosp_1',
    name: 'City Care Multispeciality Hospital',
    licenseId: 'LIC-MH-2024-101',
    city: 'Metro City North',
    address: '104 Health Way Avenue, Sector 12, Metro City North',
    phone: '+91-98234-56789',
    email: 'citycare@hospital.org',
    password: 'hospital123',
    role: 'hospital',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    inventory: {
      'Whole Blood': { 'A+': 16, 'A-': 5, 'B+': 18, 'B-': 3, 'O+': 22, 'O-': 6, 'AB+': 8, 'AB-': 2 },
      'Plasma': { 'A+': 12, 'A-': 4, 'B+': 14, 'B-': 2, 'O+': 19, 'O-': 4, 'AB+': 11, 'AB-': 1 },
      'RBC': { 'A+': 15, 'A-': 6, 'B+': 12, 'B-': 4, 'O+': 25, 'O-': 5, 'AB+': 7, 'AB-': 2 },
      'WBC': { 'A+': 8, 'A-': 2, 'B+': 9, 'B-': 1, 'O+': 10, 'O-': 3, 'AB+': 4, 'AB-': 1 }
    }
  },
  {
    id: 'hosp_2',
    name: 'Red Cross Central Blood Bank',
    licenseId: 'LIC-RC-2023-402',
    city: 'Central Metro',
    address: '12 Humanitarian Boulevard, Civic Center, Central Metro',
    phone: '+91-98110-22334',
    email: 'redcross@bloodbank.org',
    password: 'hospital123',
    role: 'hospital',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 70).toISOString(), // ~1 hr ago
    inventory: {
      'Whole Blood': { 'A+': 28, 'A-': 12, 'B+': 32, 'B-': 8, 'O+': 45, 'O-': 14, 'AB+': 15, 'AB-': 5 },
      'Plasma': { 'A+': 20, 'A-': 8, 'B+': 24, 'B-': 6, 'O+': 30, 'O-': 9, 'AB+': 18, 'AB-': 4 },
      'RBC': { 'A+': 25, 'A-': 10, 'B+': 22, 'B-': 7, 'O+': 38, 'O-': 11, 'AB+': 12, 'AB-': 3 },
      'WBC': { 'A+': 14, 'A-': 5, 'B+': 12, 'B-': 3, 'O+': 16, 'O-': 6, 'AB+': 8, 'AB-': 2 }
    }
  },
  {
    id: 'hosp_3',
    name: 'Apex Trauma & Surgical Institute',
    licenseId: 'LIC-APX-2025-993',
    city: 'Metro City South',
    address: '77 Expressway Ring Road, Near IT Hub, Metro City South',
    phone: '+91-98771-44556',
    email: 'apex@traumacare.in',
    password: 'hospital123',
    role: 'hospital',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
    inventory: {
      'Whole Blood': { 'A+': 8, 'A-': 2, 'B+': 6, 'B-': 1, 'O+': 11, 'O-': 2, 'AB+': 4, 'AB-': 0 },
      'Plasma': { 'A+': 6, 'A-': 1, 'B+': 5, 'B-': 1, 'O+': 9, 'O-': 1, 'AB+': 3, 'AB-': 0 },
      'RBC': { 'A+': 9, 'A-': 3, 'B+': 7, 'B-': 2, 'O+': 14, 'O-': 1, 'AB+': 5, 'AB-': 1 },
      'WBC': { 'A+': 4, 'A-': 0, 'B+': 3, 'B-': 0, 'O+': 5, 'O-': 1, 'AB+': 2, 'AB-': 0 }
    }
  },
  {
    id: 'hosp_4',
    name: 'St. Jude Healthcare & Blood Center',
    licenseId: 'LIC-STJ-2022-771',
    city: 'East District',
    address: '25 Hope Garden Lane, Medical Enclave, East District',
    phone: '+91-99880-12345',
    email: 'stjude@healthcare.org',
    password: 'hospital123',
    role: 'hospital',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hrs ago
    inventory: {
      'Whole Blood': { 'A+': 14, 'A-': 4, 'B+': 16, 'B-': 5, 'O+': 18, 'O-': 4, 'AB+': 9, 'AB-': 3 },
      'Plasma': { 'A+': 10, 'A-': 3, 'B+': 12, 'B-': 4, 'O+': 15, 'O-': 3, 'AB+': 8, 'AB-': 2 },
      'RBC': { 'A+': 12, 'A-': 5, 'B+': 14, 'B-': 3, 'O+': 20, 'O-': 4, 'AB+': 6, 'AB-': 2 },
      'WBC': { 'A+': 6, 'A-': 2, 'B+': 7, 'B-': 2, 'O+': 8, 'O-': 2, 'AB+': 4, 'AB-': 1 }
    }
  },
  {
    id: 'hosp_5',
    name: 'Metro Life Charity Hospital',
    licenseId: 'LIC-MLC-2024-515',
    city: 'West Suburban',
    address: '409 Western Trunk Road, Green Valley, West Suburban',
    phone: '+91-97654-88990',
    email: 'metrolife@charityhealth.org',
    password: 'hospital123',
    role: 'hospital',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    inventory: {
      'Whole Blood': { 'A+': 11, 'A-': 3, 'B+': 13, 'B-': 2, 'O+': 17, 'O-': 3, 'AB+': 6, 'AB-': 1 },
      'Plasma': { 'A+': 8, 'A-': 2, 'B+': 9, 'B-': 2, 'O+': 12, 'O-': 2, 'AB+': 5, 'AB-': 1 },
      'RBC': { 'A+': 10, 'A-': 4, 'B+': 11, 'B-': 2, 'O+': 16, 'O-': 3, 'AB+': 4, 'AB-': 1 },
      'WBC': { 'A+': 5, 'A-': 1, 'B+': 6, 'B-': 1, 'O+': 7, 'O-': 1, 'AB+': 3, 'AB-': 0 }
    }
  }
];

// Initial Seed Patients Data
const DUMMY_PATIENTS = [
  {
    id: 'pat_1',
    name: 'Sarah Johnson',
    phone: '+91-98765-43210',
    bloodGroup: 'A+',
    city: 'Metro City North',
    email: 'sarah@gmail.com',
    password: 'patient123',
    role: 'patient',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'pat_2',
    name: 'David Chen',
    phone: '+91-98123-45678',
    bloodGroup: 'O-',
    city: 'Central Metro',
    email: 'david@gmail.com',
    password: 'patient123',
    role: 'patient',
    createdAt: '2026-02-14T11:30:00Z'
  }
];

// Initial Seed Requests Data
const DUMMY_REQUESTS = [
  {
    id: 'req_101',
    hospitalId: 'hosp_1',
    hospitalName: 'City Care Multispeciality Hospital',
    patientName: 'Kavita Sundaram',
    patientPhone: '+91-98765-00112',
    patientEmail: 'kavita.s@example.com',
    bloodGroup: 'O-',
    component: 'Whole Blood',
    units: 2,
    urgency: 'Critical Emergency',
    notes: 'Severe trauma admission in OT-2. Immediate crossmatch needed.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString() // 40 mins ago
  },
  {
    id: 'req_102',
    hospitalId: 'hosp_1',
    hospitalName: 'City Care Multispeciality Hospital',
    patientName: 'Devendra Rao',
    patientPhone: '+91-99887-76655',
    patientEmail: 'devendra@example.com',
    bloodGroup: 'B+',
    component: 'Plasma',
    units: 1,
    urgency: 'Urgent',
    notes: 'Liver dysfunction with coagulopathy. Fresh Frozen Plasma requested.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString() // 1.5 hrs ago
  },
  {
    id: 'req_103',
    hospitalId: 'hosp_2',
    hospitalName: 'Red Cross Central Blood Bank',
    patientName: 'Ananya Sharma',
    patientPhone: '+91-98441-22334',
    patientEmail: 'ananya.sh@example.com',
    bloodGroup: 'A+',
    component: 'RBC',
    units: 2,
    urgency: 'Standard',
    notes: 'Elective orthopedic surgery scheduled for tomorrow morning.',
    status: 'Approved',
    approvedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

// Database Storage Controller
const StorageDB = {
  // Initialize simulated database in localStorage
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.HOSPITALS)) {
      this.setHospitals(DUMMY_HOSPITALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.setPatients(DUMMY_PATIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      this.setRequests(DUMMY_REQUESTS);
    }
  },

  // Reset database back to seed data
  resetDatabase() {
    this.setHospitals(DUMMY_HOSPITALS);
    this.setPatients(DUMMY_PATIENTS);
    this.setRequests(DUMMY_REQUESTS);
    this.showToast('Database reset to initial sample hospitals and stock.', 'info');
  },

  // Hospital operations
  getHospitals() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing hospitals from localStorage:', e);
      return [];
    }
  },

  setHospitals(hospitals) {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
  },

  getHospitalById(id) {
    const list = this.getHospitals();
    return list.find(h => h.id === id) || null;
  },

  getHospitalByEmail(email) {
    const list = this.getHospitals();
    return list.find(h => h.email.toLowerCase() === email.toLowerCase()) || null;
  },

  saveHospital(hospitalData) {
    const list = this.getHospitals();
    const existingIndex = list.findIndex(h => h.id === hospitalData.id);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...hospitalData };
    } else {
      list.push(hospitalData);
    }
    this.setHospitals(list);
    return hospitalData;
  },

  updateHospitalInventory(hospitalId, component, bloodGroup, count) {
    const list = this.getHospitals();
    const hospital = list.find(h => h.id === hospitalId);
    if (!hospital) return false;

    if (!hospital.inventory) hospital.inventory = {};
    if (!hospital.inventory[component]) hospital.inventory[component] = {};

    hospital.inventory[component][bloodGroup] = Math.max(0, parseInt(count, 10) || 0);
    hospital.lastUpdated = new Date().toISOString();

    this.setHospitals(list);

    // If current logged in user is this hospital, sync currentUser
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === hospitalId) {
      this.setCurrentUser(hospital);
    }

    return true;
  },

  // Patient operations
  getPatients() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing patients from localStorage:', e);
      return [];
    }
  },

  setPatients(patients) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  getPatientByEmail(email) {
    const list = this.getPatients();
    return list.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  savePatient(patientData) {
    const list = this.getPatients();
    const existingIndex = list.findIndex(p => p.id === patientData.id);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...patientData };
    } else {
      list.push(patientData);
    }
    this.setPatients(list);
    return patientData;
  },

  // Patient Requests operations
  getRequests() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing requests from localStorage:', e);
      return [];
    }
  },

  setRequests(requests) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  saveRequest(reqData) {
    const list = this.getRequests();
    const newReq = {
      id: reqData.id || 'req_' + Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...reqData
    };
    list.unshift(newReq);
    this.setRequests(list);
    return newReq;
  },

  updateRequestStatus(requestId, status, declineReason = '') {
    const list = this.getRequests();
    const req = list.find(r => r.id === requestId);
    if (!req) return null;

    req.status = status;
    if (status === 'Approved') {
      req.approvedAt = new Date().toISOString();
    } else if (status === 'Declined') {
      req.declinedAt = new Date().toISOString();
      req.declineReason = declineReason;
    }

    this.setRequests(list);
    return req;
  },

  // Session & Authentication operations
  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.showToast('You have been logged out successfully.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  },

  // Network Statistics & Aggregations
  getNetworkStats() {
    const hospitals = this.getHospitals();
    let totalUnits = 0;
    const cities = new Set();

    hospitals.forEach(h => {
      if (h.city) cities.add(h.city);
      if (h.inventory) {
        Object.keys(h.inventory).forEach(comp => {
          Object.keys(h.inventory[comp] || {}).forEach(grp => {
            totalUnits += parseInt(h.inventory[comp][grp], 10) || 0;
          });
        });
      }
    });

    const requests = this.getRequests();
    const fulfilledRequests = requests.filter(r => r.status === 'Approved').length;

    return {
      totalHospitals: hospitals.length,
      totalUnits,
      citiesCount: cities.size,
      fulfilledRequests
    };
  },

  // Helper: Get stock badge classification
  getStockBadge(units) {
    const count = parseInt(units, 10) || 0;
    if (count > 10) {
      return {
        level: 'available',
        label: `${count} Units (Available)`,
        badgeClass: 'badge-available',
        color: '#15803d'
      };
    } else if (count >= 3) {
      return {
        level: 'low',
        label: `${count} Units (Low Stock)`,
        badgeClass: 'badge-low',
        color: '#b45309'
      };
    } else {
      return {
        level: 'critical',
        label: `${count} Units (Critical / Low)`,
        badgeClass: 'badge-critical',
        color: '#b91c1c'
      };
    }
  },

  // Format Relative Time (e.g. "15m ago", "2h ago", "yesterday")
  formatRelativeTime(isoString) {
    if (!isoString) return 'recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  },

  // Non-blocking Toast Notification System
  showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('bloodBridgeToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bloodBridgeToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSymbol = '&#9432;'; // info
    if (type === 'success') iconSymbol = '&#10003;';
    if (type === 'danger' || type === 'error') iconSymbol = '&#9888;';
    if (type === 'warning') iconSymbol = '&#9888;';

    toast.innerHTML = `
      <div class="toast-icon">${iconSymbol}</div>
      <div class="toast-body">${this.escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  },

  // Security Helper: Escape HTML strings to prevent XSS
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Initialize database automatically on script load
StorageDB.init();

// Export globally
window.StorageDB = StorageDB;
window.BLOOD_GROUPS = BLOOD_GROUPS;
window.BLOOD_COMPONENTS = BLOOD_COMPONENTS;
window.RBC_COMPATIBILITY = RBC_COMPATIBILITY;
