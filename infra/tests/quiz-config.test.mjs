import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = readFileSync(join(root, 'supabase/seed.sql'), 'utf8');
const routes = readFileSync(join(root, '../frontend/src/app/routes.tsx'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase/migrations/20260528000006_quiz_question_choices.sql'),
  'utf8',
);

describe('Quiz engine (WO-017)', () => {
  it('adds choices and correct_index to quiz_questions', () => {
    assert.match(migration, /choices JSONB/);
    assert.match(migration, /correct_index/);
  });

  it('seeds quiz questions for security training module', () => {
    assert.match(seed, /INSERT INTO public\.quizzes/);
    assert.match(seed, /INSERT INTO public\.quiz_questions/);
    assert.match(seed, /e1000000-0000-4000-8000-000000000002/);
  });

  it('wires /training/:moduleId/quiz to QuizPage', () => {
    assert.match(routes, /path="\/training\/:moduleId\/quiz"\s+element=\{<QuizPage\s*\/>\}/);
  });

  it('includes quiz feature sources', () => {
    const dir = join(root, '../frontend/src/features/training');
    for (const file of ['QuizPage.tsx', 'quiz.logic.ts', 'useQuiz.ts', 'quiz.logic.test.ts']) {
      assert.ok(existsSync(join(dir, file)), `missing ${file}`);
    }
  });
});
