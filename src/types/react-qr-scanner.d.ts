declare module 'react-qr-scanner' {
  import * as React from 'react';

  interface QrReaderProps {
    onScan: (result: any) => void;
    onError: (error: any) => void;
    onLoad?: () => void;
    onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    delay?: number | false;
    facingMode?: 'user' | 'environment';
    legacyMode?: boolean;
    resolution?: number;
    showViewFinder?: boolean;
    style?: React.CSSProperties;
    className?: string;
    constraints?: MediaStreamConstraints;
    onResult: (result: any) => void;
  }

  class QrReader extends React.Component<QrReaderProps> {}

  export { QrReader };
  export default QrReader;
}
