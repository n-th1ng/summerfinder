import { promises as fs } from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), '.data', 'submissions.json');

type StoredSubmission = {
  id: string;
  submitterName: string;
  submitterLocation: string;
  payload: unknown;
  status: 'pending';
  createdAt: string;
};

async function readAll(): Promise<StoredSubmission[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw) as StoredSubmission[];
  } catch {
    return [];
  }
}

async function writeAll(items: StoredSubmission[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), 'utf8');
}

/**
 * File-backed submissions store. Used as a fallback when the database
 * is unreachable so the launchable demo still accepts submissions.
 */
export const fileStore = {
  async add(input: {
    submitterName: string;
    submitterLocation: string;
    payload: unknown;
  }): Promise<StoredSubmission> {
    const items = await readAll();
    const item: StoredSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      submitterName: input.submitterName,
      submitterLocation: input.submitterLocation,
      payload: input.payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    items.unshift(item);
    // keep last 500
    await writeAll(items.slice(0, 500));
    return item;
  },

  async list(): Promise<StoredSubmission[]> {
    return readAll();
  },
};