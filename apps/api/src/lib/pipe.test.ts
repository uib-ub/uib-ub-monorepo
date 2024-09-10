import { pipe } from './pipe';

test("pipe function", async () => {
  test("should compose synchronous functions", async () => {
    const double = x => x * 2;
    const addTen = x => x + 10;
    const composed = pipe(double, addTen);
    expect(await composed(5)).toBe(20);
  });

  test("should compose asynchronous functions", async () => {
    const asyncDouble = async x => x * 2;
    const asyncAddTen = async x => x + 10;
    const composed = pipe(asyncDouble, asyncAddTen);
    expect(await composed(5)).toBe(20);
  });

  test("should compose mixed synchronous and asynchronous functions", async () => {
    const double = x => x * 2;
    const asyncAddTen = async x => x + 10;
    const composed = pipe(double, asyncAddTen);
    expect(await composed(5)).toBe(20);
  });

  test("should handle promises as input", async () => {
    const double = x => x * 2;
    const addTen = x => x + 10;
    const composed = pipe(double, addTen);
    expect(await composed(Promise.resolve(5))).toBe(20);
  });

  test("should throw an error if any function returns undefined", async () => {
    const double = x => x * 2;
    const returnUndefined = () => undefined;
    const composed = pipe(double, returnUndefined);
    await expect(composed(5)).rejects.toThrow('The chain is broken');
  });

  test("should pass the result of each function to the next", async () => {
    const addTwo = x => x + 2;
    const toString = x => x.toString();
    const addPrefix = x => 'Result: ' + x;
    const composed = pipe(addTwo, toString, addPrefix);
    expect(await composed(5)).toBe('Result: 7');
  });

  test("should work with a single function", async () => {
    const double = x => x * 2;
    const composed = pipe(double);
    expect(await composed(5)).toBe(10);
  });

  test("should return a promise that resolves to the input if no functions are provided", async () => {
    const composed = pipe();
    expect(await composed(5)).toBe(5);
  });
});