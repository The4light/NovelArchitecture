import process from "node:process";
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testPrompt } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Tells OpenRouter who is asking
        'X-Title': 'NovelForge Test'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages: [
          { role: 'user', content: testPrompt || "Say: 'The AI pipeline is officially online, boss!'" }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply generated.";

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}