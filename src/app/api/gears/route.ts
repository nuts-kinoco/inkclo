import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'gears.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    return new NextResponse(fileContents, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to read gears:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
