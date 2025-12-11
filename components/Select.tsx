import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    className = '',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
        onChange(String(optionValue));
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between rounded-lg border bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${isOpen
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
            >
                <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {(isOpen && !disabled) && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100 scrollbar-thin border border-slate-100 dark:border-slate-700">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`relative flex w-full select-none items-center justify-between py-2.5 pl-3 pr-9 cursor-pointer transition-colors ${option.value === value
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <span className="block truncate text-left">{option.label}</span>
                            {option.value === value && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                                    <Check size={16} aria-hidden="true" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
