const API_URL = "https://interview.switcheo.com/prices.json";
const ICON_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/";

let prices = {};
const fromTokenSelect = document.getElementById("from-token");
const toTokenSelect = document.getElementById("to-token");
const inputAmount = document.getElementById("input-amount");
const outputAmount = document.getElementById("output-amount");

async function loadTokens() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // lấy giá cuối cùng cho mỗi token
    data.forEach(item => {
      prices[item.currency] = item.price;
    });

    // tạo options dropdown
    Object.keys(prices).forEach(token => {
      const option1 = document.createElement("option");
      option1.value = token;
      option1.textContent = token;
      fromTokenSelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = token;
      option2.textContent = token;
      toTokenSelect.appendChild(option2);
    });

    // chọn mặc định
    fromTokenSelect.value = "ETH";
    toTokenSelect.value = "USDC";
  } catch (e) {
    console.error("Error loading tokens", e);
  }
}

function calculateSwap() {
  const fromToken = fromTokenSelect.value;
  const toToken = toTokenSelect.value;
  const amount = parseFloat(inputAmount.value);

  if (!fromToken || !toToken || isNaN(amount)) {
    outputAmount.value = "";
    return;
  }

  if (fromToken === toToken) {
    outputAmount.value = "Invalid";
    return;
  }

  const fromPrice = prices[fromToken];
  const toPrice = prices[toToken];

  if (fromPrice && toPrice) {
    const usdValue = amount * fromPrice;
    const result = usdValue / toPrice;
    outputAmount.value = result.toFixed(6);
  }
}

document.getElementById("swap-form").addEventListener("input", calculateSwap);

loadTokens();
