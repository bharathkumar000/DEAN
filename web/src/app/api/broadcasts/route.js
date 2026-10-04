import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/broadcasts.json');

// Helper to read data safely
function readBroadcastsFromFile() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
      fs.writeFileSync(dataFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading broadcasts database:', err);
    return [];
  }
}

// Helper to write data safely
function writeBroadcastsToFile(broadcasts) {
  try {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(broadcasts, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing broadcasts database:', err);
    return false;
  }
}

// GET: Returns list of all broadcasts
export async function GET() {
  const broadcasts = readBroadcastsFromFile();
  return Response.json(broadcasts);
}

// POST: Adds a new broadcast
export async function POST(request) {
  try {
    const body = await request.json();
    const currentBroadcasts = readBroadcastsFromFile();
    
    const newBroadcast = {
      id: "BC-" + Date.now().toString().substring(8),
      message: body.message || "Emergency Alert",
      targetZone: body.targetZone || "All Sectors",
      severity: body.severity || "info", // "info", "warning", "critical"
      timestamp: new Date().toISOString()
    };

    currentBroadcasts.unshift(newBroadcast); // Add to the top
    
    // Cap at 10 items for optimization
    if (currentBroadcasts.length > 10) {
      currentBroadcasts.pop();
    }

    const success = writeBroadcastsToFile(currentBroadcasts);
    if (!success) {
      return Response.json({ error: 'Database write failed' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      broadcast: newBroadcast
    });
  } catch (err) {
    console.error('POST broadcast error:', err);
    return Response.json({ error: 'Invalid broadcast structure' }, { status: 400 });
  }
}
