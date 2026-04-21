import React, { useState } from "react";
import axios from "axios";

function App() {
  const [expenses, setExpenses] = useState("");
  const [insight, setInsight] = useState("");

  // ✅ convert text → structured data
  const parseExpenses = (text) => {
    return text.split("\n").map(line => {
      const [category, amount] = line.split("-");
      return {
        category: category.trim(),
        amount: Number(amount.trim())
      };
    });
  };

  const handleAnalyze = async () => {
    try {
      setInsight("Analyzing...");

      const parsed = parseExpenses(expenses);

      const res = await axios.post("http://localhost:5001/analyze", {
        expenses: parsed,
      });

      setInsight(res.data.insight || "Generating insights...");

    } catch (err) {
      console.error(err);
      setInsight("Error connecting to backend");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>AI Finance Copilot 💸</h1>

      <textarea
        rows="6"
        cols="50"
        placeholder={`Enter like:
Food - 3000
Rent - 8000
Travel - 1000`}
        value={expenses}
        onChange={(e) => setExpenses(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAnalyze}>
        Analyze
      </button>

      <h3>Insight:</h3>

      {/* ✅ important for line breaks */}
      <p style={{ whiteSpace: "pre-line" }}>
        {insight}
      </p>
    </div>
  );
}

export default App;