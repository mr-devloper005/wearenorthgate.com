import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Freelancer directory, listings, and useful finds',
      description: 'Explore profiles, listings, visual inspiration, and practical resources in a bright discovery-first layout.',
      openGraphTitle: 'Freelancer directory, listings, and useful finds',
      openGraphDescription: 'Browse profiles, listings, articles, and visual inspiration through a lively discovery-first experience.',
      keywords: ['freelancer directory', 'profiles', 'classifieds', 'discovery platform'],
    },
    hero: {
      badge: 'Fresh picks for independent work',
      title: ['Find profiles, gigs,', 'and practical resources faster.'],
      description: 'Browse standout freelancer profiles, open listings, visual inspiration, and useful reading without losing your place.',
      primaryCta: { label: 'Explore articles', href: '/article' },
      secondaryCta: { label: 'Browse listings', href: '/listing' },
      searchPlaceholder: 'Search profiles, skills, listings, topics, or tools',
      focusLabel: 'Focus',
      featureCardBadge: 'featured now',
      featureCardTitle: 'Helpful posts, profiles, and listings stay easy to scan.',
      featureCardDescription: 'The homepage highlights fresh opportunities and useful content through a bold directory-style layout.',
    },
    intro: {
      badge: 'How it works',
      title: 'A busier, brighter way to discover people, posts, and opportunities.',
      paragraphs: [
        'The experience blends profile discovery, open listings, articles, and saved resources into one visual system that feels quick to browse.',
        'Instead of sending visitors through one repeating card layout, each section uses a different reading rhythm to make scanning easier.',
        'That means people can move from spotlight content to directories, galleries, and details without losing context.',
      ],
      sideBadge: 'Best for',
      sidePoints: [
        'Freelancers looking for people, tools, and opportunities.',
        'Profiles that need a stronger first impression.',
        'Listings and resources that benefit from quick visual scanning.',
        'Visitors who want variety instead of one repeated template.',
      ],
      primaryLink: { label: 'Browse articles', href: '/article' },
      secondaryLink: { label: 'See listings', href: '/listing' },
    },
    cta: {
      badge: 'Share your work',
      title: 'Add a profile, publish a listing, or share something useful.',
      description: 'Use the site to put your work, services, updates, and resources in front of people already browsing for them.',
      primaryCta: { label: 'Create a post', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'Our Story',
    title: 'A discovery space designed for clearer browsing.',
    description: `${slot4BrandConfig.siteName} brings together profiles, listings, articles, and resources in one playful, easy-to-scan experience.`,
    paragraphs: [
      'The goal is simple: help visitors move between people, ideas, and opportunities without the interface getting in the way.',
      'Every section is built to feel distinct while staying connected, so discovery feels more natural from page to page.',
    ],
    values: [
      {
        title: 'Quick scanning',
        description: 'Layouts are designed to help visitors compare, browse, and decide faster.',
      },
      {
        title: 'Connected sections',
        description: 'Profiles, listings, articles, and resources stay part of one clear system.',
      },
      {
        title: 'Practical discovery',
        description: 'The site favors useful next steps over noise, clutter, or filler copy.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Reach out with a project, question, or partnership idea.',
    description: 'Whether you are sharing a listing, asking about a profile, or looking for the right place to publish, send a note and we will point you in the right direction.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search profiles, listings, topics, and content across the site.',
    },
    hero: {
      badge: 'Search everything',
      title: 'Find profiles, listings, and useful posts quickly.',
      description: 'Use keywords and categories to jump straight to the people, offers, or resources you need.',
      placeholder: 'Search by skill, title, topic, category, or keyword',
    },
    resultsTitle: 'Search results',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Creator access',
      title: 'Login to create a new post.',
      description: 'Sign in to add your profile, share a listing, or publish a useful update for the community.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create content for the sections you use most.',
      description: 'Pick a content type, add the important details, and publish something that is easy to browse and share.',
    },
    formTitle: 'Post details',
    submitLabel: 'Submit post',
    successTitle: 'Your post was submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Member access',
      title: 'Welcome back to your workspace.',
      description: 'Log in to manage submissions, publish new content, and keep your profile up to date.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Site access',
      title: 'Create your account and start sharing.',
      description: 'Join to publish listings, build a profile, and contribute useful content.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested profiles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit site',
    },
  },
} as const
