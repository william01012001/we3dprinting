const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const cors = require('cors');
let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (err) { nodemailer = null; }

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_CODE = process.env.ADMIN_CODE || 'pro3dadmin2026';

app.use(cors());

// v178: stuur .com altijd door naar de .nl hoofdwebsite.
app.use((req, res, next) => {
  const host = String(req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
  if (host === 'pro3dmanufacturing.com' || host === 'www.pro3dmanufacturing.com') {
    return res.redirect(301, `https://www.pro3dmanufacturing.nl${req.originalUrl || '/'}`);
  }
  next();
});
const ORDER_STATUSES = {
  new: 'Nieuw',
  preparation: 'Voorbereiding',
  printing: '3D printen',
  shipping: 'Verzonden',
  completed: 'Afgerond'
};

function statusLabel(status) {
  return ORDER_STATUSES[status] || ORDER_STATUSES.new;
}

function safeOrderNumber(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function formatEuro(value) {
  return `€${Number(value || 0).toFixed(2)}`;
}

function formatOrderDate(value) {
  try { return new Date(value).toLocaleDateString('nl-NL'); } catch (_) { return String(value || ''); }
}

function orderDocHtml(order, type = 'quote') {
  const customer = order.customer || {};
  const totals = order.totals || {};
  const isInvoice = type === 'invoice';
  const title = isInvoice ? 'Factuur' : 'Offerte';
  const docNumber = `${isInvoice ? 'FACT' : 'OFF'}-${order.orderNumber || ''}`;
  const items = (order.items || []).map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>
        <strong>${escapeHtml(String(item.filename || '-'))}</strong><br>
        ${escapeHtml(String(item.technologyLabel || item.technology || '-'))} · ${escapeHtml(String(item.material || '-'))} · ${escapeHtml(String(item.color || '-'))}
      </td>
      <td>${escapeHtml(String(item.quantity || 1))}</td>
      <td>${formatEuro(item.totalPrice || 0)}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>${title} ${escapeHtml(order.orderNumber || '')}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#111;line-height:1.45}
    .top{display:flex;justify-content:space-between;gap:30px;border-bottom:2px solid #111;padding-bottom:18px;margin-bottom:26px}
    h1{margin:0;font-size:34px}
    .muted{color:#555}
    .box{border:1px solid #ddd;border-radius:12px;padding:16px;margin:16px 0}
    table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{border-bottom:1px solid #ddd;padding:10px;text-align:left;vertical-align:top}
    th{background:#f5f5f5}
    .totals{max-width:380px;margin-left:auto}
    .totals p{display:flex;justify-content:space-between;margin:8px 0}
    .total{font-size:20px;font-weight:bold;border-top:2px solid #111;padding-top:10px}
    @media print{button{display:none}body{margin:20px}}
  </style>
</head>
<body>
  <button onclick="window.print()">Print / opslaan als PDF</button>
  <div class="top">
    <div>
      <h1>${title}</h1>
      <p class="muted">${docNumber}</p>
      <p>Order: <strong>${escapeHtml(order.orderNumber || '-')}</strong><br>
      Datum: ${formatOrderDate(order.createdAt)}<br>
      Status: ${statusLabel(order.status)}</p>
    </div>
    <div>
      <h2>Pro3D Manufacturing</h2>
      <p>Honderdland 380<br>2676 LV Maasdijk<br>Nederland<br>info@Pro3DManufacturing.nl</p>
    </div>
  </div>

  <div class="box">
    <h3>Klant</h3>
    <p><strong>${escapeHtml(customer.companyName || customer.company || customer.name || '-')}</strong><br>
    ${escapeHtml(customer.name || '')}<br>
    ${escapeHtml(customer.email || '')}<br>
    ${escapeHtml(customer.address || customer.street || '')} ${escapeHtml(customer.houseNumber || '')}<br>
    ${escapeHtml(customer.postalCode || '')} ${escapeHtml(customer.city || '')}<br>
    ${escapeHtml(customer.country || '')}<br>
    ${customer.vatNumber ? `Btw: ${escapeHtml(customer.vatNumber)}` : ''}<br>
    ${customer.poNumber ? `PO / referentie: ${escapeHtml(customer.poNumber)}` : ''}</p>
  </div>

  <table>
    <thead><tr><th>#</th><th>Omschrijving</th><th>Aantal</th><th>Prijs excl. btw</th></tr></thead>
    <tbody>${items}</tbody>
  </table>

  <div class="totals">
    <p><span>Producten excl. btw</span><strong>${formatEuro(totals.productsExVat)}</strong></p>
    <p><span>Verzending excl. btw</span><strong>${formatEuro(totals.shippingExVat)}</strong></p>
    <p><span>Totaal excl. btw</span><strong>${formatEuro(totals.exVat)}</strong></p>
    <p><span>Btw 21%</span><strong>${formatEuro((Number(totals.inclVat || totals.inVat || 0) - Number(totals.exVat || 0)))}</strong></p>
    <p class="total"><span>Totaal incl. btw</span><strong>${formatEuro(totals.inclVat || totals.inVat)}</strong></p>
  </div>

  <p class="muted">${isInvoice ? 'Betaling volgens afspraak / op factuur indien van toepassing.' : 'Deze offerte is gebaseerd op de automatische calculatie en kan bij technische controle nog aangepast worden.'}</p>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function collectOrderFiles(order) {
  return (order.items || [])
    .map((item, index) => ({
      index,
      filename: item.filename || `bestand-${index + 1}`,
      path: item.uploadPath || item.filePath || ''
    }))
    .filter(file => file.path && fs.existsSync(file.path));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'uploads');
const quotesDir = path.join(__dirname, 'quotes');
const ordersDir = path.join(__dirname, 'orders');
const messagesDir = path.join(__dirname, 'messages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(quotesDir)) fs.mkdirSync(quotesDir);
if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir);
if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir);

const accountsDir = path.join(__dirname, 'data', 'accounts');
const sessionsDir = path.join(__dirname, 'data', 'sessions');
for (const dir of [accountsDir, sessionsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeEmailKey(email) {
  return String(email || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '_');
}
function readJsonSafe(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}
function writeJsonSafe(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password || ''), salt, 120000, 32, 'sha256').toString('hex');
  return { salt, hash };
}
function verifyPassword(password, account) {
  if (!account?.password?.salt || !account?.password?.hash) return false;
  const check = hashPassword(password, account.password.salt);
  return crypto.timingSafeEqual(Buffer.from(check.hash, 'hex'), Buffer.from(account.password.hash, 'hex'));
}
function getAccountByEmail(email) {
  const key = safeEmailKey(email);
  if (!key) return null;
  return readJsonSafe(path.join(accountsDir, `${key}.json`), null);
}
function saveAccount(account) {
  writeJsonSafe(path.join(accountsDir, `${safeEmailKey(account.email)}.json`), account);
}
function createSession(email) {
  const token = crypto.randomBytes(32).toString('hex');
  writeJsonSafe(path.join(sessionsDir, `${token}.json`), {
    token,
    email: String(email || '').trim().toLowerCase(),
    createdAt: new Date().toISOString()
  });
  return token;
}
function getSessionAccount(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const session = readJsonSafe(path.join(sessionsDir, `${token}.json`), null);
  if (!session?.email) return null;
  return getAccountByEmail(session.email);
}
function publicAccount(account) {
  if (!account) return null;
  return {
    email: account.email,
    name: account.name || '',
    firstName: account.firstName || '',
    lastName: account.lastName || '',
    companyName: account.companyName || '',
    vatNumber: account.vatNumber || '',
    street: account.street || '',
    houseNumber: account.houseNumber || '',
    postalCode: account.postalCode || '',
    city: account.city || '',
    country: account.country || 'Nederland',
    invoiceAllowed: !!account.invoiceAllowed,
    customerType: account.customerType || 'business'
  };
}


const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.stl', '.step'].includes(ext)) return cb(new Error('Alleen STL en STEP worden ondersteund.'));
    cb(null, true);
  }
});


function isStepPath(fileName) {
  return /\.step$/i.test(fileName || '');
}

function isStlPath(fileName) {
  return /\.stl$/i.test(fileName || '');
}

function freecadPythonEnv() {
  return {
    ...process.env,
    PYTHONPATH: process.env.PYTHONPATH || '/usr/lib/freecad-python3/lib',
    LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || '/usr/lib/freecad-python3/lib',
    QT_QPA_PLATFORM: 'offscreen',
    QTWEBENGINE_DISABLE_SANDBOX: '1',
    QTWEBENGINE_CHROMIUM_FLAGS: '--no-sandbox',
    HOME: '/tmp',
    XDG_RUNTIME_DIR: '/tmp/runtime-root'
  };
}

function convertStepToStl(inputPath, originalName = 'model.step') {
  const outputPath = path.join(uploadDir, `converted-${Date.now()}-${Math.random().toString(16).slice(2)}.stl`);
  const converterPath = path.join(__dirname, 'convert_step_to_stl.py');

  // Multer stores uploads without extension. FreeCAD needs .step/.step extension to detect the file format.
  const ext = path.extname(originalName || '').toLowerCase();
  const safeExt = ext === '.step' ? ext : '.step';
  const inputWithExt = path.join(uploadDir, `input-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  fs.copyFileSync(inputPath, inputWithExt);

  const result = spawnSync('python3', [converterPath, inputWithExt, outputPath], {
    cwd: __dirname,
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 16,
    env: freecadPythonEnv()
  });

  if (result.status === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100) {
    try { if (fs.existsSync(inputWithExt)) fs.unlinkSync(inputWithExt); } catch (_) {}
    return outputPath;
  }

  const detail = [
    `python3 exit ${result.status}`,
    result.stderr || '',
    result.stdout || ''
  ].join('\n').trim();

  if (fs.existsSync(outputPath)) {
    try { fs.unlinkSync(outputPath); } catch (_) {}
  }
  try { if (fs.existsSync(inputWithExt)) fs.unlinkSync(inputWithExt); } catch (_) {}

  throw new Error(`STEP conversie mislukt. ${detail}`);
}

function makeStepManualResponse(req, res, reason) {
  const quoteId = `STEP-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const storedFileName = `${quoteId}${path.extname(req.file.originalname).toLowerCase() || '.step'}`;
  const storedFilePath = path.join(quotesDir, storedFileName);
  fs.copyFileSync(req.file.path, storedFilePath);

  const materialKey = req.body.material || 'fdm_pla';
      const riskMarkupOverride = getMaterialRiskMarkup(materialKey);
  const material = MATERIALS[materialKey] || MATERIALS.fdm_pla;
  const manualReview = {
    required: true,
    reasons: [
      'STEP-bestand kon niet automatisch worden omgezet naar STL.',
      reason || 'Wij controleren dit bestand handmatig op prijs, materiaal en maakbaarheid.'
    ]
  };

  const quote = {
    quoteId,
    createdAt: new Date().toISOString(),
    originalFilename: req.file.originalname,
    storedFileName,
    analysis: null,
    price: { totalPrice: 0, totalInclVat: 0, pricePerPart: 0, manualReview },
    fit: null,
    manualReview,
    choices: {
      materialKey,
      quantity: req.body.quantity || 1,
      color: req.body.color || '',
      foodgrade: req.body.foodgrade || false,
      fileType: 'step'
    }
  };

  fs.writeFileSync(path.join(quotesDir, `${quoteId}.json`), JSON.stringify(quote, null, 2), 'utf8');

  res.json({
    ok: false,
    stepConversionFailed: true,
    serverMemoryError: true,
    quoteId,
    filename: req.file.originalname,
    storedFileName,
    error: `STEP conversie mislukt. ${reason || 'Geen detailfout beschikbaar.'}`,
    userMessage: 'Verstuur een aanvraag, dan controleren we het handmatig.',
    detail: reason || '',
    manualReview,
    material: { key: materialKey, label: material.label, technology: material.technology }
  });
}


const PRINTERS = {
  fdm: {
    label: 'FDM printformaat',
    buildVolume: { x: 325, y: 320, z: 325 },
    note: 'Maximaal formaat voor FDM printen.'
  },
  sla: {
    label: 'SLA printformaat',
    buildVolume: { x: 298, y: 164, z: 300 },
    note: 'Maximaal formaat voor SLA resin printen.'
  },
  sls: {
    label: 'SLS printformaat',
    buildVolume: { x: 220, y: 220, z: 350 },
    note: 'Maximaal formaat voor SLS nylon printen.'
  }
};

const MATERIALS = {
  fdm_pla: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'PLA Basic',
    density: 1.24, materialEuroPerKg: 14, machineEuroPerHour: 1.0, setup: 0, minimum: 8, finishFactor: 1.0
  },
  fdm_petg: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'PETG Basic',
    density: 1.28, materialEuroPerKg: 14, machineEuroPerHour: 1.0, setup: 0, minimum: 8, finishFactor: 1.0
  },
  fdm_petg_cf: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'PETG-CF',
    density: 1.3, materialEuroPerKg: 33, machineEuroPerHour: 1.0, setup: 0, minimum: 10, finishFactor: 1.0, markup: 0.50
  },
  fdm_tpu85: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'TPU 85A',
    density: 1.2, materialEuroPerKg: 44, machineEuroPerHour: 1.0, setup: 0, minimum: 12, finishFactor: 1.0, markup: 0.50
  },
  fdm_tpu90: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'TPU 90A',
    density: 1.2, materialEuroPerKg: 44, machineEuroPerHour: 1.0, setup: 0, minimum: 12, finishFactor: 1.0, markup: 0.50
  },
  fdm_asa: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'ASA',
    density: 1.05, materialEuroPerKg: 25, machineEuroPerHour: 1.0, setup: 0, minimum: 8, finishFactor: 1.0, markup: 0.50
  }, 
  fdm_abs: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'ABS',
    density: 1.04, materialEuroPerKg: 14, machineEuroPerHour: 1.0, setup: 0, minimum: 8, finishFactor: 1.0, markup: 0.50
  },
  fdm_pc: {
    technology: 'fdm', technologyLabel: 'FDM filament', label: 'PC',
    density: 1.2, materialEuroPerKg: 43, machineEuroPerHour: 1.0, setup: 0, minimum: 14, finishFactor: 1.0
  },
  sla_standard_v2: {
    technology: 'sla', technologyLabel: 'SLA resin', label: 'Standard Resin V2',
    density: 1.15, materialEuroPerKg: 22, machineEuroPerHour: 1.0, setup: 0, minimum: 18, finishFactor: 1.0
  },
  sla_tough_2: {
    technology: 'sla', technologyLabel: 'SLA resin', label: 'Tough Resin 2.0',
    density: 1.13, materialEuroPerKg: 34, machineEuroPerHour: 1.0, setup: 0, minimum: 20, finishFactor: 1.0
  },
  sla_abs_pro_2: {
    technology: 'sla', technologyLabel: 'SLA resin', label: 'ABS-Like Resin Pro 2',
    density: 1.15, materialEuroPerKg: 25, machineEuroPerHour: 1.0, setup: 0, minimum: 20, finishFactor: 1.0
  },
  sla_craftsman: {
    technology: 'sla', technologyLabel: 'SLA resin', label: 'DLP Craftsman Resin',
    density: 1.12, materialEuroPerKg: 25, machineEuroPerHour: 1.0, setup: 0, minimum: 20, finishFactor: 1.0
  },
  sls_pa12: {
    technology: 'sls', technologyLabel: 'SLS nylon', label: 'PA12 Nylon',
    density: 0.95, materialEuroPerKg: 65, machineEuroPerHour: 4.0, setup: 40, minimum: 28, finishFactor: 1.05
  },
  sls_pa11: {
    technology: 'sls', technologyLabel: 'SLS nylon', label: 'PA11 Nylon',
    density: 1.03, materialEuroPerKg: 65, machineEuroPerHour: 4.0, setup: 45, minimum: 32, finishFactor: 1.08
  }
};

