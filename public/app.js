
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const CART_SCHEMA_VERSION = 47;

const MATERIAL_DATA = {
  fdm: {
    title: 'FDM filament',
    maxSize: '325 × 320 × 325 mm',
    text: 'Goede keuze voor betaalbare functionele onderdelen, prototypes en behuizingen. FDM is sterk, snel en relatief voordelig.',
    colors: ['Wit', 'Zwart', 'Blauw'],
    materials: {
      fdm_pla: { label: 'PLA Basic', info: 'Standaard FDM materiaal voor nette, betaalbare prints.', specs: ['Makkelijk te printen', 'Net oppervlak', 'Betaalbaar', 'Minder hittebestendig'] },
      fdm_petg: { label: 'PETG Basic', info: 'Sterker en taaier dan PLA. Goede allround keuze.', specs: ['Taai', 'Goede chemische bestendigheid', 'Voor functionele delen'] },
      fdm_petg_cf: { label: 'PETG-CF', info: 'PETG met carbon fiber voor stijvere technische onderdelen.', specs: ['Stijver dan PETG', 'Mat technisch oppervlak', 'Duurder materiaal'] },
      fdm_tpu85: { label: 'TPU 85A', info: 'Zeer flexibel materiaal voor zachte rubbers, dempers en elastische onderdelen. Risicovoller en langzamer te printen.', specs: ['Zeer flexibel', 'Taai', 'Langzamer te printen'] },
      fdm_tpu90: { label: 'TPU 90A', info: 'Flexibel materiaal met iets meer stevigheid dan TPU 85A. Geschikt voor dempers, rubbers en elastische onderdelen.', specs: ['Flexibel', 'Steviger dan 85A', 'Langzamer te printen'] },
      fdm_abs: { label: 'ABS', info: 'Betaalbaar technisch materiaal voor sterke onderdelen.', specs: ['Sterk', 'Hogere hittebestendigheid', 'Kan kromtrekken'] },
      fdm_asa: { label: 'ASA', info: 'Technisch materiaal voor buitengebruik en sterkere onderdelen.', specs: ['UV-bestendig', 'Sterk', 'Meer hittebestendig'] },
      fdm_pc: { label: 'PC', info: 'Sterk technisch materiaal met goede hittebestendigheid.', specs: ['Hoge sterkte', 'Goede hittebestendigheid', 'Technisch materiaal'] }
    }
  },
  sla: {
    title: 'SLA resin',
    maxSize: '298 × 164 × 300 mm',
    text: 'Beste keuze voor miniaturen, figuren en zeer nette prints met veel detail en een glad oppervlak. Ideaal voor kleine nauwkeurige onderdelen.',
    colors: ['Grijs', 'Wit', 'Zwart'],
    materials: {
      sla_standard_v2: { label: 'Standard Resin V2', info: 'Allround resin voor miniaturen, details, prototypes en nette zichtdelen.', specs: ['Goede detailweergave', 'Glad oppervlak', 'Standaard keuze'] },
      sla_tough_2: { label: 'Tough Resin 2.0', info: 'Taaier dan standaard resin. Minder snel breuk bij stoten of buigen.', specs: ['Taaier', 'Meer flexibel', 'Voor functionele prototypes'] },
      sla_abs_pro_2: { label: 'ABS-Like Resin Pro 2', info: 'Sterkere ABS-like resin voor functionele prototypes en behuizingen.', specs: ['Sterker dan standaard', 'Goede maatvastheid', 'Functionele prototypes'] },
      sla_craftsman: { label: 'DLP Craftsman Resin', info: 'Voor miniaturen, fijne details, strak oppervlak en zichtmodellen.', specs: ['Zeer fijn detail', 'Glad oppervlak', 'Voor zichtwerk'] }
    }
  },
  sls: {
    title: 'SLS nylon',
    maxSize: '220 × 220 × 350 mm',
    text: 'Beste keuze voor sterke nylon onderdelen zonder supportsporen. Ideaal voor functionele onderdelen en kleine series.',
    colors: ['Zwart'],
    foodgradeColors: ['Wit', 'Blauw'],
    materials: {
      sls_pa12: { label: 'PA12 Nylon', info: 'Sterk, maatvast en goede allround keuze voor SLS.', specs: ['Sterk', 'Maatvast', 'Lage warping'] },
      sls_pa11: { label: 'PA11 Nylon', info: 'Taaier en slagvaster dan PA12.', specs: ['Taai', 'Slagvast', 'Goed voor clips en scharnieren'] }
    }
  }
};

function isStepFile(file) {
  return /\.step$/i.test(file?.name || '');
}

function isStlFile(file) {
  return /\.stl$/i.test(file?.name || '');
}

const form = document.getElementById('calcForm');
const fileInput = document.getElementById('fileInput') || document.getElementById('modelFile');
const dropzone = document.getElementById('dropzone') || document.querySelector('.dropzone');
const fileText = document.getElementById('fileText');
const resultBox = document.getElementById('resultBox');
const priceTitle = document.getElementById('priceTitle');
const viewer = document.getElementById('viewer');
const viewerZoomIn = document.getElementById('viewerZoomIn');
const viewerZoomOut = document.getElementById('viewerZoomOut');
const viewerReset = document.getElementById('viewerReset');




const technologySelect = document.getElementById('technology');
const techButtons = Array.from(document.querySelectorAll('.tech-card'));
const materialSelect = document.getElementById('material');
const colorSelect = document.getElementById('color');
const techInfo = document.getElementById('techInfo');
const materialInfo = document.getElementById('materialInfo');
const printerInfo = document.getElementById('printerInfo');
const foodgrade = document.getElementById('foodgrade');
const foodgradeWrap = document.getElementById('foodgradeWrap');
const foodgradeHelp = document.getElementById('foodgradeHelp');
const fdmSettingsWrap = document.getElementById('fdmSettingsWrap');
const infillWrap = document.getElementById('infillWrap');
const layerHeightWrap = document.getElementById('layerHeightWrap');
const layerHeightSelect = document.getElementById('layerHeight');
const layerHeightHelp = document.getElementById('layerHeightHelp');

const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems') || document.getElementById('cartList');
const cartCount = document.getElementById('cartCount');
const cartProductEx = document.getElementById('cartProductEx');
const cartShipping = document.getElementById('cartShipping');
const cartTotalEx = document.getElementById('cartTotalEx');
const cartTotalIn = document.getElementById('cartTotalIn');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutSection = document.getElementById('checkout');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutForm = document.getElementById('checkoutForm');
const orderResult = document.getElementById('orderResult');
const checkoutCountry = document.getElementById('checkoutCountry');
const guestCheckoutFields = document.getElementById('guestCheckoutFields');
const guestCompanyField = document.getElementById('guestCompanyField');
const orderSuccessPanel = document.getElementById('orderSuccessPanel');
const loggedInCheckoutNotice = document.getElementById('loggedInCheckoutNotice');
const loggedInCheckoutDetails = document.getElementById('loggedInCheckoutDetails');
const poNumber = document.getElementById('poNumber');

const accountBtn = document.getElementById('accountBtn');
const accountBtnText = document.getElementById('accountBtnText');
const accountOverlay = document.getElementById('accountOverlay');
const accountModal = document.getElementById('accountModal');
const closeAccountBtn = document.getElementById('closeAccountBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const accountResult = document.getElementById('accountResult');
const accountLoggedOut = document.getElementById('accountLoggedOut');
const accountLoggedIn = document.getElementById('accountLoggedIn');
const accountChoice = document.getElementById('accountChoice');
const accountChoiceName = document.getElementById('accountChoiceName');
const accountChoiceCompany = document.getElementById('accountChoiceCompany');
const logoutBtnChoice = document.getElementById('logoutBtnChoice');
const accountName = document.getElementById('accountName');
const accountCompany = document.getElementById('accountCompany');
const accountVat = document.getElementById('accountVat');
const accountProfileForm = document.getElementById('accountProfileForm');
const accountFirstName = document.getElementById('accountFirstName');
const accountLastName = document.getElementById('accountLastName');
const accountStreet = document.getElementById('accountStreet');
const accountHouseNumber = document.getElementById('accountHouseNumber');
const accountPostalCode = document.getElementById('accountPostalCode');
const accountCity = document.getElementById('accountCity');
const accountCountry = document.getElementById('accountCountry');
const loadAccountOrdersBtn = document.getElementById('loadAccountOrdersBtn');
const accountOrdersList = document.getElementById('accountOrdersList');
const accountOrderDetail = document.getElementById('accountOrderDetail');
const accountPasswordForm = document.getElementById('accountPasswordForm');


const logoutBtn = document.getElementById('logoutBtn');
const businessFields = document.getElementById('businessFields');
const checkoutCompanyName = document.getElementById('checkoutCompanyName');
const checkoutVatNumber = document.getElementById('checkoutVatNumber');
const invoicePaymentOption = document.getElementById('invoicePaymentOption');
const invoicePaymentNote = document.getElementById('invoicePaymentNote');
const checkoutPaymentMethod = document.getElementById('checkoutPaymentMethod');

const quickQuestionForm = document.getElementById('quickQuestionForm');
const quickQuestionResult = document.getElementById('quickQuestionResult');
const accessGate = document.getElementById('accessGate');
const accessCodeInput = document.getElementById('accessCodeInput');
const accessCodeBtn = document.getElementById('accessCodeBtn');
const accessCodeError = document.getElementById('accessCodeError');
const ACCESS_CODE = 'pro3d2026';






let scene, camera, renderer, controls, currentMesh;
let lastCalculation = null;
let selectedModelFile = null;
let calculationInProgress = false;
let calculationRequestId = 0;
let resultState = 'idle';
function translateNow() {
  if (window.pro3dTranslate) window.pro3dTranslate(localStorage.getItem('pro3d_lang') || 'nl');
}




function refreshLanguage() {
  if (window.pro3dTranslate) setTimeout(() => window.pro3dTranslate(localStorage.getItem('pro3d_lang') || 'nl'), 0);
}

let cart = loadCart();
saveCart();


function initAccessGate() {
  if (!accessGate) return;

  const url = new URL(window.location.href);
  const codeFromUrl = url.searchParams.get('code');
  const saved = localStorage.getItem('pro3d_access_ok') === '1';

  if (saved || (codeFromUrl || '').trim().toLowerCase() === ACCESS_CODE) {
    localStorage.setItem('pro3d_access_ok', '1');
    accessGate.classList.add('hidden');
    return;
  }

  accessGate.classList.remove('hidden');

  const tryOpen = () => {
    if ((accessCodeInput?.value || '').trim().toLowerCase() === ACCESS_CODE) {
      localStorage.setItem('pro3d_access_ok', '1');
      accessGate.classList.add('hidden');
      accessCodeError.textContent = '';
    } else {
      accessCodeError.textContent = 'Code klopt niet.';
    }
  };

  accessCodeBtn?.addEventListener('click', tryOpen);
  accessCodeInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') tryOpen();
  });
}


