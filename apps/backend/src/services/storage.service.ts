import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/agents.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

export function loadAgents(): Record<string, any> {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAgents(agents: Record<string, any>): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(agents, null, 2));
}
