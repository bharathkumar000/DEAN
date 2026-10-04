export async function GET() {
  try {
    const response = await fetch('https://docs.google.com/spreadsheets/d/10Tq6CAz9CBBOapmcSk9QXoVxuX0B7xmXxDE74F2CJpY/export?format=csv', {
      signal: AbortSignal.timeout(4000), // Timeout after 4 seconds
      next: { revalidate: 5 } // Cache for 5 seconds
    });
    
    if (!response.ok) {
      throw new Error(`Google Sheets responded with status ${response.status}`);
    }
    
    const text = await response.text();
    return new Response(text, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=5, stale-while-revalidate=10'
      }
    });
  } catch (error) {
    console.error("Server-side SMS Fetch Error:", error);
    return new Response('', { 
      status: 502,
      statusText: 'Bad Gateway'
    });
  }
}
