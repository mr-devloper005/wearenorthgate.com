import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Bookmark, BriefcaseBusiness, Building2, Camera, ChevronRight, FileText, Image as ImageIcon,
  MapPin, Megaphone, Search, ShieldCheck, Sparkles, Star, Truck, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import { getPostTaskKey, type HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

const HIDDEN_TASK_KEYS = new Set(['classified', 'profile'])

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function isVisibleTask(task?: string | null) {
  return !task || !HIDDEN_TASK_KEYS.has(task)
}

function visiblePosts(posts: SitePost[]) {
  return posts.filter((post) => isVisibleTask((getPostTaskKey(post) as string | null) || null))
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getExcerpt(post?: SitePost | null, limit = 120) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = stripHtml(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((4.1 + (h % 8) / 10) * 10) / 10
}

function StatPill({ icon: Icon, children }: { icon: typeof Sparkles; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e6ef] bg-white px-4 py-2 text-sm font-bold text-[#12324a] shadow-[0_10px_30px_rgba(8,69,148,0.08)]">
      <Icon className="h-4 w-4 text-[#ff7f2a]" />
      {children}
    </span>
  )
}

function FeaturedHeroCard({ post, href }: { post?: SitePost; href: string }) {
  const title = post?.title || 'Helpful listings, resources, and posts collected in one place.'
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group relative block min-h-[360px] overflow-hidden rounded-[2rem] bg-[#10263b] shadow-[0_32px_72px_rgba(8,69,148,0.22)] sm:min-h-[420px]">
      <img src={image} alt={post?.title || 'Featured post'} className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,38,59,0.95)_0%,rgba(16,38,59,0.75)_46%,rgba(16,38,59,0.55)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#ffd32d] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#10263b]">
            {pagesContent.home.hero.badge}
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
            {categoryOf(post)}
          </span>
        </div>
        <div className="max-w-2xl">
          <h1 className="editable-display text-balance text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] text-white sm:text-5xl lg:text-[4rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg">{getExcerpt(post, 180) || pagesContent.home.hero.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full bg-[#00a79d] px-5 py-3 text-sm font-extrabold text-white">
              View spotlight
            </span>
            <span className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white/85">
              {post ? `${ratingOf(post).toFixed(1)} rated` : 'Updated daily'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PromoStrip({ posts, primaryTask, primaryRoute }: { posts: SitePost[]; primaryTask: TaskKey; primaryRoute: string }) {
  const promoPosts = posts.slice(1, 6)
  return (
    <div className="rounded-[1.6rem] border border-[#ffd58d] bg-[linear-gradient(135deg,#fff6cf_0%,#fff1bd_34%,#ffe0af_100%)] p-4 shadow-[0_18px_40px_rgba(255,127,42,0.12)]">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_minmax(0,1fr)]">
        <div className="rounded-[1.3rem] bg-white/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff7f2a]">Quick picks</p>
              <h3 className="editable-display mt-1 text-2xl font-extrabold text-[#12324a]">Useful things to check today</h3>
            </div>
            <Link href={primaryRoute} className="rounded-full bg-[#ff7f2a] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              Go
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ['40%', 'Fresh finds'],
              [String(Math.max(1, SITE_CONFIG.tasks.filter((task) => task.enabled && !HIDDEN_TASK_KEYS.has(task.key)).length)), 'Live sections'],
              ['24/7', 'Open browsing'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[1rem] border border-white/50 bg-white px-3 py-4 text-center">
                <p className="editable-display text-3xl font-extrabold text-[#12324a]">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#5a7790]">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {promoPosts.map((post, index) => (
            <Link
              key={post.id || post.slug || index}
              href={postHref(primaryTask, post, primaryRoute)}
              className="group rounded-[1.2rem] border border-white/60 bg-white p-2 shadow-[0_10px_28px_rgba(8,69,148,0.08)] transition hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden rounded-[1rem] bg-[#eef6fb]">
                <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-extrabold leading-snug text-[#12324a]">{post.title}</p>
              <p className="mt-1 text-xs font-bold text-[#ff7f2a]">{categoryOf(post)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = visiblePosts(dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]))
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && !HIDDEN_TASK_KEYS.has(task.key)).slice(0, 6)
  const heroPost = pool[0]

  return (
    <section className="bg-[linear-gradient(180deg,#eef5ff_0%,#fffdf5_100%)] pb-12 pt-0">
      <div className="border-b border-[#dbe7f0] bg-[#f8dde1]">
        <div className={`${container} flex flex-wrap items-center justify-between gap-3 py-3 text-sm font-extrabold text-[#10263b]`}>
          <p className="editable-display text-lg sm:text-2xl">Build your next freelance move with better visibility.</p>
          <Link href="/create" className="rounded-full bg-[#ffd32d] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#10263b] transition hover:brightness-95">
            Share yours
          </Link>
        </div>
      </div>

      <div className={`${container} pt-6`}>
        <div className="space-y-5">
          <div className="rounded-[1.75rem] bg-[#10263b] px-5 py-4 text-white shadow-[0_22px_48px_rgba(8,69,148,0.18)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="editable-display text-3xl font-extrabold">{SITE_CONFIG.name}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffd32d]">
                    Directory
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/70">{pagesContent.home.hero.description}</p>
              </div>
              <form action="/search" className="flex w-full max-w-[640px] overflow-hidden rounded-[1rem] bg-white shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                  <Search className="h-5 w-5 shrink-0 text-[#7d95a8]" />
                  <input
                    name="q"
                    placeholder={pagesContent.home.hero.searchPlaceholder}
                    className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-[#12324a] outline-none placeholder:text-[#7d95a8]"
                  />
                </div>
                <button className="bg-[#ff7f2a] px-6 text-sm font-extrabold text-white transition hover:brightness-95 sm:px-8">
                  Search
                </button>
              </form>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/65">
              {categories.map((task) => (
                <Link key={task.key} href={task.route} className="hover:text-[#ffd32d]">
                  {task.label}
                </Link>
              ))}
            </div>
          </div>

          <FeaturedHeroCard post={heroPost} href={heroPost ? postHref(primaryTask, heroPost, primaryRoute) : primaryRoute} />
          <PromoStrip posts={pool} primaryTask={primaryTask} primaryRoute={primaryRoute} />
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = visiblePosts(dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]))
  const storyPosts = pool.slice(6, 12)
  const trustItems = [
    { icon: ShieldCheck, title: 'Clear details', text: 'Helpful overviews with safer fallbacks when details are missing.' },
    { icon: Building2, title: 'Practical directory', text: 'Browse listings, resources, and posts from one connected layout.' },
    { icon: Truck, title: 'Fast scanning', text: 'Compact cards and strong categories help visitors compare quickly.' },
    { icon: Sparkles, title: 'Fresh layout', text: 'Different card styles keep each section feeling purposeful.' },
  ]

  return (
    <section className="bg-white py-12 sm:py-14">
      <div className={container}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff7f2a]">Popular keywords</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {pool.slice(0, 12).map((post) => (
                    <Link
                      key={post.id || post.slug || post.title}
                      href={postHref(primaryTask, post, primaryRoute)}
                      className="text-sm font-bold text-[#5a7790] hover:text-[#084594]"
                    >
                      {categoryOf(post)} |
                    </Link>
                  ))}
                </div>
              </div>
              <Link href={primaryRoute} className="hidden rounded-full bg-[#ff7f2a] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white sm:inline-flex">
                Show more
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {storyPosts.map((post, index) => (
                <Link
                  key={post.id || post.slug || index}
                  href={postHref(primaryTask, post, primaryRoute)}
                  className={`group overflow-hidden rounded-[1.5rem] border border-[#d7e6ef] bg-white shadow-[0_16px_34px_rgba(8,69,148,0.08)] transition hover:-translate-y-1.5 ${index === 0 ? 'sm:col-span-2 xl:col-span-2 xl:grid xl:grid-cols-[1.1fr_0.9fr]' : ''}`}
                >
                  <div className={`${index === 0 ? 'aspect-[16/11] xl:aspect-auto xl:min-h-full' : 'aspect-[4/3]'} overflow-hidden bg-[#eef6fb]`}>
                    <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#008e89]">{categoryOf(post)}</p>
                    <h3 className="editable-display mt-2 line-clamp-3 text-2xl font-extrabold leading-[1.02] text-[#12324a]">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#5a7790]">{getExcerpt(post, index === 0 ? 190 : 105)}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[#084594]">
                      Open post <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {trustItems.map((item) => (
              <div key={item.title} className="rounded-[1.6rem] border border-[#d7e6ef] bg-[#f8fbfe] p-5 text-center shadow-[0_14px_28px_rgba(8,69,148,0.06)]">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#12324a] shadow-[0_10px_24px_rgba(8,69,148,0.08)]">
                  <item.icon className="h-7 w-7" />
                </span>
                <h3 className="editable-display mt-4 text-2xl font-extrabold text-[#12324a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5a7790]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.5rem] border border-[#d7e6ef] bg-white shadow-[0_14px_34px_rgba(8,69,148,0.08)] transition hover:-translate-y-1.5">
      <div className="aspect-[4/3] overflow-hidden bg-[#eef6fb]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
      </div>
      <div className="p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff7f2a]">{categoryOf(post)}</p>
        <h3 className="editable-display mt-2 line-clamp-2 text-2xl font-extrabold leading-tight text-[#12324a]">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5a7790]">{getExcerpt(post, 96)}</p>
      </div>
    </Link>
  )
}

function CompactCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="flex items-start gap-4 rounded-[1.25rem] border border-[#d7e6ef] bg-white p-4 shadow-[0_12px_26px_rgba(8,69,148,0.06)] transition hover:-translate-y-1">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] bg-[#eef6fb]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#008e89]">{categoryOf(post)}</p>
        <h3 className="editable-display mt-1 line-clamp-2 text-lg font-extrabold leading-snug text-[#12324a]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5a7790]">{getExcerpt(post, 84)}</p>
      </div>
    </Link>
  )
}

function HorizontalCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group grid gap-4 overflow-hidden rounded-[1.6rem] border border-[#d7e6ef] bg-white p-4 shadow-[0_16px_30px_rgba(8,69,148,0.07)] transition hover:-translate-y-1.5 sm:grid-cols-[220px_minmax(0,1fr)]">
      <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-[#eef6fb] sm:h-full sm:aspect-auto">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="min-w-0 py-1">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff7f2a]">{categoryOf(post)}</p>
        <h3 className="editable-display mt-2 line-clamp-2 text-[1.85rem] font-extrabold leading-[1.02] text-[#12324a]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#5a7790]">{getExcerpt(post, 160)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#084594]">
          Read more <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function EditorialCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group rounded-[1.3rem] border border-[#d7e6ef] bg-white p-5 shadow-[0_12px_28px_rgba(8,69,148,0.06)] transition hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#10263b] text-sm font-extrabold text-white">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#008e89]">{categoryOf(post)}</p>
          <h3 className="editable-display mt-2 line-clamp-2 text-xl font-extrabold leading-tight text-[#12324a]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5a7790]">{getExcerpt(post, 88)}</p>
        </div>
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = visiblePosts(dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]))
  const featured = pool[0]
  const imageCards = pool.slice(1, 4)
  const compactCards = pool.slice(4, 8)
  const editorialCards = pool.slice(8, 12)
  if (!pool.length) return null

  return (
    <section className="bg-[#fffdf4] py-12 sm:py-14">
      <div className={container}>
        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            {featured ? <HorizontalCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} /> : null}
            <div className="grid gap-4 sm:grid-cols-3">
              {imageCards.map((post) => (
                <ImageFirstCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
              ))}
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-[#d7e6ef] bg-[#f5fbff] p-5 shadow-[0_18px_34px_rgba(8,69,148,0.07)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff7f2a]">Picks for you</p>
                <h2 className="editable-display mt-2 text-3xl font-extrabold text-[#12324a]">A quick shortlist</h2>
              </div>
              <Link href={primaryRoute} className="text-sm font-extrabold text-[#084594] hover:text-[#ff7f2a]">
                See more
              </Link>
            </div>
            <div className="mt-5 grid gap-4">
              {compactCards.map((post) => (
                <CompactCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {editorialCards.map((post, index) => (
                <EditorialCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections.map((section) => ({ ...section, posts: visiblePosts(section.posts) }))
      : ([
          { key: 'spotlight', posts: visiblePosts(posts.slice(0, 8)), href: primaryRoute },
          { key: 'browse', posts: visiblePosts(posts.slice(8, 16)), href: primaryRoute },
          { key: 'index', posts: visiblePosts(posts.slice(16, 24)), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const sectionMeta: Record<string, { title: string; bg: string }> = {
    spotlight: { title: 'Discover new', bg: 'bg-white' },
    browse: { title: 'Top brands', bg: 'bg-[#f6fbff]' },
    index: { title: 'More to explore', bg: 'bg-white' },
  }

  return (
    <>
      {sections.filter((section) => section.posts.length).map((section) => {
        const meta = sectionMeta[section.key] || { title: 'More to explore', bg: 'bg-white' }
        return (
          <section key={section.key} className={`${meta.bg} py-12 sm:py-14`}>
            <div className={container}>
              <div className="flex items-end justify-between gap-4">
                <h2 className="editable-display text-3xl font-extrabold text-[#12324a]">{meta.title}</h2>
                <Link href={section.href || primaryRoute} className="text-sm font-extrabold text-[#084594] hover:text-[#ff7f2a]">
                  See more
                </Link>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => (
                  <ImageFirstCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, section.href || primaryRoute)} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  const badges = [
    { icon: Sparkles, text: 'Playful layout' },
    { icon: BriefcaseBusiness, text: 'Freelancer-ready' },
    { icon: Camera, text: 'Mixed content types' },
    { icon: MapPin, text: 'Easy discovery' },
  ]

  return (
    <section className="border-t border-[#d7e6ef] bg-[#f7fafc]">
      <div className={`${container} py-12 sm:py-14`}>
        <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-[0_18px_40px_rgba(8,69,148,0.08)] lg:grid-cols-[1fr_340px] lg:p-8">
          <div>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <StatPill key={badge.text} icon={badge.icon}>{badge.text}</StatPill>
              ))}
            </div>
            <h2 className="editable-display mt-6 max-w-2xl text-4xl font-extrabold leading-[0.96] text-[#12324a]">
              Ready to share your work, listing, or next big idea?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#5a7790]">
              Publish a listing or post something useful so people can find it while they browse.
            </p>
          </div>
          <div className="rounded-[1.6rem] bg-[#10263b] p-6 text-white shadow-[0_22px_48px_rgba(8,69,148,0.18)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">Start here</p>
            <div className="mt-5 grid gap-3">
              <Link href="/create" className="inline-flex items-center justify-center rounded-full bg-[#ff7f2a] px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-95">
                Create a post
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
