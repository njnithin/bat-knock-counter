const portions = [
  '1L', '1M', '1R',
  '2L', '2M', '2R',
  '3L', '3M', '3R',
  '4L', '4M', '4R'
];

const tableBody = document.getElementById('tableBody');
const batTabsContainer = document.getElementById('batTabs');
// DOM Elements
const addBatBtn = document.getElementById('addBatBtn');
const resetBatBtn = document.getElementById('resetBatBtn');
const lockBatBtn = document.getElementById('lockBatBtn');
const exportImageBtn = document.getElementById('exportImageBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const grandTotalEl = document.getElementById('grandTotal');
const saveStatusEl = document.getElementById('saveStatus');
const customThemeSelector = document.getElementById('customThemeSelector');
const themeSelectorBtn = document.getElementById('themeSelectorBtn');
const themeDropdownMenu = document.getElementById('themeDropdownMenu');
const themeSelectorLabel = document.getElementById('themeSelectorLabel');
const themeSelectorArrow = document.getElementById('themeSelectorArrow');
const themeOptions = document.querySelectorAll('.theme-option');
const muscleModal = document.getElementById('muscleModal');
const muscleMessage = document.getElementById('muscleMessage');

const activeBatNameDisplay = document.getElementById('activeBatNameDisplay');
const activeBatWeightDisplay = document.getElementById('activeBatWeightDisplay');
const addBatModal = document.getElementById('addBatModal');
const addBatModalContent = document.getElementById('addBatModalContent');
const newBatNameInput = document.getElementById('newBatNameInput');
const newBatWeightInput = document.getElementById('newBatWeightInput');
const cancelAddBatBtn = document.getElementById('cancelAddBatBtn');
const confirmAddBatBtn = document.getElementById('confirmAddBatBtn');

const editBatModal = document.getElementById('editBatModal');
const editBatModalContent = document.getElementById('editBatModalContent');
const editBatNameInput = document.getElementById('editBatNameInput');
const editBatWeightInput = document.getElementById('editBatWeightInput');
const cancelEditBatBtn = document.getElementById('cancelEditBatBtn');
const confirmEditBatBtn = document.getElementById('confirmEditBatBtn');
const unitBtnG = document.getElementById('unitBtnG');
const unitBtnLbs = document.getElementById('unitBtnLbs');
const newBatWeightLabel = document.getElementById('newBatWeightLabel');
const editBatWeightLabel = document.getElementById('editBatWeightLabel');
let weightUnit = localStorage.getItem('batWeightUnit') || 'g';

function updateUnitToggleUI() {
  if (weightUnit === 'g') {
    if (unitBtnG) unitBtnG.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all bg-brand text-brand-contrast neu-shadow border-transparent border';
    if (unitBtnLbs) unitBtnLbs.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all text-on-surface-variant hover:text-on-surface border-transparent border';
  } else {
    if (unitBtnLbs) unitBtnLbs.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all bg-brand text-brand-contrast neu-shadow border-transparent border';
    if (unitBtnG) unitBtnG.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all text-on-surface-variant hover:text-on-surface border-transparent border';
  }
  
  const placeholderLabel = `Bat Weight (in ${weightUnit})`;
  if (newBatWeightLabel) newBatWeightLabel.textContent = placeholderLabel;
  if (editBatWeightLabel) editBatWeightLabel.textContent = placeholderLabel;
  
  populateTable(); // to update display
}

if (unitBtnG) unitBtnG.addEventListener('click', () => {
  weightUnit = 'g';
  localStorage.setItem('batWeightUnit', 'g');
  updateUnitToggleUI();
});

if (unitBtnLbs) unitBtnLbs.addEventListener('click', () => {
  weightUnit = 'lbs';
  localStorage.setItem('batWeightUnit', 'lbs');
  updateUnitToggleUI();
});

// Audio elements
const micToggleBtn = document.getElementById('micToggleBtn');
const micSensitivity = document.getElementById('micSensitivity');
const liveKnockCountEl = document.getElementById('liveKnockCount');
const autoSwitchToggle = document.getElementById('autoSwitchToggle');

let modalTimeout;

function checkMuscles(input) {
  const val = Number(input.value);
  if (val > 0 && val % 10 === 0) {
    const totalKnocks = val * 1000;
    const portion = input.dataset.portion;
    
    const currentBat = appData.lastEdited;
    const batData = appData.bats[currentBat] || {};
    const allReached = portions.every(p => (batData[p] || 0) >= val);

    if (allReached) {
      muscleMessage.textContent = `Your bat got muscles! All portions reached ${totalKnocks.toLocaleString()} knocks!`;
      fireGoldenConfetti();
    } else {
      muscleMessage.textContent = `${portion} reached ${totalKnocks.toLocaleString()} knocks!`;
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d4ff37', '#ffffff', '#4c8c2b'],
          zIndex: 9999
        });
      }
    }
    
    const modalContent = document.getElementById('muscleModalContent');
    muscleModal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-90');
    modalContent.classList.add('scale-100');
    
    clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
      muscleModal.classList.add('opacity-0', 'pointer-events-none');
      modalContent.classList.remove('scale-100');
      modalContent.classList.add('scale-90');
    }, 4000);
  }
}

