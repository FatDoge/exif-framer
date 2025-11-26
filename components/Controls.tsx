import React from 'react';
import { SketchPicker } from 'react-color';
import { ExifData } from '../types';
import { Download, RotateCcw, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

type InputGroupProps = {
  label: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  step?: string;
};

const InputGroup: React.FC<InputGroupProps> = ({ label, placeholder, value, onChange, type = 'text', prefix, suffix, step }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 pl-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value as any}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg ${prefix ? 'pl-10' : 'px-3'} ${suffix ? 'pr-10' : 'pr-3'} py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
    </div>
  </div>
);

interface ControlsProps {
  exif: ExifData;
  onUpdate: (key: keyof ExifData, value: string) => void;
  onDownload: () => void;
  onReset: () => void;
  isDownloading: boolean;
  borderColor: string;
  onUpdateBorderColor: (value: string) => void;
  layout: 'left' | 'center' | 'right';
  onUpdateLayout: (value: 'left' | 'center' | 'right') => void;
}

export const Controls: React.FC<ControlsProps> = ({
  exif,
  onUpdate,
  onDownload,
  onReset,
  isDownloading,
  borderColor,
  onUpdateBorderColor,
  layout,
  onUpdateLayout,
}) => {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const pickerAreaRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!pickerOpen) return;
      const el = pickerAreaRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [pickerOpen]);
  const parseNumberString = (s: string | undefined) => {
    if (!s) return '';
    const n = parseFloat(s);
    if (!isFinite(n)) return '';
    return String(n);
  };
  const focalInputValue = (() => {
    if (!exif.focalLength) return '';
    const s = exif.focalLength.toLowerCase().replace(/mm/g, '').trim();
    const n = parseFloat(s);
    return isFinite(n) ? String(Math.round(n)) : '';
  })();
  const fNumberInputValue = (() => {
    if (!exif.fNumber) return '';
    const s = exif.fNumber.toLowerCase().replace(/^f\//, '').trim();
    const n = parseFloat(s);
    return isFinite(n) ? String(n) : '';
  })();
  const isoInputValue = (() => {
    if (!exif.iso) return '';
    const s = exif.iso.replace(/iso/gi, '').trim();
    const n = parseInt(s, 10);
    return isFinite(n) ? String(n) : '';
  })();
  const shutterInputValue = (() => {
    if (!exif.exposureTime) return '';
    const s = exif.exposureTime.toLowerCase().replace(/s$/,'').trim();
    return s;
  })();
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          编辑
        </h2>
        <p className="text-sm text-gray-500 mt-1">自定义在边框上显示的元数据。</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow content-start">
        <div className="col-span-2">
          <InputGroup label="相机品牌" value={exif.make} onChange={(v) => onUpdate('make', v)} />
        </div>
        <div className="col-span-2">
          <InputGroup label="相机型号" value={exif.model} onChange={(v) => onUpdate('model', v)} />
        </div>
        <div className="col-span-2">
          <InputGroup label="镜头型号" value={exif.lens} onChange={(v) => onUpdate('lens', v)} />
        </div>

        <InputGroup label="焦距" type="number" suffix="mm" value={focalInputValue} onChange={(v) => onUpdate('focalLength', v)} />
        <InputGroup label="光圈" type="number" prefix="f/" step="0.1" value={fNumberInputValue} onChange={(v) => onUpdate('fNumber', v)} />
        <InputGroup label="快门速度" type="text" suffix="s" value={shutterInputValue} onChange={(v) => onUpdate('exposureTime', v)} />
        <InputGroup label="ISO" type="number" prefix="ISO" value={isoInputValue} onChange={(v) => onUpdate('iso', v)} />

        <div className="col-span-2">
          <InputGroup label="日期" value={exif.dateTime} onChange={(v) => onUpdate('dateTime', v)} />
        </div>

        <div className="col-span-2 relative" ref={pickerAreaRef}>
          <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 pl-1">边框颜色</label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPickerOpen(v => !v)}
              className="w-8 h-8 rounded-lg border border-gray-200 focus:outline-none cursor-pointer"
              style={{ backgroundColor: borderColor }}
              aria-label="选择自定义颜色"
            />
            <div className="flex flex-wrap gap-2">
              {['#ffffff','#000000','#111827','#374151','#6b7280','#e5e7eb','#f3f4f6','#f59e0b','#ef4444','#10b981','#3b82f6','#8b5cf6'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateBorderColor(c)}
                  className="w-6 h-6 rounded border border-gray-200 focus:outline-none"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {pickerOpen && (
            <div className="absolute left-0 top-16 z-50">
              <SketchPicker
                color={borderColor}
                onChangeComplete={(clr) => onUpdateBorderColor(clr.hex)}
                presetColors={['#ffffff','#000000','#111827','#374151','#6b7280','#e5e7eb','#f3f4f6','#f59e0b','#ef4444','#10b981','#3b82f6','#8b5cf6']}
                disableAlpha
              />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-1.5 pl-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">布局</label>
          </div>
          <div className="mt-2 inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {([
              { key: 'left', icon: AlignLeft, aria: '左对齐' },
              { key: 'center', icon: AlignCenter, aria: '居中对齐' },
              { key: 'right', icon: AlignRight, aria: '右对齐' },
            ] as const).map(({ key, icon: Icon, aria }) => (
              <button
                key={key}
                type="button"
                onClick={() => onUpdateLayout(key)}
                aria-label={aria}
                className={`px-3 py-2 ${layout === key ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'} ${key !== 'right' ? 'border-r border-gray-200' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-gray-900/10"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isDownloading ? '处理中...' : '下载图片'}
        </button>

        <button
          onClick={onReset}
          className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重新上传照片
        </button>
      </div>
    </div>
  );
};
