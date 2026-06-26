import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const appShell = readFileSync(join(root, '../frontend/src/app/AppShell.tsx'), 'utf8');

describe('Chatbot UI (WO-020)', () => {
  it('seeds sample chat sessions and messages', () => {
    assert.match(seed, /INSERT INTO public\.chat_sessions/);
    assert.match(seed, /INSERT INTO public\.chat_messages/);
    assert.match(seed, /d2000000-0000-4000-8000-000000000001/);
  });

  it('wires ChatWidget floating button in AppShell', () => {
    assert.match(appShell, /ChatWidget/);
  });

  it('includes chatbot widget feature sources', () => {
    const dir = join(root, '../frontend/src/features/chatbot');
    for (const file of [
      'ChatWidget.tsx',
      'MessageList.tsx',
      'MessageInput.tsx',
      'useChat.ts',
      'ChatWidget.test.tsx',
    ]) {
      assert.ok(existsSync(join(dir, file)), `missing ${file}`);
    }
  });
});
