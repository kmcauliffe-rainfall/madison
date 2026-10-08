// TailorFlow Popup Logic

let extractedMedia = [];
let sourceUrl = '';
let rawCaption = '';

const statusBanner = document.getElementById('status-banner');
const mediaGrid = document.getElementById('media-grid');
const mediaCountEl = document.getElementById('media-count');
const btnExtract = document.getElementById('btn-extract');
const btnSaveDraft = document.getElementById('btn-save-draft');
const btnCopyCaption = document.getElementById('btn-copy-caption');

const selectClient = document.getElementById('select-client');
const inputCustomClient = document.getElementById('input-custom-client');
const inputLookType = document.getElementById('input-look-type');
const inputCollaborator = document.getElementById('input-collaborator');
const chkFullbody = document.getElementById('chk-fullbody');
const chkReel = document.getElementById('chk-reel');

const creditStylist = document.getElementById('credit-stylist');
const creditAssistants = document.getElementById('credit-assistants');
const creditHair = document.getElementById('credit-hair');
const creditMakeup = document.getElementById('credit-makeup');
const creditNails = document.getElementById('credit-nails');
const creditPhoto = document.getElementById('credit-photo');

// Handle custom client toggle
selectClient.addEventListener('change', () => {
  if (selectClient.value === 'custom') {
    inputCustomClient.style.display = 'block';
    inputCustomClient.focus();
  } else {
    inputCustomClient.style.display = 'none';
  }
});

function showStatus(msg, type = 'success') {
  statusBanner.textContent = msg;
  statusBanner.className = `status-banner status-${type}`;
  statusBanner.style.display = 'block';
  setTimeout(() => {
    statusBanner.style.display = 'none';
  }, 4000);
}

// Extract media and credits from active tab
btnExtract.addEventListener('click', async () => {
  btnExtract.disabled = true;
  btnExtract.textContent = '⏳ Extracting...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showStatus('No active browser tab found.', 'error');
      btnExtract.disabled = false;
      btnExtract.textContent = '🔍 Extract Media & Credits from Page';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_PAGE_DATA' }, (response) => {
      btnExtract.disabled = false;
      btnExtract.textContent = '🔍 Re-Extract from Page';

      if (chrome.runtime.lastError || !response || !response.data) {
        showStatus('Could not extract from this page. Ensure you are on an Instagram or Getty post.', 'error');
        return;
      }

      const { data } = response;
      sourceUrl = data.source_url;
      rawCaption = data.caption || '';
      extractedMedia = data.media || [];

      // Auto populate credits
      if (data.parsed_credits) {
        creditStylist.value = data.parsed_credits.stylist || '';
        creditAssistants.value = (data.parsed_credits.assistants || []).join(', ');
        creditHair.value = data.parsed_credits.hair || '';
        creditMakeup.value = data.parsed_credits.makeup || '';
        creditNails.value = data.parsed_credits.nails || '';
        creditPhoto.value = data.parsed_credits.photographer || '';
      }

      // Check if video present -> suggest reel
      if (extractedMedia.some(m => m.type === 'video')) {
        chkReel.checked = true;
      }

      renderMediaGrid();
      showStatus(`Extracted ${extractedMedia.length} asset(s) and credits!`);
    });
  } catch (err) {
    btnExtract.disabled = false;
    btnExtract.textContent = '🔍 Extract Media & Credits from Page';
    showStatus('Error communicating with page: ' + err.message, 'error');
  }
});

function renderMediaGrid() {
  mediaCountEl.textContent = extractedMedia.length;
  if (extractedMedia.length === 0) {
    mediaGrid.innerHTML = `
      <p style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 16px 0; font-size: 11px;">
        No media items found.
      </p>
    `;
    return;
  }

  mediaGrid.innerHTML = '';
  extractedMedia.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'media-item selected';
    div.dataset.index = index;

    if (item.type === 'video') {
      div.innerHTML = `
        <video src="${item.url}" muted></video>
        <span class="overlay-badge">🎥 Video</span>
      `;
    } else {
      div.innerHTML = `
        <img src="${item.url}" alt="Extracted look" />
        <span class="overlay-badge">📸 High-Res</span>
      `;
    }

    div.addEventListener('click', () => {
      div.classList.toggle('selected');
    });

    mediaGrid.appendChild(div);
  });
}

