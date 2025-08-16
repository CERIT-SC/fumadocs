import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Paragraph, Text, Content } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';

// Type guard for MDX JSX Flow/Text Elements
function isMdxJsxElement(node: unknown): node is MdxJsxFlowElement | MdxJsxTextElement {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: unknown }).type === 'mdxJsxFlowElement' ||
    (node as { type: unknown }).type === 'mdxJsxTextElement'
  );
}

const remarkTransformTable: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (node.name !== 'table' || !parent || typeof index !== 'number') return;
      const rows: string[] = [];

      // Collect all <tr> elements inside <thead> and <tbody>
      const trNodes: MdxJsxFlowElement[] = [];

      for (const section of node.children || []) {
        if (!isMdxJsxElement(section) || !section.name) continue;

        if (section.name === 'tr') {
          trNodes.push(section);
        }

        if (['thead', 'tbody'].includes(section.name)) {
          for (const rowNode of section.children || []) {
            if (isMdxJsxElement(rowNode) && rowNode.name === 'tr') {
              trNodes.push(rowNode);
            }
          }
        }
      }

      // Process each <tr>
      for (const tr of trNodes) {
        const cells = findTableCells(tr.children || []).map((cell) =>
            extractText(cell.children as Content[]).trim()
        );

        rows.push(cells.join('  ')); // double space to separate cells
      }

      const paragraphNodes: Paragraph[] = rows.map((line) => ({
        type: 'paragraph',
        children: [{ type: 'text', value: line } as Text]
      }));

      parent.children.splice(index, 1, ...paragraphNodes);
    });
  };
};

function findTableCells(nodes: Content[]): (MdxJsxTextElement | MdxJsxFlowElement)[] {
  const cells: (MdxJsxTextElement | MdxJsxFlowElement)[] = [];

  for (const node of nodes) {
    if (isMdxJsxElement(node) && node.name && ['td', 'th'].includes(node.name)) {
      cells.push(node);
    } else if ('children' in node && Array.isArray(node.children)) {
      cells.push(...findTableCells(node.children as Content[]));
    }
  }

  return cells;
}

// Recursively extract text and replace <br/> with space
function extractText(nodes: Content[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value;
      if (isMdxJsxElement(node)) {
        if (node.name === 'br') return '; ';
        return extractText(node.children as Content[]);
      }
      if ('children' in node && Array.isArray(node.children)) {
        return extractText(node.children as Content[]);
      }
      return '';
    })
    .join('');
}

export default remarkTransformTable;

