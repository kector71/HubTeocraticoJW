import React from 'react';
import { StyleConfig } from '../types';
import { FONTS } from '../constants';
import { Bold, Italic, Underline, CaseUpper, CaseLower, ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface Props {
  title: string;
  config: StyleConfig;
  onChange: (newConfig: StyleConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  showBackground?: boolean;
}

export const StyleControl: React.FC<Props> = ({ title, config, onChange, isOpen, onToggle, showBackground }) => {
  const handleChange = (key: keyof StyleConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="group border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
      <div
        className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors rounded-t-xl ${isOpen ? 'bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700' : 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
            <Settings size={16} className={isOpen ? 'animate-spin-slow' : ''} />
            {/* Note: Settings icon needs to be imported or passed, assuming accessible or we use a generic placeholder icon if specific distinct icons per section not available efficiently yet. Let's stick to simple text or generic icon if we don't want to drill props. Actually, let's use the first letter or a generic icon. Since I can't easily add imports here without seeing the top, I'll rely on what's available or distinct styling. */}
          </div>
          <h4 className={`text-sm font-bold transition-colors ${isOpen ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{title}</h4>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-5 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
            {/* Font Family */}
            <label className="flex flex-col w-full space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Fuente</span>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-3 pr-8 text-xs font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={config.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                >
                  {FONTS.map(f => (
                    <option key={f} value={f}>{f.split(',')[0].replace(/['"]/g, '')}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </label>

            {/* Size */}
            <label className="flex flex-col w-16 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tamaño</span>
              <input
                type="number"
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-2 text-xs text-center font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                value={config.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              />
            </label>

            {/* Color */}
            <label className="flex flex-col items-center space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Color</span>
              <div className="relative w-9 h-9 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-primary hover:ring-primary/50 transition-all shadow-sm">
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  value={config.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: config.color }}
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">

            {showBackground && (
              <label className="flex items-center gap-3 cursor-pointer group/bg">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 group-hover/bg:ring-primary/50 transition-all shadow-sm">
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    value={config.backgroundColor || '#ffffff'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: config.backgroundColor || '#ffffff' }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 group-hover/bg:text-slate-700 dark:text-slate-400 dark:group-hover/bg:text-slate-200 transition-colors">Fondo</span>
              </label>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                className={`p-2 rounded-lg border transition-all ${config.fontWeight === 'bold' ? 'bg-white dark:bg-slate-700 text-primary border-primary/30 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`}
                onClick={() => handleChange('fontWeight', config.fontWeight === 'bold' ? 'normal' : 'bold')}
                title="Negrita"
              >
                <Bold size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`p-2 rounded-lg border transition-all ${config.fontStyle === 'italic' ? 'bg-white dark:bg-slate-700 text-primary border-primary/30 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`}
                onClick={() => handleChange('fontStyle', config.fontStyle === 'italic' ? 'normal' : 'italic')}
                title="Cursiva"
              >
                <Italic size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`p-2 rounded-lg border transition-all ${config.textDecoration === 'underline' ? 'bg-white dark:bg-slate-700 text-primary border-primary/30 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`}
                onClick={() => handleChange('textDecoration', config.textDecoration === 'underline' ? 'none' : 'underline')}
                title="Subrayado"
              >
                <Underline size={16} strokeWidth={2.5} />
              </button>

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button
                className={`p-2 rounded-lg border transition-all ${config.textTransform === 'uppercase' ? 'bg-white dark:bg-slate-700 text-primary border-primary/30 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`}
                onClick={() => handleChange('textTransform', config.textTransform === 'uppercase' ? 'none' : 'uppercase')}
              >
                <CaseUpper size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
