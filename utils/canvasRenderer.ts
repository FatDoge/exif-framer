import { ExifData } from '../types';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandIcon } from '../components/BrandIcon';

/**
 * Renders the final image with border and text onto a high-res canvas.
 * This preserves the original resolution of the uploaded photo.
 */
export const generateFinalImage = async (
  imageSrc: string,
  exif: ExifData,
  logoType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = async () => {
      const scale = 1; // Can increase for super-sampling if needed, but 1:1 with original is best
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;

      // Design Configuration (Relative to Image Size)
      // We want the border to be proportional. e.g., 5% of the shortest side.
      const borderSize = Math.max(originalWidth, originalHeight) * 0.04;
      const bottomPadding = borderSize * 3.5; // More space at bottom for "Polaroid" look
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject('Could not get canvas context');
        return;
      }

      const canvasWidth = originalWidth + (borderSize * 2);
      const canvasHeight = originalHeight + borderSize + bottomPadding;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 1. Draw Background (White Paper)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Draw Image
      ctx.drawImage(img, borderSize, borderSize, originalWidth, originalHeight);

      // 3. Draw Text
      // Calculate font sizes relative to image resolution
      const baseFontSize = Math.max(originalWidth, originalHeight) * 0.018; 
      const smallFontSize = baseFontSize * 0.85;

      ctx.textBaseline = 'top';
      
      // Text Color
      ctx.fillStyle = '#111111'; // Nearly black
      const textY = borderSize + originalHeight + (bottomPadding * 0.15); // Start text slightly below image
      const textXLeft = borderSize;
      const textXRight = canvasWidth - borderSize;

      const brand = logoType || exif.make;
      const svgMarkup = renderToStaticMarkup(
        React.createElement(BrandIcon, { brand })
      );
      if (svgMarkup) {
        const vb = svgMarkup.match(/viewBox="\s*\d+\s+\d+\s+(\d+)\s+(\d+)"/);
        let ratio = 5;
        if (vb && vb[1] && vb[2]) {
          const w = parseFloat(vb[1]);
          const h = parseFloat(vb[2]);
          if (w > 0 && h > 0) ratio = w / h;
        }
        const logoImg = new Image();
        const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
        logoImg.src = svgUrl;
        await new Promise((res, rej) => {
          logoImg.onload = () => res(null);
          logoImg.onerror = rej as any;
        });
        const logoH = Math.max(baseFontSize, 12);
        const logoW = logoH * ratio;
        ctx.drawImage(logoImg, textXLeft, textY - logoH * 0.1, logoW, logoH);
      }

      // Left Column: Model & Lens
      ctx.textAlign = 'left';
      
      // Model Name (Bold-ish)
      ctx.font = `600 ${baseFontSize}px "Inter", -apple-system, sans-serif`;
      // Clean up model name (remove Brand if it repeats)
      let displayModel = exif.model;
      if (displayModel.toLowerCase().startsWith(exif.make.toLowerCase())) {
         displayModel = displayModel.substring(exif.make.length).trim();
      }
      ctx.fillText(`${exif.make} ${displayModel}`, textXLeft, textY);

      // Lens Name (Lighter)
      ctx.fillStyle = '#666666';
      ctx.font = `400 ${smallFontSize}px "Inter", -apple-system, sans-serif`;
      ctx.fillText(exif.lens, textXLeft, textY + baseFontSize * 1.4);

      // Right Column: Settings
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111111';
      
      // Settings Line
      ctx.font = `500 ${baseFontSize}px "Inter", -apple-system, sans-serif`;
      const settingsText = `${exif.focalLength}  ${exif.fNumber}  ${exif.exposureTime}  ${exif.iso}`;
      ctx.fillText(settingsText, textXRight, textY);

      // Date Line
      ctx.fillStyle = '#888888';
      ctx.font = `400 ${smallFontSize}px "Inter", -apple-system, sans-serif`;
      ctx.fillText(exif.dateTime, textXRight, textY + baseFontSize * 1.4);

      // 4. Draw Logo (Simplified Text or Simple Shapes for this demo to avoid external asset dependency issues)
      // In a real app, we would load SVG paths. Here we simulate the logo placement visually.
      // We will skip drawing a complex SVG on canvas manually for robustness in this snippet, 
      // relying on the elegant typography which is the trend. 
      // Alternatively, we could draw a simple line separator.
      
      const lineY = textY + (baseFontSize * 1.4) / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = Math.max(1, originalWidth * 0.001);
      // Vertical separator line in the middle? No, keep it clean.

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = (err) => reject(err);
  });
};