function fireGoldenConfetti() {
  if (typeof confetti !== 'function') return;
  var duration = 4000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: ['#FFD700', '#DAA520', '#F8E231', '#ffffff', '#B8860B'] };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    var particleCount = 40 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

let appData = {
  lastEdited: 'Default Bat',
  bats: {},
  lockedBats: {}
};

function applyLockState() {
  const currentBat = appData.lastEdited;
  const isLocked = appData.lockedBats && appData.lockedBats[currentBat];
  
  const inputs = document.querySelectorAll('.counter-input');
  const btns = document.querySelectorAll('.counter-btn');
  const radios = document.querySelectorAll('.target-radio');
  
  if (isLocked) {
    document.body.classList.add('locked-mode');
    lockBatBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] text-brand drop-shadow-[0_0_8px_rgba(212,255,55,0.5)]">lock</span>';
    lockBatBtn.classList.remove('text-on-surface-variant', 'neu-shadow-sm');
    lockBatBtn.classList.add('bg-surface-container-high', 'neu-shadow-inset-sm');
    micToggleBtn.disabled = true;
    micToggleBtn.style.opacity = '0.5';
    micToggleBtn.title = "Recording disabled while bat is locked";
    
    resetBatBtn.disabled = true;
    resetBatBtn.style.opacity = '0.5';
    inputs.forEach(el => el.disabled = true);
    btns.forEach(el => { el.disabled = true; el.style.opacity = '0.5'; });
    radios.forEach(el => el.disabled = true);
    
    if (typeof stopListening === 'function' && window.isListening) {
      stopListening();
    }
  } else {
    document.body.classList.remove('locked-mode');
    lockBatBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">lock_open</span>';
    lockBatBtn.classList.add('text-on-surface-variant', 'neu-shadow-sm');
    lockBatBtn.classList.remove('bg-surface-container-high', 'neu-shadow-inset-sm');
    micToggleBtn.disabled = false;
    micToggleBtn.style.opacity = '1';
    micToggleBtn.title = "Start/Stop Knock Detection";
    
    resetBatBtn.disabled = false;
    resetBatBtn.style.opacity = '1';
    inputs.forEach(el => el.disabled = false);
    btns.forEach(el => { el.disabled = false; el.style.opacity = '1'; });
    radios.forEach(el => el.disabled = false);
  }
}

// Initialize Table structure
function initTable() {
  tableBody.innerHTML = '';
  portions.forEach(portion => {
    const row = document.createElement('tr');
    row.dataset.portion = portion;
    row.className = 'data-row transition-colors group';
    row.innerHTML = `
      <td class="py-3 px-2 md:px-6 text-center">
        <input type="radio" name="targetPortion" class="target-radio form-radio text-brand rounded-full border-transparent focus:ring-brand focus:ring-offset-surface-container-low h-5 w-5 cursor-pointer radio-neu" value="${portion}" ${portion === portions[0] ? 'checked' : ''}>
      </td>
      <td class="py-3 px-2 md:px-6 text-body-md font-semibold text-on-surface">${portion}</td>
      <td class="py-3 px-2 md:px-6">
        <div class="flex items-center justify-center gap-3">
          <button class="counter-btn minus w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors neu-shadow-sm active:neu-shadow-inset-sm"><span class="material-symbols-outlined text-sm pointer-events-none">remove</span></button>
          <input type="number" class="counter-input w-16 h-12 bg-surface-container-high rounded-xl text-center text-[20px] text-on-surface font-bold neu-shadow-inset border-transparent border" value="0" min="0" data-portion="${portion}">
          <button class="counter-btn plus w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors neu-shadow-sm active:neu-shadow-inset-sm"><span class="material-symbols-outlined text-sm pointer-events-none">add</span></button>
        </div>
      </td>
      <td class="row-total py-3 px-2 md:px-6 text-right text-body-md text-brand font-semibold">0</td>
    `;
    tableBody.appendChild(row);
  });
}

