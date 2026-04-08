// TTD Auto Fill Pro - Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  const pilgrimList = document.getElementById('pilgrim-list');
  const emptyState = document.getElementById('empty-state');
  const mainView = document.getElementById('main-view');
  const formView = document.getElementById('form-view');
  const pilgrimForm = document.getElementById('pilgrim-form');
  const addBtn = document.getElementById('add-pilgrim-btn');
  const backBtn = document.getElementById('back-btn');
  const fillBtn = document.getElementById('fill-btn');
  const toggleFabBtn = document.getElementById('toggle-fab-btn');
  const instantFillToggle = document.getElementById('instant-fill-toggle');
  const autoContinueToggle = document.getElementById('auto-continue-toggle');
  const liteModeToggle = document.getElementById('lite-mode-toggle');
  const ttdDarkModeToggle = document.getElementById('ttd-dark-mode-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');

  const clearAllBtn = document.getElementById('clear-all-btn');

  let pilgrims = [];

  // Initialize
  await loadPilgrims();
  initTheme();
  initToggles();

  // --- Theme Logic ---
  function initTheme() {
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
      }
    });
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    updateThemeIcons(isDark);
  });

  function updateThemeIcons(isDark) {
    document.getElementById('sun-icon').classList.toggle('hidden', !isDark);
    document.getElementById('moon-icon').classList.toggle('hidden', isDark);
  }

  // --- Toggle Logic ---
  function initToggles() {
    chrome.storage.local.get(['instantFill', 'autoContinue', 'liteMode', 'ttdDarkMode'], (result) => {
      instantFillToggle.checked = result.instantFill || false;
      autoContinueToggle.checked = result.autoContinue || false;
      liteModeToggle.checked = result.liteMode || false;
      ttdDarkModeToggle.checked = result.ttdDarkMode || false;
    });
  }

  instantFillToggle.addEventListener('change', () => {
    chrome.storage.local.set({ instantFill: instantFillToggle.checked });
  });

  autoContinueToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoContinue: autoContinueToggle.checked });
  });

  liteModeToggle.addEventListener('change', () => {
    const enabled = liteModeToggle.checked;
    chrome.storage.local.set({ liteMode: enabled });
    // Notify background script to update rules
    chrome.runtime.sendMessage({ type: 'TTD_UPDATE_LITE_MODE', enabled });
  });

  ttdDarkModeToggle.addEventListener('change', () => {
    const enabled = ttdDarkModeToggle.checked;
    chrome.storage.local.set({ ttdDarkMode: enabled });
    // Notify content script to apply dark mode
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TTD_TOGGLE_DARK_MODE', enabled });
      }
    });
  });

  // --- Data Logic ---
  async function loadPilgrims() {
    const result = await chrome.storage.local.get(['pilgrims']);
    pilgrims = result.pilgrims || [];
    renderPilgrims();
  }

  async function savePilgrims() {
    await chrome.storage.local.set({ pilgrims });
    renderPilgrims();
  }

  function renderPilgrims() {
    pilgrimList.innerHTML = '';
    if (pilgrims.length === 0) {
      emptyState.classList.remove('hidden');
      clearAllBtn.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      clearAllBtn.classList.remove('hidden');
      pilgrims.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'pilgrim-item';
        item.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs" style="width: 32px; height: 32px; border-radius: 50%; background: #ffedd5; color: #ea580c; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${index + 1}
            </div>
            <div style="min-width: 0; flex: 1;">
              <h3 class="font-bold text-sm truncate" style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${p.name}</h3>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold" style="margin: 0; font-size: 10px;">
                ${p.age} yrs • ${p.gender} • ${p.idProofType}
              </p>
            </div>
          </div>
          <div class="flex gap-1">
            <button class="edit-btn p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded-md transition-colors" data-id="${p.id}" style="background: transparent; border: none; padding: 6px; cursor: pointer;">
              <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button class="delete-btn p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-md transition-colors" data-id="${p.id}" style="background: transparent; border: none; padding: 6px; cursor: pointer;">
              <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        `;
        pilgrimList.appendChild(item);
      });
    }
  }

  // --- UI Actions ---
  addBtn.addEventListener('click', () => {
    showForm();
  });

  backBtn.addEventListener('click', () => {
    hideForm();
  });

  function showForm(pilgrim = null) {
    mainView.classList.add('hidden');
    formView.classList.remove('hidden');
    if (pilgrim) {
      document.getElementById('form-title').innerText = 'Edit Profile';
      document.getElementById('pilgrim-id').value = pilgrim.id;
      document.getElementById('name').value = pilgrim.name;
      document.getElementById('age').value = pilgrim.age;
      document.getElementById('gender').value = pilgrim.gender;
      document.getElementById('idProofType').value = pilgrim.idProofType;
      document.getElementById('idNumber').value = pilgrim.idNumber;
    } else {
      document.getElementById('form-title').innerText = 'Add Pilgrim';
      pilgrimForm.reset();
      document.getElementById('pilgrim-id').value = '';
    }
  }

  function hideForm() {
    formView.classList.add('hidden');
    mainView.classList.remove('hidden');
  }

  pilgrimForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pilgrim-id').value;
    const pilgrimData = {
      id: id || Date.now().toString(),
      name: document.getElementById('name').value,
      age: document.getElementById('age').value,
      gender: document.getElementById('gender').value,
      idProofType: document.getElementById('idProofType').value,
      idNumber: document.getElementById('idNumber').value
    };

    if (id) {
      const index = pilgrims.findIndex(p => p.id === id);
      pilgrims[index] = pilgrimData;
    } else {
      pilgrims.push(pilgrimData);
    }

    await savePilgrims();
    hideForm();
  });

  clearAllBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete ALL pilgrim profiles? This cannot be undone.')) {
      pilgrims = [];
      await savePilgrims();
    }
  });

  pilgrimList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      const id = editBtn.dataset.id;
      const pilgrim = pilgrims.find(p => p.id === id);
      showForm(pilgrim);
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const pilgrim = pilgrims.find(p => p.id === id);
      if (pilgrim && confirm(`Are you sure you want to delete the profile for "${pilgrim.name}"?`)) {
        pilgrims = pilgrims.filter(p => p.id !== id);
        savePilgrims();
      }
    }
  });

  // --- Fill Logic ---
  fillBtn.addEventListener('click', async () => {
    if (pilgrims.length === 0) {
      alert('Please add at least one pilgrim first!');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('ttdevasthanams.ap.gov.in') && !tab.url.includes('tirupatibalaji.ap.gov.in')) {
      alert('Please open the TTD Booking page first!');
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (data) => {
        window.postMessage({ type: 'TTD_AUTOFILL_START', pilgrims: data }, '*');
      },
      args: [pilgrims]
    });

    // Close popup after starting to let user see the action
    window.close();
  });

  toggleFabBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'TTD_SHOW_FAB' });
      window.close();
    }
  });

  // --- Export/Import ---
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(pilgrims, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ttd_pilgrims_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  });

  importBtn.addEventListener('click', () => importInput.click());

  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          pilgrims = [...pilgrims, ...imported];
          // Remove duplicates by ID or Name+IDNumber
          const unique = [];
          const seen = new Set();
          pilgrims.forEach(p => {
            const key = p.idNumber + p.name;
            if (!seen.has(key)) {
              unique.push(p);
              seen.add(key);
            }
          });
          pilgrims = unique;
          await savePilgrims();
          alert('Imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  });
});
