import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text, Content } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

// Type guard for MDX JSX Flow/Text Elements
function isMdxJsxFlowElement(node: unknown): node is MdxJsxFlowElement {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: unknown }).type === 'mdxJsxFlowElement' 
  );
}

function getAttribute(node: MdxJsxFlowElement, name: string): string | undefined {
  const attr = node.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === name);
  return typeof attr?.value === 'string' ? attr.value : undefined;
}

const remarkRemoveCallout: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (!isMdxJsxFlowElement(node) || node.name !== 'Callout') return;
      if (!parent || typeof index !== 'number') return;

      const title = getAttribute(node, 'title');
      const type = getAttribute(node, 'type');

      let prefixText = '';
      if (title) {
        prefixText = `${title}: `;
      } else if (type) {
        prefixText = `${type}: `;
      }

      // Wrap original content in a paragraph if needed
      const replacementNodes: Content[] = [...node.children];

      // Add prefix to the first paragraph or create one
      if (
        replacementNodes.length > 0 &&
        replacementNodes[0].type === 'paragraph' &&
        Array.isArray(replacementNodes[0].children)
      ) {
        replacementNodes[0].children.unshift({
          type: 'text',
          value: prefixText,
        } as Text);
      } else {
        replacementNodes.unshift({
          type: 'paragraph',
          children: [{ type: 'text', value: prefixText }],
        });
      }

      // Replace the Callout node with its children
      parent.children.splice(index, 1, ...replacementNodes);
    });
  };
};

export default remarkRemoveCallout;