function renderTabs() {
  batTabsContainer.innerHTML = '';
  
  if (Object.keys(appData.bats).length === 0) {
    appData.bats['Default Bat'] = {};
  }
  
  if (!appData.bats[appData.lastEdited]) {
    appData.lastEdited = Object.keys(appData.bats)[0];
  }

  Object.keys(appData.bats).forEach(batName => {
    const isLocked = appData.lockedBats && appData.lockedBats[batName];
    const tab = document.createElement('div');
    if (batName === appData.lastEdited) {
        tab.className = 'bg-surface-container-high text-brand px-5 py-3 rounded-2xl flex items-center gap-2 neu-shadow-inset transition-all cursor-pointer whitespace-nowrap';
    } else {
        tab.className = 'bg-surface-container px-5 py-3 rounded-2xl text-on-surface-variant hover:text-on-surface neu-shadow-sm transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap';
    }
    
    tab.innerHTML = `
      <span class="text-sm font-bold bat-name-text pointer-events-none">${batName}</span>
      ${isLocked ? '<span class="material-symbols-outlined text-[16px] pointer-events-none">lock</span>' : `
        <button class="hover:text-primary-fixed-dim edit-bat flex items-center" title="Rename bat"><span class="material-symbols-outlined text-[16px] pointer-events-none">edit</span></button>
        <button class="hover:text-error delete-bat flex items-center" title="Delete bat"><span class="material-symbols-outlined text-[16px] pointer-events-none">close</span></button>
      `}
    `;

    tab.onclick = (e) => {
      if (e.target.classList.contains('edit-bat')) {
        openEditBatModal(batName);
        return;
      }
      
      if (e.target.classList.contains('delete-bat')) {
        if (Object.keys(appData.bats).length <= 1) {
          alert("You must have at least one bat.");
          return;
        }
        if (confirm(`Are you sure you want to delete "${batName}"?`)) {
          delete appData.bats[batName];
          if (appData.lockedBats) delete appData.lockedBats[batName];
          if (appData.lastEdited === batName) {
            appData.lastEdited = Object.keys(appData.bats)[0];
          }
          renderTabs();
          populateTable();
          triggerSave();
        }
        return;
      }

      if (appData.lastEdited !== batName) {
        appData.lastEdited = batName;
        renderTabs();
        populateTable();
        triggerSave();
      }
    };
    batTabsContainer.appendChild(tab);
  });
}

// Update DOM and state
function updateTotals(isSilent = false) {
  let grandTotal = 0;
  const currentBat = appData.lastEdited;
  
  if (!appData.bats[currentBat]) {
    appData.bats[currentBat] = {};
  }

  document.querySelectorAll('tbody tr').forEach(row => {
    const portion = row.dataset.portion;
    const input = row.querySelector('.counter-input');
    const counter = parseInt(input.value) || 0;
    
    // Update internal state
    appData.bats[currentBat][portion] = counter;

    const total = counter * 1000;
    row.querySelector('.row-total').textContent = total.toLocaleString();
    grandTotal += total;
  });

  appData.bats[currentBat]._lastGrandTotal = grandTotal;
  grandTotalEl.textContent = grandTotal.toLocaleString();
  
  updateHeatmap();
}

