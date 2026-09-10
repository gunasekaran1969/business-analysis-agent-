export const config = {
  maxDuration: 10, // Hobby plan max
};

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, data } = req.body;

    if (!question || !data) {
      return res.status(400).json({ error: "Question and data are required." });
    }

    // ---- Summarize data instead of sending every row (keeps it fast) ----
    const totalRows = data.length;
    const totalUnits = data.reduce((sum, r) => sum + (r.units || 0), 0);

    const byRegion = {};
    const byProduct = {};
    const byChannel = {};

    data.forEach(r => {
      if (r.region) byRegion[r.region] = (byRegion[r.region] || 0) + (r.units || 0);
      if (r.product) byProduct[r.product] = (byProduct[r.product] || 0) + (r.units || 0);
      if (r.channel) byChannel[r.channel] = (byChannel[r.channel] || 0) + (r.units || 0);
    });

    const summary = {
      totalRows,
      totalUnits,
      byRegion,
      byProduct,
      byChannel,
      sampleRows: data.slice(0, 5)
    };

    const prompt = `
You are an expert Business Analyst.

Here is a SUMMARY of the sales dataset (not the full raw data):
${JSON.stringify(summary, null, 2)}

User question:
${question}

Instructions:
- Answer using the summary provided.
- Mention important numbers when useful.
- Be clear and practical.
`;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment variables." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result.error?.message || "Gemini request failed" });
    }

    const answer =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
