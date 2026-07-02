'use client'

import Link from 'next/link'
import { ArrowRight, CheckSquare, Globe2, Mail, MapPinned, Smartphone } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const HIDDEN_TASK_KEYS = new Set(['classified', 'profile'])

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t border-[#d7e6ef] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-[0_18px_40px_rgba(8,69,148,0.08)] lg:grid-cols-[1.25fr_0.85fr_1fr] lg:p-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.1rem] bg-[#10263b] shadow-[0_14px_30px_rgba(8,69,148,0.16)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-full w-full object-cover" />
              </span>
              <span>
                <span className="editable-display block text-3xl font-extrabold tracking-[-0.05em] text-[#12324a]">{SITE_CONFIG.name}</span>
                <span className="block text-xs font-extrabold uppercase tracking-[0.22em] text-[#5a7790]">{globalContent.footer?.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-8 text-[#5a7790]">{globalContent.footer?.description || SITE_CONFIG.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3cc] px-4 py-2 text-sm font-extrabold text-[#8d5c00]">
                <CheckSquare className="h-4 w-4" /> Clear sections
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f8f6] px-4 py-2 text-sm font-extrabold text-[#006f6b]">
                <Globe2 className="h-4 w-4" /> Easy discovery
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ff7f2a]">Site</h3>
            <div className="mt-4 grid gap-3">
              <Link href="/about" className="text-sm font-extrabold text-[#12324a] transition hover:text-[#084594]">About</Link>
              <Link href="/contact" className="text-sm font-extrabold text-[#12324a] transition hover:text-[#084594]">Contact</Link>
              {session ? <Link href="/create" className="text-sm font-extrabold text-[#12324a] transition hover:text-[#084594]">Create</Link> : null}
              {!session ? <Link href="/login" className="text-sm font-extrabold text-[#12324a] transition hover:text-[#084594]">Login</Link> : null}
              {!session ? <Link href="/signup" className="text-sm font-extrabold text-[#12324a] transition hover:text-[#084594]">Sign up</Link> : null}
              {session ? <button type="button" onClick={logout} className="text-left text-sm font-extrabold text-[#12324a] transition hover:text-[#084594]">Logout</button> : null}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ff7f2a]">Stay connected</h3>
            <div className="mt-4 grid gap-3">
              <div className="inline-flex items-center gap-3 rounded-[1rem] border border-[#d7e6ef] bg-[#f7fafc] px-4 py-3 text-sm font-extrabold text-[#12324a]">
                <Mail className="h-4 w-4 text-[#008e89]" /> New posts and updates
              </div>
              <div className="inline-flex items-center gap-3 rounded-[1rem] border border-[#d7e6ef] bg-[#f7fafc] px-4 py-3 text-sm font-extrabold text-[#12324a]">
                <Smartphone className="h-4 w-4 text-[#ff7f2a]" /> Mobile-friendly browsing
              </div>
              <div className="inline-flex items-center gap-3 rounded-[1rem] border border-[#d7e6ef] bg-[#f7fafc] px-4 py-3 text-sm font-extrabold text-[#12324a]">
                <MapPinned className="h-4 w-4 text-[#084594]" /> Places, listings, and useful resources
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-[#6f889c] sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {SITE_CONFIG.name}</span>
          <span>{globalContent.footer?.bottomNote}</span>
        </div>
      </div>
    </footer>
  )
}
