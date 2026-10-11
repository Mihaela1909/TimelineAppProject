// Small pure helpers for quiz scores, shared by the quiz pages, the profile and
// the admin statistics (no Vue, no Appwrite).

// Used when a quiz has no passingScore of its own.
export const DEFAULT_PASSING_SCORE = 70

// One attempt's score as a percentage (0–100, not rounded).
export function scorePercent(attempt) {
  return attempt.totalQuestions ? (attempt.score / attempt.totalQuestions) * 100 : 0
}

export function passingScoreOf(quiz) {
  return quiz?.passingScore || DEFAULT_PASSING_SCORE
}

// "~4 min" on the quiz intro screens: about 0.4 minutes per question, at least 1.
export function estimatedMinutes(questionCount) {
  return Math.max(1, Math.round(questionCount * 0.4))
}
