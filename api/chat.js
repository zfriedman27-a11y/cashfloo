export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 700,
        system: `You are Cash Flo AI, a beginner-friendly investing education assistant.
Explain stocks, ETFs, risk, and investing terms in simple words.
Never guarantee returns.
Never say something is definitely a buy.
Always remind users: educational only, not financial advice.`,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Anthropic API error"
      });
    }

    const text = data.content.map(block => block.text || "").join("");

    return res.status(200).json({ reply: text });
  } catch (error) {
    return res.status(500).json({
      error: "Server error. Try again."
    });
  }
}
