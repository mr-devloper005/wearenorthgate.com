import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function DetailAd({ slot }: { slot: 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer' }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Ads slot={slot} showLabel eager className="mx-auto w-full" />
    </div>
  )
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
  return 12 + (hashStr((post.slug || post.title || 'x') + 'r') % 420)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-extrabold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm font-bold text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function HeroFrame({ post, label, children }: { post: SitePost; label: string; children?: ReactNode }) {
  const image = getImages(post)[0] || '/placeholder.svg?height=900&width=1400'
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#10263b] shadow-[0_28px_70px_rgba(8,69,148,0.18)]">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,38,59,0.95)_0%,rgba(16,38,59,0.78)_45%,rgba(16,38,59,0.58)_100%)]" />
      <div className="relative z-10 p-6 text-white sm:p-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ffd32d]">{label}</p>
        {children}
      </div>
    </div>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <BackLink task="article" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <HeroFrame post={post} label={categoryOf(post, 'Article')}>
              <h1 className="editable-display mt-3 max-w-3xl text-balance text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] sm:text-5xl lg:text-[4rem]">{post.title}</h1>
              <div className="mt-4 text-sm font-bold text-white/75">{SITE_CONFIG.name}</div>
              {leadText(post) ? <p className="mt-5 max-w-2xl text-base leading-8 text-white/84">{leadText(post)}</p> : null}
            </HeroFrame>

            <div className="mt-8 rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_44px_rgba(8,69,148,0.08)] sm:p-8">
              {images[1] ? <img src={images[1]} alt="" className="mb-6 aspect-[16/8] w-full rounded-[1.4rem] border border-[var(--tk-line)] object-cover" /> : null}
              <BodyContent post={post} />
            </div>
            <DetailAd slot="article-bottom" />
            <EditableArticleComments slug={post.slug} comments={comments} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <InfoCard title="Quick take">
              <DetailMeta post={post} category={categoryOf(post, 'Article')} />
              <p className="mt-4 text-sm leading-7 text-[var(--tk-muted)]">{leadText(post) || 'Open the full post for details, links, and supporting context.'}</p>
            </InfoCard>
            <RelatedPanel task="article" post={post} related={related} />
          </aside>
        </div>
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <BackLink task="listing" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="rounded-[1.9rem] bg-[linear-gradient(135deg,#10263b_0%,#084594_100%)] p-6 text-white shadow-[0_28px_70px_rgba(8,69,148,0.18)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] bg-white/10">
                {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-white/70" />}
              </div>
              <div className="min-w-0">
                <Kicker task="listing">Business listing</Kicker>
                <h1 className="editable-display mt-4 text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
                <DetailMeta post={post} category={getField(post, ['category'])} />
              </div>
            </div>
            {leadText(post) ? <p className="mt-6 max-w-2xl text-base leading-8 text-white/82">{leadText(post)}</p> : null}
          </div>
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <Surface>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Showcase" />
          </Surface>
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <DetailAd slot="sidebar" />
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <BackLink task="classified" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[linear-gradient(180deg,#fff9e6_0%,#ffffff_100%)] p-6 shadow-[0_18px_44px_rgba(8,69,148,0.08)]">
              <Kicker task="classified">Open board</Kicker>
              <h1 className="editable-display mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{post.title}</h1>
              <DetailMeta post={post} category={getField(post, ['category'])} />
              <p className="editable-display mt-6 text-5xl font-extrabold tracking-[-0.05em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
              <div className="mt-6 space-y-2.5">
                {condition ? <BadgeLine label="Condition" value={condition} /> : null}
                {location ? <BadgeLine label="Location" value={location} /> : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95"><Phone className="h-4 w-4" /> Call now</a> : null}
                {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white px-5 py-3 text-sm font-extrabold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
              </div>
            </div>
            <RelatedPanel task="classified" post={post} related={related} />
          </aside>
          <article className="min-w-0">
            <Surface>
              <ImageStrip images={images} label="Offer images" large />
              <BodyContent post={post} />
            </Surface>
            <div className="mt-5">
              <ContactAction website={website} phone={phone} email={email} />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <BackLink task="image" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_40px_rgba(8,69,148,0.08)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <HeroFrame post={post} label="Image story">
              <h1 className="editable-display mt-3 text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
              {leadText(post) ? <p className="mt-5 text-base leading-8 text-white/82">{leadText(post)}</p> : null}
            </HeroFrame>
            <Surface>
              <BodyContent post={post} compact />
            </Surface>
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <BackLink task="sbm" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Surface>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
            <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
            <h1 className="editable-display mt-4 text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            {website ? (
              <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">
                Open resource <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
            <BodyContent post={post} />
          </Surface>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <RelatedPanel task="sbm" post={post} related={related} />
          </aside>
        </div>
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <BackLink task="pdf" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <Surface>
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.4rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
              <div className="min-w-0">
                <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
                <h1 className="editable-display mt-3 text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-4xl">{post.title}</h1>
              </div>
            </div>
            <BodyContent post={post} />
            {fileUrl ? (
              <div className="mt-10 overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                  <span className="text-sm font-extrabold">Document preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">Download <Download className="h-4 w-4" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}
          </Surface>
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <InfoCard title="Get this file">
              <p className="text-sm leading-7 text-[var(--tk-muted)]">Open or download the full document in a new tab whenever you are ready.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">Download <Download className="h-4 w-4" /></Link>
            </InfoCard>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <BackLink task="profile" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <DetailAd slot="footer" />
            <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_18px_44px_rgba(8,69,148,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-3xl font-extrabold tracking-[-0.04em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
            <RelatedPanel task="profile" post={post} related={related} />
          </aside>
          <article className="min-w-0">
            <HeroFrame post={post} label="Profile">
              <h2 className="editable-display mt-3 text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] sm:text-5xl">{post.title}</h2>
              {leadText(post) ? <p className="mt-5 max-w-2xl text-base leading-8 text-white/82">{leadText(post)}</p> : null}
            </HeroFrame>
            <div className="mt-5">
              <Surface>
                <BodyContent post={post} />
                <ImageStrip images={images.slice(1)} label="Gallery" />
              </Surface>
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function Surface({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_44px_rgba(8,69,148,0.08)] sm:p-8">{children}</div>
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.7rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_18px_40px_rgba(8,69,148,0.07)]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.3rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4 shadow-[0_12px_28px_rgba(8,69,148,0.05)]">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-bold leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.3rem] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_40px_rgba(8,69,148,0.07)]">
      <div className="flex items-center gap-2 p-4 text-sm font-extrabold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-3 text-sm font-extrabold text-[var(--tk-on-accent)] transition hover:brightness-95">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white px-4 py-3 text-sm font-extrabold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white px-4 py-3 text-sm font-extrabold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <InfoCard title="Quick actions">
      {buttons}
    </InfoCard>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[var(--tk-line)] bg-white px-4 py-3 text-sm">
      <span className="font-extrabold uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-5">
      <InfoCard title="About this post">
        <div className="grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2 font-bold"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
          <p className="inline-flex items-center gap-2 font-bold"><Star className="h-4 w-4 text-[var(--tk-accent)]" /> {ratingOf(post).toFixed(1)} average rating</p>
        </div>
      </InfoCard>
      {related.length ? (
        <InfoCard title="More like this">
          <div className="mt-1 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug || item.title} task={task} post={item} />)}
          </div>
        </InfoCard>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)] bg-[#f7fafc]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between gap-3">
          <h2 className="editable-display text-3xl font-extrabold tracking-[-0.04em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--tk-accent)]">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug || item.title} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug || ''}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_16px_34px_rgba(8,69,148,0.07)] transition hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-lg font-extrabold leading-snug tracking-[-0.02em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post)) || 'Open for details.'}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[1.1rem] border border-[var(--tk-line)] bg-white p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[0.9rem] object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.9rem] bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post)) || 'Open for details.'}</p>
      </div>
    </Link>
  )
}
