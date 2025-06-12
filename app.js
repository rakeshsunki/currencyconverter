/**
 * Currency Converter Application
 * Uses ExchangeRate-API to fetch live currency exchange rates
 */

// API endpoint
const API_URL = "/api/latest/";

// DOM elements
const amountInput = document.querySelector("#amount");
const fromCurrencySelect = document.querySelector("#from-currency");
const toCurrencySelect = document.querySelector("#to-currency");
const convertBtn = document.querySelector(".convert-btn");
const resultDisplay = document.querySelector("#result");
const swapBtn = document.querySelector("#swap-btn");
const fromFlagImg = document.querySelector(".from .flag-img");
const toFlagImg = document.querySelector(".to .flag-img");  // Fix: Add specific selector for the "to" flag

/**
 * Initialize the application
 */
function initApp() {
  loadCurrencyOptions();
  setupEventListeners();
  updateExchangeRate();
}

/**
 * Load currency options into select dropdowns
 */
function loadCurrencyOptions() {
  // Popular currencies to show at the top
  const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR", "CNY"];
  
  // Create option groups
  const popularOptgroup = document.createElement("optgroup");
  popularOptgroup.label = "Popular Currencies";
  
  const otherOptgroup = document.createElement("optgroup");
  otherOptgroup.label = "All Currencies";
  
  // Add popular currencies first
  popularCurrencies.forEach(currCode => {
    const option = createCurrencyOption(currCode);
    popularOptgroup.appendChild(option);
  });
  
  // Add all other currencies
  Object.keys(countryList).forEach(currCode => {
    if (!popularCurrencies.includes(currCode)) {
      const option = createCurrencyOption(currCode);
      otherOptgroup.appendChild(option);
    }
  });
  
  // Add option groups to selects - Fix: Clone nodes correctly
  fromCurrencySelect.appendChild(popularOptgroup.cloneNode(true));
  fromCurrencySelect.appendChild(otherOptgroup.cloneNode(true));
  
  // Fix: Create fresh copies for the second dropdown
  const toPopularOptgroup = document.createElement("optgroup");
  toPopularOptgroup.label = "Popular Currencies";
  
  const toOtherOptgroup = document.createElement("optgroup");
  toOtherOptgroup.label = "All Currencies";
  
  // Add currencies to the second set of optgroups
  popularCurrencies.forEach(currCode => {
    const option = createCurrencyOption(currCode);
    toPopularOptgroup.appendChild(option);
  });
  
  Object.keys(countryList).forEach(currCode => {
    if (!popularCurrencies.includes(currCode)) {
      const option = createCurrencyOption(currCode);
      toOtherOptgroup.appendChild(option);
    }
  });
  
  toCurrencySelect.appendChild(toPopularOptgroup);
  toCurrencySelect.appendChild(toOtherOptgroup);
  
  // Set default values
  fromCurrencySelect.value = "USD";
  toCurrencySelect.value = "INR";
  
  // Update flags for initial values
  updateFlag(fromCurrencySelect, fromFlagImg);
  updateFlag(toCurrencySelect, toFlagImg);
}

/**
 * Create a currency option element
 */
function createCurrencyOption(currCode) {
  const option = document.createElement("option");
  option.value = currCode;
  option.textContent = `${currCode} - ${getCurrencyName(currCode)}`;
  return option;
}

/**
 * Get currency full name
 */
function getCurrencyName(code) {
  const currencyNames = {
    USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen",
    CAD: "Canadian Dollar", AUD: "Australian Dollar", INR: "Indian Rupee",
    CNY: "Chinese Yuan", NZD: "New Zealand Dollar", BRL: "Brazilian Real",
    CHF: "Swiss Franc", ZAR: "South African Rand", RUB: "Russian Ruble",
    SGD: "Singapore Dollar", MXN: "Mexican Peso", HKD: "Hong Kong Dollar"
  };
  return currencyNames[code] || code;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Listen for currency selection changes - Fix: Pass correct flag element
  fromCurrencySelect.addEventListener("change", () => {
    updateFlag(fromCurrencySelect, fromFlagImg);
    updateExchangeRate();
  });
  
  toCurrencySelect.addEventListener("change", () => {
    updateFlag(toCurrencySelect, toFlagImg);
    updateExchangeRate();
  });
  
  // Listen for amount input changes
  amountInput.addEventListener("input", updateExchangeRate);
  
  // Listen for form submission
  convertBtn.addEventListener("click", (event) => {
    event.preventDefault();
    updateExchangeRate();
  });
  
  // Listen for swap button
  swapBtn.addEventListener("click", swapCurrencies);
}

/**
 * Update the flag image based on selected currency
 * Fix: Pass the specific flag image to update
 */
function updateFlag(selectElement, flagImg) {
  const currencyCode = selectElement.value;
  const countryCode = countryList[currencyCode];
  const flagUrl = `https://flagsapi.com/${countryCode}/flat/64.png`;
  
  // Fix: Update the specific flag image passed as parameter
  flagImg.src = flagUrl;
  flagImg.alt = `${currencyCode} flag`;
}

/**
 * Swap the selected currencies
 */
function swapCurrencies() {
  const tempCurrency = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = tempCurrency;
  
  // Fix: Update both flags with correct elements
  updateFlag(fromCurrencySelect, fromFlagImg);
  updateFlag(toCurrencySelect, toFlagImg);
  updateExchangeRate();
  
  // Add animation effect
  swapBtn.classList.add("rotate");
  setTimeout(() => swapBtn.classList.remove("rotate"), 500);
}

/**
 * Update the exchange rate display
 */
async function updateExchangeRate() {
  // Show loading state
  resultDisplay.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Getting exchange rate...';
  
  // Validate and format amount
  let amount = parseFloat(amountInput.value) || 1;
  if (amount < 0) amount = 1;
  amountInput.value = amount;
  
  try {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    // Fetch exchange rates
    const response = await fetch(`${API_URL}${fromCurrency}`);
    const data = await response.json();
    
    if (!data.rates || !data.rates[toCurrency]) {
      throw new Error("Invalid response from API");
    }
    
    const rate = data.rates[toCurrency];
    const convertedAmount = (amount * rate).toFixed(4);
    
    // Format the result for display
    const formattedAmount = new Intl.NumberFormat().format(amount);
    const formattedResult = new Intl.NumberFormat().format(convertedAmount);
    
    // Show the result with nice animation
    resultDisplay.style.opacity = 0;
    setTimeout(() => {
      resultDisplay.innerHTML = `
        <div class="result-amount">${formattedAmount} ${fromCurrency} = ${formattedResult} ${toCurrency}</div>
        <div class="result-rate">1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}</div>
      `;
      resultDisplay.style.opacity = 1;
    }, 300);
    
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    resultDisplay.innerHTML = `<span class="error"><i class="fas fa-exclamation-triangle"></i> Failed to get exchange rate. Please try again.</span>`;
  }
}

// Start the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);