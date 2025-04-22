/**
 * A function that composes multiple functions into a single function.
 *
 * @param {...Function} fns - The functions to be composed.
 * @returns {Function} - The composed function.
 */
export const pipe = (...fns) => x => {
  const pipeFn = async (v, f) => {
    const result = f(await v);
    if (result === undefined) {
      throw new Error('The chain is broken');
    }
    return result;
  };
  return fns.reduce(pipeFn, Promise.resolve(x));
};