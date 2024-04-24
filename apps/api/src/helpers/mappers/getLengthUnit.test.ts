import { getLengthUnit } from './getLengthUnit';

describe('getLengthUnit', () => {
  it('should return the correct length and unit when provided with a string containing both', () => {
    expect(getLengthUnit('10 cm')).toEqual({ value: 10, unit: 'cm', isApproximation: false });
  });

  it('should return the correct length and an empty string as the unit when provided with a string containing only the length', () => {
    expect(getLengthUnit('10')).toEqual({ value: 10, unit: '', isApproximation: false });
  });

  it('should return NaN as the length and the unit when provided with a string containing only the unit', () => {
    expect(getLengthUnit('cm')).toEqual({ value: NaN, unit: 'cm', isApproximation: false });
  });

  it('should return NaN as the length and an empty string as the unit when provided with an empty string', () => {
    expect(getLengthUnit('')).toEqual({ value: NaN, unit: '', isApproximation: false });
  });

  it('should handle strings starting with "ca" as approximations and remove the "ca" prefix', () => {
    expect(getLengthUnit('ca 10 cm')).toEqual({ value: 10, unit: 'cm', isApproximation: true });
  });

  it('should handle strings starting with "ca" and no length value as approximations', () => {
    expect(getLengthUnit('ca cm')).toEqual({ value: NaN, unit: 'cm', isApproximation: true });
  });

  it('should handle strings starting with "ca" and no unit value as approximations', () => {
    expect(getLengthUnit('ca 10')).toEqual({ value: 10, unit: '', isApproximation: true });
  });

  it('should handle strings starting with "ca" and no length or unit value as approximations', () => {
    expect(getLengthUnit('ca')).toEqual({ value: NaN, unit: '', isApproximation: true });
  });

  it('should handle strings with a unit of "mm" by converting the value to centimeters', () => {
    expect(getLengthUnit('10 mm')).toEqual({ value: 1, unit: 'cm', isApproximation: false });
  });

  it('should handle strings with a unit of "mm" and starting with "ca" by converting the value to centimeters and marking it as an approximation', () => {
    expect(getLengthUnit('ca 10 mm')).toEqual({ value: 1, unit: 'cm', isApproximation: true });
  });
});