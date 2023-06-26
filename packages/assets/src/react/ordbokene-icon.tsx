import * as React from "react";
import type { SVGProps } from "react";
import { Ref, forwardRef, memo } from "react";
const SvgOrdbokeneIcon = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    ref={ref}
  >
    <defs>
      <linearGradient id="a">
        <stop offset={0} stopColor="#560027" />
        <stop offset={1} stopColor="#560027" stopOpacity={0} />
      </linearGradient>
    </defs>
    <g transform="translate(0 -280.067)">
      <circle cx={8.467} cy={288.533} r={8.467} fill="#560027" />
      <text
        xmlSpace="preserve"
        x={3.709}
        y={293.391}
        fill="#fff"
        strokeWidth={0.179}
        fontFamily="sans-serif"
        fontSize={23.813}
        letterSpacing={0}
        style={{
          lineHeight: 1.25,
        }}
        wordSpacing={0}
      >
        <tspan
          x={3.709}
          y={293.391}
          fontFamily="Inria Serif"
          fontSize={14.287}
          style={{
            InkscapeFontSpecification: "&quot",
          }}
        >
          {"\n\t\t\t\tO\n\t\t\t"}
        </tspan>
      </text>
    </g>
  </svg>
);
const ForwardRef = forwardRef(SvgOrdbokeneIcon);
const Memo = memo(ForwardRef);
export default Memo;