const ALLOWED_COLORS = {
  fdm: ['wit', 'zwart', 'blauw'],
  sla: ['grijs', 'wit', 'zwart'],
  sls: ['zwart'],
  sls_foodgrade: ['wit', 'blauw']
};

// Interne kostprijsinstellingen - niet zichtbaar voor klanten.
// De klant ziet alleen de verkoopprijs en productkeuzes.
const COST_SETTINGS = {
  electricityEuroPerHour: 0.50,
  markupPercent: 40,
  labourEuroPerHour: 50,
  labourHoursPerOrder: {
    fdm: 15 / 60,
    sla: 30 / 60,
    sls: 1.5
  },
  machineEuroPerHour: {
    fdm: 1,
    sla: 1,
    sls: 4
  }
};

function round(n, d = 2) {
  return Number.isFinite(n) ? Number(n.toFixed(d)) : 0;
}

function vecSub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function cross(a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function dot(a, b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function mag(a) { return Math.sqrt(dot(a,a)); }
function normalize(a) { const m = mag(a) || 1; return [a[0]/m, a[1]/m, a[2]/m]; }

function triangleArea(a, b, c) {
  return 0.5 * mag(cross(vecSub(b, a), vecSub(c, a)));
}

function signedTetVolume(a, b, c) {
  return dot(a, cross(b, c)) / 6.0;
}

function parseAsciiStl(text) {
  const vertexRegex = /vertex\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
  const vertices = [];
  let m;
  while ((m = vertexRegex.exec(text)) !== null) {
    vertices.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  if (vertices.length < 3 || vertices.length % 3 !== 0) throw new Error('Ongeldig ASCII STL bestand.');
  const triangles = [];
  for (let i = 0; i < vertices.length; i += 3) triangles.push([vertices[i], vertices[i+1], vertices[i+2]]);
  return triangles;
}

function parseBinaryStl(buffer) {
  if (buffer.length < 84) throw new Error('Ongeldig binary STL bestand.');
  const triCount = buffer.readUInt32LE(80);
  const expected = 84 + triCount * 50;
  if (expected > buffer.length) throw new Error('Ongeldig binary STL bestand: bestand is te klein voor aantal triangles.');
  const triangles = [];
  let offset = 84;
  for (let i = 0; i < triCount; i++) {
    offset += 12; // normal vector
    const a = [buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8)]; offset += 12;
    const b = [buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8)]; offset += 12;
    const c = [buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8)]; offset += 12;
    offset += 2; // attribute byte count
    triangles.push([a, b, c]);
  }
  return triangles;
}

function parseStl(buffer) {
  // Binary STL can also start with "solid", so validate by size first.
  if (buffer.length >= 84) {
    const triCount = buffer.readUInt32LE(80);
    const expected = 84 + triCount * 50;
    if (expected === buffer.length) return parseBinaryStl(buffer);
  }
  const text = buffer.toString('utf8');
  return parseAsciiStl(text);
}

function edgeKey(p1, p2) {
  const a = p1.map(v => round(v, 5)).join(',');
  const b = p2.map(v => round(v, 5)).join(',');
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}


// V132 large STL fix: low-memory binary STL processing.
// Grote STL's worden niet meer volledig als triangle-array én edge-map in geheugen gezet.
const LARGE_STL_EDGE_LIMIT = Number(process.env.LARGE_STL_EDGE_LIMIT || 250000);

function getBinaryStlInfo(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 84) return null;
  const triCount = buffer.readUInt32LE(80);
  const expected = 84 + (triCount * 50);
  if (!Number.isFinite(triCount) || triCount <= 0) return null;
  if (expected > buffer.length) return null;
  return { triCount, expected };
}

function forEachBinaryStlTriangle(buffer, callback) {
  const info = getBinaryStlInfo(buffer);
  if (!info) return false;

  let offset = 84;
  for (let i = 0; i < info.triCount; i++) {
    offset += 12; // normal vector
    const a = [buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8)]; offset += 12;
    const b = [buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8)]; offset += 12;
    const c = [buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8)]; offset += 12;
    offset += 2; // attribute byte count
    callback(a, b, c, i);
  }

  return true;
}


function analyzeStl(filePath) {
  const buffer = fs.readFileSync(filePath);
  const binaryInfo = getBinaryStlInfo(buffer);

  if (binaryInfo) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let area = 0;
    let volumeSigned = 0;

    const useEdgeMap = binaryInfo.triCount <= LARGE_STL_EDGE_LIMIT;
    const edges = useEdgeMap ? new Map() : null;

    forEachBinaryStlTriangle(buffer, (a, b, c) => {
      for (const p of [a, b, c]) {
        minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); minZ = Math.min(minZ, p[2]);
        maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); maxZ = Math.max(maxZ, p[2]);
      }

      area += triangleArea(a, b, c);
      volumeSigned += signedTetVolume(a, b, c);

      if (edges) {
        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
          const key = edgeKey(u, v);
          edges.set(key, (edges.get(key) || 0) + 1);
        }
      }
    });

    let badEdges = 0;
    let manifoldScore = null;
    let isLikelyWatertight = true;

    if (edges) {
      for (const count of edges.values()) if (count !== 2) badEdges++;
      manifoldScore = edges.size === 0 ? 0 : 1 - (badEdges / edges.size);
      isLikelyWatertight = badEdges === 0;
    }

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const volumeMm3 = Math.abs(volumeSigned);
    const surfaceMm2 = area;

    return {
      triangles: binaryInfo.triCount,
      dimensionsMm: { x: round(sizeX), y: round(sizeY), z: round(sizeZ) },
      boundingBoxVolumeCm3: round((sizeX * sizeY * sizeZ) / 1000, 2),
      modelVolumeCm3: round(volumeMm3 / 1000, 3),
      surfaceAreaCm2: round(surfaceMm2 / 100, 2),
      isLikelyWatertight,
      nonManifoldEdges: edges ? badEdges : null,
      manifoldScore: manifoldScore === null ? null : round(manifoldScore * 100, 1),
      largeStlOptimized: !edges,
      analysisMode: edges ? 'full_binary' : 'large_stl_low_memory'
    };
  }

  // ASCII STL fallback. Voor extreem grote ASCII STL kan dit zwaar blijven,
  // maar de crash die gemeld werd komt typisch door grote binary STL's.
  const triangles = parseStl(buffer);
  if (triangles.length === 0) throw new Error('Geen triangles gevonden in STL.');

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let area = 0;
  let volumeSigned = 0;

  const useEdgeMap = triangles.length <= LARGE_STL_EDGE_LIMIT;
  const edges = useEdgeMap ? new Map() : null;

  for (const tri of triangles) {
    const [a, b, c] = tri;
    for (const p of tri) {
      minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); minZ = Math.min(minZ, p[2]);
      maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); maxZ = Math.max(maxZ, p[2]);
    }

    area += triangleArea(a, b, c);
    volumeSigned += signedTetVolume(a, b, c);

    if (edges) {
      for (const [u, v] of [[a, b], [b, c], [c, a]]) {
        const key = edgeKey(u, v);
        edges.set(key, (edges.get(key) || 0) + 1);
      }
    }
  }

  let badEdges = 0;
  let manifoldScore = null;
  let isLikelyWatertight = true;

  if (edges) {
    for (const count of edges.values()) if (count !== 2) badEdges++;
    manifoldScore = edges.size === 0 ? 0 : 1 - (badEdges / edges.size);
    isLikelyWatertight = badEdges === 0;
  }

  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;
  const volumeMm3 = Math.abs(volumeSigned);
  const surfaceMm2 = area;

  return {
    triangles: triangles.length,
    dimensionsMm: { x: round(sizeX), y: round(sizeY), z: round(sizeZ) },
    boundingBoxVolumeCm3: round((sizeX * sizeY * sizeZ) / 1000, 2),
    modelVolumeCm3: round(volumeMm3 / 1000, 3),
    surfaceAreaCm2: round(surfaceMm2 / 100, 2),
    isLikelyWatertight,
    nonManifoldEdges: edges ? badEdges : null,
    manifoldScore: manifoldScore === null ? null : round(manifoldScore * 100, 1),
    largeStlOptimized: !edges,
    analysisMode: edges ? 'full_ascii' : 'large_ascii_reduced_edges'
  };
}

