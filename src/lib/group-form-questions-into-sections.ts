export type QuestionSectionRow = {
  id: string;
  type: string;
  text: string;
  sectionTitle?: string | null;
};

export function groupQuestionsIntoSections(sorted: QuestionSectionRow[]): {
  title: string;
  questions: QuestionSectionRow[];
}[] {
  const blocks: { title: string; questions: QuestionSectionRow[] }[] = [];
  let pendingTitle = "Geral";
  const agg: QuestionSectionRow[] = [];
  for (const q of sorted) {
    if (q.type === "section") {
      if (agg.length > 0) {
        blocks.push({ title: pendingTitle, questions: [...agg] });
        agg.length = 0;
      }
      pendingTitle = q.sectionTitle?.trim() || q.text?.trim() || "Secção";
    } else {
      agg.push(q);
    }
  }
  if (agg.length > 0) {
    blocks.push({ title: pendingTitle, questions: [...agg] });
  } else if (blocks.length === 0) {
    blocks.push({ title: pendingTitle, questions: [] });
  }
  return blocks;
}
