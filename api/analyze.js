```javascript
export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { question, data } = req.body;

        if (!question || !data) {
            return res.status(400).json({
                error: "Question and data are required."
            });
        }

        const prompt = `
You are an expert Business Analyst.

Analyze the sales dataset provided below.

Give clear, practical business insights.

Dataset:
${JSON.stringify(data)}

User question:
${question}

Instructions:
- Answer using the supplied dataset.
- Do not invent data.
- Mention important numbers when useful.
- Explain the business meaning.
- Give recommendations when appropriate.
- Keep the answer easy for a business manager to understand.
`;

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },

                body: JSON.stringify({
                    model: "gpt-5.6",
                    input: prompt
                })
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(errorText);

            return res.status(500).json({
                error: "AI service request failed."
            });
        }

        const result =
            await response.json();

        const answer =
            result.output_text ||
            "The AI did not return an answer.";

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Server error."
        });
    }
}
```
