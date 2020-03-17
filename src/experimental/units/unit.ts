import { GenerateAllUnitConverters } from './converters/all-converters';


export function testUnit() {
  GenerateAllUnitConverters();

  // console.log(GetTypeConverters('m', 'in'));
  // console.log(GetTypeConverterOrThrow('meter', 'metre')(0.3));
  // console.log(GetTypeConverterOrThrow('meter', 'm')(0.3));
  // console.log(GetTypeConverterOrThrow('m', 'cm')(0.3));
  // console.log(GetTypeConverterOrThrow('mm', 'cm')(15));
  //
  // console.log(GetTypeConverterOrThrow('in', 'cm')(1));
  // console.log(GetTypeConverterOrThrow('cm', 'in')(2.54 * 4));
  // console.log(GetTypeConverterOrThrow('th', 'mm')(1));
  // console.log(GetTypeConverterOrThrow('minute', 'second')(1));
  //
  // console.log(GetTypeConverterOrThrow('minute', 'meter')(1));

  // console.log(GetTypeConverterOrThrow('degree', 'radian')(180));
  // console.log(GetTypeConverterOrThrow('rad', 'deg')(Math.PI / 2));

  // console.log(GetTypeConverterOrThrow('celcius', 'kelvin')(0));
  // console.log(GetTypeConverterOrThrow('celcius', '°F')(0));

  // console.log(meter(1).add(mm(1000)).sub(cm(10)).to('cm').toString());
  // console.log(NumericUnit.mean(fahrenheit(32), kelvin(273.15)).to('°C').toString());
}