function getSelectedClient() {
  if (selectClient.value === 'custom') {
    return inputCustomClient.value.trim() || 'Custom Client';
  }
  return selectClient.value;
}

function buildCleanCaption() {
  const client = getSelectedClient();
  const lookType = inputLookType.value.trim();
  const header = lookType ? `${client} • ${lookType}` : client;

  const lines = [header, ''];
  lines.push('Tailoring: @flowerthief');
  if (creditStylist.value.trim()) lines.push(`Styling: ${creditStylist.value.trim()}`);
  if (creditAssistants.value.trim()) lines.push(`Assistants: ${creditAssistants.value.trim()}`);
  if (creditHair.value.trim()) lines.push(`Hair: ${creditHair.value.trim()}`);
  if (creditMakeup.value.trim()) lines.push(`Makeup: ${creditMakeup.value.trim()}`);
  if (creditNails.value.trim()) lines.push(`Nails: ${creditNails.value.trim()}`);
  if (creditPhoto.value.trim()) lines.push(`Photo: ${creditPhoto.value.trim()}`);

  return lines.join('\n');
}

btnCopyCaption.addEventListener('click', () => {
  const caption = buildCleanCaption();
  navigator.clipboard.writeText(caption).then(() => {
    showStatus('Clean caption copied to clipboard!');
  });
});

btnSaveDraft.addEventListener('click', async () => {
  btnSaveDraft.disabled = true;
  btnSaveDraft.textContent = 'Saving Draft...';

  // Selected media
  const selectedEls = mediaGrid.querySelectorAll('.media-item.selected');
  const selectedItems = Array.from(selectedEls).map(el => {
    const idx = parseInt(el.dataset.index);
    const m = { ...extractedMedia[idx] };
    m.is_full_body = chkFullbody.checked;
    return m;
  });

  const clientName = getSelectedClient();
  const lookType = inputLookType.value.trim();
  const caption = buildCleanCaption();

  const payload = {
    post_id: 'post_' + Date.now(),
    client_name: clientName,
    event_or_project: lookType || 'Editorial / Event',
    look_type: lookType,
    status: 'draft',
    media: selectedItems.length > 0 ? selectedItems : [
      {
        url: sourceUrl || 'https://instagram.com',
        type: 'image',
        is_full_body: chkFullbody.checked,
        source_url: sourceUrl
      }
    ],
    is_standalone_reel: chkReel.checked,
    caption: caption,
    collaborator_account: inputCollaborator.value.trim() || '@flowerthief',
    scheduled_time: null,
    credits: {
      tailoring: '@flowerthief',
      stylist: creditStylist.value.trim(),
      assistants: creditAssistants.value.trim().split(',').map(s => s.trim()).filter(Boolean),
      hair: creditHair.value.trim(),
      makeup: creditMakeup.value.trim(),
      nails: creditNails.value.trim(),
      photographer: creditPhoto.value.trim()
    },
    rate_billed: 20,
    created_at: new Date().toISOString()
  };

  try {
    // Attempt sending directly to Review Dashboard API (try port 3000 then 3001)
    let res;
    try {
      res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Port 3000 returned non-ok');
    } catch {
      res = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res && res.ok) {
      showStatus('Draft saved directly to Review Dashboard!');
    } else {
      // Store locally if dashboard is not reachable
      saveToLocalExtensionStorage(payload);
    }
  } catch (e) {
    // Fallback to chrome.storage
    saveToLocalExtensionStorage(payload);
  } finally {
    btnSaveDraft.disabled = false;
    btnSaveDraft.textContent = '🚀 Send to Review Dashboard';
  }
});

function saveToLocalExtensionStorage(payload) {
  chrome.storage.local.get({ staged_posts: [] }, (res) => {
    const list = res.staged_posts;
    list.unshift(payload);
    chrome.storage.local.set({ staged_posts: list }, () => {
      showStatus('Dashboard offline — saved to extension queue! Will sync when online.');
    });
  });
}
