import React from 'react';
import { StyleConfig } from '../types';
import { FONTS } from '../constants';
import { Bold, Italic, Underline, CaseUpper, ChevronDown, Settings, Plus, Minus, Type } from 'lucide-react';

interface Props {
  title: string;
  config: StyleConfig;
  onChange: (newConfig: StyleConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  showBackground?: boolean;
}

export const StyleControl: React.FC<Props> = ({ title, config, onChange, isOpen, onToggle, showBackground }) => {
  const [isFontMenuOpen, setIsFontMenuOpen] = React.useState(false);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setIsFontMenuOpen(false);
      }
    };
    if (isFontMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFontMenuOpen]);

  const handleChange = (key: keyof StyleConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(8, Math.min(120, config.fontSize + delta));
    handleChange('fontSize', newSize);
  };

  const currentFontName = config.fontFamily.split(',')[0].replace(/['"]/g, '');

  return (
    <div className="group border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg bg-white dark:bg-zinc-900/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30">
      {/* Header - Compacto */}
      <div
        className={`flex items-center justify-between p-2 cursor-pointer select-none transition-all ${isOpen ? 'bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-b border-primary/20 dark:border-primary/20' : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'} rounded-t-lg ${isOpen ? '' : 'rounded-b-lg'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-sm ${isOpen ? 'bg-gradient-to-br from-primary to-primary/80 text-white scale-105' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'}`}>
            <Settings size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <div className="flex flex-col">
            <h4 className={`text-xs font-bold transition-colors ${isOpen ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'}`}>{title}</h4>
            {!isOpen && (
              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-medium">
                {currentFontName} • {config.fontSize}px
              </span>
            )}
          </div>
        </div>
        <div className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-300 ${isOpen ? 'bg-white/60 dark:bg-zinc-800/60 rotate-180 text-primary' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40'}`}>
          <ChevronDown size={14} strokeWidth={2.5} />
        </div>
      </div>

      {isOpen && (
        <div className="p-2.5 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200 bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900/50 dark:to-zinc-900/20 rounded-b-lg">

          {/* Fila 1: Fuente + Tamaño */}
          <div className="grid grid-cols-2 gap-2">

            {/* Font Family */}
            <div className="space-y-1" ref={fontMenuRef}>
              <label className="text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <Type size={10} className="text-primary" />
                Fuente
              </label>
              <div className="relative">
                <button
                  className="w-full h-8 flex items-center justify-between px-2.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:border-primary/50 dark:hover:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all outline-none shadow-sm"
                  onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                >
                  <span style={{ fontFamily: config.fontFamily }} className="truncate">
                    {currentFontName}
                  </span>
                  <ChevronDown size={12} className={`text-zinc-400 ml-2 transition-transform duration-200 flex-shrink-0 ${isFontMenuOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>

                {isFontMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xl z-50 animate-in zoom-in-95 duration-150">
                    <div className="p-1 space-y-0.5">
                      {FONTS.map(f => {
                        const name = f.split(',')[0].replace(/['"]/g, '');
                        const isSelected = f === config.fontFamily;
                        return (
                          <button
                            key={f}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between group/opt transition-all ${isSelected ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md' : 'text-zinc-700 dark:text-zinc-200 hover:bg-primary/5 dark:hover:bg-primary/20 hover:text-primary'}`}
                            onClick={() => {
                              handleChange('fontFamily', f);
                              setIsFontMenuOpen(false);
                            }}
                            style={{ fontFamily: f }}
                          >
                            <span>{name}</span>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <span className="text-primary text-[9px]">▲</span>
                Tamaño
              </label>
              <div className="flex items-center h-8 bg-white dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden transition-all hover:border-primary/50 dark:hover:border-primary/50 shadow-sm">
                <button
                  onClick={() => adjustFontSize(-1)}
                  className="w-9 h-full flex items-center justify-center hover:bg-primary/5 dark:hover:bg-primary/20 text-zinc-600 hover:text-primary dark:text-zinc-300 dark:hover:text-primary active:bg-primary/10 dark:active:bg-primary/30 transition-all border-r border-zinc-200 dark:border-zinc-700"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>
                <div className="flex-1 h-full relative flex items-center justify-center">
                  <input
                    type="number"
                    className="w-full h-full bg-transparent text-xs font-bold text-center text-zinc-900 dark:text-zinc-50 outline-none appearance-none px-2"
                    value={config.fontSize}
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-2 text-[9px] text-zinc-400 font-semibold pointer-events-none">px</span>
                </div>
                <button
                  onClick={() => adjustFontSize(1)}
                  className="w-9 h-full flex items-center justify-center hover:bg-primary/5 dark:hover:bg-primary/20 text-zinc-600 hover:text-primary dark:text-zinc-300 dark:hover:text-primary active:bg-primary/10 dark:active:bg-primary/30 transition-all border-l border-zinc-200 dark:border-zinc-700"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Fila 2: Color + Formato integrados */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
              <span className="text-primary text-[9px]">●</span>
              Color y Formato
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Colores */}
              <div className={`flex ${showBackground ? 'flex-col gap-1.5' : 'justify-center'} p-1.5 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-800/50 dark:to-zinc-900/30 rounded-md border border-zinc-200 dark:border-zinc-700/60`}>
                {/* Text Color */}
                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-800/70 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm">
                  <div className="relative group/color">
                    <div
                      className="w-6 h-6 rounded-md border-2 border-white dark:border-zinc-600 shadow-md overflow-hidden relative cursor-pointer group-hover/color:scale-110 transition-transform ring-1 ring-zinc-300 dark:ring-zinc-600"
                      style={{ backgroundColor: config.color }}
                    >
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        value={config.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                        title="Color de Texto"
                      />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Texto</span>
                </div>

                {/* Background Color */}
                {showBackground && (
                  <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-800/70 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm">
                    <div className="relative group/bg">
                      <div
                        className="w-6 h-6 rounded-md border-2 border-white dark:border-zinc-600 shadow-md overflow-hidden relative cursor-pointer group-hover/bg:scale-110 transition-transform ring-1 ring-zinc-300 dark:ring-zinc-600"
                        style={{ backgroundColor: config.backgroundColor || '#ffffff' }}
                      >
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          value={config.backgroundColor || '#ffffff'}
                          onChange={(e) => handleChange('backgroundColor', e.target.value)}
                          title="Color de Fondo"
                        />
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Fondo</span>
                  </div>
                )}
              </div>

              {/* Botones de Formato */}
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-800/50 dark:to-zinc-900/30 rounded-md border border-zinc-200 dark:border-zinc-700/60">
                <button
                  className={`p-2 rounded-md transition-all flex items-center justify-center ${config.fontWeight === 'bold' ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-105' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 shadow-sm'}`}
                  onClick={() => handleChange('fontWeight', config.fontWeight === 'bold' ? 'normal' : 'bold')}
                  title="Negrita"
                >
                  <Bold size={15} strokeWidth={config.fontWeight === 'bold' ? 3 : 2.5} />
                </button>
                <button
                  className={`p-2 rounded-md transition-all flex items-center justify-center ${config.fontStyle === 'italic' ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-105' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 shadow-sm'}`}
                  onClick={() => handleChange('fontStyle', config.fontStyle === 'italic' ? 'normal' : 'italic')}
                  title="Cursiva"
                >
                  <Italic size={15} strokeWidth={2.5} />
                </button>
                <button
                  className={`p-2 rounded-md transition-all flex items-center justify-center ${config.textDecoration === 'underline' ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-105' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 shadow-sm'}`}
                  onClick={() => handleChange('textDecoration', config.textDecoration === 'underline' ? 'none' : 'underline')}
                  title="Subrayado"
                >
                  <Underline size={15} strokeWidth={2.5} />
                </button>
                <button
                  className={`p-2 rounded-md transition-all flex items-center justify-center ${config.textTransform === 'uppercase' ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-105' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 shadow-sm'}`}
                  onClick={() => handleChange('textTransform', config.textTransform === 'uppercase' ? 'none' : 'uppercase')}
                  title="Mayúsculas"
                >
                  <CaseUpper size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
