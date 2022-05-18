"use strict";

const btnModeSwitch = document.querySelector(".btn__toggle");
const searchInput = document.querySelector(".search__input");
const form = document.querySelector("form");
const selectEl = document.querySelector(".select");

const cardContainer = document.querySelector(".cards__container");
const detailedInfo = document.querySelector(".detailed__info");
const body = document.body;

const loadingMarkup = `
  <div class="loading">
     <div class="loader"></div>
     <span>Loading...</span>
  </div>
`;

let clickBorder = [];

/**
 * Get countries from a web server
 * @param {string} url based on search, region, and all countries
 * @returns Promised
 */
const getCountries = async function (url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data === undefined)
      throw new Error("Country not found!");

    // From the array, we loop through with each of them
    // Take the country common name and sort it alphabetically.
    const sorted = data.sort((next, prev) =>
      next.name.common > prev.name.common ? 1 : -1
    );

    if (data.length === 1) return data;
    if (data.length > 1) return sorted;
  } catch (err) {
    detailedInfo.innerHTML = "";
    renderErr(err);
  } finally {
    cardContainer.innerHTML = "";
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

/**
 * Display the detailed information of the selected country
 * @param {*} data receives an array of "data" based on the selected country or region.
 */
const renderDetailedInfo = async function (data) {
  try {
    const [{ name: currency }] = Object.values(data.currencies);
    const languages = Object.values(data.languages).map((language) => language);
    const [{ official: nativeName }] = Object.values(data.name.nativeName);

    // Show spinner
    detailedInfo.innerHTML = loadingMarkup;

    const borders = await borderMarkup(data);
    const htmlMarkup = `
      <button class="btn btn__back">
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        style="user-select: auto"
        class="icon icon--back"
      >
      <line
        x1="216"
        y1="128"
        x2="40"
        y2="128"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
        style="user-select: auto"
      ></line>
      <polyline
        points="112 56 40 128 112 200"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
        style="user-select: auto"
      ></polyline>
    </svg>
      <span>Back</span>
    </button>

  <div class="country">
    <div class="country__imgContainer">
      <img
        src="${data.flags.svg}"
        alt="country flag"
        class="country__img"
      />
    </div>

      <section class="country_wrapper">
        <h2 class="country__name"> ${data.name.common}</h2>
        <div class="country__details">
          <div class="country__col--1">
            <p><strong>Native Name:</strong> ${nativeName}</p>
            <p><strong>Population:</strong> ${formatNumber(data.population)}</p>
            <p><strong>Region:</strong> ${data.region}</p>
            <p><strong>Sub Region:</strong> ${data.subregion}</p>
            <p><strong>Capital:</strong> ${data.capital}</p>
          </div>

          <div class="country__col--2">
            <p><strong>Top Level Domain:</strong> ${data.tld[0]}</p>
            <p><strong>Currencies:</strong> ${currency}</p>
            <p>
              <strong>Languages:</strong> ${[...languages].join(", ")}
            </p>
          </div>

          <div class="country__col--3">
            <div class="border">
              <div class="border__text">
                <p><strong> ${
                  borders !== undefined ? "Border Countries: " : ""
                }</strong></p>
              </div>
              <div class="border__country">
                ${borders !== undefined ? borders : ""}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
    // main.innerHTML = "";
    // detailedInfo.insertAdjacentHTML("beforeend", htmlMarkup);

    detailedInfo.innerHTML = htmlMarkup;
    showDetailedInfo();
    backBtn();
    borderClickEvent();
  } catch (err) {
    renderErr(err);
  }
};

/**
 *  Creates a button border markup
 * @param {*} data - receives an array of countries code
 * @returns an html button which contains the neighboring country
 */
const borderMarkup = async function (data) {
  const neighbor = data?.borders;
  const borders = [];

  try {
    // Guard clause
    if (!neighbor) return;

    // Creates button which contains the neighboring country of the selected country.
    for (const code of neighbor) {
      const [dataBorders] = await getCountries(
        `https://restcountries.com/v3.1/alpha/${code}`
      );
      const borderMarkup = `
         <button class="btn btn__border">${dataBorders.name.common}</button>
      `;

      borders.push(borderMarkup);
    }
  } catch (err) {
    renderErr(err);
  }

  return [...borders].join(" ");
};

/**
 * Displays an error markup in the UI
 * @param {string} err - contains the error message that we manually throw.
 */
const renderErr = function (err) {
  const errMarkup = `
  <div class="error">
    <h1 class="error__status">404</h1>
    <p class="error__message">${err.message}</p>
  </div>;
  `;

  clearFields();
  detailedInfo.insertAdjacentHTML("beforeend", errMarkup);
};

