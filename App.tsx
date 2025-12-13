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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: 'px', format: [816, 1056], orientation: 'portrait' }
      };
      window.html2pdf().from(content).set(opt).toPdf().get('pdf').then((pdf: any) => {
        window.open(pdf.output('bloburl'), '_blank');
      });
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const content = document.getElementById('pdf-content');
      if (!content) {
        alert('No se pudo encontrar el contenido para exportar');
        return;
      }

      // Check if html2pdf is available
      if (typeof window.html2pdf === 'undefined') {
        alert('La librería html2pdf no está disponible. Por favor recarga la página.');
        return;
      }

      // Save original transform and remove it temporarily
      const originalTransform = content.style.transform;
      const originalTransformOrigin = content.style.transformOrigin;
      content.style.transform = 'none';
      content.style.transformOrigin = 'top left';

      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const opt = {
        margin: 0,
        filename: `programa-${state.template}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'png', quality: 1.0 }, // PNG for lossless quality (better than JPEG)
        html2canvas: {
          scale: 3,  // Optimized for speed and quality (2448x3168 px)
          dpi: 300,  // Print quality DPI
          useCORS: true,
          allowTaint: true,  // Allow cross-origin images
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
          width: 816,   // Exact element width
          height: 1056, // Exact element height
          windowWidth: 816,  // Exact width for better rendering
          windowHeight: 1056,  // Exact height for better rendering
          imageTimeout: 0,  // No timeout for image loading
          x: 0,  // Start from left edge
          y: 0,  // Start from top edge
          scrollX: 0,  // No horizontal scroll offset
          scrollY: 0,  // No vertical scroll offset
          onclone: (clonedDoc: Document) => {
            // Ensure all fonts are loaded in cloned document
            const clonedElement = clonedDoc.getElementById('pdf-content');
            if (clonedElement) {
              // Remove any transforms in the cloned document too
              clonedElement.style.transform = 'none';
              clonedElement.style.transformOrigin = 'top left';
              (clonedElement.style as any).fontSmooth = 'always';
              (clonedElement.style as any).webkitFontSmoothing = 'antialiased';
              (clonedElement.style as any).MozOsxFontSmoothing = 'grayscale';
            }
          }
        },
        jsPDF: {
          unit: 'px',
          format: [816, 1056],
          orientation: 'portrait',
          compress: true,
          precision: 16,  // Maximum precision for vectors
          putOnlyUsedFonts: true,  // Optimize font embedding
          floatPrecision: 16  // Maximum float precision
        }
      };

      // Generate and download PDF directly (most reliable method)
      await window.html2pdf().from(content).set(opt).save();


      // Restore original transform
      content.style.transform = originalTransform;
      content.style.transformOrigin = originalTransformOrigin;

    } catch (err: any) {
      console.error("PDF Export Error:", err);
      alert(`Error al exportar PDF: ${err.message || 'Error desconocido'}.`);

      // Restore transform even if there's an error
      const content = document.getElementById('pdf-content');
      if (content) {
        content.style.transform = content.style.transform || 'scale(1)';
      }
    } finally {
      setIsGeneratingPDF(false);
    }
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
    <div className="flex flex-col h-screen overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans">

      {/* Header */}
      <header className="h-16 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5 px-4 min-[1050px]:px-6 flex items-center justify-between z-30 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <LayoutGrid size={24} />
          </div>
          <h1 className="font-display font-bold text-lg min-[1050px]:text-xl tracking-tight">{t.appTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Custom Language Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setIsLangMenuOpen(!isLangMenuOpen); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-white/5"
            >
              <Languages size={18} className="text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm font-medium uppercase">{state.language}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-white/5 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateState({ language: lang.code })}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors ${state.language === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-zinc-600 dark:text-zinc-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">{lang.code}</span>
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
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className={`w-full min-[1050px]:w-[320px] flex-shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/5 z-10 ${mobileView === 'preview' ? 'hidden min-[1050px]:flex' : 'flex'}`}>
          <div className="flex border-b border-zinc-200 dark:border-white/5">
            <button
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              onClick={() => setActiveTab('content')}
            >
              <FileText size={18} />
              {t.content}
            </button>
            <button
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'styles' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              onClick={() => setActiveTab('styles')}
            >
              <Palette size={18} />
              {t.styles}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
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
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-900/50">
                  <label className="block text-sm font-medium mb-2">{t.footerText}</label>
                  <textarea
                    className="w-full h-24 p-3 rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    value={state.styles.footerText}
                    onChange={(e) => updateStyle('footerText', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className={`flex-1 bg-zinc-100 dark:bg-black/20 overflow-auto ${mobileView === 'editor' ? 'hidden min-[1050px]:block' : 'block'}`}>
          <div className="min-h-full flex justify-center p-4 min-[1050px]:p-8 pb-60">
            <div className="relative h-fit">
              <Preview
                state={state}
                bannerState={state.banner}
                setBannerState={(b) => updateState({ banner: b })}
              />
            </div>
          </div>
        </main>

        {/* Floating Actions */}
        <div className={`fixed right-4 min-[1050px]:right-8 flex flex-col gap-4 transition-all duration-300 z-40 ${mobileView === 'editor' ? 'tranzinc-y-[200%] min-[1050px]:tranzinc-y-0 bottom-24 min-[1050px]:bottom-8' : 'bottom-24 min-[1050px]:bottom-8'}`}>
          <button
            onClick={handlePrint}
            className="w-14 h-14 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-full shadow-xl flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-transform hover:scale-105"
            title="Print"
          >
            <Printer size={24} />
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center transition-transform ${isGeneratingPDF ? 'opacity-50 cursor-wait' : 'hover:bg-primary/90 hover:scale-105'
              }`}
            title={isGeneratingPDF ? "Generando PDF..." : "Download PDF"}
          >
            {isGeneratingPDF ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Download size={24} />
            )}
          </button>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="min-[1050px]:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex z-50 pb-2">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 p-4 flex flex-col items-center gap-1 ${mobileView === 'editor' ? 'text-primary font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            <Settings size={20} />
            <span className="text-xs">Editor</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 p-4 flex flex-col items-center gap-1 ${mobileView === 'preview' ? 'text-primary font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            <LayoutGrid size={20} />
            <span className="text-xs">Vista Previa</span>
          </button>
        </div>

        {/* PDF Generation Loading Modal */}
        {isGeneratingPDF && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex flex-col items-center gap-6">
                {/* Spinner */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>

                {/* Text */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Generando PDF
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Por favor espera mientras se crea tu documento de alta calidad...
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
