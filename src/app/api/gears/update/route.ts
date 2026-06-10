import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { updates } = await req.json(); // Array of { id, manualTags }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'gears.json');
    const backupDir = path.join(process.cwd(), 'src', 'lib', 'data', 'backups');

    // Read current data
    const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create a backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `gears-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));

    // Update the gears
    let updatedCount = 0;
    const gearsMap = new Map(currentData.gears.map((g: any) => [g.id, g]));

    for (const update of updates) {
      if (gearsMap.has(update.id)) {
        const gear: any = gearsMap.get(update.id);
        gear.manualTags = update.manualTags;
        updatedCount++;
      }
    }

    // Write back to gears.json
    const tmpPath = dataPath + '.tmp'; fs.writeFileSync(tmpPath, JSON.stringify(currentData, null, 2)); fs.renameSync(tmpPath, dataPath);

    return NextResponse.json({ success: true, updatedCount });
  } catch (error) {
    console.error('Failed to update gears:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
