export async function POST(req) {
  try {
    const { sensorData, lang } = await req.json();
    const languageInstruction = lang === 'kn' 
      ? 'The output summary MUST be written in Kannada language.' 
      : 'The output summary MUST be written in English.';
    
    const prompt = `As a Disaster Response AI Assistant, analyze these sensor readings and provide a 2-sentence tactical summary for the incident commander. Mention any critical threats. ${languageInstruction}
    Readings: ${JSON.stringify(sensorData)}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    const data = await groqResponse.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return Response.json({ summary: data.choices[0].message.content.trim() });
    } else {
      console.error("Groq Response Error Details:", data);
      throw new Error(data.error?.message || "Invalid response structure from Groq");
    }
  } catch (error) {
    console.error("AI Error:", error);
    return Response.json({ error: error.message || "AI processing failed" }, { status: 500 });
  }
}
