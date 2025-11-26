export interface ExifData {
  make: string;
  model: string;
  lens: string;
  focalLength: string;
  fNumber: string;
  exposureTime: string;
  iso: string;
  dateTime: string;
}

export interface AppState {
  file: File | null;
  imageSrc: string | null;
  exif: ExifData;
  isProcessing: boolean;
  borderColor?: string;
  layout?: 'left' | 'center' | 'right';
}

export const INITIAL_EXIF: ExifData = {
  make: '',
  model: '',
  lens: '',
  focalLength: '',
  fNumber: '',
  exposureTime: '',
  iso: '',
  dateTime: '',
};
