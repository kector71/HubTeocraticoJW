import React, { useEffect, useState, useRef } from 'react';
import { AppState, MonthData, StyleConfig } from '../types';
import { TRANSLATIONS, MONTH_NAMES } from '../constants';
import { ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Image as ImageIcon, CalendarDays } from 'lucide-react';

interface Props {
    state: AppState;
    bannerState: AppState['banner'];
    setBannerState: (b: AppState['banner']) => void;
}

const getStyleString = (config: StyleConfig) => {
    return {
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        color: config.color,
        backgroundColor: config.backgroundColor,
        fontWeight: config.fontWeight,
        fontStyle: config.fontStyle,
        textDecoration: config.textDecoration,
        textTransform: config.textTransform as any,
    };
};

export const Preview: React.FC<Props> = ({ state, bannerState, setBannerState }) => {
    const t = TRANSLATIONS[state.language];

    // Logic to calculate dates for the table rows
    const getDatesForWeeks = (month: MonthData) => {
        if (month.selectedDays.length === 0) return [];

        const dates: string[] = [];
        const year = month.year;
        const monthIndex = month.monthIndex;

        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        let currentWeekDates: number[] = [];

        // Simple logic: iterate all days, group by week (resetting on Mondays)
        // Actually, simple grouping logic for "meetings" usually implies "midweek and weekend".
        // If user selects say Tue and Sun. 
        // Week 1: Tue 2, Sun 7. -> "2 y 7"

        let currentWeekNumber = -1;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dayOfWeek = date.getDay(); // 0 = Sun

            // Check if this day is a meeting day
            if (month.selectedDays.includes(dayOfWeek)) {
                // Calculate week number relative to start of month.
                // We can just group simply: if the gap between this meeting and the last one is > 4 days, or if we cross a Monday?
                // Let's use the standard ISO week logic roughly, or simply group sequantially for now.
                // Better approach based on HTML logic: Group meetings that occur within the same Mon-Sun week.

                // Get the Monday of the current date's week
                const dist = (dayOfWeek + 6) % 7; // Mon=0, Sun=6
                const monday = new Date(date);
                monday.setDate(date.getDate() - dist);
                const weekNum = monday.getTime(); // Use timestamp as unique week ID

                if (weekNum !== currentWeekNumber) {
                    if (currentWeekDates.length > 0) {
                        dates.push(currentWeekDates.join(' y '));
                    }
                    currentWeekDates = [];
                    currentWeekNumber = weekNum;
                }
                currentWeekDates.push(day);
            }
        }
        if (currentWeekDates.length > 0) {
            dates.push(currentWeekDates.join(' y '));
        }
        return dates;
    };

    const moveBanner = (dx: number, dy: number) => {
        setBannerState({
            ...bannerState,
            x: bannerState.x + dx,
            y: bannerState.y + dy
        });
    };

    // Scale Logic
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            // 816 is the fixed width of the paper
            // We want some padding (e.g. 32px on each side = 64px total, or less on mobile)
            const padding = window.innerWidth < 1050 ? 32 : 64;
            const availableWidth = window.innerWidth - padding;

            // If screen matches or is larger than paper, scale is 1. Else shrink.
            const newScale = Math.min(1, availableWidth / 816);
            setScale(newScale);
        };

        handleResize(); // Initial calc
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={containerRef} className="flex justify-center w-full" style={{ height: 1056 * scale, marginBottom: 20 }}>
            <div
                id="pdf-content"
                className="w-[816px] min-h-[1056px] bg-white shadow-xl text-black flex flex-col transition-all origin-top"
                style={{ transform: `scale(${scale})` }}
            >
                <div className="p-12 flex flex-col h-full flex-grow">

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 style={getStyleString(state.styles.title)}>
                            {state.template === 'acomodadores' ? t.previewTitleUshers : t.previewTitleCleaning}
                        </h2>
                    </div>

                    {/* Banner Area */}
                    <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden mb-8 group border border-slate-200">
                        {bannerState.image ? (
                            <div className="w-full h-full relative overflow-hidden">
                                <img
                                    src={bannerState.image}
                                    alt="Banner"
                                    className="absolute"
                                    style={{
                                        transform: `translate(-50%, -50%) scale(${bannerState.zoom}) translate(${bannerState.x}px, ${bannerState.y}px)`,
                                        left: '50%',
                                        top: '50%',
                                        transformOrigin: 'center center'
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon size={48} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">{t.previewPlaceholder}</p>
                            </div>
                        )}

                        {/* Banner Controls (Hover) */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => moveBanner(0, -10)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowUp size={16} /></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => moveBanner(-10, 0)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowLeft size={16} /></button>
                                <button onClick={() => moveBanner(10, 0)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowRight size={16} /></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => moveBanner(0, 10)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowDown size={16} /></button>
                            </div>
                            <div className="flex items-center gap-2 mt-2 w-48 px-4">
                                <ZoomOut size={16} className="text-white" />
                                <input
                                    type="range" min="0.5" max="3" step="0.1"
                                    value={bannerState.zoom}
                                    onChange={(e) => setBannerState({ ...bannerState, zoom: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-white/50 rounded-lg appearance-none cursor-pointer"
                                />
                                <ZoomIn size={16} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content Tables */}
                    <div className="space-y-8 flex-grow">
                        {state.months.map(month => {
                            const dates = getDatesForWeeks(month);
                            // We render as many rows as dates generated, picking data from month.weeks index
                            return (
                                <div key={month.id} className="rounded-lg overflow-hidden border border-slate-200">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr style={getStyleString(state.styles.header)}>
                                                <th className="p-3 text-center border-r border-white/20 w-1/4">
                                                    {MONTH_NAMES[month.monthIndex].toUpperCase()}
                                                </th>
                                                {state.template === 'acomodadores' ? (
                                                    <>
                                                        <th className="p-3 text-center border-r border-white/20">{t.door}</th>
                                                        <th className="p-3 text-center border-r border-white/20">{t.auditorium}</th>
                                                        <th className="p-3 text-center border-r border-white/20">{t.mic1}</th>
                                                        <th className="p-3 text-center">{t.mic2}</th>
                                                    </>
                                                ) : (
                                                    <th className="p-3 text-center">{t.assignedGroup}</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody style={getStyleString(state.styles.cell)}>
                                            {dates.length > 0 ? dates.map((dateStr, idx) => {
                                                const weekData = month.weeks[idx] || { id: '', door: '', auditorium: '', mic1: '', mic2: '', group: '' };
                                                return (
                                                    <tr key={idx} className={`transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                                        <td className="p-3 text-center font-bold border-r border-slate-200">{dateStr}</td>
                                                        {state.template === 'acomodadores' ? (
                                                            <>
                                                                <td className="p-3 text-center border-r border-slate-200">{weekData.door}</td>
                                                                <td className="p-3 text-center border-r border-slate-200">{weekData.auditorium}</td>
                                                                <td className="p-3 text-center border-r border-slate-200">{weekData.mic1}</td>
                                                                <td className="p-3 text-center">{weekData.mic2}</td>
                                                            </>
                                                        ) : (
                                                            <td className="p-3 text-center">{weekData.group}</td>
                                                        )}
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={5} className="p-12 text-center text-slate-400">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                                <CalendarDays size={24} className="text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">No dates generated</p>
                                                            <p className="text-xs max-w-[200px] mx-auto">Select days of the week in the sidebar to automatically generate the schedule rows.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <div
                            style={getStyleString(state.styles.footer)}
                            dangerouslySetInnerHTML={{ __html: state.styles.footerText }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};