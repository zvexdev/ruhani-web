import React, { useState, useRef, useEffect, useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X, Check, Sparkles } from "lucide-react";

export interface ComboboxOption<T extends string | number> {
  value: T;
  label: string;
  arabicLabel?: string;
  badge?: string;
  subtitle?: string;
}

interface LuxuryComboboxProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function LuxuryCombobox<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  searchable = true,
  icon,
  label,
  className = "",
  disabled = false,
}: LuxuryComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Screen size check for mobile drawer vs desktop floating popover
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.arabicLabel && opt.arabicLabel.includes(q)) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    } else {
      setSearchQuery("");
      setHighlightedIndex(0);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] inline-flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900/90 dark:bg-[#0a0a0a] hover:bg-neutral-800 dark:hover:bg-neutral-900 border border-emerald-900/40 dark:border-emerald-500/25 shadow-sm hover:border-emerald-500/50 text-xs font-medium text-neutral-200 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-emerald-400 shrink-0">{icon}</span>}
          {label && (
            <span className="text-neutral-400 font-normal hidden sm:inline shrink-0">
              {label}
            </span>
          )}
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-semibold text-white truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.arabicLabel && (
              <span className="font-['Amiri'] text-amber-300 text-xs shrink-0 font-bold hidden md:inline">
                ({selectedOption.arabicLabel})
              </span>
            )}
            {selectedOption?.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                {selectedOption.badge}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Sheet Backdrop */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm sm:hidden"
              />
            )}

            {/* Menu Container: Floating on Desktop, Bottom Drawer on Mobile */}
            <motion.div
              initial={
                isMobile
                  ? { y: "100%", opacity: 0 }
                  : { opacity: 0, y: -6, scale: 0.98 }
              }
              animate={
                isMobile
                  ? { y: 0, opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                isMobile
                  ? { y: "100%", opacity: 0 }
                  : { opacity: 0, y: -6, scale: 0.98 }
              }
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={
                isMobile
                  ? "fixed bottom-0 left-0 right-0 z-[60] max-h-[75vh] rounded-t-3xl bg-[#0a0a0a] border-t border-emerald-500/40 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] flex flex-col sm:hidden overflow-hidden"
                  : "absolute left-0 right-0 top-full mt-2 z-[60] min-w-[280px] sm:min-w-[320px] max-w-sm rounded-2xl bg-[#0a0a0a] border border-emerald-900/50 shadow-2xl flex flex-col max-h-[300px] overflow-hidden"
              }
            >
              {/* Mobile Drawer Grab Handle & Header */}
              {isMobile && (
                <div className="shrink-0 bg-[#0a0a0a] p-4 pb-2 border-b border-neutral-800/80">
                  <div className="w-12 h-1.5 rounded-full bg-neutral-700 mx-auto mb-3" />
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {label || placeholder}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Static Sibling Search Header with Solid Background & Border */}
              {searchable && (
                <div className="shrink-0 bg-[#0a0a0a] p-2.5 border-b border-neutral-800/80 z-10">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Options List */}
              <div
                ref={listRef}
                role="listbox"
                className="flex-1 overflow-y-auto overscroll-contain p-2 pb-6 divide-y divide-neutral-900/60 custom-scrollbar space-y-0.5"
              >
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-500">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = opt.value === value;
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(opt.value)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full min-h-[44px] flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-start text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-950/70 text-emerald-300 font-bold border border-emerald-500/30"
                            : isHighlighted
                            ? "bg-neutral-900/90 text-white"
                            : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{opt.label}</span>
                            {opt.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold shrink-0">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          {opt.subtitle && (
                            <span className="text-[10px] text-neutral-500 truncate mt-0.5">
                              {opt.subtitle}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {opt.arabicLabel && (
                            <span className="font-['Amiri'] text-sm text-neutral-400 group-hover:text-amber-300 font-bold">
                              {opt.arabicLabel}
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
