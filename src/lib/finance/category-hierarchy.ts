export type CategoryNode = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  children: CategoryNode[];
  level: number;
};

export function buildCategoryTree(
  categories: Array<{ id: string; name: string; type: string; parentId: string | null }>
): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [], level: 0 });
  });

  categories.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId)!;
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function flattenCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  function traverse(node: CategoryNode) {
    result.push(node);
    node.children.forEach(traverse);
  }
  nodes.forEach(traverse);
  return result;
}