// Update Heatmap UI based on knock volume
function updateHeatmap() {
  const currentBat = appData.lastEdited;
  const batData = appData.bats[currentBat] || {};
  
  // Find max knocks across all 12 portions
  let maxCount = 0;
  portions.forEach(portion => {
    const counter = batData[portion] || 0;
    const totalCount = counter * 1000;
    if (totalCount > maxCount) maxCount = totalCount;
  });

  portions.forEach(portion => {
    const heatEl = document.getElementById(`heat-${portion}`);
    if (!heatEl) return;
    
    const counter = batData[portion] || 0;
    const totalCount = counter * 1000;
    
    if (maxCount > 0 && totalCount > 0) {
      const intensity = (totalCount / maxCount) * 100;
      const safeIntensity = Math.max(15, intensity); // Min 15% glow if knocked at least once
      
      // Remove inset shadow when glowing, apply color-mix
      heatEl.classList.remove('neu-shadow-inset-sm');
      heatEl.style.backgroundColor = `color-mix(in srgb, var(--brand) ${safeIntensity}%, var(--surface-container-high))`;
      
      // Add a subtle outer glow if highly active
      if (intensity > 40) {
        heatEl.style.boxShadow = `0 0 ${intensity / 8}px color-mix(in srgb, var(--brand) ${intensity/2}%, transparent)`;
      } else {
        heatEl.style.boxShadow = '';
      }
    } else {
      heatEl.classList.add('neu-shadow-inset-sm');
      heatEl.style.backgroundColor = '';
      heatEl.style.boxShadow = '';
    }
  });
}

// Populate table from state
function populateTable() {
  const currentBat = appData.lastEdited || 'Default';
  const batData = currentBat ? (appData.bats[currentBat] || {}) : {};

  document.querySelectorAll('tbody tr').forEach(row => {
    const portion = row.dataset.portion;
    const input = row.querySelector('.counter-input');
    input.value = batData[portion] || 0;
  });
  
  if (activeBatNameDisplay) {
    activeBatNameDisplay.textContent = currentBat;
    const unitSwitcher = document.getElementById('unitSwitcherContainer');
    if (batData._weightInGrams) {
      if (unitSwitcher) unitSwitcher.style.display = 'flex';
      if (weightUnit === 'lbs') {
        const lbs = (batData._weightInGrams / 453.592).toFixed(2);
        activeBatWeightDisplay.textContent = `(Weight: ${lbs} lbs)`;
      } else {
        const g = Math.round(batData._weightInGrams);
        activeBatWeightDisplay.textContent = `(Weight: ${g} g)`;
      }
    } else {
      if (unitSwitcher) unitSwitcher.style.display = 'none';
      activeBatWeightDisplay.textContent = '';
    }
  }

  const sticker = document.getElementById('heatmapBatNameDisplay');
  if (sticker) {
    sticker.textContent = currentBat.length > 10 ? currentBat.substring(0, 10) : currentBat;
  }

  applyLockState();
  updateTotals(true);
}

// Status visual logic
function setStatus(text, colorClass) {
  saveStatusEl.textContent = text;
  const dot = document.getElementById('syncDot');
  dot.className = 'w-2.5 h-2.5 rounded-full neu-shadow-sm border border-transparent';
  dot.classList.add(colorClass);
  if (colorClass.includes('orange')) {
    dot.classList.add('animate-pulse');
  }
}

// Firebase Integration
const { firebaseAuth, firebaseDb, firebaseProvider } = window;
let currentUser = null;
let unsubscribeSnapshot = null;
let saveTimeout;
let lastSaveTime = 0;

// Auth UI Elements
const loginBtn = document.getElementById('loginBtn');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
const authLoadingOverlay = document.getElementById('authLoadingOverlay');

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Mobile browsers often block popups. Use redirect instead.
      firebaseAuth.signInWithRedirect(firebaseProvider).catch(err => {
        alert("Login failed: " + err.message);
      });
    } else {
      firebaseAuth.signInWithPopup(firebaseProvider).catch(err => {
        console.error("Login failed:", err);
        alert("Login failed: " + err.message);
      });
    }
  });
}

const handleLogout = () => {
  firebaseAuth.signOut();
};

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

