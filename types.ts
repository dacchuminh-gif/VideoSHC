
export interface ProjectData {
  goal: string;
  audience: string;
  userInsights: string;
  videoType: string;
  platform: string;
  aspectRatio: string;
  scriptStructure: string;
  videoStyle: string;
  duration: number;
  sceneCount: number;
  cta: string;
  analyzedData?: AnalyzedData;
  contentIdeas?: ContentIdea[];
  selectedIdeas?: ContentIdea[];
  scripts?: { idea: ContentIdea; script: ScriptScene[] }[];
  storyboards?: { idea: ContentIdea; storyboard: StoryboardScene[] }[];
}

export interface AnalyzedData {
  pain_points: string[];
  desires: string[];
  key_behaviors: string[];
  identified_gaps: string[];
}

export interface ContentIdea {
  title: string;
  concept: string;
  angle: string;
}

export interface ScriptScene {
  scene_number: number;
  duration_seconds: number;
  visual_description: string;
  scene_details: string;
  visual_suggestions: string;
  voiceover_text: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  duration: number;
  visualDescription: string;
  sceneDetails: string;
  visualSuggestions: string;
  voiceover: string;
  imageUrl: string;
  imagePrompt: string;
  isLoading: boolean;
}