// results.js

const welcome = document.getElementById("welcome");
const results = document.getElementById("results");
const poiCount = document.getElementById("poiCount");

export function showResults(pois) {
  welcome.style.display = "none";
  results.style.display = "block";

  updatePOICount(pois.length);
}

function updatePOICount(count) {
  poiCount.textContent = `${count} POIs encontrados`;
}
