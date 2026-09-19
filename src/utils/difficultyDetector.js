export function calculateDifficultyScore(signals) {
  let score = 0;

  // Repeated clicking
  if (signals.repeatedClicks >= 3) {
    score += 20;
  }

  // Long time spent
  if (signals.longDelay) {
    score += 15;
  }

  // Form errors
  if (signals.formErrors >= 1) {
    score += 20;
  }

  // Excessive scrolling
  if (signals.scrollCount >= 5) {
    score += 10;
  }

  // Repeated attempts
  if (signals.repeatedAttempts >= 2) {
    score += 15;
  }

  // Back / forward navigation
  if (signals.navigationCount >= 2) {
    score += 10;
  }

  // Keep score between 0 and 100
  if (score > 100) {
    score = 100;
  }

  let level = "LOW";

  if (score >= 60) {
    level = "HIGH";
  } else if (score >= 30) {
    level = "MODERATE";
  }

  return {
    score,
    level,
  };
}