function estimateAutoSupportPercent(filePath, technology) {
  // SLS heeft geen support nodig.
  if (technology === 'sls') return 0;

  const buffer = fs.readFileSync(filePath);
  const binaryInfo = getBinaryStlInfo(buffer);

  let totalDownwardArea = 0;
  let severeOverhangArea = 0;
  let mildOverhangArea = 0;
  let undersideArea = 0;
  let totalArea = 0;

  const consumeTriangle = (a, b, c) => {
    const area = triangleArea(a, b, c);
    if (!Number.isFinite(area) || area <= 0) return;
    totalArea += area;

    const n = normalize(cross(vecSub(b, a), vecSub(c, a)));

    if (n[2] < -0.15) {
      totalDownwardArea += area;
      if (n[2] < -0.75) undersideArea += area;
      else if (n[2] < -0.50) severeOverhangArea += area;
      else mildOverhangArea += area;
    }
  };

  if (binaryInfo) {
    forEachBinaryStlTriangle(buffer, consumeTriangle);
  } else {
    const triangles = parseStl(buffer);
    if (!triangles.length) return 0;
    for (const tri of triangles) consumeTriangle(tri[0], tri[1], tri[2]);
  }

  if (totalArea <= 0) return 0;

  const downwardRatio = totalDownwardArea / totalArea;
  const severeRatio = severeOverhangArea / totalArea;
  const undersideRatio = undersideArea / totalArea;
  const mildRatio = mildOverhangArea / totalArea;

  let percent;
  if (technology === 'fdm') {
    percent = (mildRatio * 8) + (severeRatio * 30) + (undersideRatio * 42) + (downwardRatio * 5);
    return Math.max(0, Math.min(35, round(percent, 1)));
  }

  if (technology === 'sla') {
    percent = (mildRatio * 5) + (severeRatio * 18) + (undersideRatio * 25) + (downwardRatio * 3);
    return Math.max(0, Math.min(25, round(percent, 1)));
  }

  return 0;
}


function assessManualReview(analysis, technology, autoSupportPercent) {
  const reasons = [];
  const maxDim = Math.max(analysis.dimensionsMm.x, analysis.dimensionsMm.y, analysis.dimensionsMm.z);
  const minDim = Math.min(analysis.dimensionsMm.x, analysis.dimensionsMm.y, analysis.dimensionsMm.z);
  const surfaceToVolume = analysis.modelVolumeCm3 > 0 ? analysis.surfaceAreaCm2 / analysis.modelVolumeCm3 : 0;
  const fillRatio = analysis.boundingBoxVolumeCm3 > 0 ? analysis.modelVolumeCm3 / analysis.boundingBoxVolumeCm3 : 1;

  // SLS mag altijd direct besteld worden als het model binnen de maximale maatvoering past.
  if (technology === 'sls') {
    return {
      required: false,
      reasons: [],
      surfaceToVolume: round(surfaceToVolume, 2),
      fillRatio: round(fillRatio * 100, 2)
    };
  }

  if (technology === 'fdm') {
    // V57: FDM iets soepeler.
    // Vlakke, simpele onderdelen mogen direct door.
    // Alleen duidelijke risico's gaan naar aanvraag:
    // wire/lijntjes, erg dunne delen, veel support/overhang, extreem organisch of extreem leeg volume.

    const veryWireLike = fillRatio < 0.025 && maxDim > 30;
    const highSurfaceModel = surfaceToVolume > 28 && maxDim > 35;
    const thinOpenShape = fillRatio < 0.055 && surfaceToVolume > 16 && maxDim > 45;

    if (veryWireLike) {
      reasons.push('Het model lijkt dunne lijnen/wire-achtige vormen te bevatten. FDM moet handmatig gecontroleerd worden.');
    }

    if (highSurfaceModel) {
      reasons.push('Het model heeft extreem veel oppervlak ten opzichte van volume. Dit wijst vaak op dunne details of een organische vorm die lastig FDM te printen is.');
    }

    if (thinOpenShape) {
      reasons.push('Het model heeft weinig materiaalvolume binnen de buitenafmetingen. Dit kan wijzen op dunne delen, losse lijnen of lastige support/oriëntatie.');
    }

    if (autoSupportPercent > 25) {
      reasons.push('FDM lijkt duidelijke support of overhang nodig te hebben. We controleren eerst of dit netjes te printen is.');
    }

    if (minDim < 0.7 && maxDim > 35) {
      reasons.push('Het model bevat mogelijk erg dunne delen rond 1 mm. We controleren eerst of dit sterk genoeg te printen is.');
    }

    if (analysis.triangles > 300000 && surfaceToVolume > 8) {
      reasons.push('Het STL-bestand is erg gedetailleerd/organisch. Handmatige controle voorkomt print- en slicerproblemen.');
    }

    if (maxDim > 140 && (surfaceToVolume > 9 || fillRatio < 0.12 || autoSupportPercent > 12)) {
      reasons.push('Groot FDM-model met mogelijk lastige vorm. Oriëntatie, support en levertijd moeten gecontroleerd worden.');
    }

    // Niet-watertight alleen als extra waarschuwing als er al andere FDM-risico's zijn.
    if ((!analysis.isLikelyWatertight || analysis.nonManifoldEdges > 0) && reasons.length > 0) {
      reasons.push('Het STL-model lijkt ook niet volledig gesloten/watertight. Dit controleren we mee in de aanvraag.');
    }
  }

  if (technology === 'sla') {
    // SLA is veel soepeler dan FDM.
    if (!analysis.isLikelyWatertight && analysis.nonManifoldEdges > 1500) {
      reasons.push('Het resin-model lijkt extreem veel open randen te hebben. Handmatige controle voorkomt mislukte prints.');
    }

    if (analysis.triangles > 1500000) {
      reasons.push('Het STL-bestand is extreem zwaar/gedetailleerd. Handmatige controle voorkomt fouten in verwerking.');
    }

    if (fillRatio < 0.004 && maxDim > 180) {
      reasons.push('Het model heeft extreem veel lege ruimte/dunne vormen. Resin-oriëntatie en verpakking vragen controle.');
    }

    if (minDim < 0.35 && maxDim > 25) {
      reasons.push('Het model bevat mogelijk extreem dunne details onder ongeveer 0,35 mm. We controleren of dit met SLA betrouwbaar lukt.');
    }

    if (autoSupportPercent > 45 && maxDim > 120) {
      reasons.push('Het model vraagt zeer veel resin-support. We controleren eerst de beste oriëntatie en prijs.');
    }
  }

  return {
    required: reasons.length > 0,
    reasons,
    surfaceToVolume: round(surfaceToVolume, 2),
    fillRatio: round(fillRatio * 100, 2)
  };
}

function getSlaSecondsPerLayer(layerHeightMm) {
  const lh = Number(layerHeightMm || 0.05);
  if (Math.abs(lh - 0.03) < 0.001) return 3.8;
  if (Math.abs(lh - 0.05) < 0.001) return 4.2;
  if (Math.abs(lh - 0.10) < 0.001) return 4.7;
  return 4.2;
}

function estimatePrintHours(analysis, materialKey, layerHeightMm = null, materialVolumeCm3 = null) {
  const solidVol = analysis.modelVolumeCm3;
  const z = analysis.dimensionsMm.z;
  const material = MATERIALS[materialKey];
  const technology = material?.technology || 'fdm';

  if (technology === 'fdm') {
    // FDM tijd wordt gebaseerd op geschat geprint volume, niet op massief STL-volume.
    // Minder infill = altijd minder of gelijke tijd.
    const lh = Number(layerHeightMm || 0.20);
    const layerFactor = 0.20 / Math.max(0.10, Math.min(0.24, lh));
    const printVol = Math.max(0, Number(materialVolumeCm3 || solidVol));
    return Math.max(0.25, (printVol / 18) * layerFactor + (z / 420));
  }

  if (technology === 'sla') {
    // SLA tijd: echte laag-gebaseerde schatting.
    // Per laaghoogte: 0,03 mm = 3,8 sec, 0,05 mm = 4,2 sec, 0,10 mm = 4,7 sec.
    // SLA printtijd hangt vooral af van Z-hoogte / laaghoogte.
    const lh = Math.max(0.03, Math.min(0.10, Number(layerHeightMm || 0.05)));
    const layers = Math.max(1, Math.ceil(z / lh));
    const secondsPerLayer = getSlaSecondsPerLayer(lh);
    const exposureHours = (layers * secondsPerLayer) / 3600;

    // Extra marge voor lift/retract, resin settling en grote doorsnedes.
    const printVol = Math.max(0, Number(materialVolumeCm3 || solidVol));
    const liftAndSettlingHours = Math.max(0.15, exposureHours * 0.18);
    const volumeHandlingHours = printVol / 2200;

    return Math.max(0.5, exposureHours + liftAndSettlingHours + volumeHandlingHours);
  }

  if (technology === 'sls') {
    // SLS is batch-achtig: materiaal is belangrijker dan uren; uren rustig inschatten.
    const printVol = Math.max(0, Number(materialVolumeCm3 || solidVol));
    return Math.max(0.25, (z / 150) + (printVol / 1000));
  }
  return 1;
}

function checkBuildVolume(analysis, technology) {
  const printer = PRINTERS[technology];
  if (!printer) return { fits: true, printer: null, message: null };
  const dims = [analysis.dimensionsMm.x, analysis.dimensionsMm.y, analysis.dimensionsMm.z].sort((a, b) => b - a);
  const limits = [printer.buildVolume.x, printer.buildVolume.y, printer.buildVolume.z].sort((a, b) => b - a);
  const fits = dims.every((d, i) => d <= limits[i] + 0.001);
  const techLabel = String(technology || '').toUpperCase();
  const message = fits
    ? `Past binnen het maximale printformaat: ${printer.buildVolume.x} × ${printer.buildVolume.y} × ${printer.buildVolume.z} mm.`
    : `Helaas zijn de afmetingen te groot voor onze printer. U kunt altijd contact opnemen met ons voor een oplossing.`;
  return { fits, printer, message };
}

function validateColor(material, color, foodgrade) {
  const key = material.technology === 'sls' && foodgrade ? 'sls_foodgrade' : material.technology;
  const allowed = ALLOWED_COLORS[key] || [];
  const normalized = String(color || allowed[0] || '').toLowerCase();
  if (!allowed.includes(normalized)) {
    throw new Error(`Kleur ${color} is niet mogelijk voor deze keuze. Kies: ${allowed.join(', ')}.`);
  }
  return normalized;
}

