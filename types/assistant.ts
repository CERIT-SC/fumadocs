// Base shapes without the "type" attribute
export type Assistant = {
  type: "assistant",
  id: string;
  name: string;
  engine: string;
  api_path: string;
  embed?: boolean;
  enabled: boolean;
  description?: string;
};


export type Category = {
  type: "category",
  id: string;
  name: string;
  enabled: boolean;
  assistants: Assistant[];
};

export type AssistantHierarchyItem = Category | Assistant;

export type AssistantHierarchy = AssistantHierarchyItem[];
