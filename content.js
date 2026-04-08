// TTD Auto Fill Pro - Content Script
// Robust filling logic for TTD booking portal

(function() {
  console.log('TTD Auto Fill Pro: Content script loaded');

  // Listen for messages from the popup
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TTD_AUTOFILL_START') {
      startAutoFill(event.data.pilgrims);
    }
  });

  // Global flag to prevent multiple fills on the same form
  let lastFilledFormHash = '';

  // Listen for messages from background/popup via chrome.runtime
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TTD_SHOW_FAB') {
      const fab = document.getElementById('ttd-autofill-fab');
      if (fab) {
        fab.style.display = 'block';
        showToast('Floating button enabled!', 'info');
      } else {
        injectFloatingButton(true); // Force show
      }
    }

    if (message.type === 'TTD_TOGGLE_DARK_MODE') {
      toggleDarkMode(message.enabled);
    }
  });

  // Initialize Dark Mode on load
  chrome.storage.local.get(['ttdDarkMode'], (result) => {
    if (result.ttdDarkMode) {
      toggleDarkMode(true);
    }
  });

  function toggleDarkMode(enabled) {
    const styleId = 'ttd-autofill-dark-mode';
    let styleEl = document.getElementById(styleId);

    if (enabled) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          /* TTD Dark Mode Styles */
          html, body { background-color: #121212 !important; color: #e0e0e0 !important; }
          .mat-card, .card, .mat-dialog-container, .modal-content { 
            background-color: #1e1e1e !important; 
            color: #e0e0e0 !important; 
            border: 1px solid #333 !important;
          }
          .mat-form-field-label, label, .text-muted, .text-gray-600 { color: #aaa !important; }
          input, select, textarea, .mat-input-element { 
            background-color: #2d2d2d !important; 
            color: #fff !important; 
            border-color: #444 !important;
          }
          .mat-select-value, .mat-select-arrow { color: #fff !important; }
          .mat-calendar { background-color: #1e1e1e !important; color: #fff !important; }
          .mat-calendar-body-cell-content { color: #fff !important; }
          .mat-calendar-body-disabled .mat-calendar-body-cell-content { color: #444 !important; }
          .mat-calendar-body-selected { background-color: #ff9800 !important; color: #000 !important; }
          .btn-primary, button[color="primary"], .mat-raised-button.mat-primary { 
            background-color: #f57c00 !important; 
            color: #fff !important; 
          }
          .header, .footer, nav { background-color: #1a1a1a !important; border-bottom: 1px solid #333 !important; }
          a { color: #64b5f6 !important; }
          /* Fix for white backgrounds in tables */
          table, th, td { background-color: #1e1e1e !important; color: #e0e0e0 !important; border-color: #333 !important; }
          /* Scrollbar */
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-track { background: #121212; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 5px; }
          ::-webkit-scrollbar-thumb:hover { background: #444; }
        `;
        document.head.appendChild(styleEl);
      }
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }

  // Suggestion #1: MutationObserver for Instant Auto-Fill
  const observer = new MutationObserver((mutations) => {
    // Check if we are on a relevant page
    const isTTDPage = window.location.href.includes('ttdevasthanams.ap.gov.in') || 
                      window.location.href.includes('tirupatibalaji.ap.gov.in');
    if (!isTTDPage) return;

    // Intelligent form detection
    // TTD uses Angular/Material, so we look for specific structural markers
    const formMarkers = [
      'form[formgroupname*="pilgrim"]',
      '.pilgrim-details-container',
      '.pilgrim-info-card',
      'mat-card.pilgrim-card',
      '#pilgrimDetails',
      'input[formcontrolname="name"]' // Very specific Angular control name
    ];

    // Find the first matching container
    let formContainer = null;
    for (const marker of formMarkers) {
      const el = document.querySelector(marker);
      if (el && el.offsetParent !== null) { // Ensure it's visible
        formContainer = el;
        break;
      }
    }
    
    if (formContainer) {
      // Create a more stable hash based on the specific form container's structure
      // This prevents re-filling if only unrelated parts of the page change
      const inputCount = formContainer.querySelectorAll('input, mat-select, select').length;
      const containerId = formContainer.id || formContainer.className;
      const currentFormHash = `${containerId}-${inputCount}`;

      if (currentFormHash !== lastFilledFormHash) {
        chrome.storage.local.get(['instantFill', 'pilgrims'], (result) => {
          if (result.instantFill && result.pilgrims && result.pilgrims.length > 0) {
            console.log('TTD Auto Fill Pro: Intelligent form detection triggered for:', currentFormHash);
            lastFilledFormHash = currentFormHash;
            startAutoFill(result.pilgrims);
          }
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Inject Floating Action Button (FAB)
  function injectFloatingButton(forceShow = false) {
    const fabId = 'ttd-autofill-fab';
    if (document.getElementById(fabId)) {
      if (forceShow) document.getElementById(fabId).style.display = 'block';
      return;
    }

    const fab = document.createElement('div');
    fab.id = fabId;
    fab.style.display = forceShow ? 'block' : 'none'; // Hidden by default
    fab.innerHTML = `
      <div class="ttd-fab-container">
        <button class="ttd-fab-main" title="TTD AutoFill Pro">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
        </button>
        <div class="ttd-fab-label">AutoFill Now</div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #ttd-autofill-fab {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .ttd-fab-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .ttd-fab-main {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #ea580c; /* orange-600 */
        color: white;
        border: none;
        box-shadow: 0 10px 25px rgba(234, 88, 12, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
      }
      .ttd-fab-main:hover {
        transform: scale(1.1) rotate(5deg);
        background: #c2410c; /* orange-700 */
        box-shadow: 0 15px 30px rgba(234, 88, 12, 0.5);
      }
      .ttd-fab-main:active {
        transform: scale(0.95);
      }
      .ttd-fab-label {
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
      }
      .ttd-fab-container:hover .ttd-fab-label {
        opacity: 1;
        transform: translateY(0);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(fab);

    fab.querySelector('.ttd-fab-main').addEventListener('click', async () => {
      // Fetch pilgrims from storage directly
      chrome.storage.local.get(['pilgrims'], (result) => {
        const pilgrims = result.pilgrims || [];
        if (pilgrims.length === 0) {
          showToast('No pilgrim profiles found! Add them in the extension popup.', 'error');
        } else {
          startAutoFill(pilgrims);
        }
      });
    });
  }

  // Run injection
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    injectFloatingButton();
  } else {
    window.addEventListener('DOMContentLoaded', injectFloatingButton);
  }

  async function startAutoFill(pilgrims) {
    console.log('TTD Auto Fill Pro: Starting autofill for', pilgrims.length, 'pilgrims');
    
    showToast('Starting AutoFill...', 'info');

    try {
      let filledCount = 0;
      for (let i = 0; i < pilgrims.length; i++) {
        const pilgrim = pilgrims[i];
        console.log(`Filling pilgrim ${i + 1}: ${pilgrim.name}`);

        // 1. Check if we need to click "Add Pilgrim"
        if (i > 0) {
          const rowAdded = await ensurePilgrimRowExists(i);
          if (!rowAdded && i > 0) {
            throw new Error(`Could not add row for pilgrim #${i + 1}. Please check if the "Add Pilgrim" button is visible.`);
          }
        }

        // 2. Fill the fields for this row
        const success = await fillPilgrimRow(i, pilgrim);
        if (success) {
          filledCount++;
        } else {
          console.warn(`Partial fill for pilgrim #${i + 1}`);
        }
        
        // Small delay between pilgrims to ensure stability
        await sleep(300);
      }

      if (filledCount === 0) {
        throw new Error('Could not find any form fields to fill. Are you on the correct TTD booking page?');
      }

      showToast(`Successfully filled details for ${filledCount} pilgrims!`, 'success');

      // Suggestion #3: Auto-Continue
      chrome.storage.local.get(['autoContinue'], async (result) => {
        if (result.autoContinue) {
          await sleep(800); // Wait a bit longer for all events to settle
          const continueBtn = findButtonByText('Continue') || 
                              findButtonByText('Next') || 
                              document.querySelector('button[type="submit"]') ||
                              document.querySelector('.btn-continue');
          
          if (continueBtn) {
            console.log('TTD Auto Fill Pro: Auto-continuing...');
            continueBtn.click();
          } else {
            console.warn('TTD Auto Fill Pro: Auto-continue enabled but button not found.');
          }
        }
      });
    } catch (error) {
      console.error('TTD Auto Fill Pro Error:', error);
      const userMessage = error.message.includes('TTD Auto Fill Pro') ? error.message : `AutoFill failed: ${error.message}`;
      showToast(userMessage, 'error');
    }
  }

  async function ensurePilgrimRowExists(index) {
    // Selectors for "Add Pilgrim" button
    const addBtnSelectors = [
      'button:contains("Add")',
      'button:contains("Add Pilgrim")',
      '.add-pilgrim-btn',
      'button[aria-label*="Add"]',
      '#addPilgrim'
    ];

    let addBtn = findElementByText('button', 'Add');
    
    if (addBtn) {
      const existingInputs = document.querySelectorAll(`input[name*="name"], input[id*="name"], input[placeholder*="Name"]`);
      if (existingInputs.length <= index) {
        addBtn.click();
        await sleep(800); // Wait for DOM update
        return true;
      }
      return true; // Row already exists
    }
    return false; // Button not found
  }

  async function fillPilgrimRow(index, pilgrim) {
    let fieldsFilled = 0;
    const rows = document.querySelectorAll('.pilgrim-row, .pilgrim-details, mat-card, .card');
    let container = rows[index] || document;

    // Selectors for fields
    const fieldSelectors = {
      name: [
        'input[aria-label*="Name"]',
        'input[placeholder*="Name"]',
        'input[formcontrolname*="name"]',
        'input[name*="name"]',
        'input[id*="name"]',
        'input[data-placeholder*="Name"]'
      ],
      age: [
        'input[aria-label*="Age"]',
        'input[placeholder*="Age"]',
        'input[formcontrolname*="age"]',
        'input[name*="age"]',
        'input[id*="age"]',
        'input[data-placeholder*="Age"]'
      ],
      gender: [
        'mat-select[aria-label*="Gender"]',
        'mat-select[formcontrolname*="gender"]',
        'mat-select[placeholder*="Gender"]',
        'mat-select[id*="gender"]',
        'select[aria-label*="Gender"]',
        'select[name*="gender"]',
        'select[formcontrolname*="gender"]',
        'select[id*="gender"]'
      ],
      idProof: [
        'mat-select[aria-label*="ID Proof"]',
        'mat-select[aria-label*="Photo ID Proof"]',
        'mat-select[formcontrolname*="idProof"]',
        'mat-select[formcontrolname*="idProofType"]',
        'mat-select[formcontrolname*="photoIdProof"]',
        'mat-select[placeholder*="ID Proof"]',
        'mat-select[placeholder*="Photo ID Proof"]',
        'mat-select[id*="idProof"]',
        'mat-select[id*="photoIdProof"]',
        'select[aria-label*="ID Proof"]',
        'select[aria-label*="Photo ID Proof"]',
        'select[name*="idProof"]',
        'select[formcontrolname*="idProof"]',
        'select[id*="idProof"]',
        'select[placeholder*="ID Proof"]'
      ],
      idNumber: [
        'input[aria-label*="ID Number"]',
        'input[placeholder*="ID Number"]',
        'input[formcontrolname*="idNumber"]',
        'input[name*="idNumber"]',
        'input[id*="idNumber"]',
        'input[placeholder*="Number"]',
        'input[data-placeholder*="ID Number"]'
      ]
    };

    // Helper to fill a field
    const fillField = async (type, value) => {
      const selectors = fieldSelectors[type];
      let element = null;

      // Try multiple strategies to find the element
      const findElement = () => {
        // Strategy 1: Search within the row container
        if (container !== document) {
          for (const sel of selectors) {
            try {
              element = container.querySelector(sel);
              if (element) return element;
            } catch (e) {}
          }
        }

        // Strategy 2: Search by label text within the container
        if (container !== document) {
          element = findElementByLabelText(container, type);
          if (element) return element;
        }

        // Strategy 3: Search globally and pick the N-th one
        for (const sel of selectors) {
          try {
            const all = document.querySelectorAll(sel);
            if (all[index]) return all[index];
          } catch (e) {}
        }

        // Strategy 4: Global label search
        const allLabels = findElementsByLabelText(document, type);
        if (allLabels[index]) return allLabels[index];

        return null;
      };

      element = findElement();

      if (element) {
        if (element.tagName === 'SELECT' || element.tagName === 'MAT-SELECT' || element.getAttribute('role') === 'combobox' || element.classList.contains('mat-select')) {
          await selectOption(element, value);
        } else {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('blur', { bubbles: true }));
          const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true });
          element.dispatchEvent(inputEvent);
        }
        fieldsFilled++;
        return true;
      }
      return false;
    };

    await fillField('name', pilgrim.name);
    await fillField('age', pilgrim.age);
    await fillField('gender', pilgrim.gender);
    await fillField('idProof', pilgrim.idProofType);
    await sleep(300); // Small delay after ID proof selection
    await fillField('idNumber', pilgrim.idNumber);

    return fieldsFilled > 0;
  }

  // --- Helpers ---

  async function selectOption(element, value) {
    console.log(`TTD Auto Fill Pro: Selecting option "${value}" for`, element);
    
    // Standard Select
    if (element.tagName === 'SELECT') {
      const options = Array.from(element.options);
      const option = options.find(o => 
        o.text.toLowerCase().trim().includes(value.toLowerCase().trim()) || 
        o.value.toLowerCase().trim().includes(value.toLowerCase().trim())
      );
      if (option) {
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } 
    // Material Select or Role Combobox (Common in TTD)
    else if (element.tagName === 'MAT-SELECT' || element.getAttribute('role') === 'combobox' || element.classList.contains('mat-select')) {
      // Check if already selected (avoid redundant clicks)
      const currentVal = element.textContent.toLowerCase().trim();
      if (currentVal.includes(value.toLowerCase().trim())) {
        console.log('TTD Auto Fill Pro: Option already selected');
        return;
      }

      // Click to open the dropdown - try multiple targets
      const trigger = element.querySelector('.mat-select-trigger') || element;
      trigger.click();
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Wait for dropdown animation and overlay to appear
      // We'll retry finding the options a few times
      let found = false;
      const normalizedValue = value.toLowerCase().trim();
      
      // Special mapping for common TTD values
      const valueMap = {
        'aadhaar card': ['aadhaar', 'adhar', 'aadhar', 'card'],
        'voter id': ['voter'],
        'driving license': ['driving', 'dl'],
        'pan card': ['pan'],
        'male': ['male', 'm'],
        'female': ['female', 'f'],
        'other': ['other', 'o']
      };

      const searchTerms = [normalizedValue, ...(valueMap[normalizedValue] || [])];

      for (let attempt = 0; attempt < 5; attempt++) {
        await sleep(200); 
        
        const optionSelectors = [
          'mat-option',
          '.mat-option',
          '[role="option"]',
          '.mat-select-panel mat-option',
          '.cdk-overlay-container mat-option'
        ];

        for (const sel of optionSelectors) {
          const options = document.querySelectorAll(sel);
          if (options.length === 0) continue;

          for (const opt of options) {
            const optText = opt.textContent.toLowerCase().trim();
            // Exact match or smart inclusion
            if (searchTerms.some(term => optText === term || optText.includes(term))) {
              console.log('TTD Auto Fill Pro: Found matching option:', opt.textContent);
              opt.click();
              // Trigger change detection for Angular
              element.dispatchEvent(new Event('change', { bubbles: true }));
              element.dispatchEvent(new Event('input', { bubbles: true }));
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }

      if (!found) {
        console.warn(`TTD Auto Fill Pro: Could not find option matching "${value}" after multiple attempts`);
        // Close the dropdown if not found by clicking backdrop
        const backdrop = document.querySelector('.cdk-overlay-backdrop');
        if (backdrop) backdrop.click();
      }
    }
  }

  function findElementByLabelText(root, type) {
    const labels = root.querySelectorAll('label, .label, span, mat-label, .mat-form-field-label');
    const keywords = {
      name: ['name', 'full name', 'pilgrim name'],
      age: ['age'],
      gender: ['gender', 'sex'],
      idProof: ['id proof', 'proof type', 'identity', 'photo id proof'],
      idNumber: ['id number', 'proof number', 'identity number', 'photo id number']
    };

    const targetKeywords = keywords[type];
    for (const label of labels) {
      const text = label.textContent.toLowerCase().trim();
      if (targetKeywords.some(k => text === k || text.includes(k))) {
        // Strategy 1: Associated via 'for'
        const forId = label.getAttribute('for');
        if (forId) {
          const input = document.getElementById(forId);
          if (input) return input;
        }

        // Strategy 2: Search within the same mat-form-field
        const formField = label.closest('mat-form-field, .mat-form-field, .form-group');
        if (formField) {
          const input = formField.querySelector('input, select, mat-select, [role="combobox"]');
          if (input) return input;
        }

        // Strategy 3: Next sibling or parent's child
        const next = label.nextElementSibling;
        if (next && (next.tagName === 'INPUT' || next.tagName === 'SELECT' || next.tagName === 'MAT-SELECT' || next.getAttribute('role') === 'combobox')) {
          return next;
        }
        const input = label.parentElement.querySelector('input, select, mat-select, [role="combobox"]');
        if (input && input !== label) return input;
      }
    }
    return null;
  }

  function findElementsByLabelText(root, type) {
    const results = [];
    const labels = root.querySelectorAll('label, .label, span, mat-label');
    const keywords = {
      name: ['name', 'full name', 'pilgrim name'],
      age: ['age'],
      gender: ['gender', 'sex'],
      idProof: ['id proof', 'proof type', 'identity', 'photo id proof'],
      idNumber: ['id number', 'proof number', 'identity number', 'photo id number']
    };

    const targetKeywords = keywords[type];
    for (const label of labels) {
      const text = label.textContent.toLowerCase().trim();
      if (targetKeywords.some(k => text === k || text.includes(k))) {
        const forId = label.getAttribute('for');
        if (forId) {
          const input = document.getElementById(forId);
          if (input) results.push(input);
        } else {
          const input = label.parentElement.querySelector('input, select, mat-select');
          if (input && input !== label) results.push(input);
        }
      }
    }
    return results;
  }

  function findButtonByText(text) {
    const buttons = document.querySelectorAll('button, .btn, a.btn');
    for (const btn of buttons) {
      if (btn.textContent.toLowerCase().includes(text.toLowerCase())) {
        return btn;
      }
    }
    return null;
  }

  function findElementByText(tag, text) {
    const elements = document.getElementsByTagName(tag);
    for (const el of elements) {
      if (el.textContent.includes(text)) return el;
    }
    return null;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function showToast(message, type = 'info') {
    const id = 'ttd-autofill-toast';
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 999999;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: sans-serif;
      `;
      document.body.appendChild(toast);
    }

    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      error: '#ef4444'
    };

    toast.style.backgroundColor = colors[type];
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
    }, 3000);
  }

})();