function calculatePrice(analysis, materialKey, quantity = 1, infillPercent = 20, marginPercent = 35, supportPercent = 15, color = '', foodgrade = false, infillType = 'grid', wallThicknessMm = 0.8, layerHeightMm = null) {
  const m = MATERIALS[materialKey];
  if (!m) throw new Error('Onbekend materiaal.');

  quantity = Math.max(1, parseInt(quantity || 1, 10));
  infillPercent = Math.max(0, Math.min(100, Number(infillPercent || 20)));
  marginPercent = Math.max(0, Math.min(300, Number(marginPercent || 35)));
  supportPercent = Math.max(0, Math.min(200, Number(supportPercent || 15)));
  wallThicknessMm = Math.max(0.4, Math.min(10, Number(wallThicknessMm || 0.4)));
  infillType = String(infillType || 'grid').toLowerCase();
  foodgrade = foodgrade === true || foodgrade === 'on' || foodgrade === 'true';

  if (m.technology === 'fdm') {
    const allowedLayerHeights = [0.10, 0.12, 0.16, 0.20, 0.24];
    layerHeightMm = Number(layerHeightMm || 0.20);
    if (!allowedLayerHeights.some(v => Math.abs(v - layerHeightMm) < 0.001)) throw new Error('Ongeldige laaghoogte voor FDM.');
  } else if (m.technology === 'sla') {
    const allowedLayerHeights = [0.03, 0.05, 0.10];
    layerHeightMm = Number(layerHeightMm || 0.05);
    if (!allowedLayerHeights.some(v => Math.abs(v - layerHeightMm) < 0.001)) throw new Error('Ongeldige laaghoogte voor SLA.');
  } else {
    layerHeightMm = null;
  }

  if (foodgrade && m.technology !== 'sls') throw new Error('Foodgrade optie is alleen voor SLS beschikbaar.');
  const normalizedColor = validateColor(m, color, foodgrade);

  let effectiveVolumeCm3 = analysis.modelVolumeCm3;

  let infillTypeFactor = 1.0;
  if (m.technology === 'fdm') {
    const allowedInfillTypes = {
      grid: 1.00,
      gyroid: 1.10,
      cubic: 1.08,
      lines: 0.92,
      honeycomb: 1.18
    };
    if (!Object.keys(allowedInfillTypes).includes(infillType)) {
      throw new Error('Onbekend infill type.');
    }
    infillTypeFactor = allowedInfillTypes[infillType];

    // V171 FDM gewicht: oppervlak + wanddikte + infill, geen massieve ondergrens.
    // Dit sluit beter aan bij hoe een slicer materiaal opbouwt:
    // buitenwanden/top-bottom via oppervlak, binnenvolume via infillpercentage.
    const solidVolumeCm3 = Math.max(0, Number(analysis.modelVolumeCm3 || 0));
    const surfaceAreaCm2 = Math.max(0, Number(analysis.surfaceAreaCm2 || 0));
    const wallCm = Math.max(0.04, wallThicknessMm / 10);

    // Wand/top-bottom materiaal: oppervlak × wanddikte.
    // Factor 0.42 corrigeert dat een STL-oppervlak dubbel/complex kan zijn en dat niet elke driehoek volle wanddikte toevoegt.
    const shellVolumeRawCm3 = surfaceAreaCm2 * wallCm * 0.42;
    const shellVolumeCm3 = Math.min(solidVolumeCm3 * 0.62, Math.max(solidVolumeCm3 * 0.08, shellVolumeRawCm3));

    // Infill alleen over het overgebleven interne volume.
    const internalVolumeCm3 = Math.max(0, solidVolumeCm3 - shellVolumeCm3);
    const infillVolumeCm3 = internalVolumeCm3 * (infillPercent / 100) * infillTypeFactor;

    // Kleine extra voor flow/overlap/top-bottom onregelmatigheden, maar niet belachelijk hoog.
    const flowAndOverlapFactor = 1.08;

    effectiveVolumeCm3 = (shellVolumeCm3 + infillVolumeCm3) * flowAndOverlapFactor;

    // Veiligheidsbegrenzing: FDM schatting mag nooit meer dan massief materiaal worden.
    effectiveVolumeCm3 = Math.min(solidVolumeCm3, Math.max(0, effectiveVolumeCm3));  }

  let supportVolumeCm3 = 0;
  if (m.technology !== 'sls') {
    // FDM-support kan relatief veel materiaal kosten; SLA-support is lichter met dunne contactpunten.
    const supportMaterialFactor = m.technology === 'sla' ? 0.08 : 0.25;
    supportVolumeCm3 = effectiveVolumeCm3 * (supportPercent / 100) * supportMaterialFactor;
    if (m.technology === 'fdm') supportVolumeCm3 = Math.min(supportVolumeCm3, effectiveVolumeCm3 * 0.12);
    if (m.technology === 'sla') supportVolumeCm3 = Math.min(supportVolumeCm3, effectiveVolumeCm3 * 0.04);
  }

  let totalMaterialVolumeCm3 = effectiveVolumeCm3 + supportVolumeCm3;

  // V172: SLA heeft resinverlies door supports, vat-drain, wash/cure en mislukrisico.
  // Dit maakt materiaalprijs realistischer zonder echte slicer toe te voegen.
  if (m.technology === 'sla') {
    totalMaterialVolumeCm3 *= 1.15;
  }

  const weightG = totalMaterialVolumeCm3 * m.density;
  const materialCost = (weightG / 1000) * m.materialEuroPerKg;

  let printHours = estimatePrintHours(analysis, materialKey, layerHeightMm, totalMaterialVolumeCm3);
  if (m.technology === 'fdm') {
    // Alleen een kleine factor voor patroon/wand; volume zit al in totalMaterialVolumeCm3.
    printHours = printHours * (0.98 + (infillPercent / 100) * 0.05) * infillTypeFactor;
  }
  if (m.technology === 'sla') {
    // SLA-support telt mee, maar niet extreem. Resin support is meestal lichter dan FDM support.
    printHours = printHours * (1 + Math.min(0.025, supportPercent / 1000));
  }

  const machineRate = COST_SETTINGS.machineEuroPerHour[m.technology] ?? m.machineEuroPerHour;
  const labourHours = COST_SETTINGS.labourHoursPerOrder[m.technology] ?? 0;
  const labourCost = labourHours * COST_SETTINGS.labourEuroPerHour;
  const foodgradeSurcharge = foodgrade ? 20 : 0;

  // Serieprijs: arbeid/opstart wordt maar 1x per opdracht gerekend.
  // Machine- en stroomkosten krijgen een kleine batchkorting bij hogere aantallen.
  function quantityFactor(q) {
    // V164: vloeiende seriekorting zonder harde sprongen.
    // 1 stuk = 0% korting, 1000+ stuks = maximaal 50% korting.
    const clampedQuantity = Math.max(1, Math.min(1000, Number(q) || 1));
    const progress = Math.log10(clampedQuantity) / Math.log10(1000);
    const maxDiscount = 0.50;
    const discount = maxDiscount * progress;
    return 1 - discount;
  }

  const qFactor = quantityFactor(quantity);
  const machineCost = printHours * machineRate * qFactor;
  const electricityCost = printHours * COST_SETTINGS.electricityEuroPerHour * qFactor;
  const productionOne = materialCost + machineCost + electricityCost;

  // Interne kostprijs: materiaal + machine + stroom per stuk, plus arbeid 1x per opdracht.
  // Opslag/marge wordt NIET over arbeid gerekend.
  // Normaal blijft 40%. Risicomaterialen met m.markup gebruiken 50%.
  const effectiveMarkupPercent = typeof m.markup === 'number'
    ? Math.round(m.markup * 100)
    : COST_SETTINGS.markupPercent;

  const productionTotal = foodgradeSurcharge + (productionOne * quantity);
  const productionWithMarkup = productionTotal * (1 + effectiveMarkupPercent / 100);
  let total = Math.max(m.minimum, labourCost + productionWithMarkup);

  // Veiligheidsregel: risicovol FDM-materiaal mag bij dezelfde print niet goedkoper zijn dan PLA.
  // PLA zelf blijft ongewijzigd; dit verhoogt alleen risicomaterialen als ze door lagere dichtheid goedkoper zouden uitvallen.
  if (m.technology === 'fdm' && materialKey !== 'fdm_pla' && typeof m.markup === 'number') {
    const pla = MATERIALS.fdm_pla;
    const plaWeightG = totalMaterialVolumeCm3 * pla.density;
    const plaMaterialCost = (plaWeightG / 1000) * pla.materialEuroPerKg;
    const plaProductionOne = plaMaterialCost + machineCost + electricityCost;
    const plaProductionTotal = foodgradeSurcharge + (plaProductionOne * quantity);
    const plaProductionWithMarkup = plaProductionTotal * (1 + COST_SETTINGS.markupPercent / 100);
    const plaTotal = Math.max(pla.minimum, labourCost + plaProductionWithMarkup);
    total = Math.max(total, plaTotal);
  }

  const averagePiecePrice = total / quantity;

  return {
    technology: m.technology,
    technologyLabel: m.technologyLabel,
    material: m.label,
    color: normalizedColor.charAt(0).toUpperCase() + normalizedColor.slice(1),
    foodgrade,
    quantity,
    infillPercent: m.technology === 'fdm' ? infillPercent : null,
    infillType: m.technology === 'fdm' ? infillType : null,
    wallThicknessMm: m.technology === 'fdm' ? round(wallThicknessMm, 2) : null,
    layerHeightMm: layerHeightMm ? round(layerHeightMm, 2) : null,
    supportPercent: m.technology === 'sls' ? 0 : supportPercent,
    markupPercent: effectiveMarkupPercent,
    printHoursPerPart: round(printHours, 2),
    materialVolumeCm3PerPart: round(totalMaterialVolumeCm3, 2),
    weightGPerPart: round(weightG, 2),
    totalWeightG: round(weightG * quantity, 2),
    weightG: round(weightG * quantity, 2),
    materialCostPerPart: round(materialCost, 2),
    machineCostPerPart: round(machineCost, 2),
    electricityCostPerPart: round(electricityCost, 2),
    labourCostPerOrder: round(labourCost, 2),
    foodgradeSurcharge: round(foodgradeSurcharge, 2),
    pricePerPart: round(averagePiecePrice, 2),
    totalPrice: round(total, 2),
    vat21: round(total * 0.21, 2),
    totalInclVat: round(total * 1.21, 2)
  };
}


app.get('/api/cad-health', (req, res) => {
  const converterPath = path.join(__dirname, 'convert_step_to_stl.py');
  try {
    const result = spawnSync('python3', [converterPath, 'HEALTH'], {
      cwd: __dirname,
      encoding: 'utf8',
      timeout: 60000,
      maxBuffer: 1024 * 1024 * 4,
      env: freecadPythonEnv()
    });
    res.json({
      ok: result.status === 0,
      mode: 'python3-freecad-libs',
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr
    });
  } catch (err) {
    res.json({ ok: false, mode: 'python3-freecad-libs', error: err.message });
  }
});

app.get('/api/materials', (req, res) => {
  res.json(Object.entries(MATERIALS).map(([key, val]) => ({ key, label: val.label })));
});


