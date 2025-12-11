import React, { useState } from 'react';
import { AppState, MonthData, TemplateType, WeekData } from '../types';
import { TRANSLATIONS, MONTH_NAMES } from '../constants';
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Upload, Plus } from 'lucide-react';
import { Select } from './Select';

interface Props {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export const ContentControl: React.FC<Props> = ({ state, updateState }) => {
  const t = TRANSLATIONS[state.language];
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});

  const toggleMonth = (id: string) => {
    setOpenMonths(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleWeek = (id: string) => {
    setOpenWeeks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateState({
            banner: {
              ...state.banner,
              image: event.target.result as string,
              x: 0,
              y: 0,
              zoom: 1
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addMonth = () => {
    const newMonth: MonthData = {
      id: crypto.randomUUID(),
      year: new Date().getFullYear(),
      monthIndex: new Date().getMonth(),
      selectedDays: [],
      weeks: Array.from({ length: 5 }).map(() => ({
        id: crypto.randomUUID(),
        door: '',
        auditorium: '',
        mic1: '',
        mic2: '',
        group: ''
      }))
    };
    updateState({ months: [...state.months, newMonth] });
    setOpenMonths(prev => ({ ...prev, [newMonth.id]: true }));
  };

  const removeMonth = (id: string) => {
    updateState({ months: state.months.filter(m => m.id !== id) });
  };

  const updateMonth = (id: string, updates: Partial<MonthData>) => {
    updateState({
      months: state.months.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const toggleDay = (monthId: string, dayIndex: number) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;

    const newSelectedDays = month.selectedDays.includes(dayIndex)
      ? month.selectedDays.filter(d => d !== dayIndex)
      : [...month.selectedDays, dayIndex].sort(); // Sort for consistent order

    updateMonth(monthId, { selectedDays: newSelectedDays });
  };

  const updateWeek = (monthId: string, weekId: string, field: keyof WeekData, value: string) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;

    const newWeeks = month.weeks.map(w => w.id === weekId ? { ...w, [field]: value } : w);
    updateMonth(monthId, { weeks: newWeeks });
  };

  const addWeek = (monthId: string) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;
    const newWeek = {
      id: crypto.randomUUID(),
      door: '',
      auditorium: '',
      mic1: '',
      mic2: '',
      group: ''
    };
    updateMonth(monthId, { weeks: [...month.weeks, newWeek] });
  };

  const removeWeek = (monthId: string, weekId: string) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;
    updateMonth(monthId, { weeks: month.weeks.filter(w => w.id !== weekId) });
  };



  return (
    <div className="space-y-8 pb-10">

      {/* Section: Configuration */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Configuración</h3>

        {/* Template Selector */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">
            {t.selectTemplate}
          </label>
          <Select
            options={[
              { value: 'acomodadores', label: t.templateUshers },
              { value: 'aseo', label: t.templateCleaning }
            ]}
            value={state.template}
            onChange={(value) => updateState({ template: value as TemplateType })}
          />
        </div>

        {/* Banner Upload */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">
            {t.banner}
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="banner-upload"
              onChange={handleBannerUpload}
            />
            <label
              htmlFor="banner-upload"
              className="flex items-center justify-center gap-3 w-full p-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary cursor-pointer transition-all bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload size={16} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.uploadBanner}</span>
            </label>
            {state.banner.image && (
              <div className="absolute top-1/2 -translate-y-1/2 right-3 w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Banner cargado" />
            )}
          </div>
        </div>
      </div>

      {/* Section: Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Programación</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{state.months.length} Meses</span>
        </div>

        <div className="space-y-5">
          {state.months.map((month, index) => (
            <div key={month.id} className="group border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">

              {/* Month Header */}
              <div
                className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors rounded-t-xl ${openMonths[month.id] ? 'bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                onClick={() => toggleMonth(month.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${openMonths[month.id] ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {MONTH_NAMES[month.monthIndex]} {month.year}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">{month.weeks.length} Semanas</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMonth(month.id); }}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title={t.remove}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className={`transition-transform duration-200 ${openMonths[month.id] ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {openMonths[month.id] && (
                <div className="p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
                  {/* Visual Connector Line */}

                  {/* Year/Month Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t.year}</span>
                      <input
                        type="number"
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                        value={month.year}
                        onChange={(e) => updateMonth(month.id, { year: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t.month}</span>
                      <div className="relative">
                        <Select
                          options={MONTH_NAMES.map((name, i) => ({ value: i, label: name }))}
                          value={month.monthIndex}
                          onChange={(value) => updateMonth(month.id, { monthIndex: parseInt(value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Day Selector */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block text-center">{t.meetingDay}</span>
                    <div className="flex justify-between gap-1">
                      {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                        <button
                          key={i}
                          onClick={() => toggleDay(month.id, i)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${month.selectedDays.includes(i)
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700'
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weeks Data */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Semanas</span>
                    </div>

                    {month.weeks.map((week, idx) => (
                      <div key={week.id} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors">
                        <div
                          className="flex items-center justify-between cursor-pointer group/week py-1"
                          onClick={() => toggleWeek(week.id)}
                        >
                          <span className={`text-xs font-bold uppercase transition-colors ${openWeeks[week.id] ? 'text-primary' : 'text-slate-500 group-hover/week:text-slate-700 dark:group-hover/week:text-slate-300'}`}>
                            {t.week} {idx + 1}
                          </span>
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/week:opacity-100 transition-opacity">
                            {openWeeks[week.id] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </div>
                        </div>

                        {/* Remove Week Bubble */}
                        <button
                          className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-500 transition-colors z-10"
                          onClick={(e) => { e.stopPropagation(); removeWeek(month.id, week.id); }}
                          title={t.remove}
                        >
                          <span className="sr-only">Remove</span>
                          <div className="w-1 h-1 rounded-full bg-current" />
                        </button>

                        {(openWeeks[week.id] === undefined || openWeeks[week.id]) && (
                          <div className="mt-2 grid grid-cols-2 gap-2.5 animate-in slide-in-from-left-2 duration-200">
                            {state.template === 'acomodadores' ? (
                              <>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.door}</span>
                                  <input
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.door}
                                    onChange={(e) => updateWeek(month.id, week.id, 'door', e.target.value)}
                                  />
                                </label>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.auditorium}</span>
                                  <input
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.auditorium}
                                    onChange={(e) => updateWeek(month.id, week.id, 'auditorium', e.target.value)}
                                  />
                                </label>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.mic1}</span>
                                  <input
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.mic1}
                                    onChange={(e) => updateWeek(month.id, week.id, 'mic1', e.target.value)}
                                  />
                                </label>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.mic2}</span>
                                  <input
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.mic2}
                                    onChange={(e) => updateWeek(month.id, week.id, 'mic2', e.target.value)}
                                  />
                                </label>
                              </>
                            ) : (
                              <label className="col-span-2 space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.groupName}</span>
                                <input
                                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-9 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                  value={week.group}
                                  onChange={(e) => updateWeek(month.id, week.id, 'group', e.target.value)}
                                  placeholder="Grupo..."
                                />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addWeek(month.id)}
                      className="w-full py-2 text-xs font-bold text-primary border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-all mt-2"
                    >
                      <Plus size={14} /> {t.addWeek}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addMonth}
            className="w-full py-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold flex items-center justify-center gap-2 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
              <Plus size={14} />
            </div>
            <span className="text-xs uppercase tracking-wide">{t.createNewMonth}</span>
          </button>
        </div>

      </div>
    </div>
  );
};