```javascript
/* =====================================================
   BUSINESS ANALYSIS AI AGENT
   Complete app.js
===================================================== */

let salesData = [];


/* =====================================================
   1. CSV PARSER
===================================================== */

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


/* =====================================================
   2. FILE UPLOAD
===================================================== */

const fileInput =
    document.getElementById("fileInput");

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload =
                function(e) {

                    salesData =
                        parseCSV(e.target.result);

                    analyzeData();
                };

            reader.readAsText(file);
        }
    );
}


/* =====================================================
   3. LOAD SAMPLE DATASET
===================================================== */

async function loadSampleData() {

    try {

        const response =
            await fetch(
                "sales-transactions-1000.csv"
            );

        if (!response.ok) {
            throw new Error(
                "CSV file not found"
            );
        }

        const text =
            await response.text();

        salesData =
            parseCSV(text);

        analyzeData();

    } catch (error) {

        alert(
            "Could not load the sample CSV.\n\n" +
            "Make sure sales-transactions-1000.csv " +
            "is in the same folder as index.html."
        );
    }
}


/* =====================================================
   4. MAIN BUSINESS ANALYSIS
===================================================== */

function analyzeData() {

    if (!salesData.length) {

        alert("No sales data found.");

        return;
    }

    const dashboard =
        document.getElementById("dashboard");

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }


    /* TOTAL REVENUE */

    const totalRevenue =
        salesData.reduce(
            (sum, item) =>
                sum + item.revenue,
            0
        );


    /* TOTAL UNITS */

    const totalUnits =
        salesData.reduce(
            (sum, item) =>
                sum + item.units,
            0
        );


    /* AVERAGE REVENUE */

    const avgRevenue =
        totalRevenue /
        salesData.length;


    /* GROUP DATA */

    const products =
        groupData("product");

    const regions =
        groupData("region");

    const channels =
        groupData("channel");


    /* TOP PERFORMERS */

    const topProduct =
        getTop(products);

    const topRegion =
        getTop(regions);

    const topChannel =
        getTop(channels);


    /* DISPLAY KPIs */

    setText(
        "totalRevenue",
        formatMoney(totalRevenue)
    );

    setText(
        "totalUnits",
        totalUnits.toLocaleString()
    );

    setText(
        "avgRevenue",
        formatMoney(avgRevenue)
    );

    setText(
        "topProduct",
        topProduct.name
    );

    setText(
        "topRegion",
        topRegion.name
    );

    setText(
        "topChannel",
        topChannel.name
    );


    /* DISPLAY TABLES */

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


    /* DISPLAY INSIGHTS */

    createInsights(
        totalRevenue,
        totalUnits,
        avgRevenue,
        topProduct,
        topRegion,
        topChannel
    );
}


/* =====================================================
   5. GROUP DATA
===================================================== */

function groupData(field) {

    const groups = {};

    salesData.forEach(item => {

        const key = item[field];

        if (!key) return;

        if (!groups[key]) {

            groups[key] = {
                name: key,
                revenue: 0,
                units: 0
            };
        }

        groups[key].revenue +=
            Number(item.revenue) || 0;

        groups[key].units +=
            Number(item.units) || 0;
    });

    return Object.values(groups)
        .sort(
            (a, b) =>
                b.revenue - a.revenue
        );
}


/* =====================================================
   6. GET TOP PERFORMER
===================================================== */

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


/* =====================================================
   7. CREATE TABLE
===================================================== */

function createTable(
    elementId,
    data
) {

    const table =
        document.getElementById(elementId);

    if (!table) return;

    table.innerHTML = "";

    data.forEach(item => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHTML(item.name)}
            </td>

            <td>
                ${formatMoney(item.revenue)}
            </td>

            <td>
                ${item.units.toLocaleString()}
            </td>
        `;

        table.appendChild(row);
    });
}


/* =====================================================
   8. BUSINESS INSIGHTS
===================================================== */

function createInsights(
    totalRevenue,
    totalUnits,
    avgRevenue,
    topProduct,
    topRegion,
    topChannel
) {

    const insights =
        document.getElementById(
            "insights"
        );

    if (!insights) return;

    insights.innerHTML = "";


    const messages = [

        `Total revenue is ${formatMoney(totalRevenue)} from ${totalUnits.toLocaleString()} units.`,

        `${topProduct.name} is the highest-revenue product with ${formatMoney(topProduct.revenue)}.`,

        `${topRegion.name} is the strongest region with ${formatMoney(topRegion.revenue)} in revenue.`,

        `${topChannel.name} is the strongest sales channel with ${formatMoney(topChannel.revenue)} in revenue.`,

        `Average revenue per transaction is ${formatMoney(avgRevenue)}.`,

        `Recommendation: focus on the strongest products, regions and channels while investigating weaker performers.`
    ];


    messages.forEach(message => {

        const div =
            document.createElement("div");

        div.className =
            "insight";

        div.textContent =
            "💡 " + message;

        insights.appendChild(div);
    });
}


/* =====================================================
   9. AI AGENT — ASK QUESTION
===================================================== */

async function askAgent(
    questionFromButton = ""
) {

    const input =
        document.getElementById(
            "userQuestion"
        );


    const question =
        questionFromButton ||
        (input
            ? input.value.trim()
            : "");


    if (!question) {

        return;
    }


    /* DATA CHECK */

    if (!salesData.length) {

        addAgentMessage(
            "Please load the sales dataset first."
        );

        return;
    }


    /* SHOW USER QUESTION */

    addUserMessage(question);


    if (input) {
        input.value = "";
    }


    /* LOADING MESSAGE */

    const loading =
        addAgentMessage(
            "⏳ Analyzing your business question..."
        );


    try {

        /*
           Send the question and dataset
           to our secure backend.
        */

        const response =
            await fetch(
                "/api/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question,
                        data: salesData
                    })
                }
            );


        const result =
            await response.json();


        /* REMOVE LOADING */

        if (loading) {
            loading.remove();
        }


        /* ERROR */

        if (!response.ok ||
            result.error) {

            addAgentMessage(
                "⚠️ " +
                (
                    result.error ||
                    "The AI service returned an error."
                )
            );

            return;
        }


        /* AI ANSWER */

        addAgentMessage(
            result.answer ||
            "The AI did not return an answer."
        );


    } catch (error) {

        if (loading) {
            loading.remove();
        }

        addAgentMessage(
            "⚠️ I could not connect to the AI service. " +
            "Make sure the /api/analyze backend is deployed."
        );
    }
}


/* =====================================================
   10. ADD USER MESSAGE
===================================================== */

function addUserMessage(message) {

    const chatBox =
        document.getElementById(
            "chatBox"
        );

    if (!chatBox) return;


    const div =
        document.createElement("div");

    div.className =
        "user-message";

    div.textContent =
        "👤 " + message;


    chatBox.appendChild(div);


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


/* =====================================================
   11. ADD AI MESSAGE
===================================================== */

function addAgentMessage(message) {

    const chatBox =
        document.getElementById(
            "chatBox"
        );

    if (!chatBox) return null;


    const div =
        document.createElement("div");

    div.className =
        "agent-message";

    div.textContent =
        "🤖 " + message;


    chatBox.appendChild(div);


    chatBox.scrollTop =
        chatBox.scrollHeight;


    return div;
}


/* =====================================================
   12. FORMAT MONEY
===================================================== */

function formatMoney(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );
}


/* =====================================================
   13. SAFE TEXT
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   14. SIMPLE TEXT HELPER
===================================================== */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent = value;
    }
}


/* =====================================================
   END OF BUSINESS ANALYSIS AI AGENT
===================================================== */
```
