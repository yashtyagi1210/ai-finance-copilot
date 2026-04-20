import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  const { expenses } = req.body;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const breakdown = expenses.map(e => ({
    ...e,
    percent: ((e.amount / total) * 100).toFixed(1),
  }));

  const prompt = `
Analyze these expenses and give 3 short financial insights:
${JSON.stringify(breakdown)}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return res.json({
      insight: response.choices[0].message.content,
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);

    // ✅ fallback logic
    let insights = [];

    breakdown.forEach(e => {
      if (e.category.toLowerCase() === "food" && e.percent > 30) {
        insights.push(`You spend ${e.percent}% on food — above average.`);
        insights.push(`You can save ₹${Math.round(e.amount * 0.2)} per month by reducing dining.`);
      } else if (e.category.toLowerCase() === "rent") {
        insights.push(`Rent takes up ${e.percent}% of your budget, which is reasonable.`);
      } else {
        insights.push(`${e.category} accounts for ${e.percent}% of your spending.`);
      }
    });

    return res.json({
      insight: insights.join("\n"),
    });
  }
});

app.listen(5001, () => console.log("Server running on port 5001"));