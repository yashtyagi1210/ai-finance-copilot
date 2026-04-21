import React, { useState } from "react";
import axios from "axios";

function App() {
  const [expenses, setExpenses] = useState("");
  const [insight, setInsight] = useState("");

  // ✅ Convert text → structured data safely
  const parseExpenses = (text) => {
    return text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [category, amount] = line.split("-");

        return {
          category: category ? category.trim() : "Unknown",
          amount: amount ? Number(amount.trim()) : 0,
        };
      });
  };

  // ✅ Call backend API
  const handleAnalyze = async () => {
    try {
      setInsight("Analyzing...");

      const parsedExpenses = parseExpenses(expenses);

      const res = await axios.post(
        "https://ai-finance-copilot-backend.onrender.com/analyze",
        {
          expenses: parsedExpenses,
        }
      );

      setInsight(res.data.insight || "No insights received");
    } catch (err) {
      console.error("Backend error:", err.message);
      setInsight("Error connecting to backend ❌");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>AI Finance Copilot 💸</h1>

      <textarea
        rows="6"
        cols="50"
        placeholder={`Enter expenses like:
Food - 3000
Rent - 8000
Travel - 1000`}
        value={expenses}
        onChange={(e) => setExpenses(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleAnalyze}>Analyze</button>

      <h3>Insight:</h3>

      <p style={{ whiteSpace: "pre-line" }}>{insight}</p>
    </div>
  );
}

export default App;
