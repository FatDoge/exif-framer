import React, { createContext, useContext, useMemo } from 'react';

export type Locale = 'zh' | 'en';

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const messages: Record<Locale, Record<string, string>> = {
  zh: {
    'app.title': 'ExifFrame',
    'app.processing.title': '正在处理照片...',
    'app.processing.subtitle': '解析EXIF与生成预览',
    'app.footer': '极简照片工具。',
    'app.header.brand': 'ExifFrame',

    'upload.title': '为你的照片加上边框。',
    'upload.subtitle': '上传照片，自动提取拍摄信息并生成优雅、可分享的边框。',
    'upload.drop.title': '点击或拖拽照片到此处',
    'upload.drop.support': '支持 JPG、PNG、WEBP、HEIC',

    'controls.title': '编辑',
    'controls.subtitle': '自定义在边框上显示的元数据。',
    'controls.make': '相机品牌',
    'controls.model': '相机型号',
    'controls.lens': '镜头型号',
    'controls.focalLength': '焦距',
    'controls.fNumber': '光圈',
    'controls.exposureTime': '快门速度',
    'controls.iso': 'ISO',
    'controls.dateTime': '日期',
    'controls.borderColor': '边框颜色',
    'controls.layout': '布局',
    'controls.align.left': '左对齐',
    'controls.align.center': '居中对齐',
    'controls.align.right': '右对齐',
    'controls.download': '下载图片',
    'controls.downloading': '处理中...',
    'controls.reset': '重新上传照片',

    'errors.preview_not_found': '未找到预览元素',
    'errors.download_failed': '下载失败',
    'errors.download_retry': '无法生成图片，请重试。'
  },
  en: {
    'app.title': 'ExifFrame',
    'app.processing.title': 'Processing photo...',
    'app.processing.subtitle': 'Parsing EXIF and generating preview',
    'app.footer': 'A minimal photo tool.',
    'app.header.brand': 'ExifFrame',

    'upload.title': 'Add a frame to your photo.',
    'upload.subtitle': 'Upload a photo, auto-extract EXIF and generate a shareable frame.',
    'upload.drop.title': 'Click or drag a photo here',
    'upload.drop.support': 'Supports JPG, PNG, WEBP, HEIC',

    'controls.title': 'Edit',
    'controls.subtitle': 'Customize metadata shown on the border.',
    'controls.make': 'Camera brand',
    'controls.model': 'Camera model',
    'controls.lens': 'Lens',
    'controls.focalLength': 'Focal length',
    'controls.fNumber': 'Aperture',
    'controls.exposureTime': 'Shutter speed',
    'controls.iso': 'ISO',
    'controls.dateTime': 'Date',
    'controls.borderColor': 'Border color',
    'controls.layout': 'Layout',
    'controls.align.left': 'Align left',
    'controls.align.center': 'Align center',
    'controls.align.right': 'Align right',
    'controls.download': 'Download image',
    'controls.downloading': 'Processing...',
    'controls.reset': 'Re-upload photo',

    'errors.preview_not_found': 'Preview element not found',
    'errors.download_failed': 'Download failed',
    'errors.download_retry': 'Unable to generate image, please retry.'
  }
};

export const I18nProvider: React.FC<{ locale: Locale; setLocale: (l: Locale) => void; children: React.ReactNode }> = ({ locale, setLocale, children }) => {
  const t = useMemo(() => {
    const dict = messages[locale] || messages.zh;
    return (key: string) => dict[key] ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

