import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExifData } from '../types';
import { BrandIcon } from './BrandIcon';

interface PreviewCardProps {
  imageSrc: string;
  exif: ExifData;
  borderColor?: string;
  layout?: 'left' | 'center' | 'right';
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ imageSrc, exif, borderColor = '#ffffff', layout = 'left' }) => {
  const parseHex = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '').trim();
    const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    return [r, g, b];
  };
  const srgbToLin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const isDarkBg = (() => {
    try {
      const [r, g, b] = parseHex(borderColor);
      const L = 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
      return L < 0.5;
    } catch {
      return false;
    }
  })();
  const baseColor = isDarkBg ? '#ffffff' : '#111827';
  const mutedColor = isDarkBg ? '#d1d5db' : '#6b7280';
  const tertiaryColor = isDarkBg ? '#d1d5db' : '#9ca3af';
  // Use display logic to clean up model name if it contains brand name
  const displayModel = React.useMemo(() => {
    if (exif.model.toLowerCase().startsWith(exif.make.toLowerCase())) {
        return exif.model.substring(exif.make.length).trim();
    }
    return exif.model;
  }, [exif.make, exif.model]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="shadow-2xl shadow-black/10 px-[5%] py-[4.5%] w-full max-w-2xl mx-auto rounded-[2px]"
      style={{ backgroundColor: borderColor }}
      id="preview-node"
    >
      <div className="relative aspect-auto w-full overflow-hidden bg-gray-100">
         <img 
           src={imageSrc} 
           alt="Upload" 
           className="w-full h-auto object-cover block" 
         />
      </div>

      <div className="mt-8 px-1 flex items-end" style={{ color: baseColor, justifyContent: layout === 'center' ? 'center' : layout === 'right' ? 'flex-end' : 'flex-start' }}>
        <div className="flex flex-col gap-1" style={{ textAlign: layout === 'center' ? 'center' : layout === 'right' ? 'right' : 'left' }}>
          <div className="flex items-center gap-2 mb-1" style={{ justifyContent: layout === 'center' ? 'center' : layout === 'right' ? 'flex-end' : 'flex-start' }}>
            <BrandIcon brand={exif.make} className="w-auto" />
            <span className="font-semibold text-sm sm:text-base tracking-tight">
              {displayModel || exif.make}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-normal tracking-wide" style={{ color: mutedColor }}>
            {exif.lens}
          </span>
          <div className="flex gap-3 sm:gap-4 font-medium text-xs sm:text-sm tabular-nums mt-1" style={{ justifyContent: layout === 'center' ? 'center' : layout === 'right' ? 'flex-end' : 'flex-start' }}>
            <span>{exif.focalLength}</span>
            <span>{exif.fNumber}</span>
            <span>{exif.exposureTime}</span>
            <span>{exif.iso}</span>
          </div>
          <span className="text-[10px] sm:text-xs font-light tracking-wide uppercase mt-1" style={{ color: tertiaryColor }}>
            {exif.dateTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
