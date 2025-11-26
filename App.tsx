import React, { useEffect, useMemo, useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { PreviewCard } from './components/PreviewCard';
import { Controls } from './components/Controls';
import { extractExif, formatFocalLength, formatFNumber, formatISO, formatShutter } from './utils/exifHelper';
import { AppState, ExifData, INITIAL_EXIF } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { snapdom } from '@zumer/snapdom';
import { heicTo, isHeic } from 'heic-to';
import { I18nProvider, useI18n, Locale } from './i18n';
import { Github, Globe } from 'lucide-react';

function InnerApp() {
  const [state, setState] = useState<AppState>({
    file: null,
    imageSrc: null,
    exif: INITIAL_EXIF,
    isProcessing: false,
    borderColor: '#ffffff',
    layout: 'left',
  });

  const [downloading, setDownloading] = useState(false);
  const { t } = useI18n();
  

  // Handle File Upload
  const handleFileSelect = async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    let url: string;
    const heic = await isHeic(file).catch(() => false);
    if (heic) {
      try {
        const converted: Blob = await heicTo({ blob: file, type: 'image/png', quality: 1 });
        url = URL.createObjectURL(converted);
      } catch {
        url = URL.createObjectURL(file);
      }
    } else {
      url = URL.createObjectURL(file);
    }
    
    // Parse EXIF
    const exifData = await extractExif(file);
    
    setState({
      file,
      imageSrc: url,
      exif: exifData,
      isProcessing: false,
    });
  };

  // Handle Editing EXIF
  const handleExifUpdate = (key: keyof ExifData, value: string) => {
    let v = value;
    if (key === 'focalLength') v = formatFocalLength(value);
    else if (key === 'fNumber') v = formatFNumber(value);
    else if (key === 'exposureTime') v = formatShutter(value);
    else if (key === 'iso') v = formatISO(value);
    setState(prev => ({
      ...prev,
      exif: {
        ...prev.exif,
        [key]: v
      }
    }));
  };

  // Handle Reset
  const handleReset = () => {
    if (state.imageSrc) URL.revokeObjectURL(state.imageSrc);
    setState({
      file: null,
      imageSrc: null,
      exif: INITIAL_EXIF,
      isProcessing: false,
      borderColor: '#ffffff',
      layout: 'left',
    });
  };

  // Handle Download
  const handleDownload = async () => {
    if (!state.imageSrc) return;
    setDownloading(true);

    try {
      const el = document.getElementById('preview-node');
      if (!el) throw new Error(t('errors.preview_not_found'));
      const imgProbe = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const probe = new Image();
        probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight });
        probe.onerror = reject as any;
        probe.crossOrigin = 'anonymous';
        probe.src = state.imageSrc!;
      });

      await snapdom.download(el as HTMLElement, {
        format: 'png',
        filename: `frame-${state.exif.model.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
        backgroundColor: state.borderColor || '#ffffff',
        width: imgProbe.w,
        height: undefined,
        quality: 1,
        embedFonts: true,
      } as any);
    } catch (e) {
      console.error(t('errors.download_failed'), e);
      alert(t('errors.download_retry'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col">
        <header className="flex justify-between items-center mb-6 md:mb-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-900 rounded-sm" />
            <span className="font-bold text-xl tracking-tight">{t('app.header.brand')}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur px-2 py-2 shadow-sm">
            <LangSwitcher />
            <a
              href="https://github.com/FatDoge/exif-framer"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </header>
        
        

        <main className="flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {!state.imageSrc ? (
                    state.isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col items-center justify-center min-h-[50vh]"
                        >
                            <div className="w-12 h-12 border-[3px] border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                            <div className="mt-4 text-sm text-gray-700">{t('app.processing.title')}</div>
                            <div className="mt-1 text-xs text-gray-400">{t('app.processing.subtitle')}</div>
                        </motion.div>
                    ) : (
                        <UploadZone key="upload" onFileSelect={handleFileSelect} />
                    )
                ) : (
                    <motion.div 
                        key="editor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full"
                    >
                        {/* Left/Top: Preview Area */}
                        <div className="lg:col-span-8 w-full bg-gray-200/50 rounded-3xl p-6 md:p-12 flex items-center justify-center min-h-[50vh] lg:min-h-[80vh] border border-gray-200/50">
                            <PreviewCard imageSrc={state.imageSrc} exif={state.exif} borderColor={state.borderColor || '#ffffff'} layout={state.layout || 'left'} />
                        </div>

                        {/* Right/Bottom: Controls */}
                        <div className="lg:col-span-4 w-full bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-8">
                            <Controls 
                                exif={state.exif} 
                                onUpdate={handleExifUpdate} 
                                onDownload={handleDownload}
                                onReset={handleReset}
                                isDownloading={downloading}
                                borderColor={state.borderColor || '#ffffff'}
                                onUpdateBorderColor={(c) => setState(prev => ({ ...prev, borderColor: c }))}
                                layout={state.layout || 'left'}
                                onUpdateLayout={(l) => setState(prev => ({ ...prev, layout: l as 'left'|'center'|'right' }))}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
        
        <footer className="mt-12 text-center text-xs text-gray-400">
           &copy; {new Date().getFullYear()} ExifFrame. {t('app.footer')}
        </footer>
      </div>
    </div>
  );
}

const LangSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const next = useMemo<Locale>(() => (locale === 'zh' ? 'en' : 'zh'), [locale]);
  return (
    <button
      type="button"
      aria-label="Switch language"
      className="p-2 rounded-lg hover:bg-gray-100 inline-flex items-center gap-1"
      onClick={() => {
        setLocale(next);
        localStorage.setItem('locale', next);
      }}
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-medium">{locale === 'zh' ? '中' : 'EN'}</span>
    </button>
  );
};

function App() {
  const initialLocale = (localStorage.getItem('locale') as Locale) || 'zh';
  const [locale, setLocale] = useState<Locale>(initialLocale);
  return (
    <I18nProvider locale={locale} setLocale={setLocale}>
      <InnerApp />
    </I18nProvider>
  );
}

export default App;
