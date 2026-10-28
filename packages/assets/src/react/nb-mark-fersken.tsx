import * as React from "react";
import type { SVGProps } from "react";
import { Ref, forwardRef, memo } from "react";
const SvgNbMarkFersken = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 524 687"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <circle cx={34.8813} cy={163.348} r={34.8813} fill="#F7DEDE" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M523.221.569H116.272v569.728h406.949zM395.322 163.348c0 19.264-15.617 34.881-34.881 34.881-19.265 0-34.882-15.617-34.882-34.881s15.617-34.881 34.882-34.881 34.881 15.617 34.881 34.881m-162.78 0c0 19.264-15.617 34.881-34.881 34.881s-34.881-15.617-34.881-34.881 15.617-34.881 34.881-34.881 34.881 15.617 34.881 34.881m127.899 197.661c19.264 0 34.881-15.617 34.881-34.881 0-19.265-15.617-34.881-34.881-34.881-19.265 0-34.882 15.616-34.882 34.881 0 19.264 15.617 34.881 34.882 34.881m34.881 127.898c0 19.264-15.617 34.881-34.881 34.881-19.265 0-34.882-15.617-34.882-34.881 0-19.265 15.617-34.882 34.882-34.882s34.881 15.617 34.881 34.882"
      fill="#F7DEDE"
    />
    <circle cx={360.441} cy={651.687} r={34.8813} fill="#F7DEDE" />
  </svg>
);
const ForwardRef = forwardRef(SvgNbMarkFersken);
const Memo = memo(ForwardRef);
export default Memo;
