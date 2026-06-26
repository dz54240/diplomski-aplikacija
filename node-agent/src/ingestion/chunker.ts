import { encoding_for_model } from 'tiktoken';

const enc = encoding_for_model('gpt-4');

export function countTokens(text: string): number {
  return enc.encode(text).length;
}

export interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

const BOUNDARY_PATTERNS: RegExp[] = [
  /\n# /,
  /\n## /,
  /\n### /,
  /\n\n/,
  /(?<=[.!?])\s+/,
  / /,
];

export function recursiveSplit(text: string, opts: ChunkOptions): string[] {
  if (!text.trim()) return [];
  if (countTokens(text) <= opts.chunkSize) {
    return [text.trim()];
  }
  return splitWithBoundaries(text, opts, 0);
}

function splitWithBoundaries(
  text: string,
  opts: ChunkOptions,
  depth: number,
): string[] {
  if (depth >= BOUNDARY_PATTERNS.length) {
    return hardTokenSplit(text, opts);
  }

  const pattern = BOUNDARY_PATTERNS[depth];
  const parts = splitKeepDelimiters(text, pattern);

  const chunks: string[] = [];
  let current = '';
  for (const part of parts) {
    const candidate = current + part;
    if (countTokens(candidate) <= opts.chunkSize) {
      current = candidate;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (countTokens(part) > opts.chunkSize) {
        chunks.push(...splitWithBoundaries(part, opts, depth + 1));
        current = '';
      } else {
        current = takeOverlap(current, opts.overlap) + part;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function splitKeepDelimiters(text: string, pattern: RegExp): string[] {
  const out: string[] = [];
  let lastIdx = 0;
  const flags = pattern.flags.includes('g')
    ? pattern.flags
    : pattern.flags + 'g';
  const re = new RegExp(pattern.source, flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(text.slice(lastIdx, m.index));
    lastIdx = m.index;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  return out.filter((s) => s.length > 0);
}

function takeOverlap(text: string, overlap: number): string {
  const tokens = enc.encode(text);
  if (tokens.length <= overlap) return text;
  const tail = tokens.slice(-overlap);
  return new TextDecoder().decode(enc.decode(tail));
}

function hardTokenSplit(text: string, opts: ChunkOptions): string[] {
  const tokens = enc.encode(text);
  const chunks: string[] = [];
  const stride = Math.max(1, opts.chunkSize - opts.overlap);
  for (let i = 0; i < tokens.length; i += stride) {
    const slice = tokens.slice(i, i + opts.chunkSize);
    chunks.push(new TextDecoder().decode(enc.decode(slice)));
  }
  return chunks;
}
