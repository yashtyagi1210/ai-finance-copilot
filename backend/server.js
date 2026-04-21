import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check route (useful for Render + debugging)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Main analyze route
app.post("/analyze", async (req, res) => {
  try {
    const { expenses } = req.body;

    // Safety check
    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({
        error: "Invalid expenses data",
      });
    }

    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const breakdown = expenses.map((e) => ({
      ...e,
      percent: total ? ((e.amount / total) * 100).toFixed(1) : "0",
    }));

    const prompt = `
Analyze these expenses and give 3 short financial insights:
${JSON.stringify(breakdown)}
`;

    // OpenAI call
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return res.json({
      insight: response.choices[0].message.content,
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);

    // Fallback logic (if OpenAI fails)
    let insights = [];

    const { expenses } = req.body || [];
    const total = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    (expenses || []).forEach((e) => {
      const percent = total ? ((e.amount / total) * 100).toFixed(1) : 0;

      if (e.category?.toLowerCase() === "food" && percent > 30) {
        insights.push(`You spend ${percent}% on food — above average.`);
        insights.push(
          `You can save ₹${Math.round(e.amount * 0.2)} by reducing dining.`
        );
      } else if (e.category?.toLowerCase() === "rent") {
        insights.push(`Rent takes ${percent}% of your budget.`);
      } else {
        insights.push(`${e.category} accounts for ${percent}% spending.`);
      }
    });

    return res.json({
      insight: insights.join("\n"),
    });
  }
});

// FIXED PORT for Render
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
