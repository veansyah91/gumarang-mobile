type TreeNode = {
  name: string;
  children?: TreeNode[] | null;
};

export function filterTree<T extends TreeNode>(nodes: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const matches = (node: T): T | null => {
    const nameMatches = node.name.toLowerCase().includes(q);
    const children = node.children
      ? (node.children
          .map((child) => filterTree([child], q)[0])
          .filter(Boolean) as T[])
      : [];

    if (nameMatches || children.length > 0) {
      return {
        ...node,
        children: nameMatches && children.length === 0 ? node.children : children,
      };
    }
    return null;
  };

  return nodes.map((node) => matches(node)).filter((n): n is T => n !== null);
}
