import * as React from "react";
import type { SVGProps } from "react";
import { Ref, forwardRef, memo } from "react";
const SvgNbIcon = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="2 3 115 164"
    ref={ref}
  >
    <g display="inline">
      <path
        d="M28.676-3.146h88.179v138.363H28.676z"
        transform="translate(0 7)"
        fill="#af0915"
        fillOpacity={1}
        stroke="none"
      />
    </g>
    <g display="inline">
      <path
        d="M-25.367 49.14a6.852 6.852 0 1 1-13.704 0 6.852 6.852 0 1 1 13.704 0z"
        transform="matrix(1.10638 0 0 1.10638 83.055 -5.342)"
        fill="#fff"
        fillOpacity={1}
        stroke="none"
      />
      <path
        d="M-25.367 49.14a6.852 6.852 0 1 1-13.704 0 6.852 6.852 0 1 1 13.704 0z"
        transform="matrix(1.10638 0 0 1.10638 120.04 31.267)"
        fill="#fff"
        fillOpacity={1}
        stroke="none"
      />
      <path
        d="M-25.367 49.14a6.852 6.852 0 1 1-13.704 0 6.852 6.852 0 1 1 13.704 0z"
        transform="matrix(1.10638 0 0 1.10638 120.04 -5.342)"
        fill="#fff"
        fillOpacity={1}
        stroke="none"
      />
      <path
        d="M-25.367 49.14a6.852 6.852 0 1 1-13.704 0 6.852 6.852 0 1 1 13.704 0z"
        transform="matrix(1.10638 0 0 1.10638 120.04 68.26)"
        fill="#fff"
        fillOpacity={1}
        stroke="none"
      />
      <g fill="#af0915" fillOpacity={1}>
        <path
          d="M-25.367 49.14a6.852 6.852 0 1 1-13.704 0 6.852 6.852 0 1 1 13.704 0z"
          transform="matrix(1.10638 0 0 1.10638 45.776 -5.342)"
          fill="#af0915"
          fillOpacity={1}
          stroke="none"
        />
        <path
          d="M-25.367 49.14a6.852 6.852 0 1 1-13.704 0 6.852 6.852 0 1 1 13.704 0z"
          transform="matrix(1.10638 0 0 1.10638 120.04 105.062)"
          fill="#af0915"
          fillOpacity={1}
          stroke="none"
        />
      </g>
    </g>
  </svg>
);
const ForwardRef = forwardRef(SvgNbIcon);
const Memo = memo(ForwardRef);
export default Memo;
