'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, MapPin, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const HIDDEN_TASK_KEYS = new Set(['classified', 'profile'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !HIDDEN_TASK_KEYS.has(task.key)).map((task) => ({ label: task.label, href: task.route })),
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[#24384e] bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-md">
      <div className="border-b border-white/10 bg-[#f5dfe2] text-[#10263b]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-center justify-between gap-3 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] sm:px-6 lg:px-8">
          <span>Fresh freelancer-friendly discovery</span>
          <span className="hidden items-center gap-2 sm:inline-flex"><MapPin className="h-3.5 w-3.5" /> Browse listings, articles, and useful finds</span>
        </div>
      </div>

      <nav className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.1rem] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0">
              <span className="editable-display block truncate text-3xl font-extrabold leading-none tracking-[-0.04em] text-white">
                {SITE_CONFIG.name}
              </span>
              <span className="mt-1 block truncate text-xs font-bold uppercase tracking-[0.24em] text-[#9fc0d8]">
                {globalContent.nav?.tagline || SITE_CONFIG.tagline}
              </span>
            </span>
          </Link>

          <form action="/search" className="hidden min-w-0 flex-1 xl:flex">
            <div className="flex w-full max-w-[620px] overflow-hidden rounded-[1rem] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-[#6e8aa0]" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search listings, skills, topics, or posts"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-bold text-[#12324a] outline-none placeholder:text-[#7d95a8]"
                />
              </div>
              <button className="bg-[#ff7f2a] px-6 text-sm font-extrabold text-white transition hover:brightness-95">Search</button>
            </div>
          </form>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2 text-sm text-white/85">
              <span className="rounded-full bg-white/10 px-3 py-2 font-bold">Browse</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#ffd32d]">India / INR <ChevronDown className="h-4 w-4" /></span>
            </div>
            {session ? (
              <>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff7f2a] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:brightness-95"
                >
                  <PlusCircle className="h-4 w-4" /> Create
                </Link>
                <button type="button" onClick={logout} className="text-sm font-extrabold text-white/85 transition hover:text-[#ffd32d]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-extrabold text-white/85 transition hover:text-[#ffd32d]">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-white/14"
                >
                  <UserPlus className="h-4 w-4" /> Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="ml-auto rounded-[1rem] border border-white/15 bg-white/10 p-3 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden items-center gap-2 overflow-x-auto pb-1 lg:flex">
          {navItems.slice(0, 7).map((item, index) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                  active
                    ? 'bg-[#ffd32d] text-[#10263b]'
                    : index === 0
                      ? 'bg-white/8 text-white hover:bg-white/14'
                      : 'text-white/82 hover:bg-white/8 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {open ? (
          <div className="grid gap-4 border-t border-white/10 pt-4 lg:hidden">
            <form action="/search" className="flex overflow-hidden rounded-[1rem] bg-white">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-[#6e8aa0]" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search the site"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold text-[#12324a] outline-none placeholder:text-[#7d95a8]"
                />
              </div>
              <button className="bg-[#ff7f2a] px-5 text-sm font-extrabold text-white">Go</button>
            </form>

            <div className="grid gap-2">
              {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-[1rem] px-4 py-3 text-sm font-extrabold transition ${
                      active ? 'bg-[#ffd32d] text-[#10263b]' : 'bg-white/6 text-white/88 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {session ? (
                <button type="button" onClick={logout} className="rounded-[1rem] bg-white/6 px-4 py-3 text-left text-sm font-extrabold text-white/88 hover:bg-white/10">
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  )
}
