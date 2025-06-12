declare module 'edtf' {
  interface EDTFObject {
    type: string;
    min?: number;
    max?: number;
    lower?: {
      min?: number;
      max?: number;
    };
    upper?: {
      min?: number;
      max?: number;
    };
    toString(): string;
  }

  function edtf(date: string, options?: { types: string[] }): EDTFObject;
  export default edtf;
} 