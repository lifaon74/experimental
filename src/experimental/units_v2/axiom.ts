
//
// export interface IPredicateNode {
//
// }
//
// export abstract class PredicateNode {
//
// }
//
//
//
// export interface IPredicateSymbol extends IPredicateNode {
//   readonly name: string;
// }
//
// export class PredicateSymbol extends PredicateNode implements IPredicateSymbol {
//   readonly name: string;
//
//   constructor(name: string) {
//     super();
//     this.name = name;
//   }
// }
//
//
//
//
// export interface IPredicateNumber extends IPredicateNode {
//   readonly value: number;
// }
//
// export class PredicateNumber extends PredicateNode implements IPredicateNumber {
//   readonly value: number;
//
//   constructor(
//     value: number
//   ) {
//     super();
//     this.value = value;
//   }
//
//   simplify(): IPredicateNode {
//     return this;
//   }
// }
//
//
//
// export interface IPredicateFunction extends IPredicateNode {
//   readonly members: ReadonlyArray<IPredicateNode>;
// }
//
// export abstract class PredicateFunction extends PredicateNode implements IPredicateFunction {
//   readonly members: ReadonlyArray<IPredicateNode>;
// }
//
//
// export interface IPredicateSum extends IPredicateFunction {
//
// }


class PredicationSymbol {
    readonly name: string;

    constructor(name: string) {
      this.name = name;
    }
}



class PredicationNumber {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }
}


class PredicationFunction {
  readonly name: string;
  readonly argumentsLength: number;

  constructor(
    name: string,
    argumentsLength: number
  ) {
    this.name = name;
    this.argumentsLength = argumentsLength;
  }


}


/*----*/

interface PredicateASTNode {
  type: string;
}

interface PredicateFunctionASTNode extends PredicateASTNode {
  type: 'function';
  name: string;
  args: PredicateASTNode[];
}

interface PredicateVariableASTNode extends PredicateASTNode {
  type: 'variable';
  name: string;
}

interface PredicateInferASTNode extends PredicateASTNode {
  type: 'infer';
}

type Predicate = [PredicateASTNode, PredicateASTNode];


function inferPredicateShape(
  origin: PredicateFunctionASTNode,
  target: PredicateFunctionASTNode,
  predicates: Predicate[],
) {
  for (let i = 0, li = predicates.length; i < li; i++) {
    const predicate: Predicate = predicates[i];
    const _origin: PredicateASTNode = predicate[0];

    // if (_origin.name === origin.name) {
    //
    //   for (let j = 0, lj = _origin.args.length; j < lj; j++) {
    //     const arg: PredicateASTNode = _origin.args[j];
    //     if (arg.type === '') {
    //
    //     }
    //   }
    //   // inferPredicateShape();
    // }
  }
}


const fnc = (name: string, args: PredicateASTNode[]): PredicateFunctionASTNode => {
  return {
    type: 'function',
    name,
    args,
  };
}

const variable = (name: string): PredicateVariableASTNode => {
  return {
    type: 'variable',
    name,
  };
}

const symb = (name: string): PredicateFunctionASTNode => {
  return fnc(name, []);
}

const infer = (): PredicateInferASTNode => {
  return {
    type: 'infer'
  };
}



const zero = (): PredicateFunctionASTNode => {
  return symb('zero');
}

const inc = (a: PredicateASTNode): PredicateFunctionASTNode => {
  return fnc('inc', [a]);
}

const add = (a: PredicateASTNode, b: PredicateASTNode): PredicateFunctionASTNode => {
  return fnc('add', [a, b]);
}

function resolveP(
  node: PredicateASTNode,
  predicates: Predicate[],
) {
  for (let i = 0, li = predicates.length; i < li; i++) {
    const predicate: Predicate = predicates[i];
    const _origin: PredicateASTNode = predicate[0];
  }

}

export async function debugAxiom() {


  // const predicates: Predicate[] = [
  //   [add(symb('1'), symb('2')), symb('3')],
  //   [add(variable('a'), variable('b')), add(variable('b'), variable('a'))],
  // ];
  //
  //
  // inferPredicateShape(
  //   // add(symb('1'), symb('2')),
  //   // add(symb('2'), infer()),
  //   add(symb('2'), symb('1')),
  //   add(symb('2'), infer()),
  //   predicates,
  // );


  // https://en.wikipedia.org/wiki/Peano_axioms#Arithmetic
  const predicates: Predicate[] = [
    [add(variable('a'), zero()), variable('a')],
    [add(variable('a'), inc(variable('b'))), inc(add(variable('a'), variable('ab')))],
  ];

  resolveP(
    add(variable('a'), inc(zero())),
    predicates,
  );
}