function subscribeToData() {
  if (!currentUser) return;
  
  setStatus('Syncing...', 'bg-orange-400');
  const docRef = firebaseDb.collection('users').doc(currentUser.uid);
  
  if (unsubscribeSnapshot) unsubscribeSnapshot();
  
  unsubscribeSnapshot = docRef.onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      if (data && data.bats && Object.keys(data.bats).length > 0) {
        // Prevent local saves from overwriting incoming cloud data if we just saved
        if (Date.now() - lastSaveTime > 2000) {
           appData = data;
           if (!appData.lockedBats) appData.lockedBats = {};
           if (!appData.lastEdited) appData.lastEdited = Object.keys(appData.bats)[0];
           
           let migrated = false;
           Object.values(appData.bats).forEach(bat => {
             if (bat._weight !== undefined && bat._weightInGrams === undefined) {
               let w = String(bat._weight).toLowerCase();
               if (w.includes('lb')) {
                 bat._weightInGrams = parseFloat(w) * 453.592;
               } else {
                 bat._weightInGrams = parseFloat(w);
               }
               delete bat._weight;
               migrated = true;
             }
           });
           
           updateUnitToggleUI();
           renderTabs();
           populateTable();
           
           if (migrated) triggerSave();
        }
      } else {
        // Doc exists but data is empty or broken
        appData = { bats: { 'Default': { toe: 0, edges: 0, splice: 0, blade: 0, _weightInGrams: 1100 } }, lastEdited: 'Default', lockedBats: {} };
        triggerSave();
      }
    } else {
      // Brand New User
      appData = { bats: { 'Default': { toe: 0, edges: 0, splice: 0, blade: 0, _weightInGrams: 1100 } }, lastEdited: 'Default', lockedBats: {} };
      triggerSave(); // create doc
    }
    setStatus('Cloud Sync', 'bg-brand');
  }, error => {
    console.error('Firestore listener error:', error);
    setStatus('Sync Failed', 'bg-red-500');
  });
}

async function saveData() {
  if (!currentUser) return;
  setStatus('Saving...', 'bg-orange-400');
  
  try {
    lastSaveTime = Date.now();
    await firebaseDb.collection('users').doc(currentUser.uid).set(appData, { merge: true });
    setTimeout(() => setStatus('Cloud Sync', 'bg-brand'), 500);
  } catch (error) {
    console.error('Error saving data:', error);
    setStatus('Save Failed', 'bg-red-500');
  }
}

// Debounce save function to prevent spamming server
function triggerSave() {
  if (!currentUser) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveData, 500);
}

// Event Listeners
document.addEventListener('click', e => {
  if (e.target.classList.contains('plus')) {
    const input = e.target.parentElement.querySelector('.counter-input');
    const oldVal = Number(input.value);
    input.value = oldVal + 1;
    updateTotals();
    triggerSave();
    if (Number(input.value) !== oldVal) checkMuscles(input);
  }

  if (e.target.classList.contains('minus')) {
    const input = e.target.parentElement.querySelector('.counter-input');
    input.value = Math.max(0, Number(input.value) - 1);
    updateTotals();
    triggerSave();
  }

  if (e.target === muscleModal) {
    const modalContent = document.getElementById('muscleModalContent');
    muscleModal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-90');
  }
});

document.addEventListener('input', e => {
  if (e.target.classList.contains('counter-input')) {
    if (e.target.value < 0) {
      e.target.value = 0;
    }
    updateTotals();
    triggerSave();
    checkMuscles(e.target);
  }
});

function openAddBatModal() {
  newBatNameInput.value = '';
  newBatWeightInput.value = '';
  addBatModal.classList.remove('opacity-0', 'pointer-events-none');
  addBatModalContent.classList.remove('scale-90');
  addBatModalContent.classList.add('scale-100');
  setTimeout(() => newBatNameInput.focus(), 100);
}

function closeAddBatModal() {
  addBatModal.classList.add('opacity-0', 'pointer-events-none');
  addBatModalContent.classList.remove('scale-100');
  addBatModalContent.classList.add('scale-90');
}

addBatBtn.addEventListener('click', openAddBatModal);

cancelAddBatBtn.addEventListener('click', closeAddBatModal);

confirmAddBatBtn.addEventListener('click', () => {
  const name = newBatNameInput.value.trim();
  const weightVal = parseFloat(newBatWeightInput.value);
  
  if (name) {
    if (name.length > 10) {
      alert("Bat name cannot exceed 10 characters.");
      return;
    }
    
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      alert("Bat name can only contain letters, numbers, and spaces.");
      return;
    }

    if (!appData.bats[name]) {
      appData.bats[name] = {};
      if (!isNaN(weightVal)) {
        appData.bats[name]._weightInGrams = weightUnit === 'lbs' ? weightVal * 453.592 : weightVal;
      }
      appData.lastEdited = name;
      renderTabs();
      populateTable();
      triggerSave();
      closeAddBatModal();
    } else {
      alert("A bat with this name already exists.");
    }
  } else {
    alert("Please enter a bat name.");
  }
});

