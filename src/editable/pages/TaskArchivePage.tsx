import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const placeholder = '/placeholder.svg?height=900&width=1200'

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo) || asText(content.avatar)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body) || 'Details inside.')
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((4 + (hashStr(post.slug || post.id || post.title || 'x') % 9) / 10) * 10) / 10
}

const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 8 + (hashStr((post.slug || post.title || 'x') + 'r') % 380)
}

function Stars({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-bold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const featured = posts[0]
  const quickLinks = posts.slice(1, 6)
  const archiveAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed'> = {
    article: 'header',
    profile: 'sidebar',
    listing: 'in-feed',
    classified: 'header',
    image: 'in-feed',
    sbm: 'sidebar',
    pdf: 'header',
  }

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="border-b border-[var(--tk-line)] bg-[linear-gradient(180deg,#eef5ff_0%,#fffdf4_100%)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_20px_46px_rgba(8,69,148,0.08)]">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{theme.kicker}</p>
                <h1 className="editable-display mt-3 text-4xl font-extrabold leading-[0.96] tracking-[-0.05em]">{voice?.headline || `Browse ${label}`}</h1>
                <p className="mt-4 text-sm leading-7 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
                <div className="mt-5 grid gap-2 text-sm font-bold text-[var(--tk-text)]">
                  <div className="rounded-[1rem] bg-[var(--tk-raised)] px-4 py-3">{posts.length} live results</div>
                  <div className="rounded-[1rem] bg-[var(--tk-raised)] px-4 py-3">{categoryLabel}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.8rem] bg-[#10263b] p-5 text-white shadow-[0_26px_60px_rgba(8,69,148,0.18)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">Search and filter</p>
                      <p className="mt-1 text-sm text-white/75">Switch categories without leaving the archive view.</p>
                    </div>
                    <form action={basePath} className="flex flex-col gap-2 sm:flex-row">
                      <div className="relative">
                        <select
                          name="category"
                          defaultValue={category}
                          className="h-12 appearance-none rounded-full border border-white/15 bg-white px-4 pr-10 text-sm font-bold text-[#12324a] outline-none"
                          aria-label={voice?.filterLabel || 'Filter category'}
                        >
                          <option value="all">All categories</option>
                          {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e8aa0]" />
                      </div>
                      <button className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--tk-accent)] px-5 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">
                        Apply
                      </button>
                    </form>
                  </div>
                  {quickLinks.length ? (
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/70">
                      {quickLinks.map((post) => (
                        <Link key={post.id || post.slug || post.title} href={`${basePath}/${post.slug || ''}`} className="hover:text-[#ffd32d]">
                          {post.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                {featured ? <FeaturedArchiveCard task={task} basePath={basePath} post={featured} /> : null}
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={archiveAdSlot[task]} showLabel eager className="mx-auto w-full" />
          </div>
          {posts.length ? (
            <div className={task === 'image' ? 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3' : 'grid gap-5 lg:grid-cols-12'}>
              {posts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug || `${task}-${index}`} post={post} task={task} basePath={basePath} index={index} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[1.8rem] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center shadow-[0_18px_40px_rgba(8,69,148,0.06)]">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-3xl font-extrabold tracking-[-0.04em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 font-extrabold transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full bg-[var(--tk-raised)] px-5 py-3 font-extrabold text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full bg-[var(--tk-accent)] px-5 py-3 font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function hrefFor(task: TaskKey, basePath: string, post: SitePost) {
  if (post.slug) return `${basePath}/${post.slug}`
  return buildPostUrl(task, post.slug || '')
}

function FeaturedArchiveCard({ task, basePath, post }: { task: TaskKey; basePath: string; post: SitePost }) {
  return (
    <Link href={hrefFor(task, basePath, post)} className="group block overflow-hidden rounded-[1.9rem] bg-[var(--tk-surface)] shadow-[0_24px_60px_rgba(8,69,148,0.12)]">
      <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="min-h-[260px] overflow-hidden bg-[var(--tk-raised)]">
          <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </div>
        <div className="bg-[linear-gradient(135deg,#10263b_0%,#084594_100%)] p-6 text-white">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">{getCategory(post, 'Featured')}</p>
          <h2 className="editable-display mt-3 line-clamp-3 text-3xl font-extrabold leading-[0.98] tracking-[-0.04em]">{post.title}</h2>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/78">{getSummary(post)}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#12324a]">
            Open feature <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = hrefFor(task, basePath, post)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const wide = index % 5 === 0
  return (
    <Link href={href} className={`group overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_42px_rgba(8,69,148,0.08)] transition hover:-translate-y-1.5 ${wide ? 'lg:col-span-8' : 'lg:col-span-4'}`}>
      <div className={`grid gap-0 ${wide ? 'md:grid-cols-[1fr_0.95fr]' : ''}`}>
        <div className={`overflow-hidden bg-[var(--tk-raised)] ${wide ? 'aspect-[16/12] md:aspect-auto' : 'aspect-[4/3]'}`}>
          <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tk-accent)]">
            <span>{getCategory(post, 'Article')}</span>
            <span className="text-[var(--tk-muted)]">No. {String(index + 1).padStart(2, '0')}</span>
          </div>
          <h2 className="editable-display mt-3 text-3xl font-extrabold leading-[1.02] tracking-[-0.04em]">{post.title}</h2>
          <Stars post={post} />
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
          <CardArrow label="Read article" />
        </div>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className="group lg:col-span-6">
      <div className="flex h-full items-center gap-5 rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 shadow-[0_16px_38px_rgba(8,69,148,0.07)] transition hover:-translate-y-1.5">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
          {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="editable-display truncate text-2xl font-extrabold tracking-[-0.03em]">{post.title}</h2>
          <Stars post={post} />
          <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[var(--tk-muted)]">
            {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
            {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
            {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}</span> : null}
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className="group lg:col-span-4">
      <div className="flex h-full flex-col rounded-[1.6rem] border border-[var(--tk-line)] bg-[linear-gradient(180deg,#ffffff_0%,#fff9ec_100%)] p-6 shadow-[0_18px_40px_rgba(8,69,148,0.07)] transition hover:-translate-y-1.5">
        <div className="flex items-start justify-between gap-4">
          <span className="editable-display text-3xl font-extrabold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
          {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
        </div>
        <h2 className="editable-display mt-5 text-2xl font-extrabold leading-snug tracking-[-0.03em]">{post.title}</h2>
        <Stars post={post} />
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-bold text-[var(--tk-muted)]">
          <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_16px_34px_rgba(8,69,148,0.08)] transition hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(16,38,59,0.88))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ffd32d]">{getCategory(post, 'Image')}</p>
          <h2 className="editable-display line-clamp-2 text-xl font-extrabold leading-snug tracking-[-0.03em] text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-white/75">View image <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group lg:col-span-4">
      <div className="flex h-full gap-4 rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_16px_34px_rgba(8,69,148,0.07)] transition hover:-translate-y-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Globe className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--tk-muted)]">Saved {String(index + 1).padStart(2, '0')}</span>
          <h2 className="editable-display mt-1.5 text-xl font-extrabold leading-snug tracking-[-0.03em]">{post.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
          {website ? <p className="mt-3 truncate text-xs font-extrabold text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
        </div>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group lg:col-span-4">
      <div className="flex h-full flex-col rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_16px_34px_rgba(8,69,148,0.07)] transition hover:-translate-y-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-6 w-6" /></div>
          <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tk-muted)]">{getCategory(post, 'Document')}</span>
        </div>
        <h2 className="editable-display mt-6 text-2xl font-extrabold leading-snug tracking-[-0.03em]">{post.title}</h2>
        <Stars post={post} />
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="group lg:col-span-3">
      <div className="flex h-full flex-col items-center rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 text-center shadow-[0_16px_34px_rgba(8,69,148,0.07)] transition hover:-translate-y-1">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
        </div>
        <h2 className="editable-display mt-5 text-xl font-extrabold tracking-[-0.03em]">{post.title}</h2>
        {role ? <p className="mt-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
        <Stars post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}
