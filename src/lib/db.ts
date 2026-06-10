import Dexie, { type EntityTable } from 'dexie';

export interface Note {
  id: string;
  title: string;
  content: string; // JSON string of blocknote document
  embedding?: number[]; // Semantic embedding array
  tags?: string[]; // Array of Tag IDs
  pinned?: boolean;
  color?: string; // e.g. 'indigo', 'purple', 'rose', 'amber', 'emerald'
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // Index into TAG_COLORS array (stored as string)
}

export interface Link {
  id: string;
  source: string;
  target: string;
}

export interface HistorySnapshot {
  id?: number;
  noteId: string;
  timestamp: number;
  content: string;
}

export const db = new Dexie('OfflineNotesDB') as Dexie & {
  notes: EntityTable<Note, 'id'>;
  tags: EntityTable<Tag, 'id'>;
  links: EntityTable<Link, 'id'>;
  history: EntityTable<HistorySnapshot, 'id'>;
};

db.version(1).stores({
  notes: 'id, title, createdAt, updatedAt',
  links: 'id, source, target'
});

db.version(2).stores({
  notes: 'id, title, createdAt, updatedAt',
  links: 'id, source, target',
  history: '++id, noteId, timestamp'
});

db.version(3).stores({
  notes: 'id, title, createdAt, updatedAt, pinned',
  links: 'id, source, target',
  history: '++id, noteId, timestamp',
  tags: 'id, name'
});
