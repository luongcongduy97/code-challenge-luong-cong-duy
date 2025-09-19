const API_URL = "https://interview.switcheo.com/prices.json";
const ICON_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/";

let prices = {};
const fromTokenSelect = document.getElementById("from-token");
const toTokenSelect = document.getElementById("to-token");
const inputAmount = document.getElementById("input-amount");
const outputAmount = document.getElementById("output-amount");
const amtError = document.getElementById("amt-error");
const globalError = document.getElementById("global-error");
const rateEl = document.getElementById("rate");
const swapBtn = document.getElementById("swap-btn");
const toast = document.getElementById("toast");

// --- Load tokens and prices ---
async function loadTokens() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // keep the lastest seen price token
    data.forEach(item => { prices[item.currency] = item.price });

    const tokens = Object.keys(prices).sort();
    tokens.forEach(t => {
      fromTokenSelect.append(new Option(t, t));
      toTokenSelect.append(new Option(t, t));
    })

    // sensible defaults if present
    if (prices.ETH) fromTokenSelect.value = "ETH";
    if (prices.USDC) toTokenSelect.value = "USDC";
    
    updateAll();
  } catch (e) {
    showGlobalError("Failed to load token prices. Please refresh.");
    console.error(e);
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

  swapBtn.disabled = !ok;
  return ok;
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
    rateEl.textContent = "-";
    return;
  }
  
  const usdValue = amount * fromPrice;
  const result = usdValue / toPrice;
  outputAmount.value = result.toFixed(6);
  rateEl.textContent = `Rate: 1 ${from} ≈ ${(fromPrice / toPrice).toFixed(6)} ${to}}`;
}

function updateAll() {
  validate();
  calculate();
}

// --- Sumit (mock backend) ---
swapBtn.addEventListener("click", async () => {
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
    setTimeout(() => toast.classList.add("hidden"), 2500);
  }, 1200);
});

// --- Live updates ---
document.getElementById("swap-form").addEventListener("input", updateAll);
fromTokenSelect.addEventListener("change", updateAll);
toTokenSelect.addEventListener("change", updateAll);

// init
loadTokens();
