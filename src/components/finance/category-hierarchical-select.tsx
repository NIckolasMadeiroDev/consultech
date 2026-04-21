"use client";

import { buildCategoryTree, flattenCategoryTree } from "@/lib/finance/category-hierarchy";

type Category = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
};

type CategoryHierarchicalSelectProps = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  type: "entry" | "exit";
  required?: boolean;
  disabled?: boolean;
};

export function CategoryHierarchicalSelect({
  categories,
  value,
  onChange,
  type,
  required = false,
  disabled = false,
}: CategoryHierarchicalSelectProps) {
  const filtered = categories.filter((c) => c.type === type);
  const tree = buildCategoryTree(filtered);
  const flat = flattenCategoryTree(tree);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
      required={required}
      disabled={disabled}
    >
      <option value="">Selecione uma categoria</option>
      {flat.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {"  ".repeat(cat.level)}
          {cat.level > 0 && "└─ "}
          {cat.name}
          {cat.children.length > 0 && " ►"}
        </option>
      ))}
    </select>
  );
}
