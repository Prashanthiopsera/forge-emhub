import { Link, useParams } from 'react-router-dom';
import { useQuiz } from '@/features/training/useQuiz';

export function QuizPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { data, answers, loading, submitting, error, result, setAnswer, submit, canSubmit } =
    useQuiz(moduleId);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading quiz…</p>;
  }

  if (!moduleId || !data) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Quiz</h1>
        <p className="text-slate-600">No quiz is available for this training module.</p>
        <Link to="/training" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to training
        </Link>
      </section>
    );
  }

  const { quiz, latestAttempt } = data;

  return (
    <section aria-labelledby="quiz-title" className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link to="/training" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to training
        </Link>
        <h1 id="quiz-title" className="mt-2 text-2xl font-semibold text-slate-900">
          {quiz.title}
        </h1>
        <p className="mt-1 text-slate-600">
          Pass score: {quiz.passScore}%. Answer all {quiz.questions.length} questions to submit.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            {error}
          </p>
        ) : null}
        {data.source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo quiz data.
          </p>
        ) : null}
        {latestAttempt && !result ? (
          <p className="mt-2 text-sm text-slate-600" role="status">
            Previous attempt: {latestAttempt.score}% ({latestAttempt.passed ? 'passed' : 'not passed'}
            ).
          </p>
        ) : null}
      </header>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <ol className="space-y-6">
          {quiz.questions.map((question, index) => (
            <li
              key={question.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
              aria-labelledby={`question-${question.id}`}
            >
              <p id={`question-${question.id}`} className="font-medium text-slate-900">
                {index + 1}. {question.prompt}
              </p>
              <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Choices for question {index + 1}</legend>
                {question.choices.map((choice, choiceIndex) => (
                  <label
                    key={`${question.id}-${choiceIndex}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={choiceIndex}
                      checked={answers[question.id] === choiceIndex}
                      onChange={() => setAnswer(question.id, choiceIndex)}
                      className="text-brand-600"
                    />
                    <span className="text-sm text-slate-700">{choice}</span>
                  </label>
                ))}
              </fieldset>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit quiz'}
          </button>
        </div>
      </form>

      {result ? (
        <div
          className={[
            'rounded-lg border p-4',
            result.passed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-900',
          ].join(' ')}
          role="status"
        >
          <p className="font-semibold">
            {result.passed ? 'You passed!' : 'Not quite — try again'}
          </p>
          <p className="mt-1 text-sm">
            Score: {result.score}% (required {quiz.passScore}%).
          </p>
        </div>
      ) : null}
    </section>
  );
}
