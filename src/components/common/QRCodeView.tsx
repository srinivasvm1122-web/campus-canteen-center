import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  centerIcon?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 180,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x for sharp retina rendering
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => {
        setDataUrl(url);
        setError(null);
      })
      .catch(err => {
        console.error('QR Code generation error:', err);
        setError('Failed to generate QR Code');
      });
  }, [value, size, darkColor, lightColor]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-red-50 text-red-500 text-xs rounded-xl p-2 text-center ${className}`}
      >
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 rounded-xl animate-pulse ${className}`}
      >
        <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block bg-white p-2 rounded-2xl shadow-md border border-slate-100 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={dataUrl}
        alt="QR Code"
        className="w-full h-full object-contain rounded-xl"
      />
    </div>
  );
};
