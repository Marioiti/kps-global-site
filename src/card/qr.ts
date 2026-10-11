import QRCode from 'qrcode';

/** A QR code as one SVG path: dark modules as unit squares, joined along each row. */
export interface QrShape {
  /** Modules per side, without the quiet zone. */
  size: number;
  d: string;
}

/** Builds the code at build time (Node); the page only gets the path. */
export function qrShape(text: string): QrShape {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const size = modules.size;
  const parts: string[] = [];
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!modules.get(y, x)) {
        x++;
        continue;
      }
      const start = x;
      while (x < size && modules.get(y, x)) x++;
      parts.push(`M${start} ${y}h${x - start}v1h-${x - start}z`);
    }
  }
  return { size, d: parts.join('') };
}

/** The module grid of a code, for tests: true for a dark module. */
export function qrMatrix(text: string): boolean[][] {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
  return Array.from({ length: modules.size }, (_, y) => Array.from({ length: modules.size }, (_, x) => Boolean(modules.get(y, x))));
}
