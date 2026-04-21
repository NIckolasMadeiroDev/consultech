export function assertAnswersRespectVisibility(
  answerQuestionIds: string[],
  allowedQuestionIds: Set<string>
): void {
  for (const qid of answerQuestionIds) {
    if (!allowedQuestionIds.has(qid)) {
      throw new Error("Invalid submission: answers for questions that were not shown");
    }
  }
}
