import * as SQLite from 'expo-sqlite';
import { CardDraft } from './extract';
import { Grade, newSchedule, review } from './scheduler';

export interface Note {
  id: number;
  title: string;
  body: string;
  updated_at: number;
}
export interface Card {
  id: number;
  note_id: number;
  front: string;
  back: string;
  ease: number;
  interval_days: number;
  reps: number;
  due_at: number;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('recall.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        ease REAL NOT NULL,
        interval_days REAL NOT NULL,
        reps INTEGER NOT NULL,
        due_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS cards_due ON cards(due_at);
    `);
    return db;
  })();
  return dbPromise;
}

export async function listNotes(): Promise<(Note & { card_count: number })[]> {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT n.*, (SELECT COUNT(*) FROM cards c WHERE c.note_id = n.id) AS card_count
     FROM notes n ORDER BY updated_at DESC`,
  );
}

export async function getNote(id: number): Promise<Note | null> {
  const db = await getDb();
  return db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', id);
}

export async function createNote(): Promise<number> {
  const db = await getDb();
  const r = await db.runAsync("INSERT INTO notes (title, body, updated_at) VALUES ('', '', ?)", Date.now());
  return r.lastInsertRowId;
}

export async function saveNote(id: number, title: string, body: string) {
  const db = await getDb();
  await db.runAsync('UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ?', title, body, Date.now(), id);
}

export async function deleteNote(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}

export async function listCards(noteId: number): Promise<Card[]> {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM cards WHERE note_id = ? ORDER BY id', noteId);
}

export async function allCards(): Promise<Card[]> {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM cards');
}

// Adds drafts, skipping fronts the note already has. Returns how many were added.
export async function addCards(noteId: number, drafts: CardDraft[]): Promise<number> {
  const db = await getDb();
  const existing = new Set((await listCards(noteId)).map((c) => c.front.toLowerCase()));
  const fresh = drafts.filter((d) => !existing.has(d.front.toLowerCase()));
  const now = Date.now();
  const s = newSchedule(now);
  await db.withTransactionAsync(async () => {
    for (const d of fresh) {
      await db.runAsync(
        'INSERT INTO cards (note_id, front, back, ease, interval_days, reps, due_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        noteId, d.front, d.back, s.ease, s.intervalDays, s.reps, s.dueAt,
      );
    }
  });
  return fresh.length;
}

export async function deleteCard(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM cards WHERE id = ?', id);
}

export async function dueCards(now = Date.now()): Promise<Card[]> {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM cards WHERE due_at <= ? ORDER BY due_at', now);
}

export async function gradeCard(card: Card, grade: Grade) {
  const db = await getDb();
  const next = review(
    { ease: card.ease, intervalDays: card.interval_days, reps: card.reps, dueAt: card.due_at },
    grade,
    Date.now(),
  );
  await db.runAsync(
    'UPDATE cards SET ease = ?, interval_days = ?, reps = ?, due_at = ? WHERE id = ?',
    next.ease, next.intervalDays, next.reps, next.dueAt, card.id,
  );
}