initAccessGate();
initViewer();

function showLoadedResultMessage() {
  resultState = 'loaded';
  priceTitle.textContent = 'STL geladen';
  resultBox.innerHTML = 'Klik op bereken prijs links om de automatische calculatie te starten.';
  refreshLanguage();
  refreshLanguage();
}



resetDefaults();
syncTechnologyCards();
updateTechnologyUI();
renderCart();
    if (getStoredAccount()) loadAccountOrders();
refreshLanguage();



function syncTechnologyCards() {
  const currentTech = technologySelect.value || 'fdm';
  
function jumpToCalculatorTechnology(tech) {
  if (!['fdm', 'sla', 'sls'].includes(tech)) return;

  try {
    technologySelect.value = tech;
    techButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tech === tech));
    updateTechnologyUI();
  } catch (err) {
    console.warn('Techniek selecteren mislukt:', err);
  }

  const target = document.getElementById('calculator');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.querySelectorAll('[data-jump-tech]').forEach(btn => {
  if (btn.dataset.pro3dJumpBound) return;
  btn.dataset.pro3dJumpBound = '1';
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    jumpToCalculatorTechnology(btn.dataset.jumpTech);
  });
});


techButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tech === currentTech);
  });
}

techButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    technologySelect.value = btn.dataset.tech;
    syncTechnologyCards();
    technologySelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

technologySelect.addEventListener('change', () => {
  syncTechnologyCards();
  updateTechnologyUI();
  translateNow();
  invalidateCalculation();
});
materialSelect.addEventListener('change', () => {
  updateMaterialInfo();
  translateNow();
  invalidateCalculation();
});
colorSelect.addEventListener('change', invalidateCalculation);
foodgrade.addEventListener('change', () => {
  updateColorOptions();
  translateNow();
  invalidateCalculation();
});
['quantity','infill','wallThickness','layerHeight','infillType'].forEach(name => {
  const el = form.elements[name];
  if (el) el.addEventListener('input', invalidateCalculation);
  if (el) el.addEventListener('change', invalidateCalculation);
});

if (fileInput) fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  selectedModelFile = file;

  if (!isStlFile(file) && !isStepFile(file)) {
    showError('Upload alleen een STL- of STEP-bestand.');
    return;
  }

  if (typeof clearViewer === 'function') clearViewer();
  fileText.textContent = file.name;
  lastCalculation = null;

  if (isStlFile(file)) {
    showLoadedResultMessage();
    previewStl(file);
  } else {
    resultState = 'step-preview';
    priceTitle.textContent = 'STEP-bestand geladen';
    resultBox.innerHTML = 'STEP wordt alvast omgezet voor de viewer. Je kunt ondertussen op bereken prijs klikken.';
    refreshLanguage();
    if (typeof previewStepFast === 'function') previewStepFast(file);
  }
});

if (dropzone) {
  if (fileInput && !dropzone.dataset.pro3dKeyboardUploadBound) {
    dropzone.dataset.pro3dKeyboardUploadBound = '1';
    dropzone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click();
      }
    });
  }
  ['dragenter', 'dragover'].forEach(evt => dropzone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); dropzone.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach(evt => dropzone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('is-dragover');
  }));
  dropzone.addEventListener('drop', e => {
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    selectedModelFile = file;

    if (!isStlFile(file) && !isStepFile(file)) {
      showError('Upload alleen een STL- of STEP-bestand.');
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;

    if (typeof clearViewer === 'function') clearViewer();
    fileText.textContent = file.name;
    lastCalculation = null;

    if (isStlFile(file)) {
      showLoadedResultMessage();
      previewStl(file);
    } else {
      resultState = 'step-preview';
      priceTitle.textContent = 'STEP-bestand geladen';
      resultBox.innerHTML = 'STEP wordt alvast omgezet voor de viewer. Je kunt ondertussen op bereken prijs klikken.';
      refreshLanguage();
      if (typeof previewStepFast === 'function') previewStepFast(file);
    }
  });
}

function resetDefaults() {
  technologySelect.value = 'fdm';
  if (form.elements.quantity) form.elements.quantity.value = 1;
  if (form.elements.infill) form.elements.infill.value = 20;
  if (form.elements.wallThickness) form.elements.wallThickness.value = 0.8;
}

function updateTechnologyUI() {
  const tech = technologySelect.value;
  const data = MATERIAL_DATA[tech];
  if (!data) return;

  techInfo.innerHTML = `<strong>${escapeHtml(data.title)}</strong>${escapeHtml(data.text)}`;
  printerInfo.innerHTML = `<strong>${escapeHtml(data.title.replace('filament','printformaat').replace('resin','printformaat').replace('nylon','printformaat'))}</strong><span>${escapeHtml(data.maxSize)}</span>`;

  
  translateNow();
materialSelect.innerHTML = '';

  if (tech === 'fdm') {
    const groups = [
      ['Standaard', ['fdm_pla', 'fdm_petg']],
      ['Technisch', ['fdm_pc']],
      ['Risico / technisch', ['fdm_petg_cf', 'fdm_abs', 'fdm_asa']],
      ['Risico / flexibel', ['fdm_tpu85', 'fdm_tpu90']]
    ];

    for (const [groupLabel, keys] of groups) {
      const group = document.createElement('optgroup');
      group.label = groupLabel;

      for (const key of keys) {
        const mat = data.materials[key];
        if (!mat) continue;
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = mat.label;
        group.appendChild(opt);
      }

      if (group.children.length) materialSelect.appendChild(group);
    }
  } else {
    for (const [key, mat] of Object.entries(data.materials)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = mat.label;
      materialSelect.appendChild(opt);
    }
  }

  materialSelect.selectedIndex = 0;

  if (tech !== 'sls') foodgrade.checked = false;
  foodgradeWrap.classList.toggle('hidden', tech !== 'sls');
  foodgradeHelp.classList.toggle('hidden', tech !== 'sls');

  fdmSettingsWrap.classList.toggle('hidden', tech !== 'fdm');
  if (infillWrap) infillWrap.classList.toggle('hidden', tech !== 'fdm');

  layerHeightWrap.classList.toggle('hidden', tech === 'sls');
  updateLayerHeightOptions();
  updateColorOptions();
  updateMaterialInfo();
}

function updateLayerHeightOptions() {
  const tech = technologySelect.value;
  layerHeightSelect.innerHTML = '';
  let options = [];
  if (tech === 'fdm') {
    options = [
      ['0.10', '0.10 mm - zeer fijn, langzaamste print'],
      ['0.12', '0.12 mm - fijn detail'],
      ['0.16', '0.16 mm - strak/allround'],
      ['0.20', '0.20 mm - standaard keuze'],
      ['0.24', '0.24 mm - sneller, grovere lagen']
    ];
    layerHeightHelp.textContent = 'Hoe kleiner de laaghoogte, hoe strakker en gladder de print oogt. De print wordt wel langzamer en daardoor duurder.';
  } else if (tech === 'sla') {
    options = [
      ['0.03', '0.03 mm - hoogste detail'],
      ['0.05', '0.05 mm - standaard keuze'],
      ['0.10', '0.10 mm - sneller']
    ];
    layerHeightHelp.textContent = 'Bij SLA geeft een kleinere laaghoogte meer detail en minder zichtbare laaglijnen. De print duurt dan langer.';
  } else {
    layerHeightHelp.textContent = '';
  }
  for (const [value, label] of options) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    layerHeightSelect.appendChild(opt);
  }
  if (tech === 'fdm') layerHeightSelect.value = '0.20';
  if (tech === 'sla') layerHeightSelect.value = '0.05';
}

function updateColorOptions() {
  const tech = technologySelect.value;
  const data = MATERIAL_DATA[tech];
  const colors = tech === 'sls' && foodgrade.checked ? data.foodgradeColors : data.colors;
  colorSelect.innerHTML = '';
  for (const color of colors) {
    const opt = document.createElement('option');
    opt.value = color.toLowerCase();
    opt.textContent = color;
    colorSelect.appendChild(opt);
  }
}

