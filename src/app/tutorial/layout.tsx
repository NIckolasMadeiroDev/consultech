import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutorial | Consultech",
  description:
    "Tutorial do sistema Consultech: concepção do projeto, login, formulários, respostas, dashboards e como responder. Sugestões à Vice-presidente Maria Vitória Santos. Desenvolvido por Nickolas Madeiro.",
};

export default function TutorialLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
