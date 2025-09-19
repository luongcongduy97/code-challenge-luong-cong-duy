const API_URL = "https://interview.switcheo.com/prices.json";
const ICON_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/";

let prices = {};
let balances = {}; // mock balances for UX (can be removed)

// Elements
const fromTokenSelect = document.getElementById("from-token");
const toTokenSelect = document.getElementById("to-token");
const inputAmount = document.getElementById("input-amount");
const outputAmount = document.getElementById("output-amount");
const amtError = document.getElementById("amt-error");
const globalError = document.getElementById("global-error");
const rateEl = document.getElementById("rate");
const swapBtn = document.getElementById("swap-btn");
const toast = document.getElementById("toast");
const fromIcon = document.getElementById("from-icon");
const toIcon = document.getElementById("to-icon");
const fromUsdEl = document.getElementById("from-usd");
const toUsdEl = document.getElementById("to-usd");
const fromBalEl = document.getElementById("from-balance");
const maxBtn = document.getElementById("max-btn");
const flipBtn = document.getElementById("flip-btn");
const loadingOverlay = document.getElementById("loading");

// --- until
const fmt6 = n => Number(n).toFixed(6);
const fmt2 = n => Number(n).toFixed(2);
const save = () => localStorage.setItem("swap.sel", JSON.stringify({f: fromTokenSelect.value, t: toTokenSelect.value}));
const load = () => {
  try { 
    return JSON.parse(localStorage.getItem("swap.sel")||"{}"); 
  } catch { return {}; } 
};

// helper: make icon URL
function iconUrl(sym) {
  // symbols in repo are uppercase, 1:1 file name
  return ICON_URL + encodeURIComponent(sym) + '.svg';
}

// helper: inline SVG fallback (when image 404)
function fallbackIcon(sym){
  const t = (sym||"?").slice(0,4);
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
    <rect width='100%' height='100%' fill='#eef2ff'/>
    <text x='50%' y='55%' font-family='Arial' font-size='10' text-anchor='middle' fill='#334155'>${t}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}

// set image src with graceful fallback
function setIcon(imgEl, symbol) {
  const url = iconUrl(symbol);
  imgEl.onerror = () => { imgEL.src = fallbackIcon(symbol); };
  imgEl.src = url;
  imgEl.alt=`${symbol} icon`;
}

// --- loading skeleton
function setLoading(v){
  loadingOverlay.classList.toggle("hidden", !v);
  swapBtn.disabled = true;
}


// --- Load tokens and prices ---
async function loadTokens() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // keep the lastest seen price token
    data.forEach(item => { prices[item.currency] = item.price });

    // mock small balances to drive UX
    Object.keys(prices).forEach(sym => {
      balances[sym] = 100 + Math.random() * 50; // 100–150
    });

    // build selects
    const tokens = Object.keys(prices).sort();
    tokens.forEach(t => {
      fromTokenSelect.append(new Option(t, t));
      toTokenSelect.append(new Option(t, t));
    })

    // restore or defaults
    const saved = load();
    if (saved.f && prices[saved.f]) fromTokenSelect.value = saved.f; else if (prices.ETH) fromTokenSelect.value="ETH";
    if (saved.t && prices[saved.t]) toTokenSelect.value = saved.t; else if (prices.USDC) toTokenSelect.value="USDC";
    
    updateAll();
  } catch (e) {
    showGlobalError("Failed to load token prices. Please refresh.");
    console.error(e);
  }finally{
    setLoading(false);
  }
}

// --- Validation helpers ---
function clearErrors() {
  amtError.textContent = "";
  amtError.classList.add("hidden");
  inputAmount.classList.remove("invalid");

  globalError.textContent = "";
  globalError.classList.add("hidden");
}

function showAmtError(msg) {
  amtError.textContent = msg;
  amtError.classList.remove("hidden");
  inputAmount.classList.add("invalid");
}

function showGlobalError(msg) {
  globalError.textContent = msg;
  globalError.classList.remove("hidden");
}

