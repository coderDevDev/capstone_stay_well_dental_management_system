declare module 'html2pdf.js' {
  function html2pdf(
    element: HTMLElement | DocumentFragment,
    options?: {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: { type?: string; quality?: number };
      html2canvas?: { scale?: number; useCORS?: boolean };
      jsPDF?: { unit?: string; format?: string; orientation?: string };
      pagebreak?: { mode?: string; before?: string[]; after?: string[] };
    }
  ): Promise<void>;

  export = html2pdf;
}
