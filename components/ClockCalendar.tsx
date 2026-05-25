"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, ChevronLeft, ChevronRight, CalendarDays, Save, Clock, Globe, Trash2,
} from "lucide-react";
import { TIMEZONES, REGIONS } from "@/lib/timezones";
import { useTimezone } from "@/lib/hooks/useTimezone";
import { dateKey, loadNotes, saveNotes, todayKeyInTz, type NotesMap } from "@/lib/calendarNotes";

interface Props {
  onClose: () => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ClockCalendar({ onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { tz, setTz } = useTimezone();
  const [notes, setNotes] = useState<NotesMap>({});
  const [noteDraft, setNoteDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // Live clock update
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Today computed in the SELECTED timezone (so the dashboard's "today"
  // matches what the user expects in their own timezone).
  const today = useMemo(() => {
    const key = todayKeyInTz(tz);
    const [y, m, d] = key.split("-").map(Number);
    return { year: y, month: m - 1, day: d, key };
  }, [tz, now]);

  // View state: which month is shown; which day is selected.
  const [view, setView] = useState({ year: today.year, month: today.month });
  const [selected, setSelected] = useState({
    year: today.year,
    month: today.month,
    day: today.day,
  });
  const selectedKey = dateKey(selected.year, selected.month, selected.day);

  // Load notes once
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  // When selected day changes, load its existing note into the editor
  useEffect(() => {
    setNoteDraft(notes[selectedKey] ?? "");
    setSaved(false);
  }, [selectedKey, notes]);

  // Outside-click + Escape close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  // Build the month cell grid
  const cells = useMemo(() => {
    const firstDay = new Date(view.year, view.month, 1);
    const startDow = firstDay.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const out: Array<
      | { day: number; key: string; isToday: boolean; isSelected: boolean; hasNote: boolean }
      | null
    > = [];

    for (let i = 0; i < startDow; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(view.year, view.month, d);
      out.push({
        day: d,
        key,
        isToday: key === today.key,
        isSelected:
          view.year === selected.year &&
          view.month === selected.month &&
          d === selected.day,
        hasNote: (notes[key]?.trim().length ?? 0) > 0,
      });
    }
    while (out.length % 7 !== 0) out.push(null);

    const rows: typeof out[] = [];
    for (let i = 0; i < out.length; i += 7) rows.push(out.slice(i, i + 7));
    return rows;
  }, [view, selected, today, notes]);

  function nextMonth() {
    setView((v) => {
      const m = v.month + 1;
      return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m };
    });
  }
  function prevMonth() {
    setView((v) => {
      const m = v.month - 1;
      return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m };
    });
  }
  function jumpToToday() {
    setView({ year: today.year, month: today.month });
    setSelected({ year: today.year, month: today.month, day: today.day });
  }
  function handleSave() {
    const updated = { ...notes };
    const trimmed = noteDraft.trim();
    if (trimmed.length === 0) {
      delete updated[selectedKey];
    } else {
      updated[selectedKey] = noteDraft;
    }
    setNotes(updated);
    saveNotes(updated);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }
  function handleClear() {
    setNoteDraft("");
  }

  const selectedDateLabel = useMemo(() => {
    const d = new Date(selected.year, selected.month, selected.day);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selected]);

  const notesInMonthCount = useMemo(() => {
    const prefix = `${view.year}-${String(view.month + 1).padStart(2, "0")}-`;
    return Object.keys(notes).filter((k) => k.startsWith(prefix) && notes[k].trim().length > 0).length;
  }, [notes, view]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Calendar and notes"
      className="absolute right-0 top-full mt-2 w-[420px] max-w-[95vw] bg-panel border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-panel2/40">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-accent" />
          <h2 className="text-sm font-semibold">Calendar & Notes</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Timezone picker + Current time */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <label className="block">
          <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-wider mb-1">
            <Globe size={10} />
            Timezone
          </div>
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/40"
          >
            {REGIONS.map((region) => (
              <optgroup key={region} label={region}>
                {TIMEZONES.filter((t) => t.region === region).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2 text-xs bg-panel2/50 border border-border rounded-md px-2.5 py-1.5">
          <Clock size={12} className="text-accentBlue" />
          <span className="text-muted">Current:</span>
          <span className="font-mono font-bold ml-auto">
            {now
              ? new Intl.DateTimeFormat("en-US", {
                  timeZone: tz,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                  timeZoneName: "short",
                }).format(now)
              : "—"}
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-1 text-muted hover:text-white rounded hover:bg-panel2"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {MONTH_NAMES[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={jumpToToday}
              className="text-[10px] text-accent hover:underline"
            >
              Today
            </button>
            {notesInMonthCount > 0 && (
              <span className="text-[10px] text-muted">· {notesInMonthCount} note{notesInMonthCount === 1 ? "" : "s"}</span>
            )}
          </div>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="p-1 text-muted hover:text-white rounded hover:bg-panel2"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-0.5 text-[10px] text-muted uppercase tracking-wider mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="space-y-0.5">
          {cells.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-0.5">
              {row.map((cell, ci) =>
                cell ? (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() =>
                      setSelected({
                        year: view.year,
                        month: view.month,
                        day: cell.day,
                      })
                    }
                    className={`relative h-9 rounded-md text-xs font-medium transition ${
                      cell.isSelected
                        ? "bg-accent/20 border border-accent/50 text-accent"
                        : cell.isToday
                        ? "border border-accent/30 hover:bg-panel2 text-white"
                        : "hover:bg-panel2 text-white border border-transparent"
                    }`}
                  >
                    {cell.day}
                    {cell.hasNote && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accentBlue"
                        aria-label="has note"
                      />
                    )}
                  </button>
                ) : (
                  <div key={`empty-${ri}-${ci}`} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes editor */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">{selectedDateLabel}</span>
          <span className="text-[10px] text-muted font-mono">{noteDraft.length} chars</span>
        </div>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={4}
          placeholder="Trading notes, journal entries, reminders, key levels for this day…"
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent/40 resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          {saved && <span className="text-[10px] text-accent">Saved ✓</span>}
          {noteDraft.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted hover:text-accentRed transition"
            >
              <Trash2 size={11} />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/20 transition"
          >
            <Save size={12} />
            Save note
          </button>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 border-t border-border bg-panel2/30 text-[10px] text-muted">
        Notes are saved per browser. Blue dot under a day = has a note. Picking a
        timezone also updates the header clock.
      </div>
    </div>
  );
}
