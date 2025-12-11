import React, { useState, useEffect } from 'react';
import { LayoutGrid, Moon, Sun, Download, Printer, Settings, Palette, FileText, Languages, Check } from 'lucide-react';
import { AppState, StylesState, Language } from './types';
import { INITIAL_STYLES, TRANSLATIONS } from './constants';
import { ContentControl } from './components/ContentControl';
import { StyleControl } from './components/StyleControl';
import { Preview } from './components/Preview';

export default function App() {
  const [activeTab, setActiveTab] = useState<'content' | 'styles'>('content');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [openStyles, setOpenStyles] = useState<Record<string, boolean>>({ title: false, header: false, cell: false, footer: false });
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const [state, setState] = useState<AppState>({
    template: 'acomodadores',
    months: [],
    styles: INITIAL_STYLES,
    banner: { image: null, zoom: 1, x: 0, y: 0 },
    language: 'es',
    theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  });

  // Handle Dark Mode
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Close menus on click outside
  useEffect(() => {
    const closeMenu = () => setIsLangMenuOpen(false);
    if (isLangMenuOpen) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [isLangMenuOpen]);

  // Initial Month Population
  useEffect(() => {
    if (state.months.length === 0) {
      setState(prev => ({
        ...prev,
        months: [{
          id: crypto.randomUUID(),
          year: new Date().getFullYear(),
          monthIndex: new Date().getMonth(),
          selectedDays: [], // Empty initially
          weeks: Array.from({ length: 5 }).map(() => ({
            id: crypto.randomUUID(),
            door: '', auditorium: '', mic1: '', mic2: '', group: ''
          }))
        }]
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = TRANSLATIONS[state.language];

  const updateState = React.useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStyle = React.useCallback((section: keyof StylesState, config: any) => {
    setState(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [section]: config
      }
    }));
  }, []);

  const toggleStyle = React.useCallback((section: string) => {
    setOpenStyles(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handlePrint = () => {
    const content = document.getElementById('pdf-content');
    if (!content) return;

    // Temporarily hide controls if any inside preview (though our Preview comp is clean)
    // We can use window.print() but it prints the whole page. 
    // Ideally we use html2pdf to open in new tab or specific print CSS.
    // Let's use html2pdf for print as well (preview in blob).

    if (typeof window.html2pdf !== 'undefined') {
      const opt = {
        margin: 0,
        filename: 'program.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'px', format: [816, 1056], orientation: 'portrait' }
      };
      window.html2pdf().from(content).set(opt).toPdf().get('pdf').then((pdf: any) => {
        window.open(pdf.output('bloburl'), '_blank');
      });
    }
  };

  const handleDownloadPDF = () => {
    const content = document.getElementById('pdf-content');
    if (!content || typeof window.html2pdf === 'undefined') return;

    // Calculate dynamic height to ensure single page
    const height = Math.max(content.offsetHeight + 50, 1056); // Min height of A4

    const opt = {
      margin: 0,
      filename: `program-${state.template}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF: { unit: 'px', format: [816, height], orientation: 'portrait' }
    };
    window.html2pdf().from(content).set(opt).save();
  };

  const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
    { code: 'pl', label: 'Polski' }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-900 dark:text-slate-100 font-sans">

      {/* Header */}
      <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <LayoutGrid size={24} />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight">{t.appTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Custom Language Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setIsLangMenuOpen(!isLangMenuOpen); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Languages size={18} className="text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium uppercase">{state.language}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateState({ language: lang.code })}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${state.language === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{lang.code}</span>
                      <span>{lang.label}</span>
                    </div>
                    {state.language === lang.code && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => updateState({ theme: state.theme === 'light' ? 'dark' : 'light' })}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className={`w-full md:w-[400px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10 ${mobileView === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('content')}
            >
              <FileText size={18} />
              {t.content}
            </button>
            <button
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'styles' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('styles')}
            >
              <Palette size={18} />
              {t.styles}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {activeTab === 'content' ? (
              <ContentControl state={state} updateState={updateState} />
            ) : (
              <div className="space-y-4">
                <StyleControl
                  title={t.mainTitle}
                  config={state.styles.title}
                  onChange={(c) => updateStyle('title', c)}
                  isOpen={openStyles.title}
                  onToggle={() => toggleStyle('title')}
                />
                <StyleControl
                  title={t.tableHeaders}
                  config={state.styles.header}
                  onChange={(c) => updateStyle('header', c)}
                  isOpen={openStyles.header}
                  onToggle={() => toggleStyle('header')}
                  showBackground
                />
                <StyleControl
                  title={t.cellContent}
                  config={state.styles.cell}
                  onChange={(c) => updateStyle('cell', c)}
                  isOpen={openStyles.cell}
                  onToggle={() => toggleStyle('cell')}
                />
                <StyleControl
                  title={t.footer}
                  config={state.styles.footer}
                  onChange={(c) => updateStyle('footer', c)}
                  isOpen={openStyles.footer}
                  onToggle={() => toggleStyle('footer')}
                />

                {/* Footer Text */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900/50">
                  <label className="block text-sm font-medium mb-2">{t.footerText}</label>
                  <textarea
                    className="w-full h-24 p-3 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    value={state.styles.footerText}
                    onChange={(e) => updateStyle('footerText', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className={`flex-1 bg-slate-100 dark:bg-black/20 overflow-auto p-4 md:p-8 flex justify-center ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          <div className="relative">
            <Preview
              state={state}
              bannerState={state.banner}
              setBannerState={(b) => updateState({ banner: b })}
            />
          </div>
        </main>

        {/* Floating Actions */}
        <div className={`fixed right-4 md:right-8 flex flex-col gap-4 transition-all duration-300 z-40 ${mobileView === 'editor' ? 'translate-y-[200%] md:translate-y-0 bottom-24 md:bottom-8' : 'bottom-24 md:bottom-8'}`}>
          <button
            onClick={handlePrint}
            className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-transform hover:scale-105"
            title="Print"
          >
            <Printer size={24} />
          </button>
          <button
            onClick={handleDownloadPDF}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105"
            title="Download PDF"
          >
            <Download size={24} />
          </button>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex z-50 pb-2">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 p-4 flex flex-col items-center gap-1 ${mobileView === 'editor' ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Settings size={20} />
            <span className="text-xs">Editor</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 p-4 flex flex-col items-center gap-1 ${mobileView === 'preview' ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <LayoutGrid size={20} />
            <span className="text-xs">Vista Previa</span>
          </button>
        </div>

      </div>
    </div>
  );
}
