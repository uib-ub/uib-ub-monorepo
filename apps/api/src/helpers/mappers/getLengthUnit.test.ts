import { getLengthUnit } from './getLengthUnit';
import { aatCMUnitType } from './staticMapping';

describe('getLengthUnit', () => {
  it('should return the correct length unit object', () => {
    // Test case 1: Valid input with unit 'mm'
    expect(getLengthUnit('10mm')).toEqual({
      value: 1,
      unit: aatCMUnitType,
      isApproximation: false,
    });

    // Test case 2: Valid input with unit 'cm'
    expect(getLengthUnit('20cm')).toEqual({
      value: 20,
      unit: aatCMUnitType,
      isApproximation: false,
    });

    // Test case 3: Valid input with unit 'ca cm' (approximation)
    expect(getLengthUnit('ca 30cm')).toEqual({
      value: 30,
      unit: aatCMUnitType,
      isApproximation: true,
    });

    // Test case 4: Invalid input (NaN value)
    expect(getLengthUnit('abc')).toEqual({
      value: NaN,
      unit: {}, // Replace with the expected unit object
      isApproximation: false,
    });
  });
});