function updateMaterialInfo() {
  const tech = technologySelect.value;
  const mat = MATERIAL_DATA[tech]?.materials?.[materialSelect.value];
  if (!mat) {
    materialInfo.innerHTML = '';
    return;
  }
  materialInfo.innerHTML = `
    <strong>${escapeHtml(mat.label)}</strong>
    ${escapeHtml(mat.info)}
    <ul>${mat.specs.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
  `;

  translateNow();
}

function invalidateCalculation() {
  // V146: zodra instellingen wijzigen, wordt een lopende berekening ongeldig.
  calculationRequestId += 1;
  lastCalculation = null;
  resultState = 'invalidated';
  const file = getCurrentModelFile();
  if (file) {
    priceTitle.textContent = 'Instellingen aangepast';
    resultBox.innerHTML = 'Klik opnieuw op bereken prijs voor de nieuwe instellingen.';
    document.getElementById('addToCartBtn')?.setAttribute('disabled', 'disabled');
  }
  if (calculationInProgress) {
    resetCalculateButton();
  }
}


function getMaterialRiskMarkup(materialKey) {
  if (['fdm_tpu85', 'fdm_tpu90', 'fdm_abs', 'fdm_asa', 'fdm_petg_cf'].includes(materialKey)) return 0.50;
  return null;
}



async function readCalculateJsonSafe(res) {
  const text = await res.text();

  if (!text || !text.trim()) {
    throw new Error('De server gaf geen antwoord terug. Dit gebeurt meestal bij een heel groot of zwaar STL-bestand. Je bestand blijft geselecteerd; probeer opnieuw of stuur een handmatige aanvraag.');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error('De server gaf geen geldige JSON terug. Het STL-bestand is waarschijnlijk te zwaar of de berekening werd onderbroken. Je bestand blijft geselecteerd.');
  }
}

function getCurrentModelFile() {
  return selectedModelFile || fileInput?.files?.[0] || null;
}

function buildCalculationFormData() {
  const data = new FormData(form);
  const file = getCurrentModelFile();

  // Browser file inputs can sometimes lose their File reference after a failed request.
  // We always append the remembered file again so recalculating does not require re-uploading.
  if (file) {
    data.set('model', file, file.name);
  }

  return data;
}

function resetCalculateButton() {
  const submitButton = form?.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    if (submitButton.dataset.originalText) {
      submitButton.textContent = submitButton.dataset.originalText;
    }
  }
  calculationInProgress = false;
}

function setCalculateButtonLoading() {
  const submitButton = form?.querySelector('button[type="submit"]');
  if (submitButton) {
    if (!submitButton.dataset.originalText) submitButton.dataset.originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.textContent = 'Berekenen...';
  }
  calculationInProgress = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const requestId = ++calculationRequestId;

  const file = getCurrentModelFile();
  if (!file) {
    showError('Kies eerst een STL- of STEP-bestand.');
    resetCalculateButton();
    return;
  }

  if (!isStlFile(file) && !isStepFile(file)) {
    showError('Upload alleen een STL- of STEP-bestand.');
    resetCalculateButton();
    return;
  }

  selectedModelFile = file;
  setCalculateButtonLoading();
  resultState = 'calculating';

  priceTitle.textContent = 'Even rekenen';
  resultBox.innerHTML = 'Berekenen...';

  try {
    const data = buildCalculationFormData();
    const res = await fetch('/api/calculate', { method: 'POST', body: data });
    const json = await readCalculateJsonSafe(res);

    if (requestId !== calculationRequestId) return;

    if (!json.ok) {
      if (json.fitError) {
        showFitError(json);
        return;
      }
      throw new Error(json.error || 'Berekenen mislukt');
    }

    lastCalculation = json;
    showResult(json);

    if (json.convertedFromStep && json.storedFileName && typeof previewStoredStl === 'function') {
      clearViewer();
      previewStoredStl(json.storedFileName);
    }
  } catch (err) {
    if (requestId !== calculationRequestId) return;
    console.error('Calculate error:', err);
    showError(`${err.message || 'Berekenen mislukt'}

Je bestand blijft geselecteerd. Pas eventueel instellingen aan en klik opnieuw op bereken prijs.`);
  } finally {
    if (requestId === calculationRequestId) resetCalculateButton();
  }
});