resetBatBtn.addEventListener('click', () => {
  const currentBat = appData.lastEdited;
  if (confirm(`Are you sure you want to reset all counters for "${currentBat}" to 0?`)) {
    portions.forEach(portion => {
      if (!appData.bats[currentBat]) appData.bats[currentBat] = {};
      appData.bats[currentBat][portion] = 0;
      appData.bats[currentBat][portion + '_partial'] = 0;
    });
    liveKnockCountEl.value = 0;
    populateTable();
    triggerSave();
  }
});

lockBatBtn.addEventListener('click', () => {
  const currentBat = appData.lastEdited;
  if (!appData.lockedBats) appData.lockedBats = {};
  
  appData.lockedBats[currentBat] = !appData.lockedBats[currentBat];
  applyLockState();
  renderTabs(); // Refresh the tab lock icons
  triggerSave();
});

exportImageBtn.addEventListener('click', () => {
  const wrapper = document.querySelector('.table-wrapper');
  const inputs = wrapper.querySelectorAll('input.counter-input');
  
  // Swap inputs to divs to avoid html2canvas rendering bugs with inset shadows and input paddings
  const swaps = [];
  inputs.forEach(input => {
    const div = document.createElement('div');
    // Copy the classes but remove the problematic neumorphic inset shadow just for the screenshot
    div.className = input.className.replace('neu-shadow-inset', '') + ' flex items-center justify-center';
    div.textContent = input.value;
    input.style.display = 'none';
    input.parentNode.insertBefore(div, input);
    swaps.push({ input, div });
  });

  html2canvas(wrapper, { backgroundColor: getComputedStyle(document.body).backgroundColor }).then(canvas => {
    // Revert the DOM
    swaps.forEach(swap => {
      swap.input.style.display = '';
      swap.div.remove();
    });
    
    const link = document.createElement('a');
    link.download = `Bat_Knocks_${appData.lastEdited.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }).catch(err => {
    swaps.forEach(swap => {
      swap.input.style.display = '';
      swap.div.remove();
    });
  });
});

exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const currentBat = appData.lastEdited;
  const batData = appData.bats[currentBat] || {};
  
  doc.setFontSize(18);
  doc.text(`Bat Knocks - ${currentBat}`, 14, 22);
  
  const bodyData = portions.map(portion => {
    const counter = batData[portion] || 0;
    const total = counter * 1000;
    return [portion, counter.toString(), total.toLocaleString()];
  });
  
  let grandTotal = 0;
  portions.forEach(p => grandTotal += (batData[p] || 0) * 1000);
  
  doc.autoTable({
    startY: 30,
    head: [['Portion', 'Counter', 'Total Knocks']],
    body: bodyData,
    foot: [['Grand Total', '', grandTotal.toLocaleString()]],
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { halign: 'center', fillColor: [76, 175, 80] },
    footStyles: { halign: 'center', fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  doc.save(`Bat_Knocks_${currentBat.replace(/\s+/g, '_')}.pdf`);
});

exportExcelBtn.addEventListener('click', () => {
  const currentBat = appData.lastEdited;
  const batData = appData.bats[currentBat] || {};
  
  const wsData = [
    ["Portion", "Counter", "Total Knocks"]
  ];
  
  let grandTotal = 0;
  portions.forEach(portion => {
    const counter = batData[portion] || 0;
    const total = counter * 1000;
    grandTotal += total;
    wsData.push([portion, counter, total]);
  });
  
  wsData.push(["Grand Total", "", grandTotal]);
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  XLSX.utils.book_append_sheet(wb, ws, "Bat Data");
  XLSX.writeFile(wb, `Bat_Knocks_${currentBat.replace(/\s+/g, '_')}.xlsx`);
});

// Theme Logic
function applyTheme(theme) {
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const savedTheme = localStorage.getItem('appTheme') || 'system';
const labels = {
  'system': 'System Theme',
  'dark': 'Dark Theme',
  'light': 'Light Theme'
};
themeSelectorLabel.textContent = labels[savedTheme];
applyTheme(savedTheme);

// Custom Dropdown Logic
let isDropdownOpen = false;

function toggleDropdown() {
  isDropdownOpen = !isDropdownOpen;
  if (isDropdownOpen) {
    themeDropdownMenu.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
    themeDropdownMenu.classList.add('opacity-100', 'pointer-events-auto', 'scale-100', 'flex');
    themeSelectorArrow.classList.add('rotate-180');
  } else {
    themeDropdownMenu.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    themeDropdownMenu.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
    setTimeout(() => themeDropdownMenu.classList.remove('flex'), 200);
    themeSelectorArrow.classList.remove('rotate-180');
  }
}

themeSelectorBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown();
});

document.addEventListener('click', (e) => {
  if (isDropdownOpen && !customThemeSelector.contains(e.target)) {
    toggleDropdown();
  }
});

themeOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    const newTheme = e.target.dataset.value;
    themeSelectorLabel.textContent = e.target.textContent;
    localStorage.setItem('appTheme', newTheme);
    applyTheme(newTheme);
    toggleDropdown();
  });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('appTheme') === 'system' || !localStorage.getItem('appTheme')) {
    applyTheme('system');
  }
});

// App Startup
initTable();
// Initialize Auth State Listener
firebaseAuth.getRedirectResult().catch(err => {
  console.error("Mobile redirect error:", err);
  alert("Login Error: " + err.message);
});

firebaseAuth.onAuthStateChanged(user => {
  if (authLoadingOverlay) authLoadingOverlay.classList.add('opacity-0', 'pointer-events-none');
  
  if (user) {
    currentUser = user;
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('flex');
    if (userName) userName.textContent = user.displayName ? user.displayName.split(' ')[0] : 'User';
    if (userAvatar) userAvatar.src = user.photoURL || '';
    
    // Load User Data
    subscribeToData();
  } else {
    currentUser = null;
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('flex');
    
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    
    // Clear data and show empty state
    appData = { bats: {}, lastEdited: null };
    renderTabs();
    populateTable();
    setStatus('Offline (Logged Out)', 'bg-yellow-400');
  }
});

// --- Audio Recorder Logic ---
window.isListening = false; // Expose to global for lock check
let audioContext;
let analyser;
let microphone;
let knockDebounceTimer = 0;

function getPartialCount(portion) {
  const currentBat = appData.lastEdited;
  if (!appData.bats[currentBat]) appData.bats[currentBat] = {};
  return appData.bats[currentBat][portion + '_partial'] || 0;
}

function setPartialCount(portion, count) {
  const currentBat = appData.lastEdited;
  if (!appData.bats[currentBat]) appData.bats[currentBat] = {};
  appData.bats[currentBat][portion + '_partial'] = count;
}

function updateLiveCountDisplay() {
  const checkedRadio = document.querySelector('input[name="targetPortion"]:checked');
  if (checkedRadio) {
    liveKnockCountEl.value = getPartialCount(checkedRadio.value);
  }
}

// Listen for radio button changes to update display
document.addEventListener('change', e => {
  if (e.target.classList.contains('target-radio') && window.isListening) {
    updateLiveCountDisplay();
  }
});

// Manual edit of live count
liveKnockCountEl.addEventListener('input', (e) => {
  const checkedRadio = document.querySelector('input[name="targetPortion"]:checked');
  if (checkedRadio) {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    setPartialCount(checkedRadio.value, val);
    updateHeatmap();
    triggerSave();
  }
});

async function startListening() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 512;
    microphone.connect(analyser);
    
    updateLiveCountDisplay();
    liveKnockCountEl.classList.remove('hidden');

    window.isListening = true;
    micToggleBtn.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">stop_circle</span>
        <span id="micToggleText">Stop Listening</span>
    `;
    
    detectKnock();
  } catch (err) {
    console.error('Error accessing microphone:', err);
    alert('Microphone access is required for auto knock detection.');
  }
}

function stopListening() {
  window.isListening = false;
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  micToggleBtn.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">sports_cricket</span>
      <span id="micToggleText">Record Knock</span>
  `;
  liveKnockCountEl.classList.add('hidden');
}

micToggleBtn.addEventListener('click', () => {
  if (window.isListening) {
    stopListening();
  } else {
    startListening();
  }
});

function detectKnock() {
  if (!window.isListening) return;

  const dataArray = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(dataArray);

  let maxAmplitude = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const amplitude = Math.abs(dataArray[i] - 128);
    if (amplitude > maxAmplitude) {
      maxAmplitude = amplitude;
    }
  }

  // Calculate threshold based on sensitivity (1-100)
  // Higher sensitivity = lower threshold
  const sensitivityValue = parseInt(micSensitivity.value, 10);
  const threshold = Math.max(10, 128 - (sensitivityValue * 1.2)); 

  const now = Date.now();
  if (maxAmplitude > threshold && (now - knockDebounceTimer > 300)) {
    // Knock detected!
    knockDebounceTimer = now;
    registerKnock();
  }

  requestAnimationFrame(detectKnock);
}

function registerKnock() {
  const checkedRadio = document.querySelector('input[name="targetPortion"]:checked');
  if (!checkedRadio) return;
  
  const targetPortion = checkedRadio.value;
  const row = document.querySelector(`tr[data-portion="${targetPortion}"]`);
  if (!row) return;
  
  let currentPartial = getPartialCount(targetPortion);
  currentPartial++;
  setPartialCount(targetPortion, currentPartial);
  
  liveKnockCountEl.value = currentPartial;

  // Flash the row for visual feedback on every single knock
  row.classList.add('knock-flash');
  setTimeout(() => {
    row.classList.remove('knock-flash');
  }, 500);
  
  if (currentPartial >= 1000) {
    const input = row.querySelector('.counter-input');
    if (input) {
      const oldVal = Number(input.value);
      input.value = oldVal + 1;
      updateTotals();
      if (Number(input.value) !== oldVal) checkMuscles(input);
    }
    setPartialCount(targetPortion, 0);
    liveKnockCountEl.value = 0;
    
    // Auto-switch logic
    if (autoSwitchToggle.checked) {
      const currentIndex = portions.indexOf(targetPortion);
      let nextIndex = currentIndex + 1;
      if (nextIndex >= portions.length) nextIndex = 0;
      
      const nextPortion = portions[nextIndex];
      const nextRadio = document.querySelector(`input[name="targetPortion"][value="${nextPortion}"]`);
      if (nextRadio) {
        nextRadio.checked = true;
        updateLiveCountDisplay();
      }
    }
  }
  
  updateHeatmap();
  triggerSave(); // Save partial counts and totals
}

let batBeingEdited = null;

function openEditBatModal(batName) {
  batBeingEdited = batName;
  const batData = appData.bats[batName] || {};
  editBatNameInput.value = batName;
  if (batData._weightInGrams) {
    if (weightUnit === 'lbs') {
      editBatWeightInput.value = (batData._weightInGrams / 453.592).toFixed(2);
    } else {
      editBatWeightInput.value = Math.round(batData._weightInGrams);
    }
  } else {
    editBatWeightInput.value = '';
  }
  
  editBatModal.classList.remove('opacity-0', 'pointer-events-none');
  editBatModalContent.classList.remove('scale-90');
  editBatModalContent.classList.add('scale-100');
  setTimeout(() => editBatNameInput.focus(), 100);
}

function closeEditBatModal() {
  editBatModal.classList.add('opacity-0', 'pointer-events-none');
  editBatModalContent.classList.remove('scale-100');
  editBatModalContent.classList.add('scale-90');
  batBeingEdited = null;
}

cancelEditBatBtn.addEventListener('click', closeEditBatModal);

confirmEditBatBtn.addEventListener('click', () => {
  if (!batBeingEdited) return;
  
  const newName = editBatNameInput.value.trim();
  const weightVal = parseFloat(editBatWeightInput.value);
  
  if (!newName) {
    alert("Please enter a bat name.");
    return;
  }
  
  if (newName.length > 10) {
    alert("Bat name cannot exceed 10 characters.");
    return;
  }
  
  if (!/^[a-zA-Z0-9 ]+$/.test(newName)) {
    alert("Bat name can only contain letters, numbers, and spaces.");
    return;
  }
  
  if (newName !== batBeingEdited && appData.bats[newName]) {
    alert("A bat with this name already exists.");
    return;
  }
  
  // If name changed, move the data
  if (newName !== batBeingEdited) {
    appData.bats[newName] = appData.bats[batBeingEdited];
    delete appData.bats[batBeingEdited];
    
    if (appData.lockedBats && appData.lockedBats[batBeingEdited]) {
      appData.lockedBats[newName] = appData.lockedBats[batBeingEdited];
      delete appData.lockedBats[batBeingEdited];
    }

    if (appData.lastEdited === batBeingEdited) {
      appData.lastEdited = newName;
    }
  }
  
  // Update weight
  if (!isNaN(weightVal)) {
    appData.bats[newName]._weightInGrams = weightUnit === 'lbs' ? weightVal * 453.592 : weightVal;
  } else {
    delete appData.bats[newName]._weightInGrams;
  }
  
  renderTabs();
  populateTable();
  triggerSave();
  closeEditBatModal();
});
