import { SafeFormattedText } from "@/components/forms/safe-formatted-text";

type SectionHeaderProps = Readonly<{
  title: string;
  description?: string | null;
  id?: string;
}>;

export function SectionHeader({ title, description, id }: SectionHeaderProps) {
  const headingId = id ?? "section-heading";
  return (
    <div className="border-b border-neutral-200 pb-3 pt-4 first:pt-0 dark:border-neutral-700">
      <h3
        id={headingId}
        className="text-h4 font-semibold text-primary-600 dark:text-primary-400"
      >
        {title}
      </h3>
      {description?.trim() ? (
        <SafeFormattedText
          source={description.trim()}
          className="prose prose-sm mt-2 max-w-none text-body text-[var(--text-secondary)] dark:prose-invert"
        />
      ) : null}
    </div>
  );
}
