"use strict";

const btnModeSwitch = document.querySelector(".btn__toggle");
const searchInput = document.querySelector(".search__input");
const form = document.querySelector("form");
const selectEl = document.querySelector(".select");

const cardContainer = document.querySelector(".cards__container");
const body = document.body;

let clickBorder = [];

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

    if (!response.ok) throw new Error("Country not found!");

    // todo: refactor
    if (data.length > 1) return sorted;
    if (data.length === 1) return data;
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

/**
 * Display the detailed information of the selected country
 * @param {*} data receives an array of "data" based on the selected country or region.
 */
const renderDetailedInfo = async function (data) {
  const [{ name: currency }] = Object.values(data.currencies);
  const languages = Object.values(data.languages).map((language) => language);
  const [{ official: nativeName }] = Object.values(data.name.nativeName);

  const borders = await borderMarkup(data);

  const htmlMarkup = `
  <div class="detailed__info">
  <button class="btn btn__back">
    <img src="images/arrow-left.svg" alt="icon" class="icon" />
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
  </div>
  `;

  body.innerHTML = "";
  body.insertAdjacentHTML("beforeend", htmlMarkup);
  backBtn();
  borderClickEvent();
};

/**
 *  Creates a button border markup
 * @param {*} data - receives an array of countries code
 * @returns an html button which contains the neighboring country
 */
const borderMarkup = async function (data) {
  const neighbor = data?.borders;
  const borders = [];

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

  return [...borders];
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

// Clear UI
const clearFields = function () {
  cardContainer.innerHTML = "";
  searchInput.value = "";
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
// Events;
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

      console.log(clickBorder);

      // Always render the last click item
      // Todo: refactor
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

    if (clickBorder.length !== 0) {
      leng--;

      const prevCountry = clickBorder[leng];
      clickBorder.pop();
      renderDetailedInfo(prevCountry);
    }

    // // Not working length is NULL
    // if (!clickBorder.length) window.location.reload();
  });
};

// Init
(async function () {
  // Returns an array
  const data = await getCountries(`
  https://restcountries.com/v3.1/all`);

  renderCard(data);
})();
