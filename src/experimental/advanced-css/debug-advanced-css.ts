// import * as cssTree from 'css-tree';
import { compile, Element as CSSElement } from 'stylis';
import { IndentLines, ScopeLines } from './snipets';

import { CSSSelectorNode, parse as parseCSSSelector } from 'parsel-js';
import {
  isCCSSSelectorComplexNode, isCSSSelectorAttributeNode, isCSSSelectorCompoundNode, serializeCSSSelectorNode
} from './parser/functions';
import {
  ApplyConditionalCSSSelectors, ExtractConditionalCSSSelectorOfCSSSelector, IConditionalCSSSelector, JS_ATTRIBUTE_NAME
} from './conditional-css-selector';


/*------------------------*/


// https://github.com/postcss/benchmark
// https://github.com/thysultan/stylis.js
// https://lea.verou.me/2020/09/parsel-a-tiny-permissive-css-selector-parser/

export function CreateStyleElement(css: string, disabled: boolean = false): HTMLStyleElement {
  const styleElement: HTMLStyleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(css));
  document.head.appendChild(styleElement);
  (styleElement.sheet as StyleSheet).disabled = disabled;
  return styleElement;
}

// invalid
const css1 = `
  body:not(.a), div {
    background-color: js(parentElement.style.backgroundColor);
  }
`;

// semi-valid (IDE compliant, but not CSSOM compliant)
const css2 = `
  body:not(.a), div {
    js-background-color: 'parentElement.style.backgroundColor';
  }
`;


// valid
const css3 = `
  body:not(.a), div {
    --js-bg: 'parentElement.style.backgroundColor';
    background-color: var(--js-bg);
  }
`;

interface CSSAndJS {
  css: string[];
  js: string[];
}

function createCSSAndJS(
  css: string[] = [],
  js: string[] = [],
): CSSAndJS {
  return {
    css,
    js,
  };
}

function flattenCSSAndJS(
  array: CSSAndJS[],
): CSSAndJS {
  return array.reduce((merged: CSSAndJS, value: CSSAndJS) => {
    return appendCSSAndJS(merged, value);
  }, createCSSAndJS());
}

function appendCSSAndJS(
  a: CSSAndJS,
  b: CSSAndJS,
): CSSAndJS {
  a.css.push(...b.css);
  a.js.push(...b.js);
  return a;
}

function forCSSAndJSLines(
  input: CSSAndJS,
  callback: (lines: string[]) => string[],
  copy: boolean = false,
): CSSAndJS {
  if (copy) {
    return {
      css: callback(input.css),
      js: callback(input.js),
    };
  } else {
    input.css = callback(input.css);
    input.js = callback(input.js);
    return input;
  }
}

function scopeCSS(
  input: CSSAndJS,
): CSSAndJS {
  ScopeLines(input.css);
  return input;
}

function indentCSS(
  input: CSSAndJS,
): CSSAndJS {
  IndentLines(input.css);
  return input;
}


const JS_PROPERTY_PATTERN = `js-([_a-zA-Z]+[_-a-zA-Z0-9]*)`;
const JS_PROPERTY_REGEXP = new RegExp(`^${ JS_PROPERTY_PATTERN }$`, 'g');

function parseCSSDeclaration(
  element: CSSElement,
): CSSAndJS {
  const propertyName: string = element.children as string;
  const propertyValue: string = element.value;
  console.log(element);
  const match: RegExpExecArray | null = JS_PROPERTY_REGEXP.exec(propertyName);
  if (match !== null) {
    return {
      css: [],
      js: [
        ``
      ],
    };
  } else {
    return {
      css: [
        `${ propertyName }: ${ propertyValue }`,
      ],
      js: [],
    };
  }
}


function parseCSSRule(
  element: CSSElement,
): CSSAndJS {
  // console.log(element);

  const cssAndJSForBody: CSSAndJS = flattenCSSAndJS(
    (element.children as CSSElement[])
      .map((element: CSSElement): CSSAndJS => {
        switch (element.type) {
          case 'decl':
            return parseCSSDeclaration(element);
          default:
            throw new Error(`Unknown element: ${ element.type }`);
        }
      })
  );

  const selector: string[] = (element.props as string[]);

  return {
    css: [
      `${ selector.join(',\n') } {`,
      ...IndentLines(cssAndJSForBody.css),
      `}`,
    ],
    js: cssAndJSForBody.js
  };
}

