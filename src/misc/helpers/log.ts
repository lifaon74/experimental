
export function log(...values: any[]) {
  if (typeof require === 'function') {
    console.log(
      ...values.map((value: any) => {
        return require('util').inspect(value, { showHidden: false, depth: null, colors: true  })
      })
    );
  } else {
    console.log(values);
  }
}