app.post('/api/preview-step', (req, res) => {
  upload.single('model')(req, res, (uploadErr) => {
    let filePath = req.file?.path;
    let convertedPath = null;

    try {
      if (uploadErr) throw uploadErr;
      if (!req.file) throw new Error('Geen STEP-bestand ontvangen.');

      const originalName = req.file.originalname || '';
      if (!isStepPath(originalName)) {
        throw new Error('Preview conversie is alleen voor STEP bestanden.');
      }

      convertedPath = convertStepToStl(filePath, originalName);

      const previewId = `PREVIEW-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const storedFileName = `${previewId}.stl`;
      const storedFilePath = path.join(quotesDir, storedFileName);
      fs.copyFileSync(convertedPath, storedFilePath);

      res.json({
        ok: true,
        filename: originalName,
        storedFileName,
        previewUrl: `/api/quote-stl/${encodeURIComponent(storedFileName)}`
      });
    } catch (err) {
      res.status(400).json({
        ok: false,
        error: err.message || 'STEP preview conversie mislukt.'
      });
    } finally {
      for (const p of [filePath, convertedPath]) {
        if (p && fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (_) {}
        }
      }
    }
  });
});



function getMaterialRiskMarkup(materialKey) {
  if (['fdm_tpu85', 'fdm_tpu90', 'fdm_abs', 'fdm_asa', 'fdm_petg_cf'].includes(materialKey)) return 0.50;
  return null;
}


app.post('/api/account/register', (req, res) => {
  res.status(403).json({
    ok: false,
    error: 'Account aanmaken kan alleen door Pro3D Manufacturing.'
  });
});




function normalizeVatNumber(vatNumber) {
  return String(vatNumber || '').trim().toUpperCase().replace(/[\s.\-]/g, '');
}

function splitVatNumber(vatNumber) {
  const clean = normalizeVatNumber(vatNumber);
  const match = clean.match(/^([A-Z]{2})([A-Z0-9]+)$/);
  if (!match) return null;
  return { countryCode: match[1], number: match[2], clean };
}

function normalizeCompanyName(name) {
  return String(name || '')
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(BV|B\.V\.|BVBA|NV|N\.V\.|GMBH|UG|LTD|LIMITED|SARL|SAS|SA|SRL|SL|SP Z O O|SRO|S\.R\.O\.)\b/g, '')
    .replace(/[^A-Z0-9]/g, '');
}


function getCompanyCoreWord(name) {
  const cleaned = String(name || '')
    .replace(/\b(B\.?V\.?|N\.?V\.?|BVBA|GMBH|UG|LTD|LIMITED|SARL|SAS|SA|SRL|SL|SRO|S\.R\.O\.)\b/gi, '')
    .trim();

  const first = cleaned.split(/[\s,.;:/\\|()[\]{}_-]+/).find(part => part && part.length >= 3);
  return normalizeCompanyName(first || cleaned);
}

function isLikelyDutchVatFormat(vatNumber) {
  return /^NL\d{9}B\d{2}$/i.test(normalizeVatNumber(vatNumber));
}

function companyNameLooksSimilar(inputName, viesName) {
  const a = normalizeCompanyName(inputName);
  const b = normalizeCompanyName(viesName);
  const aCore = getCompanyCoreWord(inputName);
  const bCore = getCompanyCoreWord(viesName);

  if (!a || !b) return null;
  if (a === b) return true;
  if (a.length >= 4 && b.includes(a)) return true;
  if (b.length >= 4 && a.includes(b)) return true;

  // V133: bij bedrijfsnamen zoals "Freshtech Solutions b.v." is het hoofdwoord belangrijker.
  if (aCore && bCore && aCore.length >= 4 && bCore.length >= 4) {
    if (aCore === bCore) return true;
    if (b.includes(aCore) || a.includes(bCore)) return true;
  }

  return false;
}

async function checkVatVies(companyName, vatNumber) {
  const split = splitVatNumber(vatNumber);
  if (!split) {
    return {
      ok: false,
      valid: false,
      source: 'format',
      error: 'Btw-nummer formaat klopt niet. Gebruik bijvoorbeeld NL123456789B01.'
    };
  }

  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:checkVat>
      <urn:countryCode>${split.countryCode}</urn:countryCode>
      <urn:vatNumber>${split.number}</urn:vatNumber>
    </urn:checkVat>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await fetch('https://ec.europa.eu/taxation_customs/vies/services/checkVatService', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      body: soapBody
    });

    const xml = await response.text();
    if (!response.ok) {
      throw new Error(`VIES fout ${response.status}`);
    }

    const getTag = (tag) => {
      const re = new RegExp(`<(?:\\\\w+:)?${tag}>([\\\\s\\\\S]*?)</(?:\\\\w+:)?${tag}>`, 'i');
      const m = xml.match(re);
      return m ? m[1].trim() : '';
    };

    const valid = getTag('valid') === 'true';
    const registeredName = getTag('name');
    const registeredAddress = getTag('address');
    const nameMatch = registeredName && registeredName !== '---'
      ? companyNameLooksSimilar(companyName, registeredName)
      : null;

    const registeredNameClean = registeredName === '---' ? '' : registeredName;
    const registeredAddressClean = registeredAddress === '---' ? '' : registeredAddress;

    // V133: Nederlandse btw-nummers kunnen soms niet positief uit VIES komen terwijl het formaat klopt.
    // Dan tonen we een gele waarschuwing/voorlopig akkoord, geen rode fout.
    if (!valid && isLikelyDutchVatFormat(split.clean)) {
      return {
        ok: true,
        valid: null,
        fallbackValid: true,
        source: 'nl_format_fallback',
        vatNumber: split.clean,
        countryCode: split.countryCode,
        registeredName: registeredNameClean,
        registeredAddress: registeredAddressClean,
        nameMatch: registeredNameClean ? companyNameLooksSimilar(companyName, registeredNameClean) : true,
        companyCore: getCompanyCoreWord(companyName),
        message: 'Nederlands btw-nummer formaat klopt. VIES kon dit nummer niet positief bevestigen, controleer eventueel handmatig.'
      };
    }

    return {
      ok: true,
      valid,
      fallbackValid: false,
      source: 'vies',
      vatNumber: split.clean,
      countryCode: split.countryCode,
      registeredName: registeredNameClean,
      registeredAddress: registeredAddressClean,
      nameMatch,
      companyCore: getCompanyCoreWord(companyName),
      message: valid
        ? (nameMatch === false ? 'Btw-nummer is geldig, maar bedrijfsnaam wijkt af.' : 'Btw-nummer is geldig.')
        : 'Btw-nummer kon niet positief bevestigd worden door VIES.'
    };
  } catch (err) {
    if (isLikelyDutchVatFormat(split.clean)) {
      return {
        ok: true,
        valid: null,
        fallbackValid: true,
        source: 'nl_format_fallback',
        vatNumber: split.clean,
        countryCode: split.countryCode,
        registeredName: '',
        registeredAddress: '',
        nameMatch: true,
        companyCore: getCompanyCoreWord(companyName),
        message: 'Nederlands btw-nummer formaat klopt. VIES is tijdelijk niet bereikbaar, controleer eventueel handmatig.'
      };
    }

    return {
      ok: false,
      valid: null,
      fallbackValid: false,
      source: 'vies',
      vatNumber: split.clean,
      error: 'Btw-check kon niet worden uitgevoerd. VIES is mogelijk tijdelijk niet bereikbaar.',
      detail: err.message
    };
  }
}


app.post('/api/vat/check', async (req, res) => {
  res.json({
    ok: true,
    disabled: true,
    result: {
      ok: true,
      valid: null,
      disabled: true,
      message: 'Btw-controle is uitgeschakeld.'
    }
  });
});

app.post('/api/admin/verify', (req, res) => {
  const ok = String(req.body?.adminCode || '') === ADMIN_CODE;
  res.status(ok ? 200 : 401).json({ ok, error: ok ? null : 'Admin-code klopt niet.' });
});

app.post('/api/admin/accounts/list', (req, res) => {
  try {
    if (String(req.body?.adminCode || '') !== ADMIN_CODE) throw new Error('Admin-code klopt niet.');
    const accounts = fs.readdirSync(accountsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => readJsonSafe(path.join(accountsDir, file), null))
      .filter(Boolean)
      .map(publicAccount)
      .sort((a, b) => String(a.companyName || a.email).localeCompare(String(b.companyName || b.email)));
    res.json({ ok: true, accounts });
  } catch (err) {
    res.status(401).json({ ok: false, error: err.message || 'Accounts ophalen mislukt.' });
  }
});

app.post('/api/admin/accounts/create', async (req, res) => {
  try {
    const {
      adminCode, name, firstName, lastName, email, password, companyName, vatNumber,
      street, houseNumber, postalCode, city, country, invoiceAllowed
    } = req.body || {};
    if (String(adminCode || '') !== ADMIN_CODE) throw new Error('Admin-code klopt niet.');

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanFirstName = String(firstName || '').trim();
    const cleanLastName = String(lastName || '').trim();
    const displayName = String(name || `${cleanFirstName} ${cleanLastName}`.trim()).trim();

    if (!displayName || displayName.length < 2) throw new Error('Vul naam contactpersoon in.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('Vul een geldig e-mailadres in.');
    if (!companyName || String(companyName).trim().length < 2) throw new Error('Vul bedrijfsnaam in.');
    if (!vatNumber || String(vatNumber).trim().length < 6) throw new Error('Vul btw-nummer in.');

    const existing = getAccountByEmail(cleanEmail);
    if (!existing && (!password || String(password).length < 6)) {
      throw new Error('Nieuw account heeft een tijdelijk wachtwoord van minimaal 6 tekens nodig.');
    }

    const account = {
      id: existing?.id || crypto.randomBytes(12).toString('hex'),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: displayName,
      firstName: cleanFirstName || existing?.firstName || '',
      lastName: cleanLastName || existing?.lastName || '',
      email: cleanEmail,
      companyName: String(companyName).trim(),
      vatNumber: String(vatNumber).trim(),
      street: String(street || existing?.street || '').trim(),
      houseNumber: String(houseNumber || existing?.houseNumber || '').trim(),
      postalCode: String(postalCode || existing?.postalCode || '').trim(),
      city: String(city || existing?.city || '').trim(),
      country: String(country || existing?.country || 'Nederland').trim(),
      customerType: 'business',
      invoiceAllowed: invoiceAllowed !== false && invoiceAllowed !== 'false',
      password: password ? hashPassword(password) : existing.password
    };

    saveAccount(account);
    res.json({ ok: true, account: publicAccount(account), updated: !!existing });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message || 'Account aanmaken mislukt.' });
  }
});

app.post('/api/account/login', (req, res) => {
  try {
    const account = getAccountByEmail(req.body?.email);
    if (!account || !verifyPassword(req.body?.password, account)) throw new Error('E-mailadres of wachtwoord klopt niet.');
    const token = createSession(account.email);
    res.json({ ok: true, token, account: publicAccount(account) });
  } catch (err) {
    res.status(401).json({ ok: false, error: err.message || 'Inloggen mislukt.' });
  }
});


app.post('/api/account/update', (req, res) => {
  try {
    const account = getSessionAccount(req);
    if (!account) throw new Error('Niet ingelogd.');

    const { firstName, lastName, street, houseNumber, postalCode, city, country } = req.body || {};
    account.firstName = String(firstName || '').trim();
    account.lastName = String(lastName || '').trim();
    account.name = `${account.firstName} ${account.lastName}`.trim() || account.name;
    account.street = String(street || '').trim();
    account.houseNumber = String(houseNumber || '').trim();
    account.postalCode = String(postalCode || '').trim();
    account.city = String(city || '').trim();
    account.country = String(country || 'Nederland').trim();
    account.updatedAt = new Date().toISOString();

    // Bedrijfsnaam, btw-nummer en factuurrechten bewust niet aanpasbaar door klant.
    saveAccount(account);
    res.json({ ok: true, account: publicAccount(account) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message || 'Account bijwerken mislukt.' });
  }
});


app.get('/api/account/orders', (req, res) => {
  try {
    const account = getSessionAccount(req);
    if (!account) throw new Error('Niet ingelogd.');

    const email = String(account.email || '').trim().toLowerCase();
    const orders = fs.readdirSync(ordersDir)
      .filter(file => file.endsWith('.json'))
      .map(file => readJsonSafe(path.join(ordersDir, file), null))
      .filter(Boolean)
      .filter(order => String(order.customer?.email || '').trim().toLowerCase() === email)
      .map(order => ({
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status || 'new',
        paymentMethod: order.customer?.paymentMethod || 'direct',
        status: order.status || 'new',
        statusLabel: order.statusLabel || statusLabel(order.status || 'new'),
        trackingCarrier: order.tracking?.carrier || '',
        trackingCode: order.tracking?.code || '',
        trackingUrl: order.tracking?.url || '',
        poNumber: order.customer?.poNumber || '',
        exVat: Number(order.totals?.exVat || 0),
        inclVat: Number(order.totals?.inclVat || order.totals?.inVat || 0),
        itemCount: Array.isArray(order.items) ? order.items.length : 0
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ ok: true, orders });
  } catch (err) {
    res.status(401).json({ ok: false, error: err.message || 'Orders ophalen mislukt.' });
  }
});

app.post('/api/account/orders/detail', (req, res) => {
  try {
    const account = getSessionAccount(req);
    if (!account) throw new Error('Niet ingelogd.');

    const order = readOrderFile(req.body?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');

    const accountEmail = String(account.email || '').trim().toLowerCase();
    const orderEmail = String(order.customer?.email || '').trim().toLowerCase();
    if (!accountEmail || accountEmail !== orderEmail) {
      throw new Error('Je hebt geen toegang tot deze order.');
    }

    res.json({ ok: true, order });
  } catch (err) {
    res.status(403).json({ ok: false, error: err.message || 'Order openen mislukt.' });
  }
});

app.post('/api/account/password', (req, res) => {
  try {
    const account = getSessionAccount(req);
    if (!account) throw new Error('Niet ingelogd.');

    const { currentPassword, newPassword } = req.body || {};
    if (!verifyPassword(currentPassword, account)) {
      throw new Error('Huidig wachtwoord klopt niet.');
    }
    if (!newPassword || String(newPassword).length < 6) {
      throw new Error('Nieuw wachtwoord moet minimaal 6 tekens zijn.');
    }

    account.password = hashPassword(newPassword);
    account.updatedAt = new Date().toISOString();
    saveAccount(account);

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message || 'Wachtwoord wijzigen mislukt.' });
  }
});

app.get('/api/account/me', (req, res) => {
  const account = getSessionAccount(req);
  if (!account) return res.status(401).json({ ok: false, error: 'Niet ingelogd.' });
  res.json({ ok: true, account: publicAccount(account) });
});

app.post('/api/calculate', (req, res) => {
  upload.single('model')(req, res, (uploadErr) => {
    let filePath = req.file?.path;
    let convertedPath = null;
    let analysisPath = filePath;

    try {
      if (uploadErr) throw uploadErr;
      if (!req.file) throw new Error('Geen STL- of STEP-bestand ontvangen.');

      const originalName = req.file.originalname || '';
      const isStep = isStepPath(originalName);
      const isStl = isStlPath(originalName);

      if (!isStl && !isStep) {
        throw new Error('Upload alleen een STL- of STEP-bestand.');
      }

      if (isStep) {
        try {
          convertedPath = convertStepToStl(filePath, originalName);
          analysisPath = convertedPath;
        } catch (convertErr) {
          console.error('STEP conversion failed:', convertErr.message);
          makeStepManualResponse(req, res, convertErr.message);
          return;
        }
      }
const materialKey = req.body.material || 'fdm_pla';
      const quantity = req.body.quantity || 1;
      const infill = req.body.infill || 20;
      const margin = 35;
      const color = req.body.color || '';
      const foodgrade = req.body.foodgrade || false;
      const infillType = req.body.infillType || 'grid';
      const wallThickness = req.body.wallThickness || 0.8;
      const layerHeight = req.body.layerHeight || null;

      const analysis = analyzeStl(analysisPath);
      if (analysis.modelVolumeCm3 <= 0) {
        throw new Error('Volume is 0. Controleer of de STL gesloten/watertight is.');
      }

      const material = MATERIALS[materialKey];
      const fit = checkBuildVolume(analysis, material.technology);
      if (!fit.fits) {
        res.json({ ok: false, fitError: true, error: fit.message, filename: req.file.originalname, analysis, fit });
        return;
      }

      const autoSupport = estimateAutoSupportPercent(analysisPath, material.technology);
      const price = calculatePrice(analysis, materialKey, quantity, infill, margin, autoSupport, color, foodgrade, infillType, wallThickness, layerHeight);
      price.autoSupportPercent = autoSupport;
      const manualReview = assessManualReview(analysis, material.technology, autoSupport);
      price.manualReview = manualReview;

      const quoteId = `Q-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const storedFileName = `${quoteId}.stl`;
      const storedFilePath = path.join(quotesDir, storedFileName);
      fs.copyFileSync(analysisPath, storedFilePath);

      const originalExt = path.extname(req.file.originalname || '').toLowerCase() || '.stl';
      const originalStoredFileName = `${quoteId}-original${originalExt}`;
      const originalStoredFilePath = path.join(quotesDir, originalStoredFileName);
      fs.copyFileSync(filePath, originalStoredFilePath);

      const quote = {
        quoteId,
        createdAt: new Date().toISOString(),
        originalFilename: req.file.originalname,
        sourceFileType: isStep ? 'step' : 'stl',
        convertedFromStep: isStep,
        storedFileName,
        originalStoredFileName,
        analysis,
        price,
        fit,
        manualReview,
        choices: {
          materialKey,
          quantity,
          infill,
          autoSupport,
          color,
          foodgrade,
          infillType,
          wallThickness,
          layerHeight
        }
      };
      fs.writeFileSync(path.join(quotesDir, `${quoteId}.json`), JSON.stringify(quote, null, 2), 'utf8');

      res.json({
        ok: true,
        quoteId,
        filename: req.file.originalname,
        sourceFileType: isStep ? 'step' : 'stl',
        convertedFromStep: isStep,
        storedFileName,
        originalStoredFileName,
        analysis,
        price,
        fit,
        manualReview,
        warning: manualReview.required ? 'Dit model vraagt opnieuw proberen. De prijs is een indicatie; je kunt een aanvraag versturen.' : null
      });
    } catch (err) {
      const msg = err && err.message ? err.message : 'Berekenen mislukt.';
      const memoryLike = /heap|memory|allocation|array buffer|out of memory/i.test(msg);
      res.status(memoryLike ? 413 : 400).json({
        ok: false,
        error: memoryLike
          ? 'Dit STL-bestand kon niet automatisch worden berekend door een server/geheugenfout. Probeer opnieuw of gebruik later een sterkere server.'
          : msg,
        heavyStl: memoryLike,
        serverMemoryError: memoryLike
      });
    } finally {
      for (const p of [filePath, convertedPath]) {
        if (p && fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (_) {}
        }
      }
    }
  });
});


