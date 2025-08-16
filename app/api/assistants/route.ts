import { ApiWithAuth } from "@/lib/auth";
import { AssistantHierarchy } from "@/types/assistant";
import { NextResponse } from "next/server"
import { readFile } from 'fs/promises';

// GET A LIST OF AVAILABLE ASSISTANTS
export const GET = ApiWithAuth(async () => {
  let assistant_hierarchy: AssistantHierarchy = [];
  
  try {
    // Load assistants-default.json first
    const defaultAssistants = (await import("./assistants-default.json")).default as AssistantHierarchy;
    if (Array.isArray(defaultAssistants)) {
      assistant_hierarchy = [...defaultAssistants];
    }
  } catch {
    // Ignore missing assistants-default.json
  }
  
  try {
    const fileContent = await readFile('/opt/fumadocs/app/api/assistants/assistants.json', 'utf-8');
    const customAssistants = JSON.parse(fileContent) as AssistantHierarchy;

    if (Array.isArray(customAssistants)) {
      // Merge: custom assistants extend default ones
      assistant_hierarchy = [...assistant_hierarchy, ...customAssistants];
    }
  } catch (error) {
    console.error('Error reading assistants.json:', error);
  }
  
  if (!assistant_hierarchy || !Array.isArray(assistant_hierarchy)) {
    return NextResponse.json(null, { status: 200 });
  }

  const enabled_assistants: AssistantHierarchy = assistant_hierarchy
    .map(item => {
      if (item.type === "assistant") {
        return item.enabled !== false ? item : null;
      } else if (item.type === "category" && item.enabled !== false) {
        const assistants = item.assistants.filter(a => a.enabled !== false);
        if (assistants.length === 0) return null;

        // Shallow copy to avoid mutation
        return { ...item, assistants };
      }
      return null;
    })
    .filter(item => item !== null)

  return NextResponse.json(enabled_assistants);
});
