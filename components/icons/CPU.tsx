import { SVGProps } from 'react';

export function CPUIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
      <g fill="none">
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="4" d="M38 8H10a2 2 0 0 0-2 2v28a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"/>
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="4" d="M30 18H18v12h12z"/>
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14.91 2v6m0 32v6m9.09-40v6m0 32v6m9.09-40v6m0 32v6M2 14.91h6m32 0h6M2 24h6m32 0h6M2 33.09h6m32 0h6"/>
      </g>
    </svg>
  );
}