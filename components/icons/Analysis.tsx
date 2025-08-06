import { SVGProps } from 'react';

export function AnalysisIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="4">
        <path strokeLinejoin="round" d="M44 5H4v12h40z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 41.03l12.176-12.3l6.579 6.3L30.798 27l4.48 4.368"/>
        <path strokeLinecap="round" d="M44 16.172v26m-40-26v14M13.016 43H44M17 11h21m-28-.003h1"/>
      </g>
    </svg>
  );
}