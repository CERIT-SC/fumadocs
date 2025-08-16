import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';


export interface AssistantToPageEntry {
  assistant_id: number;
  page_pattern: string;
}

export interface AssistantToPageMapping {
  assistant_to_page: AssistantToPageEntry[];
}

function getPipelineId(path: string): number | null {
    const filePath = './content/runllm_assistants.json';
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData: AssistantToPageMapping = JSON.parse(data);
    const entry = jsonData.assistant_to_page.find(entry =>
        new RegExp(entry.page_pattern).test(path)
    );

    return entry?.assistant_id ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {path} = body;
  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }
  const pipeline_id = getPipelineId(path);

  return NextResponse.json({ id: pipeline_id }, { status: 200 });
}