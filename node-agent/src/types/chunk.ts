export type Modality = 'text' | 'image_caption' | 'table' | 'formula';

export interface DraftChunk {
  modality: Modality;
  content: string;
  page: number | null;
  section_path: string[];
  position: number;
  image_uri: string | null;
  image_is_critical: boolean;
  metadata: Record<string, unknown>;
}

export interface ChunkResult {
  id: string;
  document_id: string;
  document_title: string;
  modality: Modality;
  content: string;
  page: number | null;
  section_path: string[];
  image_uri: string | null;
  similarity: number;
  metadata: Record<string, unknown>;
}

export interface ChunkMeta {
  id: string;
  document_id: string;
  document_title: string;
  page: number | null;
  section_path: string[];
  content: string;
  modality: Modality;
  image_uri: string | null;
}
