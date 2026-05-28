import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SECURITY_MODULE_ID, SECURITY_QUIZ_FIXTURE } from '@/features/training/quiz.fixtures';
import { QuizPage } from '@/features/training/QuizPage';

vi.mock('@/features/training/useQuiz', () => ({
  useQuiz: vi.fn(),
}));

import { useQuiz } from '@/features/training/useQuiz';

const mockUseQuiz = vi.mocked(useQuiz);

function renderQuiz(moduleId = SECURITY_MODULE_ID) {
  return render(
    <MemoryRouter initialEntries={[`/training/${moduleId}/quiz`]}>
      <Routes>
        <Route path="/training/:moduleId/quiz" element={<QuizPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('QuizPage (WO-017)', () => {
  it('renders questions and submits when all answered', () => {
    const submit = vi.fn();
    mockUseQuiz.mockReturnValue({
      data: { quiz: SECURITY_QUIZ_FIXTURE, latestAttempt: null, source: 'fixture' },
      answers: {},
      loading: false,
      submitting: false,
      error: null,
      result: null,
      setAnswer: vi.fn(),
      submit,
      canSubmit: true,
    });

    renderQuiz();
    expect(screen.getByRole('heading', { name: SECURITY_QUIZ_FIXTURE.title })).toBeInTheDocument();
    expect(screen.getByText(/What should you enable/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit quiz' }));
    expect(submit).toHaveBeenCalled();
  });

  it('shows empty state when quiz is unavailable', () => {
    mockUseQuiz.mockReturnValue({
      data: null,
      answers: {},
      loading: false,
      submitting: false,
      error: null,
      result: null,
      setAnswer: vi.fn(),
      submit: vi.fn(),
      canSubmit: false,
    });

    renderQuiz('unknown-module');
    expect(screen.getByText(/No quiz is available/)).toBeInTheDocument();
  });
});