const SHIPPING_RATES = {
  NL: { label: 'Nederland', rates: [6.95, 6.95, 8.95, 13.95, 18.95] },
  BE: { label: 'België', rates: [12.25, 19.25, 24.75, 34.25, 46.00] },
  DE: { label: 'Duitsland', rates: [12.50, 20.00, 25.50, 35.75, 48.00] },
  FR: { label: 'Frankrijk', rates: [12.50, 20.00, 25.50, 35.75, 48.00] },
  LU: { label: 'Luxemburg', rates: [12.50, 20.00, 25.50, 35.75, 48.00] },
  ES: { label: 'Spanje', rates: [12.50, 20.00, 25.50, 35.75, 48.00] },
  IT: { label: 'Italië', rates: [12.50, 20.00, 25.50, 35.75, 48.00] },
  AT: { label: 'Oostenrijk', rates: [15.00, 21.50, 26.50, 37.50, 53.50] },
  PL: { label: 'Polen', rates: [17.25, 23.50, 29.75, 39.50, 56.00] },
  SK: { label: 'Slowakije', rates: [21.00, 28.00, 35.50, 45.50, 61.75] },
  SE: { label: 'Zweden', rates: [20.25, 27.00, 34.25, 44.00, 60.25] },
  CH: { label: 'Zwitserland', rates: [27.00, 33.25, 43.75, 65.00, null] },
  UK: { label: 'Verenigd Koninkrijk', rates: [20.00, 26.75, 34.25, 44.00, null] },
  US: { label: 'Verenigde Staten', rates: [32.00, 51.00, 85.50, 160.00, null] },
  EU_OTHER: { label: 'Overige Europese landen', rates: [22.00, 29.00, 40.00, 69.00, null] },
  WORLD_OTHER: { label: 'Overige wereld', rates: [34.00, 52.00, 82.25, 143.00, null] }
};

function rateByWeight(rates, kg) {
  if (kg <= 2) return rates[0];
  if (kg <= 5) return rates[1];
  if (kg <= 10) return rates[2];
  if (kg <= 20) return rates[3];
  if (kg <= 23) return rates[4];
  return null;
}

function normalizeCountryCode(raw) {
  const value = String(raw || 'NL').trim();
  const upper = value.toUpperCase();
  const aliases = {
    'THE NETHERLANDS': 'NL', 'NETHERLANDS': 'NL', 'NEDERLAND': 'NL',
    'BELGIUM': 'BE', 'BELGIE': 'BE', 'BELGIË': 'BE',
    'GERMANY': 'DE', 'DUITSLAND': 'DE',
    'FRANCE': 'FR', 'FRANKRIJK': 'FR',
    'SLOVAKIA': 'SK', 'SLOWAKIJE': 'SK',
    'UNITED KINGDOM': 'UK', 'VERENIGD KONINKRIJK': 'UK',
    'UNITED STATES': 'US', 'VERENIGDE STATEN': 'US', 'USA': 'US'
  };
  return SHIPPING_RATES[upper] ? upper : (aliases[upper] || 'NL');
}

function calculateShipping(cart, countryCode = 'NL') {
  countryCode = normalizeCountryCode(countryCode);
  if (!Array.isArray(cart) || cart.length === 0) return { exVat: 0, inclVat: 0, realKg: 0, billableKg: 0, countryCode, countryLabel: SHIPPING_RATES[countryCode].label, oversized: false, message: '' };
  let totalWeightG = 0;
  let volumetricKg = 0;
  let longestMm = 0;
  let maxX = 0, maxY = 0, maxZ = 0;

  for (const item of cart) {
    const qty = Math.max(1, Number(item.quantity || 1));
    totalWeightG += Number(item.totalWeightG || 0);
    const d = item.dimensionsMm || {};
    const x = Number(d.x || 0), y = Number(d.y || 0), z = Number(d.z || 0);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
    longestMm = Math.max(longestMm, x, y, z);
    const sorted = [x, y, z].sort((a, b) => b - a);
    const lengthCm = (sorted[0] + 40) / 10;
    const widthCm = (sorted[1] + 40) / 10;
    const heightCm = (sorted[2] + 40) / 10;
    volumetricKg += Math.max(0.05, (lengthCm * widthCm * heightCm / 5000) * qty);
  }

  const realKg = totalWeightG / 1000;
  const billableKg = Math.max(realKg, volumetricKg, 0.1);
  const country = SHIPPING_RATES[countryCode] || SHIPPING_RATES.NL;
  const oversizedIntl = countryCode !== 'NL' && (billableKg > 23 || longestMm > 1000 || maxX > 1000 || maxY > 500 || maxZ > 500);
  const oversizedNl = countryCode === 'NL' && (billableKg > 23 || longestMm > 1000 || maxX > 1000 || maxY > 500 || maxZ > 500);
  const oversized = oversizedIntl || oversizedNl;
  let inclVat = rateByWeight(country.rates, billableKg);
  let message = countryCode === 'NL' ? 'PostNL indicatie Nederland.' : `PostNL indicatie ${country.label}.`;
  if (inclVat == null || oversized) {
    inclVat = countryCode === 'NL' ? 29.95 : 89.95;
    message = countryCode === 'NL'
      ? 'Groot/zwaar pakket: verzendkosten als maatwerk indicatie gerekend.'
      : 'Groot/zwaar internationaal pakket: verzendkosten als maatwerk indicatie gerekend.';
  }

  return {
    exVat: Number((inclVat / 1.21).toFixed(2)),
    inclVat: Number(inclVat.toFixed(2)),
    realKg: Number(realKg.toFixed(2)),
    billableKg: Number(billableKg.toFixed(2)),
    countryCode,
    countryLabel: country.label,
    oversized,
    message
  };
}