function validate() {
  clearErrors();
  let ok = true;

  //amount validation
  const raw = inputAmount.value.trim();
  const amount = Number(raw);

  if (raw === "") {
    showAmtError("Please enter an amount");
    ok = false;
  } else if (!isFinite(amount)) {
    showAmtError("Amount must be a number");
    ok = false;
  } else if (amount <= 0) {
    showAmtError("Amount must be greater than 0.");
    ok = false;
  } else if (!/^\d+(\.\d{1,8})?$/.test(raw)) {
    showAmtError("Max 8 decimals allowed.");
    ok = false;
  }

  //token validation
  const from = fromTokenSelect.value;
  const to = toTokenSelect.value;

  if (from === to) {
    showGlobalError("From and To must be diffrent");
    ok = false;
  }

  if (!prices[from]) {
    showGlobalError(`Missing price for ${from}.`);
  }

  if (!prices[to]) {
    showGlobalError(`Missing price for ${to}.`)
  }

  // mock balance check
  if (ok) {
    const bal = balances[from] || 0;
    if (amount > bal) { 
      showAmtError(`Amount exceeds balance (${fmt6(bal)} ${from}).`);
      ok=false; 
    }
  }

  swapBtn.disabled = !ok;
  return ok;
}

// --- calculation + UI
function updateUsdHints() {
  const a = Number(inputAmount.value);
  const from = fromTokenSelect.value, to = toTokenSelect.value;
  const fromPrice = prices[from], toPrice = prices[to];
  if (isFinite(a) && fromPrice) {
    fromUsdEl.textContent = `≈ $${fmt2(a * fromPrice)}`; 
  }
  else {
    fromUsdEl.textContent="≈ —"; 
  }
  const out = Number(outputAmount.value);

  if (isFinite(out) && toPrice) {
    toUsdEl.textContent = `≈ $${fmt2(out*toPrice)}`; 
  }
  else {
    toUsdEl.textContent="≈ —";
  }
  const bal = balances[from];
  fromBalEl.textContent = `Balance: ${bal?fmt6(bal):"—"} ${from || ""}`;
}


// --- Calculation + UI updates
function calculate() {
  const amount = Number(inputAmount.value);
  const from = fromTokenSelect.value;
  const to = toTokenSelect.value;

  const fromPrice = prices[from];
  const toPrice = prices[to];

  if (!isFinite(amount) || !fromPrice || !toPrice) {
    outputAmount.value = "";
    rateEl.textContent = "Rate: —";
    updateUsdHints();
    return;
  }
  
  const usdValue = amount * fromPrice;
  const result = usdValue / toPrice;
  outputAmount.value = fmt6(result);
  rateEl.textContent = `Rate: 1 ${from} ≈ ${fmt6(fromPrice/toPrice)} ${to}}`;
  updateUsdHints();
}

function updateIcons() {
  const from = fromTokenSelect.value;
  const to = toTokenSelect.value;
  if (from) setIcon(fromIcon, from);
  if (to) setIcon(toIcon, to);
}
function updateAll() {
  updateIcons();
  save();
  validate();
  calculate();
}

// --- Sumit (mock backend) ---
swapBtn.addEventListener("click", () => {
  if (!validate()) return;
  
  swapBtn.disabled = true;
  swapBtn.textContent = "PROCESSING...";
  toast.classList.add("hidden");

  // simulate network delay
  setTimeout(() => {
    swapBtn.textContent = "CONFIRM SWAP";
    swapBtn.disabled = false;
    toast.textContent = "Swap submitted!";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2200);
  }, 1000);
});

// Swap direction
flipBtn.addEventListener("click", ()=>{
  const from = fromTokenSelect.value;
  fromTokenSelect.value = toTokenSelect.value;
  toTokenSelect.value = from;

  // move numbers sensibly: set inputAmount based on previous output
  const prevOut = outputAmount.value;
  if (prevOut){ inputAmount.value = prevOut; }
  updateAll();
});

// Max button (mock)
maxBtn.addEventListener("click", ()=>{
  const from = fromTokenSelect.value;
  const bal = balances[from] || 0;
  if (bal>0){ inputAmount.value = fmt6(bal); updateAll(); }
});

// --- Live updates ---
document.getElementById("swap-form").addEventListener("input", updateAll);
fromTokenSelect.addEventListener("change", updateAll);
toTokenSelect.addEventListener("change", updateAll);

// init
loadTokens();