function debugAdvancedCSS1() {
  // const lines: string[] = [
  //   `const styleElement = document.createElement('style');`,
  //   `styleElement.appendChild(document.createTextNode(css));`,
  // ];

  const out: CSSAndJS = createCSSAndJS();

  const elements: CSSElement[] = compile(css2);
  // console.log(elements);

  for (let i = 0, l = elements.length; i < l; i++) {
    const element: CSSElement = elements[i];
    switch (element.type) {
      case 'rule':
        appendCSSAndJS(out, parseCSSRule(element));
        break;
    }
  }


  const css = out.css.join('\n');
  const js = out.js.join('\n');
  console.log('------------ CSS -----------');
  console.log(css);
  console.log('------------ JS -----------');
  console.log(js);
}

function debugAdvancedCSS2() {
  const styleElement = CreateStyleElement(css2);
  const sheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;

  console.log(sheet);
}


/*--------------------------*/

/*
selector syntax:

  [__js="code"]
  :js(code)


property syntax:

  js-property-name: 'code';

  property-name: js('code');

  --element-color: 'js(document.body.backgroundColor)';
  property-name: var(--element-color);

 */

class AdvancedCSSProperty {
  readonly name: string;
  readonly value: string;
  readonly parent: AdvancedCSSStyleRule;

  protected constructor(
    name: string,
    value: string,
    parent: AdvancedCSSStyleRule,
  ) {
    this.name = name;
    this.value = value;
    this.parent = parent;
  }
}

class AdvancedCSSDynamicProperty extends AdvancedCSSProperty {

}




class AdvancedCSSSelector {

  static parse(input: string): AdvancedCSSSelector {
    return new AdvancedCSSSelector(input);
  }

  readonly value: string;

  protected _conditions: IConditionalCSSSelector[];

  constructor(
    value: string,
  ) {
    this.value = value;
    this._conditions = ExtractConditionalCSSSelectorOfCSSSelector(value);

    // console.log(this._conditions);
    //
    // ApplyConditionalCSSSelectors(this._conditions);
  }

  // * listMatchingElements<GElement extends Element>(
  //   root: Node,
  // ): Generator<GElement> {
  //   const treeWalker: TreeWalker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
  //
  //   while (treeWalker.nextNode()) {
  //     const element: GElement = treeWalker.currentNode as GElement;
  //     if (element.matches(this.selector)) {
  //       yield treeWalker.currentNode as GElement;
  //     }
  //   }
  // }
}


class AdvancedCSSStyleRule {
  readonly selector: AdvancedCSSSelector;

  protected _properties: AdvancedCSSProperty[];

  constructor(
    selector: AdvancedCSSSelector,
  ) {
    this.selector = selector;
    this._properties = [];
  }

  appendProperty(
    name: string,
    value: string,
  ): void {

  }

  // * listMatchingElements<GElement extends Element>(
  //   root: Node,
  // ): Generator<GElement> {
  //   const treeWalker: TreeWalker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
  //
  //   while (treeWalker.nextNode()) {
  //     const element: GElement = treeWalker.currentNode as GElement;
  //     if (element.matches(this.selector)) {
  //       yield treeWalker.currentNode as GElement;
  //     }
  //   }
  // }

  toString(): string {
    return ``;
  }
}

// class AdvancedCSSStyleSheet {
//   constructor(
//     selector: string,
//     properties: Iterable<AdvancedCSSProperty>,
//   ) {
//     this._properties = Array.from(properties);
//   }
// }

function debugAdvancedCSSRule() {
  // const styleElement = CreateStyleElement(css2);
  // const sheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;
  //
  // console.log(sheet.cssRules);

  // const selectorString = `*[${ JS_ATTRIBUTE_NAME }="element.offsetWidth > 500"], b`;
  const selectorString = `*[${ JS_ATTRIBUTE_NAME }="element.offsetWidth > 500"]`;
  // const selectorString = `a[${ JS_ATTRIBUTE_NAME }="element.offsetWidth > 500"] + div[${ JS_ATTRIBUTE_NAME }="element.offsetWidth < 500"]`;
  // const selectorString = `a[${ JS_ATTRIBUTE_NAME }="element.offsetWidth > 500"] > div[${ JS_ATTRIBUTE_NAME }="123"]`;
  // const selectorString = `a[${ JS_ATTRIBUTE_NAME }="element > 123"] > div[${ JS_ATTRIBUTE_NAME }="123"]`;
  // const selectorString = `a[attr="abcde"][attr="123"]`;
  // const selectorString = `*[${ JS_ATTRIBUTE_NAME }="$exp(() => (element.offsetWidth > 500))"]`;
  const selector = AdvancedCSSSelector.parse(selectorString);

  console.log(selector);
}


/*--------------------------*/

export async function debugAdvancedCSS() {
  // await debugAdvancedCSS1();
  // await debugAdvancedCSS2();
  await debugAdvancedCSSRule();
}
