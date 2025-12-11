import React from 'react';
import { StyleConfig } from '../types';
import { FONTS } from '../constants';
import { Bold, Italic, Underline, CaseUpper, ChevronDown, ChevronUp, Settings, Plus, Minus } from 'lucide-react';

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

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(8, Math.min(120, config.fontSize + delta));
    handleChange('fontSize', newSize);
  };

  return (
    <div className="group border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
      <div
        className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-colors rounded-t-xl ${isOpen ? 'bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700' : 'group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'}`}>
            <Settings size={14} className={isOpen ? 'animate-pulse' : ''} />
          </div>
          <h4 className={`text-sm font-semibold transition-colors ${isOpen ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>{title}</h4>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2.5 items-end">
            {/* Font Family */}
            <label className="flex flex-col w-full space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Fuente</span>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2 pl-2.5 pr-8 text-xs font-medium text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
                  value={config.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                >
                  {FONTS.map(f => (
                    <option key={f} value={f}>{f.split(',')[0].replace(/['"]/g, '')}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </label>

            {/* Size with +/- buttons */}
            <label className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Tamaño</span>
              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1">
                <button
                  onClick={() => adjustFontSize(-1)}
                  className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
                  title="Reducir"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <input
                  type="number"
                  className="w-12 bg-transparent text-xs text-center font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                  value={config.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                />
                <button
                  onClick={() => adjustFontSize(1)}
                  className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
                  title="Aumentar"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </label>

            {/* Color */}
            <label className="flex flex-col items-center space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Color</span>
              <div className="relative w-9 h-9 rounded-lg overflow-hidden ring-2 ring-zinc-200 dark:ring-zinc-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all shadow-sm cursor-pointer group/color">
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  value={config.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
                <div
                  className="w-full h-full group-hover/color:scale-110 transition-transform"
                  style={{ backgroundColor: config.color }}
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">

            {showBackground && (
              <label className="flex items-center gap-2.5 cursor-pointer group/bg">
                <div className="relative w-7 h-7 rounded-lg overflow-hidden ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover/bg:ring-blue-500 dark:group-hover/bg:ring-blue-400 transition-all shadow-sm">
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    value={config.backgroundColor || '#ffffff'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  />
                  <div
                    className="w-full h-full group-hover/bg:scale-110 transition-transform"
                    style={{ backgroundColor: config.backgroundColor || '#ffffff' }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover/bg:text-zinc-800 dark:group-hover/bg:text-zinc-200 transition-colors">Fondo</span>
              </label>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                className={`p-1.5 rounded-lg transition-all ${config.fontWeight === 'bold' ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                onClick={() => handleChange('fontWeight', config.fontWeight === 'bold' ? 'normal' : 'bold')}
                title="Negrita"
              >
                <Bold size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`p-1.5 rounded-lg transition-all ${config.fontStyle === 'italic' ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                onClick={() => handleChange('fontStyle', config.fontStyle === 'italic' ? 'normal' : 'italic')}
                title="Cursiva"
              >
                <Italic size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`p-1.5 rounded-lg transition-all ${config.textDecoration === 'underline' ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                onClick={() => handleChange('textDecoration', config.textDecoration === 'underline' ? 'none' : 'underline')}
                title="Subrayado"
              >
                <Underline size={16} strokeWidth={2.5} />
              </button>

              <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5"></div>

              <button
                className={`p-1.5 rounded-lg transition-all ${config.textTransform === 'uppercase' ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                onClick={() => handleChange('textTransform', config.textTransform === 'uppercase' ? 'none' : 'uppercase')}
                title="Mayúsculas"
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
