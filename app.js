/* =====================================================
   BUSINESS ANALYSIS AI AGENT - app.js
===================================================== */

let salesData = [];

const loadStatus = document.getElementById("loadStatus");
const answerBox = document.getElementById("answerBox");
const askBtn = document.getElementById("askBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const csvFileInput = document.getElementById("csvFileInput");
const questionInput = document.getElementById("questionInput");

/* =====================================================
   1. CSV PARSER
===================================================== */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim();
    });
    return {
      date: row.date,
      region: row.region,
      product: row.product,
      channel: row.channel,
      units: Number(row.units)
    };
  });
}

/* =====================================================
   2. LOAD SAMPLE DATASET (fetch from same folder)
===================================================== */
loadSampleBtn.addEventListener("click", async () => {
  loadStatus.textContent = "Loading sample dataset...";
  try {
    const response = await fetch("sales-transactions-1000.csv");

    if (!response.ok) {
      throw new Error(`File not found (status ${response.status})`);
    }

    const text = await response.text();
    salesData = parseCSV(text);

    loadStatus.textContent = `Loaded ${salesData.length} rows successfully.`;
  } catch (err) {
    loadStatus.textContent = `Error loading sample dataset: ${err.message}`;
    console.error(err);
  }
});

/* =====================================================
   3. LOAD FILE FROM DEVICE (manual upload)
===================================================== */
csvFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    salesData = parseCSV(e.target.result);
    loadStatus.textContent = `Loaded ${salesData.length} rows from ${file.name}.`;
  };
  reader.onerror = () => {
    loadStatus.textContent = "Error reading file.";
  };
  reader.readAsText(file);
});

/* =====================================================
   4. ASK QUESTION -> CALL /api/analyze
===================================================== */
askBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    answerBox.textContent = "Please type a question first.";
    return;
  }

  if (!salesData.length) {
    answerBox.textContent = "Please load sales data first (use the button above).";
    return;
  }

  answerBox.textContent = "Analyzing...";
  askBtn.disabled = true;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, data: salesData })
    });

    const result = await response.json();

    if (!response.ok) {
      answerBox.textContent = `Error: ${result.error || "Something went wrong."}`;
    } else {
      answerBox.textContent = result.answer;
    }
  } catch (err) {
    answerBox.textContent = `Request failed: ${err.message}`;
    console.error(err);
  } finally {
    askBtn.disabled = false;
  }
});
