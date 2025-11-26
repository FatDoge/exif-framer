import ExifReader from 'exifreader';
import { ExifData, INITIAL_EXIF } from '../types';

export const formatFocalLength = (val: string | undefined): string => {
  if (!val) return INITIAL_EXIF.focalLength;
  try {
    let s = val.toLowerCase().replace(/mm/g, '').replace(/\s+/g, '').trim();
    let num: number;
    if (s.includes('/')) {
      const [a, b] = s.split('/');
      const na = parseFloat(a);
      const nb = parseFloat(b);
      if (isFinite(na) && isFinite(nb) && nb !== 0) num = na / nb; else num = parseFloat(s);
    } else {
      num = parseFloat(s);
    }
    if (!isFinite(num)) return INITIAL_EXIF.focalLength;
    return `${Math.round(num)}mm`;
  } catch {
    return INITIAL_EXIF.focalLength;
  }
};

export const formatFNumber = (val: string | undefined): string => {
  if (!val) return INITIAL_EXIF.fNumber;
  try {
    const s = val.toString().toLowerCase().replace(/^f\//, '').trim();
    const num = parseFloat(s);
    if (!isFinite(num)) return INITIAL_EXIF.fNumber;
    return `f/${num}`;
  } catch {
    return INITIAL_EXIF.fNumber;
  }
};

export const formatISO = (val: string | undefined): string => {
  if (!val) return INITIAL_EXIF.iso;
  try {
    const s = val.toString().replace(/iso/gi, '').trim();
    const num = parseInt(s, 10);
    if (!isFinite(num)) return INITIAL_EXIF.iso;
    return `ISO ${num}`;
  } catch {
    return INITIAL_EXIF.iso;
  }
};

export const formatShutter = (val: string | undefined): string => {
  if (!val) return INITIAL_EXIF.exposureTime;
  if (val.includes('/')) return val + 's';
  const num = parseFloat(val);
  if (!isFinite(num)) return INITIAL_EXIF.exposureTime;
  if (num >= 1) return num + 's';
  if (num > 0) return '1/' + Math.round(1 / num) + 's';
  return INITIAL_EXIF.exposureTime;
};

export const formatDate = (val: string | undefined): string => {
  if (!val) return INITIAL_EXIF.dateTime;
  try {
    const parts = val.split(' ')[0].split(':');
    if (parts.length === 3) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return val;
  } catch {
    return val;
  }
};

export const extractExif = async (file: File): Promise<ExifData> => {
  try {
    const tags = await ExifReader.load(file);
    
    // Helper to safely get string values
    const getTag = (key: string): string | undefined => {
        const tag = tags[key];
        if (!tag) return undefined;
        // ExifReader sometimes returns arrays for values, or objects with 'description'
        if (tag.description) return tag.description;
        if (tag.value) return Array.isArray(tag.value) ? tag.value[0].toString() : tag.value.toString();
        return undefined;
    };

    return {
      make: getTag('Make') || INITIAL_EXIF.make,
      model: getTag('Model') || INITIAL_EXIF.model,
      lens: getTag('LensModel') || getTag('Lens') || INITIAL_EXIF.lens,
      focalLength: formatFocalLength(getTag('FocalLength')),
      fNumber: formatFNumber(getTag('FNumber')),
      exposureTime: formatShutter(getTag('ExposureTime')),
      iso: formatISO(getTag('ISOSpeedRatings')),
      dateTime: formatDate(getTag('DateTimeOriginal')),
    };

  } catch (error) {
    console.warn("Failed to read EXIF", error);
    return INITIAL_EXIF;
  }
};
