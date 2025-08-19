// loading.js

let isLoading = false;
const searchButton = document.getElementById("searchButton");
const welcome = document.getElementById("welcome");
const loading = document.getElementById("loading");
const results = document.getElementById("results");

export function setLoading(loadingState) {
  isLoading = loadingState;

  if (isLoading) {
    searchButton.disabled = true;
    searchButton.innerHTML = `<div class="spinner"></div>`;
    welcome.style.display = "none";
    results.style.display = "none";
    loading.style.display = "flex";
  } else {
    searchButton.disabled = false;
    searchButton.innerHTML = `
      <svg class="search-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    `;
    loading.style.display = "none";
  }
}
