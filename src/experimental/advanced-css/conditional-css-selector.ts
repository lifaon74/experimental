import { CSSSelectorNode, parse as parseCSSSelector } from 'parsel-js';
import {
  isCCSSSelectorComplexNode, isCSSSelectorAttributeNode, isCSSSelectorCompoundNode, serializeCSSSelectorNode
} from './parser/functions';

export type TConditionalCSSSelectorCondition = (element: Element) => boolean;

export interface IConditionalCSSSelector {
  selector: string;
  condition: TConditionalCSSSelectorCondition;
  value: string;
}

export const JS_ATTRIBUTE_NAME = `__js`;
export const JS_ATTRIBUTE_PATTERN = `\\[${ JS_ATTRIBUTE_NAME }=(["']?)(.*)\\1\\]`;
export const JS_ATTRIBUTE_REGEXP = new RegExp(`^${ JS_ATTRIBUTE_PATTERN }$`);

export function ExtractConditionalCSSSelectorOfCSSSelectorNode(
  node: CSSSelectorNode,
  pseudoSelector: string = '',
  anySelectorRequired: boolean = true,
): IConditionalCSSSelector[] {
  const conditionalCSSSelectors: IConditionalCSSSelector[] = [];
  if (isCSSSelectorAttributeNode(node)) {
    const match: RegExpExecArray | null = JS_ATTRIBUTE_REGEXP.exec(node.content);
    if (match !== null) {
      const content: string = match[2];
      const script: string = `return (${ content });`;
      let fnc: TConditionalCSSSelectorCondition;
      try {
        fnc = new Function('element', script) as TConditionalCSSSelectorCondition;
      } catch {
        throw new Error(`Invalid js for ${ pseudoSelector }${ node.content }`);
      }
      const conditionalCSSSelector: IConditionalCSSSelector = {
        selector: `${ pseudoSelector }${ anySelectorRequired ? '*' : '' }`,
        condition: fnc,
        value: content,
      };
      conditionalCSSSelectors.push(conditionalCSSSelector);
    }
  } else if (isCCSSSelectorComplexNode(node)) {
    const elegantCombinator: string = (node.combinator === ' ')
      ? ' '
      : ` ${ node.combinator } `;
    conditionalCSSSelectors.push(...ExtractConditionalCSSSelectorOfCSSSelectorNode(node.left, pseudoSelector));
    conditionalCSSSelectors.push(...ExtractConditionalCSSSelectorOfCSSSelectorNode(node.right, `${ pseudoSelector }${ serializeCSSSelectorNode(node.left) }${ elegantCombinator }`));
  } else if (isCSSSelectorCompoundNode(node)) {
    let _pseudoSelector: string = pseudoSelector;
    for (let i = 0, l = node.list.length; i < l; i++) {
      const child: CSSSelectorNode = node.list[i];
      conditionalCSSSelectors.push(...ExtractConditionalCSSSelectorOfCSSSelectorNode(child, _pseudoSelector, i === 0));
      _pseudoSelector += serializeCSSSelectorNode(child);
    }
  }

  return conditionalCSSSelectors;
}

export function ExtractConditionalCSSSelectorOfCSSSelector(
  selector: string,
): IConditionalCSSSelector[] {
  // console.log(parseCSSSelector(selector));
  return ExtractConditionalCSSSelectorOfCSSSelectorNode(parseCSSSelector(selector));
}

export function GroupConditionalCSSSelectors(
  conditionalCSSSelectors: IConditionalCSSSelector[],
): Map<string, IConditionalCSSSelector> {
  const conditionalCSSSelectorMap = new Map<string, IConditionalCSSSelector>();
  for (let i = 0, l = conditionalCSSSelectors.length; i < l; i++) {
    const conditionalCSSSelector: IConditionalCSSSelector = conditionalCSSSelectors[i];
    if (conditionalCSSSelectorMap.has(conditionalCSSSelector.value)) {
      (conditionalCSSSelectorMap.get(conditionalCSSSelector.value) as IConditionalCSSSelector).selector += `, ${ conditionalCSSSelector.selector }`;
    } else {
      conditionalCSSSelectorMap.set(conditionalCSSSelector.value, {
        ...conditionalCSSSelector,
      });
    }
  }
  return conditionalCSSSelectorMap;
}

export function ApplyConditionalCSSSelector(
  conditionalCSSSelector: IConditionalCSSSelector,
  root: ParentNode = document,
): void {
  root
    .querySelectorAll(conditionalCSSSelector.selector)
    .forEach((element: Element) => {
      if (conditionalCSSSelector.condition(element)) {
        console.log('ok');
        element.setAttribute(JS_ATTRIBUTE_NAME, conditionalCSSSelector.value);
      } else {
        element.removeAttribute(JS_ATTRIBUTE_NAME);
      }
    });
}



export function ApplyConditionalCSSSelectors(
  conditionalCSSSelectors: IConditionalCSSSelector[],
  root: ParentNode = document,
): void {
  const grouped: Map<string, IConditionalCSSSelector> = GroupConditionalCSSSelectors(conditionalCSSSelectors);
  const iterator: Iterator<IConditionalCSSSelector> = grouped.values();
  let result: IteratorResult<IConditionalCSSSelector>;
  while (!(result = iterator.next()).done) {
    ApplyConditionalCSSSelector(result.value, root);
  }
}


/*------------*/

// interface IConditionalGroupedCSSSelector {
//   selectors: string[];
//   condition: TConditionalCSSSelectorCondition;
//   value: string;
// }
//
// const CONDITIONAL_CSS_SELECTOR_MAP = new Map<string, IConditionalGroupedCSSSelector>();
//

