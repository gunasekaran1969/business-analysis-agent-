```javascript
let salesData = [];

/* -----------------------------
   CSV PARSER
----------------------------- */

function parseCSV(text) {

    const lines = text.trim().split(/\r?\n/);

    const headers = lines[0]
        .split(",")
        .map(h => h.trim().toLowerCase());

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
            units: Number(row.units),
            unit_price: Number(row.unit_price),
            revenue: Number(row.revenue)
        };
    });
}


/* -----------------------------
   FILE UPLOAD
----------------------------- */

document.getElementById("fileInput")
    .addEventListener("change", function(event) {

        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {

            salesData = parseCSV(e.target.result);

            analyzeData();
        };

        reader.readAsText(file);
    });


/* -----------------------------
   SAMPLE DATA
----------------------------- */

async function loadSampleData() {

    try {

        const response =
            await fetch("sales-transactions-1000.csv");

        const text = await response.text();

        salesData = parseCSV(text);

        analyzeData();

    } catch (error) {

        alert(
            "Could not load the sample CSV. Make sure sales-transactions-1000.csv is in the same folder as index.html."
        );
    }
}


/* -----------------------------
   MAIN ANALYSIS
----------------------------- */

function analyzeData() {

    if (!salesData.length) {

        alert("No sales data found.");

        return;
    }

    document
        .getElementById("dashboard")
        .classList.remove("hidden");


    /* TOTALS */

    const totalRevenue =
        salesData.reduce(
            (sum, item) => sum + item.revenue,
            0
        );

    const totalUnits =
        salesData.reduce(
            (sum, item) => sum + item.units,
            0
        );

    const avgRevenue =
        totalRevenue / salesData.length;


    /* GROUP DATA */

    const products =
        groupData("product");

    const regions =
        groupData("region");

    const channels =
        groupData("channel");


    /* TOP ITEMS */

    const topProduct =
        getTop(products);

    const topRegion =
        getTop(regions);

    const topChannel =
        getTop(channels);


    /* KPI DISPLAY */

    document.getElementById("totalRevenue")
        .textContent = formatMoney(totalRevenue);

    document.getElementById("totalUnits")
        .textContent = totalUnits.toLocaleString();

    document.getElementById("avgRevenue")
        .textContent = formatMoney(avgRevenue);

    document.getElementById("topProduct")
        .textContent = topProduct.name;

    document.getElementById("topRegion")
        .textContent = topRegion.name;

    document.getElementById("topChannel")
        .textContent = topChannel.name;


    /* TABLES */

    createTable(
        "productTable",
        products
    );

    createTable(
        "regionTable",
        regions
    );

    createTable(
        "channelTable",
        channels
    );


    /* INSIGHTS */

    createInsights(
        totalRevenue,
        totalUnits,
        avgRevenue,
        topProduct,
        topRegion,
        topChannel
    );
}


/* -----------------------------
   GROUPING
----------------------------- */

function groupData(field) {

    const groups = {};

    salesData.forEach(item => {

        const key = item[field];

        if (!groups[key]) {

            groups[key] = {
                name: key,
                revenue: 0,
                units: 0
            };
        }

        groups[key].revenue += item.revenue;
        groups[key].units += item.units;
    });

    return Object.values(groups)
        .sort((a, b) => b.revenue - a.revenue);
}


/* -----------------------------
   TOP PERFORMER
----------------------------- */

function getTop(data) {

    if (!data.length) {

        return {
            name: "-",
            revenue: 0,
            units: 0
        };
    }

    return data[0];
}


/* -----------------------------
   TABLE CREATION
----------------------------- */

function createTable(elementId, data) {

    const table =
        document.getElementById(elementId);

    table.innerHTML = "";

    data.forEach(item => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(item.name)}</td>
            <td>${formatMoney(item.revenue)}</td>
            <td>${item.units.toLocaleString()}</td>
        `;

        table.appendChild(row);
    });
}


/* -----------------------------
   BUSINESS INSIGHTS
----------------------------- */

function createInsights(
    totalRevenue,
    totalUnits,
    avgRevenue,
    topProduct,
    topRegion,
    topChannel
) {

    const insights =
        document.getElementById("insights");

    insights.innerHTML = "";

    const messages = [

        `Total revenue generated is ${formatMoney(totalRevenue)} from ${totalUnits.toLocaleString()} units.`,

        `${topProduct.name} is the highest-revenue product, generating ${formatMoney(topProduct.revenue)}.`,

        `${topRegion.name} is the strongest region with revenue of ${formatMoney(topRegion.revenue)}.`,

        `${topChannel.name} is the strongest sales channel with revenue of ${formatMoney(topChannel.revenue)}.`,

        `The average revenue per transaction is ${formatMoney(avgRevenue)}.`,

        `Business recommendation: focus on the highest-performing product, region and channel while investigating weaker performers for improvement opportunities.`
    ];

    messages.forEach(message => {

        const div =
            document.createElement("div");

        div.className = "insight";

        div.textContent = "💡 " + message;

        insights.appendChild(div);
    });
}


/* -----------------------------
   MONEY FORMAT
----------------------------- */

function formatMoney(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }
    ).format(value);
}


/* -----------------------------
   SECURITY
----------------------------- */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```
