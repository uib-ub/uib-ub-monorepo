import * as React from "react";
import type { SVGProps } from "react";
import { forwardRef, memo } from "react";

const SvgHvlIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 164 142"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    ref={ref}
  >
    <path
      d="M21.613.203H.036l36.007 62.365 10.788-18.685L21.613.203ZM107.209.203l-42.798 74.13-10.788 18.685 28.242 48.917L163.694.203h-56.485Z"
      fill="#00b6c9"
      fillRule="nonzero"
    />
  </svg>
));
SvgHvlIcon.displayName = "SvgHvlIcon";
const Memo = memo(SvgHvlIcon);
export default Memo;
