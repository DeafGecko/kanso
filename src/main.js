document.addEventListener('DOMContentLoaded', () => {
  // Kanso-scripts.js: Main JS logic for the minimalist writing app

  // DOM Elements
  const writingArea = document.getElementById('writing-area');
  const charCount = document.getElementById('char-count');
  const wordCount = document.getElementById('word-count');
  const limitCount = document.getElementById('limit-count');
  const limitDisplay = document.getElementById('limit-display');
  const themeButtons = document.querySelectorAll('.theme-btn');
  const limitToggle = document.getElementById('limit-toggle');
  const wordLimitInput = document.getElementById('word-limit-input');
  const statsPanel = document.querySelector('.stats-panel');
  const paragraphLimitInput = document.getElementById('paragraph-limit-input');
  const paragraphLimitToggle = document.getElementById('paragraph-limit-toggle');
  const paragraphLimitWarning = document.getElementById('paragraph-limit-warning');
  const paragraphLimitDisplay = document.getElementById('paragraph-limit-display');
  const paragraphCount = document.getElementById('paragraph-count');
  const pageLimitInput = document.getElementById('page-limit-input');
  const pageLimitToggle = document.getElementById('page-limit-toggle');
  const pageLimitWarning = document.getElementById('page-limit-warning');
  const pageLimitDisplay = document.getElementById('page-limit-display');
  const pageCount = document.getElementById('page-count');
  const saveBtn = document.getElementById('saveBtn');
  const openBtn = document.getElementById('openBtn');
  const newBtn = document.getElementById('newBtn');
  const fileInput = document.getElementById('file-input');
  const fontSelect = document.getElementById('font-select');
  const fontSizeSelect = document.getElementById('font-size-select');

  // Application State
  let wordLimit = 500;
  let isLimitEnabled = false;
  let paragraphLimit = 10;
  let isParagraphLimitEnabled = false;
  let pageLimit = 1;
  let isPageLimitEnabled = false;
  let currentFileName = 'untitled.txt';
  let currentFileHandle = null; // For future File System Access API
  let currentFont = 'georgia';
  // FONT SELECT: Change font on selection
  fontSelect.addEventListener('change', () => {
    const font = fontSelect.value;
    document.body.classList.remove('font-georgia', 'font-serif', 'font-sans', 'font-mono', 'font-writer', 'font-lora', 'font-openSans', 'font-playfair');
    document.body.classList.add(`font-${font}`);
    currentFont = font;
    saveData();
  });
  let isSaved = false;

  // DATA PERSISTENCE: Load/save settings and document to localStorage
  function loadData() {
    const saved = JSON.parse(localStorage.getItem('kanso')) || {};
    if (typeof saved.text === 'string') writingArea.value = saved.text;
    if (typeof saved.theme === 'string') {
      document.body.classList.remove('white', 'dark', 'coffee');
      document.body.classList.add(saved.theme);
      themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === saved.theme);
      });
    }
    if (typeof saved.font === 'string') {
      document.body.classList.remove('font-georgia', 'font-serif', 'font-sans', 'font-mono', 'font-writer', 'font-lora', 'font-openSans', 'font-playfair');
      document.body.classList.add(`font-${saved.font}`);
      currentFont = saved.font;
      fontSelect.value = saved.font;
    }
    if (typeof saved.limit === 'number' || typeof saved.limit === 'string') {
      wordLimit = Number(saved.limit) || 500;
      wordLimitInput.value = wordLimit;
    }
    if (saved.limitEnabled) {
      isLimitEnabled = true;
      limitToggle.classList.add('active');
      limitDisplay.classList.remove('hidden');
    } else {
      isLimitEnabled = false;
      limitToggle.classList.remove('active');
      limitDisplay.classList.add('hidden');
    }
    if (typeof saved.paragraphLimit === 'number' || typeof saved.paragraphLimit === 'string') {
      paragraphLimit = Number(saved.paragraphLimit) || 10;
      paragraphLimitInput.value = paragraphLimit;
    }
    if (saved.paragraphLimitEnabled) {
      isParagraphLimitEnabled = true;
      paragraphLimitToggle.classList.add('active');
      paragraphLimitDisplay.classList.remove('hidden');
    } else {
      isParagraphLimitEnabled = false;
      paragraphLimitToggle.classList.remove('active');
      paragraphLimitDisplay.classList.add('hidden');
    }
    if (typeof saved.pageLimit === 'number' || typeof saved.pageLimit === 'string') {
      pageLimit = Number(saved.pageLimit) || 1;
      pageLimitInput.value = pageLimit;
    }
    if (saved.pageLimitEnabled) {
      isPageLimitEnabled = true;
      pageLimitToggle.classList.add('active');
      pageLimitDisplay.classList.remove('hidden');
    } else {
      isPageLimitEnabled = false;
      pageLimitToggle.classList.remove('active');
      pageLimitDisplay.classList.add('hidden');
    }
    if (typeof saved.fileName === 'string') currentFileName = saved.fileName;
    updateStats();
  }

  function saveData(showNotification = false) {
    const data = {
      text: writingArea.value,
      theme: getTheme(),
      font: currentFont,
      limit: wordLimit,
      limitEnabled: isLimitEnabled,
      paragraphLimit: paragraphLimit,
      paragraphLimitEnabled: isParagraphLimitEnabled,
      pageLimit: pageLimit,
      pageLimitEnabled: isPageLimitEnabled,
      fileName: currentFileName,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('kanso', JSON.stringify(data));
    isSaved = true;
    if (showNotification) {
      const notif = document.getElementById('save-notification');
      if (notif) {
        notif.classList.remove('hidden');
        notif.classList.add('show');
        clearTimeout(notif._timeout);
        notif._timeout = setTimeout(() => {
          notif.classList.remove('show');
          notif.classList.add('hidden');
        }, 1500);
      }
    }
  }

  function getTheme() {
    if (document.body.classList.contains('white')) return 'white';
    if (document.body.classList.contains('dark')) return 'dark';
    if (document.body.classList.contains('coffee')) return 'coffee';
    return 'white';
  }

  // THEME BUTTONS: Add event listeners for theme switching
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      document.body.classList.remove('white', 'dark', 'coffee');
      document.body.classList.add(theme);
      themeButtons.forEach(b => b.classList.toggle('active', b === btn));
      saveData();
    });
  });

  // WORD LIMIT CONTROLS: Handles word, paragraph, and page limit toggles and inputs
  limitToggle.addEventListener('click', () => {
    isLimitEnabled = !isLimitEnabled;
    limitToggle.classList.toggle('active');
    updateStats();
    saveData();
  });

  wordLimitInput.addEventListener('input', () => {
    const value = parseInt(wordLimitInput.value);
    if (value > 0) {
      wordLimit = value;
      updateStats();
      saveData();
    }
  });

  // Paragraph limit controls
  paragraphLimitToggle.addEventListener('click', () => {
    isParagraphLimitEnabled = !isParagraphLimitEnabled;
    paragraphLimitToggle.classList.toggle('active');
    updateStats();
    saveData();
  });

  paragraphLimitInput.addEventListener('input', () => {
    const value = parseInt(paragraphLimitInput.value);
    if (value > 0) {
      paragraphLimit = value;
      updateStats();
      saveData();
    }
  });

  // Page limit controls
  pageLimitToggle.addEventListener('click', () => {
    isPageLimitEnabled = !isPageLimitEnabled;
    pageLimitToggle.classList.toggle('active');
    updateStats();
    saveData();
  });

  pageLimitInput.addEventListener('input', () => {
    const value = parseInt(pageLimitInput.value);
    if (value > 0) {
      pageLimit = value;
      updateStats();
      saveData();
    }
  });

  // FILE OPERATIONS: Save, open, and create new documents
  saveBtn.addEventListener('click', () => {
    const text = writingArea.value;
    // Try to use File System Access API if available and file was opened
    if (window.showSaveFilePicker && currentFileHandle) {
      (async () => {
        try {
          const writable = await currentFileHandle.createWritable();
          await writable.write(text);
          await writable.close();
          saveData(true); // Show notification
        } catch (err) {
          alert('Failed to save file: ' + err.message);
        }
      })();
    } else if (window.showSaveFilePicker && !currentFileHandle) {
      // Prompt user for file name/location using File System Access API
      (async () => {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: currentFileName,
            types: [{
              description: 'Text Files',
              accept: { 'text/plain': ['.txt', '.md'] }
            }]
          });
          currentFileHandle = handle;
          currentFileName = handle.name || currentFileName;
          const writable = await handle.createWritable();
          await writable.write(text);
          await writable.close();
          saveData(true); // Show notification
        } catch (err) {
          // User cancelled or error
        }
      })();
    } else {
      // Fallback: prompt for file name if not set
      let fileName = currentFileName;
      if (!fileName || fileName === 'untitled.txt') {
        fileName = prompt('Enter file name to save:', 'my-writing.txt') || 'my-writing.txt';
        currentFileName = fileName;
      }
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      saveData(true); // Show notification
    }
  });

  openBtn.addEventListener('click', () => {
    // Use File System Access API if available
    if (window.showOpenFilePicker) {
      (async () => {
        try {
          const [handle] = await window.showOpenFilePicker({
            types: [{
              description: 'Text Files',
              accept: { 'text/plain': ['.txt', '.md'] }
            }]
          });
          currentFileHandle = handle;
          const file = await handle.getFile();
          currentFileName = file.name;
          const text = await file.text();
          writingArea.value = text;
          updateStats();
          saveData();
        } catch (err) {
          // User cancelled or error
        }
      })();
    } else {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      currentFileName = file.name;
      currentFileHandle = null; // Not using File System Access API
      const reader = new FileReader();
      reader.onload = (event) => {
        writingArea.value = event.target.result;
        updateStats(); // This will immediately check and show warnings if over limit
        saveData();
        // Optionally, scroll to stats panel or visually highlight warning if over limit
        // (handled by updateStats logic and CSS)
      };
      reader.readAsText(file);
    }
    fileInput.value = '';
  });

  newBtn.addEventListener('click', () => {
    if (!isSaved && writingArea.value.trim() && !confirm('Start a new document? Unsaved changes will be lost.')) {
      return;
    }
    writingArea.value = '';
    currentFileName = 'untitled.txt';
    currentFileHandle = null;
    // Reset limits to defaults
    wordLimit = 500;
    isLimitEnabled = false;
    wordLimitInput.value = wordLimit;
    limitToggle.classList.remove('active');
    limitDisplay.style.display = 'none';
    paragraphLimit = 10;
    isParagraphLimitEnabled = false;
    paragraphLimitInput.value = paragraphLimit;
    paragraphLimitToggle.classList.remove('active');
    paragraphLimitDisplay.style.display = 'none';
    pageLimit = 1;
    isPageLimitEnabled = false;
    pageLimitInput.value = pageLimit;
    pageLimitToggle.classList.remove('active');
    pageLimitDisplay.style.display = 'none';
    updateStats();
    saveData();
    isSaved = false;
    writingArea.focus();
  });

  // WRITING AREA EVENTS: Listen for typing and auto-save
  writingArea.addEventListener('input', () => {
    updateStats();
    isSaved = false;
    saveData();
  });

  // AUTO-SAVE: Saves document every 30 seconds

  // BACKGROUND REFRESH: Update stats and save every 5 seconds (no notification)
  setInterval(() => {
    updateStats();
    saveData(false);
    // If using File System Access API and a file is open, save to file as well
    if (window.showSaveFilePicker && currentFileHandle) {
      (async () => {
        try {
          const writable = await currentFileHandle.createWritable();
          await writable.write(writingArea.value);
          await writable.close();
        } catch (err) {
          // Ignore errors (user may have revoked permission)
        }
      })();
    }
  }, 5000); // Every 5 seconds

  // HOVER TRIGGERS: Show panels on hover
  document.querySelector('.hover-trigger-bottom').addEventListener('mouseenter', () => {
    statsPanel.style.opacity = '1';
  });

  document.querySelector('.hover-trigger-right').addEventListener('mouseenter', () => {
    document.querySelector('.controls-panel').style.opacity = '1';
  });

  // KEYBOARD SHORTCUTS: Save, open, new document shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveBtn.click();
    }

    // Ctrl/Cmd + O to open
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      openBtn.click();
    }

    // Ctrl/Cmd + N for new document
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      newBtn.click();
    }
  });

  // --- STATS PANEL LOGIC ---
  function updateStats() {
    const text = writingArea.value;
    // Character count
    charCount.textContent = text.length;
    // Word count
    const words = text.trim().split(/\s+/).filter(Boolean);
    wordCount.textContent = words.length;
    // Paragraph count
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    if (paragraphCount) paragraphCount.textContent = paragraphs.length;
    // Page count (500 words per page)
    const pages = Math.max(1, Math.ceil(words.length / 500));
    if (pageCount) pageCount.textContent = pages;

    // Remove all warnings and red border first
    limitCount.classList.remove('warning');
    if (paragraphCount) paragraphCount.classList.remove('warning');
    if (pageCount) pageCount.classList.remove('warning');
    writingArea.classList.remove('over-limit');

    // Word limit
    let overWord = false;
    if (isLimitEnabled && wordLimit > 0) {
      limitCount.textContent = `${words.length} / ${wordLimit}`;
      limitDisplay.classList.remove('hidden');
      if (words.length > wordLimit) {
        limitCount.classList.add('warning');
        overWord = true;
      }
    } else {
      limitDisplay.classList.add('hidden');
    }

    // Paragraph limit
    let overPara = false;
    if (isParagraphLimitEnabled && paragraphLimit > 0) {
      paragraphLimitDisplay.classList.remove('hidden');
      if (paragraphCount) paragraphCount.textContent = paragraphs.length;
      if (paragraphs.length > paragraphLimit) {
        if (paragraphCount) paragraphCount.classList.add('warning');
        overPara = true;
      }
    } else {
      paragraphLimitDisplay.classList.add('hidden');
    }

    // Page limit
    let overPage = false;
    if (isPageLimitEnabled && pageLimit > 0) {
      pageLimitDisplay.classList.remove('hidden');
      if (pageCount) pageCount.textContent = pages;
      if (pages > pageLimit) {
        if (pageCount) pageCount.classList.add('warning');
        overPage = true;
      }
    } else {
      pageLimitDisplay.classList.add('hidden');
    }

    // Add red border if any limit is exceeded
    if (overWord || overPara || overPage) {
      writingArea.classList.add('over-limit');
    }
    // End of updateStats
  }

  // INITIALIZATION: Load settings and focus writing area
  loadData();
  writingArea.focus();
  updateStats();
});