function showError(message) {
  resultState = 'error';
  priceTitle.textContent = 'Fout';

  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('file too large') || normalized.includes('model te groot') || normalized.includes('afmetingen te groot')) {
    showOversizeContactMessage();
    return;
  }

  resultBox.innerHTML = `<p class="warning">${escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
}

function showOversizeContactMessage(detailsHtml = '') {
  resultState = 'error';
  priceTitle.textContent = 'Model te groot';
  resultBox.innerHTML = `
    <div class="fit-error">
      <strong>Helaas zijn de afmetingen te groot voor onze printer.</strong>
      <p>U kunt altijd contact opnemen met ons voor een oplossing.</p>
    </div>
    ${detailsHtml}
    <a class="primary full" href="/contact.html">Aanvraag / contact</a>`;
}

function showFitError(data) {
  lastCalculation = null;
  const a = data.analysis;
  const detailsHtml = `
    <div class="price-summary">
      <div class="summary-row"><span>Jouw model</span><strong>${a.dimensionsMm.x} × ${a.dimensionsMm.y} × ${a.dimensionsMm.z} mm</strong></div>
      <div class="summary-row"><span>Maximaal formaat</span><strong>${data.fit.printer.buildVolume.x} × ${data.fit.printer.buildVolume.y} × ${data.fit.printer.buildVolume.z} mm</strong></div>
    </div>`;
  showOversizeContactMessage(detailsHtml);
}

function showResult(data) {
  resultState = 'calculated';
  const a = data.analysis;
  const p = data.price;
  priceTitle.textContent = `€${p.totalPrice.toFixed(2)} excl. btw`;
  const manualRequired = Boolean(
    p.serverMemoryError ||
    data.serverMemoryError ||
    data.requiresManualReview ||
    (data.warning && data.warning.toLowerCase().includes('opnieuw proberen')) ||
    (data.warning && data.warning.toLowerCase().includes('aanvraag versturen'))
  );
  const canOrder = !manualRequired;
  const action = canOrder
    ? `<button type="button" class="primary full" id="addToCartBtn">Toevoegen aan winkelwagen</button>`
    : `<button type="button" class="primary full" id="requestReviewBtn">Aanvraag versturen</button>`;

  resultBox.innerHTML = `
    <div class="price-summary">
      <div class="main-price"><span>Totaalprijs excl. btw</span><strong>€${p.totalPrice.toFixed(2)}</strong></div>
      <div class="summary-row"><span>Totaal incl. 21% btw</span><strong>€${p.totalInclVat.toFixed(2)}</strong></div>
      <div class="summary-row highlight"><span>${p.quantity > 1 ? `Gemiddeld per stuk bij ${p.quantity} stuks` : 'Prijs per stuk'}</span><strong>€${p.pricePerPart.toFixed(2)}</strong></div>
      <div class="summary-row"><span>Afmetingen model</span><strong>${a.dimensionsMm.x} × ${a.dimensionsMm.y} × ${a.dimensionsMm.z} mm</strong></div>
      <div class="summary-row"><span>Gekozen optie</span><strong>${escapeHtml(p.technologyLabel)} · ${escapeHtml(p.material)} · ${escapeHtml(p.color)}</strong></div>
      ${p.foodgrade ? `<div class="summary-row"><span>Foodgrade</span><strong>Met certificaat</strong></div>` : ''}
    </div>
    <p class="ok">${escapeHtml(data.fit.message)}</p>
    ${data.warning ? `<p class="warning">${escapeHtml(data.warning)}</p>` : ''}
    ${!canOrder ? `<div class="fit-error"><strong>Handmatige controle nodig</strong><p>Dit model krijgt wel een prijsindicatie, maar kan niet direct besteld worden.</p></div>` : ''}
    ${action}
  `;

  const add = document.getElementById('addToCartBtn');
  if (add) add.addEventListener('click', () => addCurrentToCart());
  const req = document.getElementById('requestReviewBtn');
  if (req) req.addEventListener('click', () => requestManualReview());
}

function addCurrentToCart() {
  if (!lastCalculation) {
    showError('Deze prijs is verouderd of nog niet opnieuw berekend. Klik opnieuw op bereken prijs.');
    return;
  }
  const warningText = String(lastCalculation.warning || '').toLowerCase();
  const manualRequired = Boolean(
    lastCalculation.serverMemoryError ||
    lastCalculation.requiresManualReview ||
    lastCalculation.price?.serverMemoryError ||
    warningText.includes('opnieuw proberen') ||
    warningText.includes('aanvraag versturen')
  );
  if (manualRequired) {
    requestManualReview();
    return;
  }
  const p = lastCalculation.price;
  const item = {
    cartSchemaVersion: CART_SCHEMA_VERSION,
    quoteId: String(lastCalculation.quoteId || ''),
    storedFileName: String(lastCalculation.storedFileName || ''),
    originalStoredFileName: String(lastCalculation.originalStoredFileName || ''),
    filename: String(lastCalculation.filename || ''),
    title: `${p.technologyLabel} · ${p.material} · ${p.color}`,
    quantity: Number(p.quantity || 1),
    totalPrice: Number(p.totalPrice || 0),
    totalInclVat: Number(p.totalInclVat || 0),
    dimensions: lastCalculation.analysis.dimensionsMm,
    weightG: Number(p.totalWeightG || p.weightG || ((Number(p.weightGPerPart || 0) || 0) * Number(p.quantity || 1))) || 0,
    weightGPerPart: Number(p.weightGPerPart || 0) || 0,
    totalWeightG: Number(p.totalWeightG || p.weightG || ((Number(p.weightGPerPart || 0) || 0) * Number(p.quantity || 1))) || 0,
    serverMemoryError: false
  };

  if (!isValidCartItem(item)) {
    showError('Dit product kon niet veilig aan de winkelwagen worden toegevoegd. Probeer opnieuw te berekenen of upload opnieuw.');
    return;
  }

  cart.push(item);
  saveCart();
  renderCart();
refreshLanguage();

  openCart();
}

async function requestManualReview() {
  if (!lastCalculation) return;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Website aanvraag',
        email: 'info@Pro3DManufacturing.nl',
        subject: 'Handmatige printcontrole aanvraag',
        message: `Aanvraag voor ${lastCalculation.filename}. Quote: ${lastCalculation.quoteId || 'geen quoteId'}. Prijsindicatie: €${lastCalculation.price.totalPrice} excl. btw.`
      })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Aanvraag versturen mislukt.');
    resultBox.insertAdjacentHTML('beforeend', '<p class="ok">Aanvraag is opgeslagen/verstuurd.</p>');
  } catch (err) {
    resultBox.insertAdjacentHTML('beforeend', `<p class="warning">${escapeHtml(err.message)}</p>`);
  }
}


function isValidCartItem(item) {
  if (!item || typeof item !== 'object') return false;

  // Oude winkelwagen-items zonder nieuwe schema-versie verwijderen we automatisch.
  if (item.cartSchemaVersion !== CART_SCHEMA_VERSION) return false;

  if (typeof item.quoteId !== 'string' || item.quoteId.length < 3) return false;
  if (typeof item.filename !== 'string') return false;
  const safeFilename = item.filename.toLowerCase();
  if (!safeFilename.endsWith('.stl') && !safeFilename.endsWith('.step')) return false;
  if (typeof item.title !== 'string' || item.title.length < 3) return false;

  const quantity = Number(item.quantity);
  const totalPrice = Number(item.totalPrice);
  const totalInclVat = Number(item.totalInclVat);

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 9999) return false;
  if (!Number.isFinite(totalPrice) || totalPrice <= 0 || totalPrice > 100000) return false;
  if (!Number.isFinite(totalInclVat) || totalInclVat <= 0 || totalInclVat > 121000) return false;

  // Aanvraagproducten mogen nooit in de winkelwagen blijven staan.
  if (item.serverMemoryError || item.requiresManualReview) return false;

  return true;
}

function loadCart() {
  try {
    const raw = localStorage.getItem('pro3d_cart');
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      localStorage.removeItem('pro3d_cart');
      return [];
    }

    const cleaned = parsed.filter(isValidCartItem);

    // Automatisch oude/foute producten wegschrijven.
    if (cleaned.length !== parsed.length) {
      if (cleaned.length) {
        localStorage.setItem('pro3d_cart', JSON.stringify(cleaned));
      } else {
        localStorage.removeItem('pro3d_cart');
      }
    }

    return cleaned;
  } catch {
    localStorage.removeItem('pro3d_cart');
    return [];
  }
}
function saveCart() {
  cart = Array.isArray(cart) ? cart.filter(isValidCartItem) : [];
  if (cart.length) {
    localStorage.setItem('pro3d_cart', JSON.stringify(cart));
  } else {
    localStorage.removeItem('pro3d_cart');
  }
}


function formatWeightLabelV165(item) {
  const totalG = Number(item?.totalWeightG || item?.weightG || 0);
  const perPartG = Number(item?.weightGPerPart || 0);
  const qty = Number(item?.quantity || 1);
  const raw = totalG > 0 ? totalG : perPartG * qty;
  if (!Number.isFinite(raw) || raw <= 0) return '-';
  if (raw >= 1000) return `${(raw / 1000).toFixed(raw >= 10000 ? 1 : 2)} kg`;
  return `${raw.toFixed(raw >= 100 ? 0 : 1)} g`;
}

function getCurrentLangV165() {
  return (document.documentElement.lang || localStorage.getItem('pro3d_lang') || 'nl').toLowerCase().startsWith('en') ? 'en' : 'nl';
}

function checkoutTextV165(key, fallback = '') {
  const lang = getCurrentLangV165();
  const dict = {
    nl: {
      placing: 'Bestelling wordt geplaatst...',
      emptyCart: 'Je winkelwagen is leeg.',
      companyRequired: 'Vul bedrijfsnaam in voor zakelijke bestelling.',
      vatRequired: 'Vul btw-nummer in voor zakelijke bestelling.',
      invoiceLogin: 'Log eerst in met een vast klantenaccount om op factuur te betalen.',
      title: 'Bedankt voor uw bestelling',
      intro: 'Uw order is succesvol ontvangen.',
      orderNumber: 'Ordernummer',
      next: 'We gaan er mee aan de slag en nemen contact op als er vragen zijn.',
      confirm: 'U ontvangt een bevestiging per e-mail als deze beschikbaar is.'
    },
    en: {
      placing: 'Placing order...',
      emptyCart: 'Your cart is empty.',
      companyRequired: 'Please enter a company name for a business order.',
      vatRequired: 'Please enter a VAT number for a business order.',
      invoiceLogin: 'Please log in with a fixed customer account to pay by invoice.',
      title: 'Thank you for your order',
      intro: 'Your order has been received successfully.',
      orderNumber: 'Order number',
      next: 'We will start working on it and contact you if we have any questions.',
      confirm: 'You will receive an email confirmation when available.'
    }
  };
  return dict[lang]?.[key] || dict.nl[key] || fallback;
}

function updateCheckoutCustomerTypeV165() {
  const selectedCustomerType = document.querySelector('input[name="customerType"]:checked')?.value || 'private';
  const isBusiness = selectedCustomerType === 'business';
  if (businessFields) businessFields.classList.toggle('hidden', !isBusiness);
  if (guestCompanyField) guestCompanyField.classList.add('hidden');
  if (checkoutCompanyName) checkoutCompanyName.required = isBusiness;
  if (checkoutVatNumber) checkoutVatNumber.required = isBusiness;
}

function showOrderSuccessV165(orderNumber) {
  if (!checkoutForm || !orderSuccessPanel) return false;
  checkoutSection?.classList.add('checkout-success-mode');
  checkoutForm.classList.add('hidden');
  orderSuccessPanel.classList.remove('hidden');
  orderSuccessPanel.innerHTML = `
    <div class="success-check">✓</div>
    <p class="eyebrow">${getCurrentLangV165() === 'en' ? 'ORDER RECEIVED' : 'BESTELLING ONTVANGEN'}</p>
    <h2>${checkoutTextV165('title')}</h2>
    <p class="success-intro">${checkoutTextV165('intro')}</p>
    <div class="success-order-number">
      <span>${checkoutTextV165('orderNumber')}</span>
      <strong>${escapeHtml(orderNumber || '-')}</strong>
    </div>
    <p>${checkoutTextV165('next')}</p>
    <p class="muted small-note">${checkoutTextV165('confirm')}</p>
    <button type="button" class="primary success-close-btn" id="successCloseCheckoutBtn">${getCurrentLangV165() === 'en' ? 'Close' : 'Sluiten'}</button>
  `;
  orderSuccessPanel.querySelector('#successCloseCheckoutBtn')?.addEventListener('click', closeCheckoutModal);
  return true;
}

function resetCheckoutSuccessV165() {
  checkoutSection?.classList.remove('checkout-success-mode');
  if (checkoutForm) checkoutForm.classList.remove('hidden');
  if (orderSuccessPanel) {
    orderSuccessPanel.classList.add('hidden');
    orderSuccessPanel.innerHTML = '';
  }
}


function renderCart() {
  try {
    if (!cartItems) return;
    cart = Array.isArray(cart) ? cart.filter(isValidCartItem) : [];
    saveCart();
    cartCount.textContent = cart.length;

    const productTotal = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const shipping = estimateShipping(cart);

    cartProductEx.textContent = euro(productTotal);
    cartShipping.textContent = euro(shipping);
    cartTotalEx.textContent = euro(productTotal + shipping);
    cartTotalIn.textContent = euro((productTotal + shipping) * 1.21);

    cartItems.innerHTML = cart.length ? cart.map((item, i) => `
      <div class="cart-line">
        <strong>${escapeHtml(item.filename || '3D print')}</strong>
        <span>${escapeHtml(item.title || '')}</span>
        <small>Aantal: ${item.quantity || 1} · Geschat gewicht: ${formatWeightLabelV165(item)}</small>
        <b>${euro(item.totalPrice || 0)}</b>
        <button type="button" data-remove="${i}">Verwijderen</button>
      </div>`).join('') : '<p class="small">Je winkelwagen is leeg.</p>';

    if (checkoutItems) {
            const checkoutLines = cart.map(item => `<div class=\"summary-row checkout-product-line\">
        <span><b>${escapeHtml(item.filename || '3D print')}</b><small>${escapeHtml(item.title || '')}<br>Aantal: ${Number(item.quantity || 1)} · Geschat gewicht: ${formatWeightLabelV165(item)}</small></span>
        <strong>${euro(item.totalPrice || 0)}</strong>
      </div>`).join('');
      checkoutItems.innerHTML = checkoutLines + `
        <div class="summary-row"><span>Producten excl. btw</span><strong>${euro(productTotal)}</strong></div>
        <div class="summary-row"><span>Verzendkosten</span><strong>${euro(shipping)}</strong></div>
        <div class="summary-row highlight"><span>Totaal excl. btw</span><strong>${euro(productTotal + shipping)}</strong></div>
        <div class="summary-row highlight"><span>Totaal incl. btw</span><strong>${euro((productTotal + shipping) * 1.21)}</strong></div>`;
    }
  } catch (err) {
    console.error('Render cart fout:', err);
    localStorage.removeItem('pro3d_cart');
    cart = [];
    if (cartItems) cartItems.innerHTML = '<p class="small">Je winkelwagen is leeggemaakt omdat er oude/foute data in stond.</p>';
    if (cartCount) cartCount.textContent = '0';
  }
}

function estimateShipping(items) {
  if (!items.length) return 0;
  const country = checkoutCountry?.value || 'NL';
  const base = country === 'NL' ? 7.95 : country === 'BE' || country === 'DE' ? 12.50 : 21.00;
  const totalWeightKg = items.reduce((sum, i) => {
    const totalG = Number(i.totalWeightG || i.weightG || 0);
    const perPartG = Number(i.weightGPerPart || 0);
    const qty = Number(i.quantity || 1);
    return sum + ((totalG > 0 ? totalG : perPartG * qty) / 1000);
  }, 0);
  if (totalWeightKg > 10) return base + 12;
  if (totalWeightKg > 5) return base + 7;
  if (totalWeightKg > 2) return base + 4;
  return base;
}
function euro(n) { return `€${Number(n || 0).toFixed(2)}`; }




async function openCheckoutModal() {
  await verifyAccountSession();
    if (!checkoutSection) return;
  resetCheckoutSuccessV165();
  updateCheckoutCustomerTypeV165();
  renderCart();
refreshLanguage();

  checkoutSection.classList.remove('hidden');
  checkoutSection.classList.add('checkout-open');
  document.body.classList.add('checkout-is-open');
}

function closeCheckoutModal() {
  if (!checkoutSection) return;
  checkoutSection.classList.add('hidden');
  checkoutSection.classList.remove('checkout-open');
  document.body.classList.remove('checkout-is-open');
}


function openCart() {
  try {
    cart = loadCart();
    renderCart();
refreshLanguage();

  } catch (err) {
    console.error('Cart render error:', err);
    cart = [];
    localStorage.removeItem('pro3d_cart');
    renderCart();
refreshLanguage();

  }

  if (cartDrawer) {
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartDrawer.classList.add('pro3d-cart-open');
    cartDrawer.style.display = 'block';
    cartDrawer.style.visibility = 'visible';
    cartDrawer.style.opacity = '1';
    cartDrawer.style.transform = 'translateX(0)';
    cartDrawer.style.pointerEvents = 'auto';
    cartDrawer.style.left = 'auto';
    cartDrawer.style.right = '0';
    cartDrawer.style.top = '0';
    cartDrawer.style.bottom = '0';
    cartDrawer.style.width = 'min(420px, 92vw)';
    cartDrawer.style.height = '100vh';
    cartDrawer.style.filter = 'none';
    cartDrawer.style.backdropFilter = 'none';
    cartDrawer.style.zIndex = '10010';
    cartDrawer.style.background = '#081221';
    cartDrawer.style.color = '#ffffff';
  }

  if (cartOverlay) {
    cartOverlay.classList.add('pro3d-cart-open');
    cartOverlay.style.display = 'block';
    cartOverlay.style.visibility = 'visible';
    cartOverlay.style.opacity = '1';
    cartOverlay.style.pointerEvents = 'auto';
    cartOverlay.style.left = '0';
    cartOverlay.style.right = '0';
    cartOverlay.style.top = '0';
    cartOverlay.style.bottom = '0';
    cartOverlay.style.filter = 'none';
    cartOverlay.style.backdropFilter = 'none';
    cartOverlay.style.zIndex = '10000';
  }
}

function closeCart() {
  if (cartDrawer) {
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartDrawer.classList.remove('pro3d-cart-open');
    cartDrawer.style.display = '';
    cartDrawer.style.visibility = '';
    cartDrawer.style.opacity = '';
    cartDrawer.style.transform = '';
    cartDrawer.style.pointerEvents = '';
    cartDrawer.style.left = '';
    cartDrawer.style.right = '';
    cartDrawer.style.top = '';
    cartDrawer.style.bottom = '';
    cartDrawer.style.width = '';
    cartDrawer.style.height = '';
    cartDrawer.style.filter = '';
    cartDrawer.style.backdropFilter = '';
    cartDrawer.style.zIndex = '';
    cartDrawer.style.background = '';
    cartDrawer.style.color = '';
  }

  if (cartOverlay) {
    cartOverlay.classList.remove('pro3d-cart-open');
    cartOverlay.style.display = '';
    cartOverlay.style.visibility = '';
    cartOverlay.style.opacity = '';
    cartOverlay.style.pointerEvents = '';
    cartOverlay.style.left = '';
    cartOverlay.style.right = '';
    cartOverlay.style.top = '';
    cartOverlay.style.bottom = '';
    cartOverlay.style.filter = '';
    cartOverlay.style.backdropFilter = '';
    cartOverlay.style.zIndex = '';
  }
}

// V119 cart button fix: bind actual cart buttons used in HTML.

function getAccountToken() {
  return localStorage.getItem('pro3d_account_token') || '';
}
function setAccountToken(token) {
  if (token) localStorage.setItem('pro3d_account_token', token);
  else localStorage.removeItem('pro3d_account_token');
}
function getStoredAccount() {
  try { return JSON.parse(localStorage.getItem('pro3d_account') || 'null'); } catch (_) { return null; }
}
function setStoredAccount(account) {
  if (account) localStorage.setItem('pro3d_account', JSON.stringify(account));
  else localStorage.removeItem('pro3d_account');
  updateAccountUi();
}
function openAccountModal() {
  if (!accountModal) return;
  accountModal.classList.remove('hidden');
  accountModal.setAttribute('aria-hidden', 'false');
  accountOverlay?.classList.remove('hidden');
  bindAccountChoiceButtons();
  bindAccountDashboardTabs();
  resetAccountModalToChoice();
  updateAccountUi();
  verifyAccountSession();
}
function closeAccountModal() {
  accountModal?.classList.add('hidden');
  accountModal?.setAttribute('aria-hidden', 'true');
  accountOverlay?.classList.add('hidden');
  resetAccountModalToChoice();
}
function updateAccountUi() {
  const account = getStoredAccount();

  if (!account) {
    if (accountLoggedOut) accountLoggedOut.classList.remove('hidden');
    if (accountChoice) accountChoice.classList.add('hidden');
    if (accountLoggedIn) accountLoggedIn.classList.add('hidden');
    accountModal?.classList.remove('account-modal-wide');
  } else {
    if (accountLoggedOut) accountLoggedOut.classList.add('hidden');

    const dashboardOpen = accountLoggedIn && !accountLoggedIn.classList.contains('hidden');
    if (!dashboardOpen) {
      if (accountChoice) accountChoice.classList.remove('hidden');
      if (accountLoggedIn) accountLoggedIn.classList.add('hidden');
      accountModal?.classList.remove('account-modal-wide');
    }

    if (accountName) accountName.textContent = account.name || account.email || '';
    if (accountChoiceName) accountChoiceName.textContent = account.name || account.email || 'Account';
    if (accountCompany) accountCompany.textContent = account.companyName ? `Bedrijf: ${account.companyName}` : '';
    if (accountChoiceCompany) accountChoiceCompany.textContent = account.companyName ? `Bedrijf: ${account.companyName}` : '';
    if (accountVat) accountVat.textContent = account.vatNumber ? `Btw: ${account.vatNumber}` : '';
    if (accountFirstName) accountFirstName.value = account.firstName || '';
    if (accountLastName) accountLastName.value = account.lastName || '';
    if (accountStreet) accountStreet.value = account.street || '';
    if (accountHouseNumber) accountHouseNumber.value = account.houseNumber || '';
    if (accountPostalCode) accountPostalCode.value = account.postalCode || '';
    if (accountCity) accountCity.value = account.city || '';
    if (accountCountry) accountCountry.value = account.country || 'Nederland';
    if (checkoutCompanyName && account.companyName) checkoutCompanyName.value = account.companyName;
    if (checkoutVatNumber && account.vatNumber) checkoutVatNumber.value = account.vatNumber;
  }

  if (typeof updateCheckoutModeForAccount === 'function') updateCheckoutModeForAccount();
}
function showAccountMessage(message, ok = false) {
  if (!accountResult) return;
  accountResult.className = ok ? 'form-result success' : 'form-result error';
  accountResult.textContent = message || '';
}


function accountToCheckoutCustomer(account, formCustomer = {}) {
  const fullName = `${account.firstName || ''} ${account.lastName || ''}`.trim() || account.name || formCustomer.name || '';
  const addressLine = `${account.street || ''} ${account.houseNumber || ''}`.trim();

  return {
    ...formCustomer,
    customerType: 'business',
    paymentMethod: 'invoice',
    name: fullName,
    email: account.email || formCustomer.email || '',
    phone: formCustomer.phone || '',
    companyName: account.companyName || '',
    company: account.companyName || '',
    vatNumber: account.vatNumber || '',
    address: addressLine || formCustomer.address || '',
    street: account.street || '',
    houseNumber: account.houseNumber || '',
    postalCode: account.postalCode || formCustomer.postalCode || '',
    city: account.city || formCustomer.city || '',
    country: account.country || formCustomer.country || 'NL',
    poNumber: formCustomer.poNumber || '',
    note: formCustomer.note || '',
    invoiceAccount: account
  };
}

function updateCheckoutModeForAccount() {
  const account = getStoredAccount();
  const isLoggedIn = !!account;

  guestCheckoutFields?.classList.toggle('hidden', isLoggedIn);
  loggedInCheckoutNotice?.classList.toggle('hidden', !isLoggedIn);

  document.querySelectorAll('input[name="customerType"]').forEach(input => {
    input.closest('.checkout-choice-box')?.classList.toggle('hidden', isLoggedIn);
  });

  if (checkoutPaymentMethod) checkoutPaymentMethod.value = isLoggedIn ? 'invoice' : 'direct';

  if (isLoggedIn) {
    if (loggedInCheckoutDetails) {
      const address = `${account.street || ''} ${account.houseNumber || ''}, ${account.postalCode || ''} ${account.city || ''}`.trim();
      loggedInCheckoutDetails.textContent = `${account.companyName || account.name || account.email} · ${address || 'adres via account'}`;
    }

    guestCheckoutFields?.querySelectorAll('input, select, textarea').forEach(el => {
      el.dataset.wasRequired = el.required ? '1' : '';
      el.required = false;
    });
  } else {
    guestCheckoutFields?.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.dataset.wasRequired === '1') el.required = true;
    });
  }
}



async function readOrderJsonSafe(res) {
  const text = await res.text();

  if (!text || !text.trim()) {
    throw new Error('De server gaf geen antwoord terug bij het plaatsen van de order. Probeer opnieuw of neem contact op.');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error('De server gaf geen geldige order-response terug. De order is mogelijk niet geplaatst. Probeer opnieuw of neem contact op.');
  }
}

function accountEuro(value) {
  return '€' + Number(value || 0).toFixed(2);
}

function escapeAccountHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

async function loadAccountOrders() {
  if (!accountOrdersList) return;
  accountOrdersList.innerHTML = 'Orders laden...';
  accountOrderDetail?.classList.remove('hidden');

  try {
    const res = await fetch('/api/account/orders', {
      headers: getAccountToken() ? { Authorization: `Bearer ${getAccountToken()}` } : {}
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Orders ophalen mislukt.');

    if (!json.orders.length) {
      accountOrdersList.innerHTML = '<p class="muted small-note">Nog geen orders gevonden.</p>'; 
      if (accountOrderDetail) accountOrderDetail.innerHTML = '<p class="muted">Geen order geselecteerd.</p>';
      return;
    }

    accountOrdersList.innerHTML = json.orders.map(order => `
      <div class="account-order-row" data-account-order-row="${escapeAccountHtml(order.orderNumber)}">
        <div>
          <strong>${escapeAccountHtml(order.orderNumber)}</strong>
          <p>${escapeAccountHtml(new Date(order.createdAt).toLocaleString('nl-NL'))}</p>
          <p>${escapeAccountHtml(order.poNumber || '')}</p>
          <p>${order.itemCount} item(s) · ${escapeAccountHtml(order.paymentMethod || 'direct')}</p>
        </div>
        <div class="account-order-row-right">
          <strong>${accountEuro(order.inclVat)}</strong>
          <button type="button" class="secondary" data-account-order="${escapeAccountHtml(order.orderNumber)}">Bekijk</button>
        </div>
      </div>
    `).join('');

    accountOrdersList.querySelectorAll('[data-account-order]').forEach(btn => {
      btn.addEventListener('click', () => openAccountOrder(btn.dataset.accountOrder));
    });
  } catch (err) {
    accountOrdersList.innerHTML = `<p class="form-result error">${escapeAccountHtml(err.message)}</p>`;
  }
}


async function openAccountDocument(orderNumber, type) {
  try {
    const res = await fetch('/api/account/order-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccountToken() ? { Authorization: `Bearer ${getAccountToken()}` } : {})
      },
      body: JSON.stringify({ orderNumber, type })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Document openen mislukt.');
    window.open(json.url, '_blank');
  } catch (err) {
    showAccountMessage(err.message || 'Document openen mislukt.');
  }
}

async function openAccountOrder(orderNumber) {
  document.querySelectorAll('[data-account-order-row]').forEach(row => row.classList.toggle('active', row.dataset.accountOrderRow === orderNumber));
  if (!accountOrderDetail) return;
  accountOrderDetail.classList.remove('empty');
  accountOrderDetail.innerHTML = 'Order laden...';

  try {
    const res = await fetch('/api/account/orders/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccountToken() ? { Authorization: `Bearer ${getAccountToken()}` } : {})
      },
      body: JSON.stringify({ orderNumber })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Order openen mislukt.');

    const order = json.order;
    const customer = order.customer || {};
    const trackingLinkHtml = order.tracking?.code
      ? `<p>Track & trace: <strong>${escapeAccountHtml(order.tracking.carrier || '')} ${escapeAccountHtml(order.tracking.code || '')}</strong></p>${order.tracking.url ? `<p><a class="tracking-link" href="${escapeAccountHtml(order.tracking.url)}" target="_blank" rel="noopener">Track & trace openen</a></p>` : ''}`
      : '';

    accountOrderDetail.innerHTML = `
      <h3>${escapeAccountHtml(order.orderNumber)}</h3>
      <p class="muted small-note">${escapeAccountHtml(new Date(order.createdAt).toLocaleString('nl-NL'))}</p>
      <p>PO / referentie: <strong>${escapeAccountHtml(customer.poNumber || '-')}</strong></p>
      <p>Status: <strong>${escapeAccountHtml(order.statusLabel || order.status || 'Nieuw')}</strong></p>${trackingLinkHtml}
      <div class="order-doc-buttons">
        <button type="button" class="secondary" data-account-doc="quote">Offerte downloaden</button>
        <button type="button" class="secondary" data-account-doc="invoice">Factuur downloaden</button>
      </div>
      <p>Totaal excl. btw: <strong>${accountEuro(order.totals?.exVat)}</strong></p>
      <p>Totaal incl. btw: <strong>${accountEuro(order.totals?.inclVat || order.totals?.inVat)}</strong></p>
      <div class="items-table">
        ${(order.items || []).map(item => `
          <div class="item-row">
            <div>
              <strong>${escapeAccountHtml(item.filename || '-')}</strong>
              <p>${escapeAccountHtml(item.technologyLabel || '-')} · ${escapeAccountHtml(item.material || '-')} · ${escapeAccountHtml(item.color || '-')}</p>
              <p>Aantal: ${escapeAccountHtml(item.quantity || 1)}</p>
              <p>${escapeAccountHtml(typeof item.dimensions === 'object' ? `${item.dimensions.x || '-'} × ${item.dimensions.y || '-'} × ${item.dimensions.z || '-'} mm` : '')}</p>
            </div>
            <strong>${accountEuro(item.totalPrice)}</strong>
          </div>
        `).join('')}
      </div>
    `;
    accountOrderDetail.querySelectorAll('[data-account-doc]').forEach(btn => {
      btn.addEventListener('click', () => openAccountDocument(order.orderNumber, btn.dataset.accountDoc));
    });
  } catch (err) {
    accountOrderDetail.innerHTML = `<p class="form-result error">${escapeAccountHtml(err.message)}</p>`;
  }
}


function clearStaleAccount(reason = 'Sessie verlopen. Log opnieuw in.') {
  setAccountToken(null);
  setStoredAccount(null);
  if (accountOrdersList) accountOrdersList.innerHTML = '';
  accountOrderDetail?.classList.add('hidden');
  if (accountOrderDetail) accountOrderDetail.innerHTML = '';
  updateAccountUi();
  accountModal?.classList.remove('account-modal-wide');
  showAccountMessage(reason, false);
}

async function verifyAccountSession() {
  const token = getAccountToken();
  if (!token) {
    if (getStoredAccount()) clearStaleAccount('Sessie verlopen. Log opnieuw in.');
    return null;
  }

  try {
    const res = await fetch('/api/account/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!json.ok || !json.account) {
      clearStaleAccount('Sessie verlopen. Log opnieuw in.');
      return null;
    }
    setStoredAccount(json.account);
    return json.account;
  } catch (err) {
    clearStaleAccount('Sessie kon niet worden gecontroleerd. Log opnieuw in.');
    return null;
  }
}




function resetAccountModalToChoice() {
  accountModal?.classList.remove('account-modal-wide');
  if (accountLoggedIn) accountLoggedIn.classList.add('hidden');

  const account = getStoredAccount();
  if (account) {
    if (accountLoggedOut) accountLoggedOut.classList.add('hidden');
    if (accountChoice) accountChoice.classList.remove('hidden');
  } else {
    if (accountChoice) accountChoice.classList.add('hidden');
    if (accountLoggedOut) accountLoggedOut.classList.remove('hidden');
  }

  document.querySelectorAll('[data-account-content]').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('[data-account-panel]').forEach(btn => btn.classList.remove('active'));
}

function showAccountChoice() {
  if (accountLoggedOut) accountLoggedOut.classList.add('hidden');
  if (accountLoggedIn) accountLoggedIn.classList.add('hidden');
  if (accountChoice) accountChoice.classList.remove('hidden');
  accountModal?.classList.remove('account-modal-wide');
}

function openAccountDashboard(section = 'details') {
  if (accountLoggedOut) accountLoggedOut.classList.add('hidden');
  if (accountChoice) accountChoice.classList.add('hidden');
  if (accountLoggedIn) accountLoggedIn.classList.remove('hidden');
  accountModal?.classList.add('account-modal-wide');
  bindAccountDashboardTabs();
  showAccountPanel(section);
}

function bindAccountChoiceButtons() {
  document.querySelectorAll('[data-open-account-section]').forEach(btn => {
    if (btn.dataset.accountChoiceBound) return;
    btn.dataset.accountChoiceBound = '1';
    btn.addEventListener('click', () => openAccountDashboard(btn.dataset.openAccountSection || 'details'));
  });
  logoutBtnChoice?.addEventListener('click', () => {
    setStoredAccount(null);
    setAccountToken(null);
    if (accountOrdersList) accountOrdersList.innerHTML = '';
    if (accountOrderDetail) accountOrderDetail.innerHTML = '';
    showAccountMessage('Uitgelogd.', true);
    updateAccountUi();
  });
}

function showAccountPanel(panelName) {
  const name = panelName || 'details';
  document.querySelectorAll('[data-account-panel]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.accountPanel === name);
  });
  document.querySelectorAll('[data-account-content]').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.accountContent === name);
  });

  if (name === 'orders' && getAccountToken()) {
    loadAccountOrders();
  }
}

function bindAccountDashboardTabs() {
  document.querySelectorAll('[data-account-panel]').forEach(btn => {
    if (btn.dataset.accountTabsBound) return;
    btn.dataset.accountTabsBound = '1';
    btn.addEventListener('click', () => showAccountPanel(btn.dataset.accountPanel));
  });
}

function bindAccountSystem() {
  bindAccountDashboardTabs();
  bindAccountChoiceButtons();
  accountBtn?.addEventListener('click', openAccountModal);
  closeAccountBtn?.addEventListener('click', closeAccountModal);
  accountOverlay?.addEventListener('click', closeAccountModal);

  document.querySelectorAll('[data-account-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.accountTab;
      document.querySelectorAll('[data-account-tab]').forEach(b => b.classList.toggle('active', b === btn));
      loginForm?.classList.toggle('hidden', tab !== 'login');
      registerForm?.classList.toggle('hidden', tab !== 'register');
      showAccountMessage('', true);
    });
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAccountMessage('Inloggen...');
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(loginForm).entries()))
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Inloggen mislukt.');
      setAccountToken(json.token);
      setStoredAccount(json.account);
      showAccountMessage('Ingelogd.', true);
      loginForm.reset();
    } catch (err) { showAccountMessage(err.message || 'Inloggen mislukt.'); }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAccountMessage('Account aanmaken...');
    try {
      const res = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(registerForm).entries()))
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Account aanmaken mislukt.');
      setAccountToken(json.token);
      setStoredAccount(json.account);
      showAccountMessage('Account aangemaakt en ingelogd.', true);
      registerForm.reset();
    } catch (err) { showAccountMessage(err.message || 'Account aanmaken mislukt.'); }
  });


  accountProfileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAccountMessage('Gegevens opslaan...');
    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getAccountToken() ? { Authorization: `Bearer ${getAccountToken()}` } : {})
        },
        body: JSON.stringify(Object.fromEntries(new FormData(accountProfileForm).entries()))
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Gegevens opslaan mislukt.');
      setStoredAccount(json.account);
      showAccountMessage('Gegevens opgeslagen.', true);
    } catch (err) {
      showAccountMessage(err.message || 'Gegevens opslaan mislukt.');
    }
  });


  loadAccountOrdersBtn?.addEventListener('click', loadAccountOrders);

  accountPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAccountMessage('Wachtwoord wijzigen...');
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getAccountToken() ? { Authorization: `Bearer ${getAccountToken()}` } : {})
        },
        body: JSON.stringify(Object.fromEntries(new FormData(accountPasswordForm).entries()))
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Wachtwoord wijzigen mislukt.');
      accountPasswordForm.reset();
      showAccountMessage('Wachtwoord gewijzigd.', true);
    } catch (err) {
      showAccountMessage(err.message || 'Wachtwoord wijzigen mislukt.');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    setAccountToken('');
    setStoredAccount(null);
    if (accountOrdersList) accountOrdersList.innerHTML = '';
    accountOrderDetail?.classList.add('hidden');
    if (accountOrderDetail) accountOrderDetail.innerHTML = '';
    showAccountMessage('Uitgelogd.', true);
  });

  document.querySelectorAll('input[name="customerType"]').forEach(input => {
    input.addEventListener('change', () => {
      const isBusiness = document.querySelector('input[name="customerType"]:checked')?.value === 'business';
      businessFields?.classList.toggle('hidden', !isBusiness);
    });
  });

  updateAccountUi();
}
bindAccountSystem();


// V130 account button fallback: account knop altijd openen, ook als layout/taalblok wijzigt.
function bindAccountButtonV130() {
  const btn = document.getElementById('accountBtn');
  const modal = document.getElementById('accountModal');
  const overlay = document.getElementById('accountOverlay');
  const closeBtn = document.getElementById('closeAccountBtn');

  if (btn && modal && !btn.dataset.v130AccountBound) {
    btn.dataset.v130AccountBound = '1';
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof openAccountModal === 'function') {
        openAccountModal();
        return;
      }
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      overlay?.classList.remove('hidden');
    });
  }

  if (closeBtn && modal && !closeBtn.dataset.v130AccountBound) {
    closeBtn.dataset.v130AccountBound = '1';
    closeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof closeAccountModal === 'function') {
        closeAccountModal();
        return;
      }
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      overlay?.classList.add('hidden');
    });
  }

  if (overlay && modal && !overlay.dataset.v130AccountBound) {
    overlay.dataset.v130AccountBound = '1';
    overlay.addEventListener('click', () => {
      if (typeof closeAccountModal === 'function') closeAccountModal();
      else {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
      }
    });
  }
}

bindAccountButtonV130();
document.addEventListener('DOMContentLoaded', bindAccountButtonV130);

function forceOpenCartDrawer() {
  try {
    if (typeof renderCart === 'function') renderCart();
  } catch (err) {
    console.warn('Cart render warning:', err);
  }

  if (cartOverlay) {
    cartOverlay.classList.remove('hidden');
    cartOverlay.classList.add('open', 'we3d-cart-open', 'pro3d-cart-open');
    cartOverlay.style.display = 'block';
    cartOverlay.style.visibility = 'visible';
    cartOverlay.style.opacity = '1';
    cartOverlay.style.pointerEvents = 'auto';
  }

  if (cartDrawer) {
    cartDrawer.classList.remove('hidden');
    cartDrawer.classList.add('open', 'we3d-cart-open', 'pro3d-cart-open');
    cartDrawer.removeAttribute('hidden');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartDrawer.style.display = 'block';
    cartDrawer.style.visibility = 'visible';
    cartDrawer.style.opacity = '1';
    cartDrawer.style.pointerEvents = 'auto';
    cartDrawer.style.transform = 'translateX(0)';
  }

  document.body.classList.add('cart-is-open', 'pro3d-cart-is-open');
}

function forceCloseCartDrawer() {
  if (cartOverlay) {
    cartOverlay.classList.remove('open', 'we3d-cart-open', 'pro3d-cart-open');
    cartOverlay.style.pointerEvents = 'none';
    cartOverlay.style.opacity = '';
    cartOverlay.style.visibility = '';
    cartOverlay.style.display = '';
  }

  if (cartDrawer) {
    cartDrawer.classList.remove('open', 'we3d-cart-open', 'pro3d-cart-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartDrawer.style.transform = '';
    cartDrawer.style.opacity = '';
    cartDrawer.style.visibility = '';
    cartDrawer.style.pointerEvents = '';
    cartDrawer.style.display = '';
  }

  document.body.classList.remove('cart-is-open', 'pro3d-cart-is-open');
}

function bindCartButtonsV119() {
  if (openCartBtn && !openCartBtn.dataset.v119CartBound) {
    openCartBtn.dataset.v119CartBound = '1';
    openCartBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      forceOpenCartDrawer();
    });
  }

  if (closeCartBtn && !closeCartBtn.dataset.v119CartBound) {
    closeCartBtn.dataset.v119CartBound = '1';
    closeCartBtn.addEventListener('click', (event) => {
      event.preventDefault();
      forceCloseCartDrawer();
    });
  }

  if (cartOverlay && !cartOverlay.dataset.v119CartBound) {
    cartOverlay.dataset.v119CartBound = '1';
    cartOverlay.addEventListener('click', (event) => {
      event.preventDefault();
      forceCloseCartDrawer();
    });
  }

  if (clearCartBtn && !clearCartBtn.dataset.v119CartBound) {
    clearCartBtn.dataset.v119CartBound = '1';
    clearCartBtn.addEventListener('click', (event) => {
      event.preventDefault();
      cart = [];
      saveCart();
      renderCart();
    });
  }

  if (checkoutBtn && !checkoutBtn.dataset.v119CartBound) {
    checkoutBtn.dataset.v119CartBound = '1';
    checkoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      forceCloseCartDrawer();
      if (typeof openCheckoutModal === 'function') {
        openCheckoutModal();
      } else if (checkoutSection) {
        checkoutSection.classList.remove('hidden');
        checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

bindCartButtonsV119();
document.addEventListener('DOMContentLoaded', bindCartButtonsV119);



window.openPro3DCart = openCart;
window.closePro3DCart = closeCart;

openCartBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  openCart();
});

closeCartBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeCart();
});

cartOverlay?.addEventListener('click', () => {
  closeCart();
});

cartDrawer?.addEventListener('click', (event) => {
  event.stopPropagation();
});

cartItems?.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('[data-remove]');
  if (!removeBtn) return;
  event.preventDefault();
  event.stopPropagation();
  const index = Number(removeBtn.dataset.remove);
  if (Number.isFinite(index) && index >= 0) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
refreshLanguage();

  }
});

if (clearCartBtn) {
  clearCartBtn.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    cart = [];
    localStorage.removeItem('pro3d_cart');
    renderCart();
refreshLanguage();

  };
}

checkoutCountry?.addEventListener('change', renderCart);

if (checkoutBtn) {
  checkoutBtn.onclick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeCart();
    await openCheckoutModal();
  };
}

closeCheckoutBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  closeCheckoutModal();
});

checkoutSection?.addEventListener('click', (event) => {
  if (event.target === checkoutSection) {
    closeCheckoutModal();
  }
});


document.querySelectorAll('input[name="customerType"]').forEach((input) => {
  if (!input.dataset.customerTypeV165Bound) {
    input.dataset.customerTypeV165Bound = '1';
    input.addEventListener('change', updateCheckoutCustomerTypeV165);
  }
});
updateCheckoutCustomerTypeV165();

checkoutForm?.addEventListener('submit', async e => {
  e.preventDefault();
  // V123 checkout business validation
  const account = await verifyAccountSession() || getStoredAccount();
  const selectedCustomerType = document.querySelector('input[name="customerType"]:checked')?.value || (account ? 'business' : 'private');
  const selectedPaymentMethod = checkoutPaymentMethod?.value || (account ? 'invoice' : 'direct');

  if (!account && selectedCustomerType === 'business') {
    if (!checkoutCompanyName?.value?.trim()) {
      orderResult.textContent = checkoutTextV165('companyRequired');
      return;
    }
    if (!checkoutVatNumber?.value?.trim()) {
      orderResult.textContent = checkoutTextV165('vatRequired');
      return;
    }
  }

  if (selectedPaymentMethod === 'invoice' && !getAccountToken()) {
    orderResult.textContent = checkoutTextV165('invoiceLogin');
    openAccountModal();
    return;
  }

  if (!cart.length) {
    orderResult.textContent = checkoutTextV165('emptyCart');
    return;
  }
  orderResult.textContent = checkoutTextV165('placing');
  try {
    const formCustomer = Object.fromEntries(new FormData(checkoutForm).entries());
    const verifiedAccount = getStoredAccount();
    const payload = {
      customer: verifiedAccount ? accountToCheckoutCustomer(verifiedAccount, formCustomer) : formCustomer,
      cart,
      shipping: estimateShipping(cart)
    };
    const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(getAccountToken() ? { Authorization: `Bearer ${getAccountToken()}` } : {}) }, body: JSON.stringify(payload) });
    const json = await readOrderJsonSafe(res);
    if (!json.ok) throw new Error(json.error || 'Bestelling plaatsen mislukt.');
    const orderNumber = json.orderNumber || json.orderId || 'aangemaakt';
    orderResult.textContent = '';
    showOrderSuccessV165(orderNumber);
    cart = [];
    saveCart();
    renderCart();
refreshLanguage();

    checkoutForm.reset();
    updateCheckoutCustomerTypeV165();
  } catch (err) {
    orderResult.textContent = err.message;
  }
});

quickQuestionForm?.addEventListener('submit', async e => {
  e.preventDefault();
  quickQuestionResult.textContent = 'Vraag wordt verstuurd...';
  try {
    const data = Object.fromEntries(new FormData(quickQuestionForm).entries());
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Versturen mislukt.');
    quickQuestionResult.textContent = 'Bedankt, je vraag is ontvangen.';
    quickQuestionForm.reset();
  } catch (err) {
    quickQuestionResult.textContent = err.message;
  }
});

function initViewer() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, viewer.clientWidth / viewer.clientHeight, 0.1, 10000);
  camera.position.set(90, 74, 90);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  viewer.appendChild(renderer.domElement);

  renderer.domElement.addEventListener('wheel', (event) => {
    event.stopPropagation();
    // Niet preventDefault: browser mag de pagina normaal scrollen.
  }, { passive: true });

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // Scrollwiel boven de 3D-viewer blijft de pagina scrollen. Model draaien kan met slepen.
  controls.enableZoom = false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.7));
  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(80, 120, 90);
  scene.add(dir);

  window.addEventListener('resize', () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  });
  animate();
}

function previewStl(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const loader = new STLLoader();
      const geometry = loader.parse(event.target.result);
      geometry.computeVertexNormals();
      geometry.center();
      if (currentMesh) scene.remove(currentMesh);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.05, color: 0xf7f7f7 });
      currentMesh = new THREE.Mesh(geometry, mat);
      scene.add(currentMesh);
      currentMesh.scale.setScalar(1);
      fitCameraToObject(currentMesh);
    } catch (err) {
      showError(`Preview fout: ${err.message}`);
    }
  };
  reader.readAsArrayBuffer(file);
}


function clearViewer() {
  try {
    if (currentMesh && scene) {
      scene.remove(currentMesh);
      if (currentMesh.geometry) currentMesh.geometry.dispose();
      if (currentMesh.material) currentMesh.material.dispose();
      currentMesh = null;
    }
    resetViewerCamera();
  } catch (err) {
    console.warn('Viewer leegmaken mislukt:', err);
  }
}


let stepPreviewRequestId = 0;

async function previewStepFast(file) {
  if (!file || !isStepFile(file)) return;

  const requestId = ++stepPreviewRequestId;
  const calculationIdAtStart = calculationRequestId;

  const canWritePreviewResult = () =>
    requestId === stepPreviewRequestId &&
    calculationIdAtStart === calculationRequestId &&
    resultState === 'step-preview' &&
    !lastCalculation &&
    !calculationInProgress;

  try {
    if (canWritePreviewResult()) {
      priceTitle.textContent = 'STEP-preview laden';
      resultBox.innerHTML = 'STEP wordt alvast naar STL omgezet voor de viewer...';
      refreshLanguage();
    }

    const data = new FormData();
    data.append('model', file);

    const res = await fetch('/api/preview-step', { method: 'POST', body: data });
    const json = await res.json();

    // Als gebruiker ondertussen nieuw bestand kiest of berekening start/klaar is: oude preview niet laten overschrijven.
    if (requestId !== stepPreviewRequestId) return;

    if (!json.ok) {
      if (canWritePreviewResult()) {
        resultBox.innerHTML = 'STEP-preview kon niet direct geladen worden. Je kunt nog wel bereken prijs proberen.';
        refreshLanguage();
      }
      return;
    }

    await previewStoredStl(json.storedFileName);

    if (canWritePreviewResult()) {
      priceTitle.textContent = 'STEP-preview geladen';
      resultBox.innerHTML = 'STEP is alvast omgezet en geladen in de viewer. Klik op bereken prijs voor de calculatie.';
      refreshLanguage();
    }
  } catch (err) {
    if (requestId !== stepPreviewRequestId) return;
    console.warn('Snelle STEP-preview mislukt:', err);
    if (canWritePreviewResult()) {
      resultBox.innerHTML = 'STEP-preview kon niet direct geladen worden. Je kunt nog wel bereken prijs proberen.';
      refreshLanguage();
    }
  }
}


async function previewStoredStl(storedFileName) {
  if (!storedFileName || !storedFileName.toLowerCase().endsWith('.stl')) return;

  try {
    const res = await fetch(`/api/quote-stl/${encodeURIComponent(storedFileName)}`);
    if (!res.ok) throw new Error('Geconverteerde STL kon niet geladen worden.');

    const blob = await res.blob();
    const convertedFile = new File([blob], storedFileName, { type: 'model/stl' });

    previewStl(convertedFile);
  } catch (err) {
    console.warn('Geconverteerde STEP/STL viewer laden mislukt:', err);
    showError(`Viewer fout: ${err.message}`);
  }
}


function zoomViewer(factor) {
  if (!camera || !controls) return;
  const target = controls.target.clone();
  const offset = camera.position.clone().sub(target);
  const currentDistance = offset.length();
  const nextDistance = Math.max(14, Math.min(1400, currentDistance * factor));
  offset.setLength(nextDistance);
  camera.position.copy(target.clone().add(offset));
  camera.updateProjectionMatrix();
  controls.update();
}


function fitCameraToObject(object, offset = 1.35) {
  if (!camera || !controls || !object) return;

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxSize = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(maxSize) || maxSize <= 0) {
    resetViewerCamera();
    return;
  }

  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = new THREE.Vector3(1, 0.82, 1).normalize();
  camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
  camera.near = Math.max(distance / 100, 0.1);
  camera.far = Math.max(distance * 100, 2000);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}


function resetViewerCamera() {
  if (!camera || !controls) return;
  camera.position.set(90, 74, 90);
  controls.target.set(0, 0, 0);
  camera.updateProjectionMatrix();
  controls.update();
}



if (viewerReset && !viewerReset.dataset.pro3dViewerResetBound) {
  viewerReset.dataset.pro3dViewerResetBound = '1';
  viewerReset.addEventListener('click', (event) => {
    event.preventDefault();
    resetViewerCamera();
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}



// V139: voorkom oude lokale accountgegevens die niet meer op server bestaan.
if (getAccountToken()) verifyAccountSession().then(() => updateCheckoutModeForAccount());