const CONTACT_TO = 'info@Pro3DManufacturing.nl';
async function sendContactEmail(message) {
  if (!nodemailer) return { sent: false, reason: 'nodemailer_not_installed' };
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || CONTACT_TO;
  if (!host || !user || !pass) return { sent: false, reason: 'smtp_not_configured' };
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  await transporter.sendMail({
    from,
    to: CONTACT_TO,
    replyTo: message.email,
    subject: `Nieuwe vraag via Pro3D Manufacturing${message.subject ? ': ' + message.subject : ''}`,
    text: `Naam: ${message.name}\nE-mail: ${message.email}\nTelefoon: ${message.phone || '-'}\nOnderwerp: ${message.subject || '-'}\n\nVraag:\n${message.message}`
  });
  return { sent: true };
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone = '', subject = '', message } = req.body || {};
    if (!name || !email || !message) throw new Error('Vul naam, e-mail en vraag in.');
    const contactId = `MSG-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-6)}`;
    const item = {
      ok: true,
      contactId,
      createdAt: new Date().toISOString(),
      to: CONTACT_TO,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      subject: String(subject || '').trim(),
      message: String(message).trim()
    };
    const mailResult = await sendContactEmail(item).catch(err => ({ sent: false, reason: err.message }));
    item.emailStatus = mailResult;
    fs.writeFileSync(path.join(messagesDir, `${contactId}.json`), JSON.stringify(item, null, 2), 'utf8');
    res.json({ ok: true, contactId, emailSent: !!mailResult.sent });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});


async function sendQuoteRequestEmail(request) {
  if (!nodemailer) return { sent: false, reason: 'nodemailer_not_installed' };
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || CONTACT_TO;
  if (!host || !user || !pass) return { sent: false, reason: 'smtp_not_configured' };
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({
    from,
    to: CONTACT_TO,
    replyTo: request.email,
    subject: `Nieuwe printaanvraag controle ${request.quoteId}`,
    text: `Nieuwe printaanvraag voor opnieuw proberen

Quote: ${request.quoteId}
Naam: ${request.name}
E-mail: ${request.email}
Telefoon: ${request.phone || '-'}

Bestand: ${request.filename || '-'}
Indicatie excl. btw: €${request.estimatedTotalExVat}
Techniek: ${request.choice || '-'}
Redenen:
- ${request.reasons.join('\n- ')}

Opmerking klant:
${request.message || '-'}

Controleer het quote-bestand in de map quotes.`
  });
  return { sent: true };
}

app.post('/api/quote-request', async (req, res) => {
  try {
    const { quoteId, name, email, phone = '', message = '' } = req.body || {};
    if (!quoteId) throw new Error('Geen quote ID ontvangen. Bereken het model opnieuw.');
    if (!name || !email) throw new Error('Vul naam en e-mail in.');
    const quotePath = path.join(quotesDir, `${String(quoteId).replace(/[^a-zA-Z0-9_-]/g, '')}.json`);
    if (!fs.existsSync(quotePath)) throw new Error('Quote niet gevonden. Bereken het model opnieuw.');
    const quote = JSON.parse(fs.readFileSync(quotePath, 'utf8'));
    const requestId = `REQ-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-6)}`;
    const item = {
      ok: true,
      type: 'manual_print_request',
      requestId,
      createdAt: new Date().toISOString(),
      to: CONTACT_TO,
      quoteId,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      message: String(message || '').trim(),
      filename: quote.originalFilename,
      estimatedTotalExVat: quote.price?.totalPrice,
      choice: `${quote.price?.technologyLabel || ''} · ${quote.price?.material || ''} · ${quote.price?.color || ''}`,
      reasons: quote.manualReview?.reasons || quote.price?.manualReview?.reasons || [],
      quote
    };
    const mailResult = await sendQuoteRequestEmail(item).catch(err => ({ sent: false, reason: err.message }));
    item.emailStatus = mailResult;
    fs.writeFileSync(path.join(messagesDir, `${requestId}.json`), JSON.stringify(item, null, 2), 'utf8');
    res.json({ ok: true, requestId, emailSent: !!mailResult.sent });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});


app.get('/api/quote-stl/:file', (req, res) => {
  try {
    const file = path.basename(req.params.file || '');
    if (!file || !file.toLowerCase().endsWith('.stl')) {
      return res.status(400).json({ ok: false, error: 'Alleen STL quote bestanden zijn toegestaan.' });
    }

    const filePath = path.join(quotesDir, file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, error: 'Quote STL niet gevonden.' });
    }

    res.setHeader('Content-Type', 'model/stl');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});



async function sendOrderEmail(order) {
  if (!nodemailer) return { sent: false, reason: 'nodemailer_not_installed' };
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || CONTACT_TO;
  if (!host || !user || !pass) return { sent: false, reason: 'smtp_not_configured' };

  const customer = order.customer || {};
  const itemsText = (order.items || []).map((item, index) => {
    return `${index + 1}. ${item.filename || '-'} | ${item.technologyLabel || '-'} | ${item.material || '-'} | aantal ${item.quantity || 1} | €${Number(item.totalPrice || 0).toFixed(2)} excl. btw`;
  }).join('\n');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from,
    to: CONTACT_TO,
    replyTo: customer.email || CONTACT_TO,
    subject: `Nieuwe order ${order.orderNumber} - €${Number(order.totals?.inclVat || 0).toFixed(2)} incl. btw`,
    text: `Nieuwe order ontvangen

Ordernummer: ${order.orderNumber}
Datum: ${order.createdAt}
Status: ${order.status}

Klant:
Naam: ${customer.name || '-'}
E-mail: ${customer.email || '-'}
Telefoon: ${customer.phone || '-'}
Type: ${customer.customerType || 'private'}
Betaalmethode: ${customer.paymentMethod || 'direct'}
PO / referentie: ${customer.poNumber || '-'}
Bedrijf: ${customer.companyName || '-'}
Btw: ${customer.vatNumber || '-'}

Adres:
${customer.address || customer.street || '-'} ${customer.houseNumber || ''}
${customer.postalCode || '-'} ${customer.city || '-'}
${customer.country || '-'}

Bedragen:
Producten excl. btw: €${Number(order.totals?.productsExVat || 0).toFixed(2)}
Verzending excl. btw: €${Number(order.totals?.shippingExVat || 0).toFixed(2)}
Totaal excl. btw: €${Number(order.totals?.exVat || 0).toFixed(2)}
Totaal incl. btw: €${Number(order.totals?.inclVat || 0).toFixed(2)}

Items:
${itemsText || '-'}

Open het order portaal om de order te bekijken.`
  });

  return { sent: true };
}

function requireAdminCode(req) {
  const code = req.body?.adminCode || req.query?.adminCode || req.headers['x-admin-code'];
  if (String(code || '') !== ADMIN_CODE) {
    const err = new Error('Admin-code klopt niet.');
    err.statusCode = 401;
    throw err;
  }
}

function readOrderFile(orderNumber) {
  const raw = String(orderNumber || '').trim();
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!clean) return null;

  const directPath = path.join(ordersDir, `${clean}.json`);
  if (fs.existsSync(directPath)) return readJsonSafe(directPath, null);

  // V148 fallback: zoek orderbestand robuuster.
  const files = fs.existsSync(ordersDir) ? fs.readdirSync(ordersDir) : [];
  const found = files.find(file => {
    const base = file.replace(/\.json$/i, '');
    return file.toLowerCase() === `${clean}.json`.toLowerCase()
      || base === clean
      || base.toLowerCase() === clean.toLowerCase();
  });

  return found ? readJsonSafe(path.join(ordersDir, found), null) : null;
}


app.post('/api/admin/orders/list', (req, res) => {
  try {
    requireAdminCode(req);

    const sortBy = String(req.body?.sortBy || 'date_desc');
    let orders = fs.readdirSync(ordersDir)
      .filter(file => file.endsWith('.json'))
      .map(file => readJsonSafe(path.join(ordersDir, file), null))
      .filter(Boolean)
      .map(order => ({
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status || 'new',
        customerName: order.customer?.name || '',
        customerEmail: order.customer?.email || '',
        companyName: order.customer?.companyName || '',
        paymentMethod: order.customer?.paymentMethod || 'direct',
        exVat: Number(order.totals?.exVat || 0),
        inclVat: Number(order.totals?.inclVat || 0),
        itemCount: Array.isArray(order.items) ? order.items.length : 0
      }));

    orders.sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'amount_desc') return b.inclVat - a.inclVat;
      if (sortBy === 'amount_asc') return a.inclVat - b.inclVat;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ ok: true, orders });
  } catch (err) {
    res.status(err.statusCode || 400).json({ ok: false, error: err.message || 'Orders ophalen mislukt.' });
  }
});

