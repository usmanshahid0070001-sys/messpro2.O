import { useMemo } from 'react';
import { encodeQRCode } from '../utils/qrEncoder';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

export default function QRCodeSVG({
  value,
  size = 200,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  includeMargin = true,
  className = '',
}: QRCodeSVGProps) {
  const { matrix, size: matrixSize } = useMemo(() => {
    if (!value) {
      return { matrix: [], size: 0 };
    }
    try {
      return encodeQRCode(value);
    } catch (e) {
      console.error('Failed to encode QR code:', e);
      return { matrix: [], size: 0 };
    }
  }, [value]);

  const margin = includeMargin ? 4 : 0;
  const viewBoxSize = matrixSize + margin * 2;

  // Generate SVG path for dark modules
  const path = useMemo(() => {
    if (!matrix.length) return '';
    let d = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r]?.[c]) {
          const x = c + margin;
          const y = r + margin;
          d += `M${x},${y}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize, margin]);

  if (!matrix.length) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-muted/20 text-xs text-muted-foreground ${className}`}
      >
        Generating QR...
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />
      <path d={path} fill={fgColor} />
    </svg>
  );
}
