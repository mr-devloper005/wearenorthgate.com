import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY = "'Bricolage Grotesque', 'Trebuchet MS', sans-serif"
const BODY = "'Nunito Sans', 'Segoe UI', sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY,
  fontBody: BODY,
  bg: '#fffdf7',
  surface: '#ffffff',
  raised: '#f4fbff',
  text: '#12324a',
  muted: '#5a7790',
  line: '#d7e6ef',
  accent: '#ff7f2a',
  accentSoft: '#fff3cc',
  onAccent: '#ffffff',
  glow: 'rgba(255,211,45,0.26)',
  radius: '1.55rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Guidebook', note: 'Long reads and ideas laid out like a lively editorial catalog.' },
  listing: { ...base, kicker: 'Directory', note: 'Service listings with quick filters, strong details, and easy follow-up.' },
  classified: { ...base, kicker: 'Open Board', note: 'Offers and opportunities with bright, practical scanability.' },
  image: { ...base, kicker: 'Gallery', note: 'A playful image wall built for quick browsing and visual discovery.' },
  sbm: { ...base, kicker: 'Shortlist', note: 'Useful saved links presented like a curated recommendation shelf.' },
  pdf: { ...base, kicker: 'Library', note: 'Downloads and documents arranged like an organized resource desk.' },
  profile: { ...base, kicker: 'Profiles', note: 'Freelancer-friendly identity pages with clear contact touchpoints.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
