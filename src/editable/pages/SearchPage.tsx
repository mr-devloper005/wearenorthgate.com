import type { Metadata } from 'next'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, BriefcaseBusiness, Filter, Globe2, Search, Sparkles, UserRound } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads } from '@/lib/ads'

const HIDDEN_TASK_KEYS = new Set(['classified', 'profile'])

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || '/placeholder.svg?height=900&width=1400'
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || 'Open the result to see the full details.'

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function taskLabel(task: TaskKey | null) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
}

function taskHref(post: SitePost) {
  const task = getPostTaskKey(post) as TaskKey | null
  const route = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  return `${route || `/${task || 'article'}`}/${post.slug}`
}

function isVisibleTask(task: string | null) {
  return !task || !HIDDEN_TASK_KEYS.has(task)
}

function SearchHero({ query, category, task, enabledTasks }: { query: string; category: string; task: string; enabledTasks: typeof SITE_CONFIG.tasks }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[1.8rem] border border-[#d7e6ef] bg-white shadow-[0_24px_60px_rgba(8,69,148,0.10)]">
        <div className="rounded-t-[1.8rem] bg-[#10263b] px-5 py-4 text-white">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">{pagesContent.search.hero.badge}</p>
          <h2 className="editable-display mt-1 text-2xl font-extrabold">Search lanes</h2>
        </div>
        <div className="grid gap-2 p-4">
          {enabledTasks.slice(0, 6).map((item, index) => (
            <div key={item.key} className="flex items-center justify-between rounded-[1.2rem] bg-[#f7fbff] px-4 py-3">
              <span className="text-sm font-extrabold text-[#12324a]">{item.label}</span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${index % 2 === 0 ? 'bg-[#fff3cc] text-[#8d5c00]' : 'bg-[#e6f8f6] text-[#006f6b]'}`}>Browse</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-5">
        <div className="rounded-[1.8rem] bg-[#10263b] p-6 text-white shadow-[0_26px_60px_rgba(8,69,148,0.18)] sm:p-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">Discovery desk</p>
            <h1 className="editable-display mt-3 text-balance text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] sm:text-5xl lg:text-[3.9rem]">
              {pagesContent.search.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/82">{pagesContent.search.hero.description}</p>
          </div>

          <form action="/search" className="mt-6 rounded-[1.5rem] bg-white p-4 shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
            <input type="hidden" name="master" value="1" />
            <div className="flex flex-col gap-3 xl:flex-row">
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[1rem] border border-[#d7e6ef] bg-white px-4 py-3">
                <Search className="h-5 w-5 text-[#6e8aa0]" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-sm font-extrabold text-[#12324a] outline-none placeholder:text-[#7d95a8]" />
              </label>
              <label className="flex items-center gap-2 rounded-[1rem] border border-[#d7e6ef] bg-white px-4 py-3 xl:w-[220px]">
                <Filter className="h-4 w-4 text-[#6e8aa0]" />
                <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#12324a] outline-none placeholder:text-[#7d95a8]" />
              </label>
              <select name="task" defaultValue={task} className="rounded-[1rem] border border-[#d7e6ef] bg-white px-4 py-3 text-sm font-extrabold text-[#12324a] outline-none xl:w-[220px]">
                <option value="">All content types</option>
                {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
              <button className="inline-flex items-center justify-center rounded-full bg-[#ff7f2a] px-7 py-3 text-sm font-extrabold text-white transition hover:brightness-95" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {([
            ['Featured services', UserRound],
            ['Freelancer tools', BriefcaseBusiness],
            ['Useful links and posts', Globe2],
          ] as Array<[string, LucideIcon]>).map(([label, Icon]) => (
            <div key={label} className="rounded-[1.4rem] border border-[#d7e6ef] bg-white p-4 shadow-[0_14px_30px_rgba(8,69,148,0.06)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3cc] text-[#ff7f2a]">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-extrabold text-[#12324a]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturedResult({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  return (
    <Link href={taskHref(post)} className="group block overflow-hidden rounded-[1.9rem] bg-white shadow-[0_22px_54px_rgba(8,69,148,0.10)]">
      <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="min-h-[260px] overflow-hidden bg-[#eef6fb]">
          <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </div>
        <div className="bg-[linear-gradient(135deg,#10263b_0%,#084594_100%)] p-6 text-white">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">{taskLabel(task)}</p>
          <h2 className="editable-display mt-3 line-clamp-3 text-3xl font-extrabold leading-[0.98] tracking-[-0.04em]">{post.title}</h2>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/78">{summaryOf(post)}</p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#12324a]">
            Open feature <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const href = taskHref(post)
  const image = getImage(post)
  const summary = summaryOf(post)
  const label = taskLabel(task)
  const wide = index % 5 === 0

  return (
    <Link href={href} className={`group block overflow-hidden rounded-[1.7rem] border border-[#d7e6ef] bg-white shadow-[0_16px_34px_rgba(8,69,148,0.08)] transition hover:-translate-y-1.5 ${wide ? 'lg:col-span-8' : 'lg:col-span-4'}`}>
      <div className={`grid gap-0 ${wide ? 'md:grid-cols-[1fr_0.95fr]' : ''}`}>
        <div className={`overflow-hidden bg-[#eef6fb] ${wide ? 'aspect-[16/12] md:aspect-auto' : 'aspect-[4/3]'}`}>
          <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff7f2a]">
            <span>{label}</span>
            <span className="text-[#7d95a8]">No. {String(index + 1).padStart(2, '0')}</span>
          </div>
          <h2 className="editable-display mt-3 text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#12324a]">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#5a7790]">{summary}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#084594]">
            Open result <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = (feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key)))
    .filter((post) => isVisibleTask((getPostTaskKey(post) as string | null) || compactText(getContent(post).type) || null))
  const safeTask = HIDDEN_TASK_KEYS.has(task) ? '' : task
  const results = posts.filter((post) => matches(post, normalized, category, safeTask)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && !HIDDEN_TASK_KEYS.has(item.key))
  const featured = results[0]
  const quickLinks = results.slice(1, 7)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef5ff_0%,#fffdf4_100%)] text-[#12324a]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <SearchHero query={query} category={category} task={safeTask} enabledTasks={enabledTasks} />

          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot="in-feed" showLabel eager className="mx-auto w-full" />
          </div>

          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {featured ? <FeaturedResult post={featured} /> : null}

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ff7f2a]">{results.length} results</p>
                  <h2 className="editable-display mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#12324a]">
                    {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
                  </h2>
                </div>
                <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-[#d7e6ef] bg-white px-5 py-3 text-sm font-extrabold text-[#12324a] shadow-[0_12px_26px_rgba(8,69,148,0.06)]">
                  Browse latest <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {results.length ? (
                <div className="grid gap-5 lg:grid-cols-12">
                  {results.map((post, index) => <SearchResultCard key={post.id || post.slug || `${index}`} post={post} index={index} />)}
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-[#d7e6ef] bg-white/80 p-10 text-center shadow-[0_18px_40px_rgba(8,69,148,0.05)]">
                  <p className="editable-display text-3xl font-extrabold tracking-[-0.04em] text-[#12324a]">No matching posts found.</p>
                  <p className="mt-3 text-sm font-bold text-[#5a7790]">Try a different keyword, content type, or category.</p>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-[1.7rem] border border-[#d7e6ef] bg-white p-5 shadow-[0_16px_34px_rgba(8,69,148,0.07)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3cc] text-[#ff7f2a]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#ff7f2a]">Popular keywords</p>
                    <h3 className="editable-display text-2xl font-extrabold text-[#12324a]">Quick trails</h3>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickLinks.map((post) => (
                    <Link key={post.id || post.slug || post.title} href={taskHref(post)} className="rounded-full bg-[#f4fbff] px-4 py-2 text-sm font-extrabold text-[#12324a] transition hover:bg-[#fff3cc] hover:text-[#8d5c00]">
                      {post.title.slice(0, 22)}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