// Clear UI
const clearFields = function () {
  cardContainer.innerHTML = "";
  searchInput.value = "";
};

// Show card container and hide detailedInfo
const showCardContainer = function () {
  cardContainer.classList.remove("hidden");
  detailedInfo.innerHTML = "";
  detailedInfo.classList.add("hidden");
};

// Show detailed info and hide card container
const showDetailedInfo = function () {
  cardContainer.classList.add("hidden");
  detailedInfo.classList.remove("hidden");
};

/**
 * Format the number based on the user language
 * @param {Number} num accepts random number
 * @returns number, a formatted one based on the user language
 */
const formatNumber = function (num) {
  const locale = navigator.language;
  return new Intl.NumberFormat(locale).format(num);
};

//////////////////////
// Events
// Form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // Get the search country
    const searchValue = searchInput.value;

    // Show spinner
    cardContainer.innerHTML = loadingMarkup;

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
      showCardContainer();
      renderCard(country);
    }
  } catch (err) {
    renderErr(err);
  }
});

// Theme switch
btnModeSwitch.addEventListener("click", (e) => {
  // HTML markup for light and dark mode
  const htmlDarkMode = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    style="user-select: auto"
    class="icon"
  >
    <path
      d="M216.7,152.6A91.9,91.9,0,0,1,103.4,39.3h0A92,92,0,1,0,216.7,152.6Z"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></path>
  </svg>
  <span>Dark Mode</span>
  `;

  const htmlLightMode = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    style="user-select: auto"
    class="icon"
  >
    <circle
      cx="128"
      cy="128"
      r="60"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></circle>
    <line
      x1="128"
      y1="36"
      x2="128"
      y2="16"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="62.9"
      y1="62.9"
      x2="48.8"
      y2="48.8"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="36"
      y1="128"
      x2="16"
      y2="128"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="62.9"
      y1="193.1"
      x2="48.8"
      y2="207.2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="128"
      y1="220"
      x2="128"
      y2="240"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="193.1"
      y1="193.1"
      x2="207.2"
      y2="207.2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="220"
      y1="128"
      x2="240"
      y2="128"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
    <line
      x1="193.1"
      y1="62.9"
      x2="207.2"
      y2="48.8"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      style="user-select: auto"
    ></line>
  </svg>
  <span>Light mode</span>
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

// Add a click event to the entire cardContainer and
// Get the class named "card" and use its attribute to display detailed country info.
cardContainer.addEventListener("click", async (e) => {
  // Get the name of the selected/click country and search it by name.

  const country = e.target
    .closest(".card")
    .children[0].children[0].getAttribute("alt");

  const [data] = await getCountries(
    `https://restcountries.com/v3.1/name/${country}`
  );

  // Push the data from the clickBorder (track of the click event on the borders)
  clickBorder.push(data);

  if (e.target.closest(".card")) {
    renderDetailedInfo(data);
  }

  if (!e.target.closest(".card")) return;
});

// Watch any changes from the select element
selectEl.addEventListener("change", async (e) => {
  try {
    // Get the selected region
    const region = e.target.value;

    // Show spinner
    cardContainer.innerHTML = loadingMarkup;

    // Await for the response from the server
    const country = await getCountries(
      `https://restcountries.com/v3.1/region/${region}`
    );

    clearFields();
    showCardContainer();
    renderCard(country);
  } catch (err) {
    renderErr(err);
  }
});

/**
 * Adds a click event to the border country (each button)
 * @returns an array of the clicked border country
 */
const borderClickEvent = function () {
  const btnBorder = document.querySelectorAll(".btn__border");

  btnBorder.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const country = e.target.textContent;
      const [data] = await getCountries(
        `https://restcountries.com/v3.1/name/${country}`
      );

      // Records the click on the border country and push it on the clickBorder
      clickBorder.push(data);

      // Always render the last click item
      const countryData = clickBorder.length - 1;
      renderDetailedInfo(clickBorder[countryData]);
    });

    return clickBorder;
  });
};

// Add click event to back button
const backBtn = function () {
  const btnBack = document.querySelector(".btn__back");
  btnBack.addEventListener("click", (e) => {
    clickBorder;

    let leng = clickBorder.length - 1;
    leng--;

    if (leng >= 0) {
      const prevCountry = clickBorder[leng];
      clickBorder.pop();
      renderDetailedInfo(prevCountry);
    }

    if (leng < 0) window.location.reload();
  });
};

// Init
(async function () {
  // Returns an array
  const data = await getCountries(`
  https://restcountries.com/v3.1/all`);

  renderCard(data);
})();
