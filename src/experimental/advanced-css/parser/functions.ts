import {
  CSSSelectorAttributeNode, CSSSelectorClassNode, CSSSelectorComplexNode, CSSSelectorCompoundNode, CSSSelectorIdNode,
  CSSSelectorListNode, CSSSelectorNode, CSSSelectorPseudoClassNode, CSSSelectorPseudoElementNode, CSSSelectorTypeNode
} from 'parsel-js';

export function isCSSSelectorIdNode(node: CSSSelectorNode): node is CSSSelectorIdNode {
  return node.type === 'id';
}

export function isCSSSelectorClassNode(node: CSSSelectorNode): node is CSSSelectorClassNode {
  return node.type === 'class';
}

export function isCSSSelectorTypeNode(node: CSSSelectorNode): node is CSSSelectorTypeNode {
  return node.type === 'type';
}

export function isCSSSelectorAttributeNode(node: CSSSelectorNode): node is CSSSelectorAttributeNode {
  return node.type === 'attribute';
}

export function isCSSSelectorPseudoClassNode(node: CSSSelectorNode): node is CSSSelectorPseudoClassNode {
  return node.type === 'pseudo-class';
}

export function isCSSSelectorPseudoElementNode(node: CSSSelectorNode): node is CSSSelectorPseudoElementNode {
  return node.type === 'pseudo-element';
}

export function isCSSSelectorListNode(node: CSSSelectorNode): node is CSSSelectorListNode {
  return node.type === 'list';
}

export function isCCSSSelectorComplexNode(node: CSSSelectorNode): node is CSSSelectorComplexNode {
  return node.type === 'complex';
}

export function isCSSSelectorCompoundNode(node: CSSSelectorNode): node is CSSSelectorCompoundNode {
  return node.type === 'compound';
}


function walkCSSAST(
  node: CSSSelectorNode,
  callback: (node: CSSSelectorNode, parents: CSSSelectorNode[]) => void,
  parents: CSSSelectorNode[] = [],
) {
  callback(node, parents);

  const _parents: CSSSelectorNode[] = parents.concat([node]);

  if (isCCSSSelectorComplexNode(node)) {
    walkCSSAST(node.left, callback, _parents);
    walkCSSAST(node.right, callback, _parents);
  } else if (isCSSSelectorCompoundNode(node)) {
    for (let i = 0, l = node.list.length; i < l; i++) {
      walkCSSAST(node.list[i], callback, _parents);
    }
  }/* else if (node.subtree && o && o.subtree) {
    walk(node.subtree, callback, o, node);
  }*/

}

export function serializeCSSSelectorNode(node: CSSSelectorNode): string {
  if (isCSSSelectorIdNode(node)) {
    return node.content;
  } else if (isCSSSelectorClassNode(node)) {
    return node.content;
  } else if (isCSSSelectorTypeNode(node)) {
    return node.content;
  } else if (isCSSSelectorAttributeNode(node)) {
    return node.content;
  } else if (isCSSSelectorPseudoClassNode(node)) {
    return node.content;
  } else if (isCSSSelectorListNode(node)) {
    return node.list.map(serializeCSSSelectorNode).join(', ');
  } else if (isCCSSSelectorComplexNode(node)) {
    return `${ serializeCSSSelectorNode(node.left) }${ node.combinator }${ serializeCSSSelectorNode(node.right) }`;
  } else if (isCSSSelectorCompoundNode(node)) {
    return node.list.map(serializeCSSSelectorNode).join('');
  } else {
    throw new Error(`Unknown css selector node: ${ node.type }`);
  }
}
