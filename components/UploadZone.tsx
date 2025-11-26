import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
  const { t } = useI18n();
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-xl mx-auto text-center"
    >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6">
            {t('upload.title')}
        </h1>
        <p className="text-gray-500 mb-12 text-lg font-light">
            {t('upload.subtitle')}
        </p>

      <div 
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="group relative w-full aspect-[3/2] border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 hover:bg-white hover:border-gray-900 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center overflow-hidden"
      >
        <input 
            type="file" 
            accept="image/*" 
            onChange={handleChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="p-8 transition-transform duration-300 group-hover:scale-110">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-gray-900 transition-colors">
                <Upload className="w-8 h-8 text-gray-500 group-hover:text-white" />
            </div>
            <p className="text-lg font-medium text-gray-900">
                {t('upload.drop.title')}
            </p>
            <p className="text-sm text-gray-400 mt-2">
                {t('upload.drop.support')}
            </p>
        </div>
      </div>
    </motion.div>
  );
};
