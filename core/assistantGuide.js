export async function generateAssistantTip(projectDir) {
  const tips = [
    "Break tasks into small commits for clarity.",
    "Clean unused files to keep your project healthy.",
    "Review your routes for consistency.",
    "Check your .env keys for duplicates.",
    "Organize controllers into logical groups.",
    "Focus on one module at a time to avoid overwhelm.",
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}
