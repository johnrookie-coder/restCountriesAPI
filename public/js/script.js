"use strict";

const btnModeSwitch = document.querySelector(".btn__toggle");
const searchInput = document.querySelector(".search__input");
const form = document.querySelector("form");
const selectEl = document.querySelector(".select");

const cardContainer = document.querySelector(".cards__container");
const body = document.body;

// Form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the search country
  const searchValue = searchInput.value;

  // Await for the response
  const country = await getCountries(
    `https://restcountries.com/v3.1/name/${searchValue}`
  );

  // Guard clause
  if (searchValue === "") return;
  if (country === undefined) return;

  // Check whether the country exists and the searchValue is not an empty string.
  if (searchValue !== "" && country !== undefined) {
    clearFields();
    renderCard(country);
  }
});

// Mode switch
btnModeSwitch.addEventListener("click", (e) => {
  // HTML markup for light and dark mode
  const htmlDarkMode = `
    <img src="images/moon.svg" alt="icon" class="icon" />
    <span>Dark Mode</span>
  `;

  const htmlLightMode = `
    <img src="images/sun.svg" alt="icon" class="icon" />
    <span>Light Mode</span>
  `;

  // Toggle between two modes
  if (e.target.closest(".btn")) body.classList.toggle("dark");

  // Clearing existing markup
  btnModeSwitch.innerHTML = "";

  // Set the markup based on which mode is selected
  if (!body.classList.contains("dark"))
    btnModeSwitch.insertAdjacentHTML("beforeend", htmlDarkMode);

  if (body.classList.contains("dark"))
    btnModeSwitch.insertAdjacentHTML("beforeend", htmlLightMode);
});

/**
 * Get countries from a web server
 * @param {string} url based on search, region, and all countries
 * @returns Promised
 */

const getCountries = async function (url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    // From the array, we loop through with each of them
    // Take the country common name and sort it alphabetically.
    const sorted = data.sort((next, prev) =>
      next.name.common > prev.name.common ? 1 : -1
    );

    if (!response.ok) throw new Error("Country not found cc!");
    return sorted;
  } catch (err) {
    renderErr(err);
  }
};

/**
 *  Displays an card/s markup in the UI
 * @param {Array} data - receives an array of "data" based on the selected country or region.
 */
const renderCard = function (data) {
  for (const countryData of data) {
    const cardMarkup = `
    <div class="card">
      <div class="card__img">
        <img
          src="${countryData.flags.svg}"
          alt="${countryData.name.common}"
          class="card__flag"
        />
      </div>
      <div class="card__desc">
        <h2 class="card__name">${countryData.name.official}</h2>
        <p class="card__text"><strong>Population:</strong> ${formatNumber(
          countryData.population
        )}</p>
        <p class="card__text"><strong>Region:</strong> ${countryData.region}</p>
        <p class="card__text"><strong>Capital:</strong> ${
          countryData.capital
        }</p>
      </div>
    </div>
  `;
    cardContainer.insertAdjacentHTML("beforeend", cardMarkup);
  }
};

// Clear UI
const clearFields = function () {
  cardContainer.innerHTML = "";
  searchInput.value = "";
};

/**
 * Displays an error markup in the UI
 * @param {string} err - contains the error message that we manually throw.
 */
const renderErr = function (err) {
  const errMarkup = `
  <div class="error">
    <h1 class="error__status">404</h1>
    <p class="error__message">${err}</p>
  </div>;
  `;

  clearFields();
  cardContainer.insertAdjacentHTML("beforeend", errMarkup);
};

// Watch any changes from the select element
selectEl.addEventListener("change", async (e) => {
  // Get the selected region
  const region = e.target.value;

  // Await for the response from the server
  const country = await getCountries(
    `https://restcountries.com/v3.1/region/${region}`
  );

  clearFields();
  renderCard(country);
});

/**
 * Format the number based on the user language
 * @param {Number} num accepts random number
 * @returns number, a formatted one based on the user language
 */
const formatNumber = function (num) {
  const locale = navigator.language;
  return new Intl.NumberFormat(locale).format(num);
};

// Init
(async function () {
  // Returns an array
  const data = await getCountries(`
  https://restcountries.com/v3.1/all`);

  renderCard(data);
})();

/////////
// Todo
// 1. Add loading while fetching
// 2. Icons change color when it is switched to light | dark mode.
// 3. Start working with the detailed view