app.post('/api/admin/orders/detail', (req, res) => {
  try {
    requireAdminCode(req);
    const order = readOrderFile(req.body?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');
    res.json({ ok: true, order });
  } catch (err) {
    res.status(err.statusCode || 400).json({ ok: false, error: err.message || 'Order openen mislukt.' });
  }
});



function drawOrderPdf(order, type = 'quote') {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ size: 'A4', margin: 42, info: { Title: `${type === 'invoice' ? 'Factuur' : 'Offerte'} ${order.orderNumber || ''}` } });
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  const done = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const customer = order.customer || {};
  const totals = order.totals || {};
  const isInvoice = type === 'invoice';
  const title = isInvoice ? 'FACTUUR' : 'OFFERTE';
  const docNumber = `${isInvoice ? 'FACT' : 'OFF'}-${order.orderNumber || ''}`;
  const logoPath = path.join(__dirname, 'public', 'logo.png');

  const blue = '#4268d6';
  const dark = '#111827';
  const muted = '#64748b';

  if (fs.existsSync(logoPath)) {
    try { doc.image(logoPath, 42, 36, { width: 70 }); } catch (_) {}
  }

  doc.fillColor(dark).fontSize(26).font('Helvetica-Bold').text(title, 130, 42);
  doc.fontSize(10).fillColor(muted).font('Helvetica').text(docNumber, 130, 76);
  doc.fontSize(10).fillColor(muted).text(`Order: ${order.orderNumber || '-'}`, 130, 92);
  doc.fontSize(10).fillColor(muted).text(`Datum: ${formatOrderDate(order.createdAt)}`, 130, 108);

  doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text('Pro3D Manufacturing', 380, 42, { align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor(muted).text('Honderdland 380\n2676 LV Maasdijk\nNederland\ninfo@Pro3DManufacturing.nl', 380, 62, { width: 170, align: 'right' });

  doc.moveTo(42, 150).lineTo(553, 150).strokeColor(blue).lineWidth(1.5).stroke();

  let y = 175;
  doc.fillColor(dark).fontSize(13).font('Helvetica-Bold').text('Klant', 42, y);
  doc.fontSize(10).font('Helvetica').fillColor(muted).text([
    customer.companyName || customer.company || customer.name || '-',
    customer.name || '',
    customer.email || '',
    `${customer.address || customer.street || ''} ${customer.houseNumber || ''}`.trim(),
    `${customer.postalCode || ''} ${customer.city || ''}`.trim(),
    customer.country || '',
    customer.vatNumber ? `Btw: ${customer.vatNumber}` : '',
    customer.poNumber ? `PO / referentie: ${customer.poNumber}` : ''
  ].filter(Boolean).join('\n'), 42, y + 20, { width: 250 });

  y = 330;
  doc.fillColor(dark).fontSize(13).font('Helvetica-Bold').text('Omschrijving', 42, y);
  doc.text('Aantal', 370, y);
  doc.text('Prijs excl.', 465, y, { width: 85, align: 'right' });
  y += 18;
  doc.moveTo(42, y).lineTo(553, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
  y += 10;

  (order.items || []).forEach((item, index) => {
    if (y > 675) {
      doc.addPage();
      y = 50;
    }
    doc.fillColor(dark).fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${item.filename || '-'}`, 42, y, { width: 300 });
    doc.font('Helvetica').fillColor(muted).text(`${item.technologyLabel || item.technology || '-'} · ${item.material || '-'} · ${item.color || '-'}`, 42, y + 15, { width: 300 });
    doc.fillColor(dark).font('Helvetica').text(String(item.quantity || 1), 380, y, { width: 50 });
    doc.font('Helvetica-Bold').text(formatEuro(item.totalPrice || 0), 465, y, { width: 85, align: 'right' });
    y += 54;
    doc.moveTo(42, y).lineTo(553, y).strokeColor('#f1f5f9').lineWidth(1).stroke();
    y += 10;
  });

  y = Math.max(y + 18, 625);
  const totalX = 340;
  const line = (label, value, bold = false) => {
    doc.fillColor(muted).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).text(label, totalX, y, { width: 120 });
    doc.fillColor(dark).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(formatEuro(value), 465, y, { width: 85, align: 'right' });
    y += bold ? 24 : 18;
  };

  const incl = Number(totals.inclVat || totals.inVat || 0);
  const ex = Number(totals.exVat || 0);
  line('Producten excl. btw', totals.productsExVat || 0);
  line('Verzending excl. btw', totals.shippingExVat || 0);
  line('Totaal excl. btw', ex);
  line('Btw 21%', incl - ex);
  doc.moveTo(totalX, y - 4).lineTo(553, y - 4).strokeColor(blue).stroke();
  line('Totaal incl. btw', incl, true);

  doc.fontSize(9).fillColor(muted).font('Helvetica').text(
    isInvoice
      ? 'Betaling volgens afspraak / op factuur indien van toepassing.'
      : 'Deze offerte is gebaseerd op de automatische calculatie en kan bij technische controle nog aangepast worden.',
    42,
    760,
    { width: 510 }
  );

  doc.end();
  return done;
}


app.post('/api/admin/orders/tracking', (req, res) => {
  try {
    requireAdminCode(req);
    const order = readOrderFile(req.body?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');

    const carrier = String(req.body?.carrier || '').trim();
    const code = String(req.body?.code || '').trim();
    const url = String(req.body?.url || '').trim();

    order.tracking = { carrier, code, url, updatedAt: new Date().toISOString() };
    order.updatedAt = new Date().toISOString();

    fs.writeFileSync(path.join(ordersDir, `${safeOrderNumber(order.orderNumber)}.json`), JSON.stringify(order, null, 2), 'utf8');
    res.json({ ok: true, order });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message || 'Track & trace opslaan mislukt.' });
  }
});

app.post('/api/admin/orders/status', (req, res) => {
  try {
    requireAdminCode(req);
    const order = readOrderFile(req.body?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');

    const status = String(req.body?.status || 'new');
    if (!ORDER_STATUSES[status]) throw new Error('Onbekende status.');

    order.status = status;
    order.statusLabel = statusLabel(status);
    order.updatedAt = new Date().toISOString();
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({ status, label: statusLabel(status), at: new Date().toISOString() });

    fs.writeFileSync(path.join(ordersDir, `${safeOrderNumber(order.orderNumber)}.json`), JSON.stringify(order, null, 2), 'utf8');
    res.json({ ok: true, order });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message || 'Status bijwerken mislukt.' });
  }
});



// V148 PDF route fix: simpele route voor /api/order/PRO3D-.../invoice.pdf en quote.pdf
app.get('/api/order/:orderNumber/:docName', async (req, res) => {
  try {
    const docName = String(req.params.docName || '').toLowerCase();
    if (docName !== 'quote.pdf' && docName !== 'invoice.pdf') {
      return res.status(404).type('text/plain').send('Document niet gevonden.');
    }

    const orderNumber = decodeURIComponent(req.params.orderNumber || '');
    const type = docName === 'invoice.pdf' ? 'invoice' : 'quote';
    const order = readOrderFile(orderNumber);

    if (!order) {
      return res.status(404).type('text/plain').send('Document niet gevonden. Order bestaat niet of is nog niet opgeslagen.');
    }

    const pdf = await drawOrderPdf(order, type);
    const prefix = type === 'invoice' ? 'factuur' : 'offerte';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${prefix}-${order.orderNumber}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('PDF_DOCUMENT_ERROR:', err);
    res.status(500).type('text/plain').send(`PDF maken mislukt: ${err.message || 'onbekende fout'}`);
  }
});

app.post('/api/account/order-document', (req, res) => {
  try {
    const account = getSessionAccount(req);
    if (!account) throw new Error('Niet ingelogd.');
    const order = readOrderFile(req.body?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');
    if (String(order.customer?.email || '').toLowerCase() !== String(account.email || '').toLowerCase()) {
      throw new Error('Geen toegang tot deze order.');
    }
    const type = req.body?.type === 'invoice' ? 'invoice' : 'quote';
    res.json({ ok: true, url: `/api/order/${encodeURIComponent(order.orderNumber)}/${type}.pdf` });
  } catch (err) {
    res.status(403).json({ ok: false, error: err.message || 'Document openen mislukt.' });
  }
});

app.post('/api/admin/order-document', (req, res) => {
  try {
    requireAdminCode(req);
    const order = readOrderFile(req.body?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');
    const type = req.body?.type === 'invoice' ? 'invoice' : 'quote';
    res.json({ ok: true, url: `/api/order/${encodeURIComponent(order.orderNumber)}/${type}.pdf` });
  } catch (err) {
    res.status(403).json({ ok: false, error: err.message || 'Document openen mislukt.' });
  }
});

app.get('/api/admin/order-file', (req, res) => {
  try {
    requireAdminCode(req);
    const order = readOrderFile(req.query?.orderNumber);
    if (!order) throw new Error('Order niet gevonden.');

    const itemIndex = Number(req.query?.itemIndex || 0);
    const fileType = req.query?.fileType === 'converted' ? 'storedFileName' : 'originalStoredFileName';
    const item = (order.items || [])[itemIndex];
    const fileName = item?.fileRefs?.[fileType] || item?.[fileType] || '';
    if (!fileName) throw new Error('Geen bestand gekoppeld aan dit order-item.');

    const filePath = path.join(quotesDir, path.basename(fileName));
    if (!fs.existsSync(filePath)) throw new Error('Bestand niet gevonden op server.');

    res.download(filePath, item.filename || path.basename(filePath));
  } catch (err) {
    res.status(404).json({ ok: false, error: err.message || 'Bestand downloaden mislukt.' });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    // V138: alle order-fouten blijven JSON. Geen Express HTML errorpagina meer.
    const checkoutCustomer = req.body?.customer || req.body || {};
    const customerType = String(checkoutCustomer.customerType || 'private');
    const paymentMethod = String(checkoutCustomer.paymentMethod || 'direct');
    const companyName = String(checkoutCustomer.companyName || checkoutCustomer.company || '').trim();
    const vatNumber = String(checkoutCustomer.vatNumber || '').trim();

    if (customerType === 'business') {
      if (!companyName) throw new Error('Vul bedrijfsnaam in voor zakelijke bestelling.');
      if (!vatNumber) throw new Error('Vul btw-nummer in voor zakelijke bestelling.');
    }

    if (paymentMethod === 'invoice') {
      const account = getSessionAccount(req);
      if (!account || !account.invoiceAllowed) {
        throw new Error('Op factuur betalen kan alleen met een ingelogd vast klantenaccount.');
      }

      const publicAcc = publicAccount(account);
      req.body.invoiceAccount = publicAcc;
      req.body.customer = { ...checkoutCustomer, invoiceAccount: publicAcc };
    }

    const { customer, cart } = req.body || {};
    if (!customer || !customer.name || !customer.email || !customer.address || !customer.postalCode || !customer.city) {
      throw new Error('Vul alle verplichte checkout gegevens in.');
    }
    if (!Array.isArray(cart) || cart.length === 0) throw new Error('Winkelwagen is leeg.');

    const orderNumber = `PRO3D-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-6)}`;
    const productExVat = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const shipping = calculateShipping(cart, customer.country);
    const totals = {
      productsExVat: productExVat,
      shippingExVat: shipping.exVat,
      shippingInclVat: shipping.inclVat,
      exVat: productExVat + shipping.exVat,
      inVat: (productExVat * 1.21) + shipping.inclVat,
      inclVat: (productExVat * 1.21) + shipping.inclVat
    };

    const orderItems = cart.map((item, index) => ({
      ...item,
      fileRefs: {
        originalStoredFileName: item.originalStoredFileName || '',
        storedFileName: item.storedFileName || ''
      }
    }));

    const order = {
      ok: true,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'new',
      statusLabel: statusLabel('new'),
      statusHistory: [{ status: 'new', label: statusLabel('new'), at: new Date().toISOString() }],
      customer,
      items: orderItems,
      shipping,
      totals
    };

    fs.writeFileSync(path.join(ordersDir, `${orderNumber}.json`), JSON.stringify(order, null, 2), 'utf8');

    const mailResult = await sendOrderEmail(order).catch(err => ({ sent: false, reason: err.message }));
    order.emailStatus = mailResult;
    fs.writeFileSync(path.join(ordersDir, `${orderNumber}.json`), JSON.stringify(order, null, 2), 'utf8');

    res.json({ ok: true, orderNumber, orderId: orderNumber, totals: order.totals, emailSent: !!mailResult.sent });
  } catch (err) {
    console.error('ORDER_ERROR:', err);
    if (!res.headersSent) {
      res.status(400).json({
        ok: false,
        error: err.message || 'Bestelling plaatsen mislukt.',
        source: 'order-json-v138'
      });
    }
  }
});


// V138 API JSON error handler: voorkom HTML errorpagina voor API-calls.
app.use('/api', (err, req, res, next) => {
  console.error('API_ERROR:', err);
  if (res.headersSent) return next(err);
  res.status(err.statusCode || 500).json({
    ok: false,
    error: err.message || 'Serverfout.',
    source: 'api-json-v138'
  });
});

app.listen(PORT, () => {
  console.log(`Pro3D Manufacturing calculator draait op http://localhost:${PORT}`);
});
