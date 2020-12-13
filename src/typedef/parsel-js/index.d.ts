declare module 'parsel-js' {

  interface CSSSelectorNode {
    type: string;
    // content?: string;
  }

  interface CSSSelectorTokenNode extends CSSSelectorNode {
    content: string;
    pos: [number, number];
  }


  interface CSSSelectorIdNode extends CSSSelectorTokenNode {
    type: 'id';
    name: string;
  }

  interface CSSSelectorClassNode extends CSSSelectorTokenNode {
    type: 'class';
    name: string;
  }

  interface CSSSelectorTypeNode extends CSSSelectorTokenNode {
    type: 'type';
    name: string;
  }

  interface CSSSelectorAttributeNode extends CSSSelectorTokenNode {
    type: 'attribute';
    name: string;
    operator: string;
    value: string;
  }

  interface CSSSelectorPseudoClassNode extends CSSSelectorTokenNode {
    type: 'pseudo-class';
    name: string;
    argument: string;
    subtree: CSSSelectorNode;
  }

  interface CSSSelectorPseudoElementNode extends CSSSelectorTokenNode {
    type: 'pseudo-element';
    name: string;
  }

  interface CSSSelectorListNode extends CSSSelectorNode {
    type: 'list';
    list: CSSSelectorNode[];
  }

  interface CSSSelectorComplexNode extends CSSSelectorNode {
    type: 'complex';
    combinator: string;
    left: CSSSelectorNode;
    right: CSSSelectorNode;
  }


  interface CSSSelectorCompoundNode extends CSSSelectorNode {
    type: 'compound';
    list: CSSSelectorNode[];
  }

  interface ParseOptions {
    recursive?: boolean;
    list?: boolean;
  }

  function parse(selector: string, options?: ParseOptions): CSSSelectorNode;

  function walk(node: CSSSelectorNode, callback: (node: CSSSelectorNode, parent: CSSSelectorNode | undefined) => void): void;
}

