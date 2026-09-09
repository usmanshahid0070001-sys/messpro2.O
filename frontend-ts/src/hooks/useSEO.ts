import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: 'index, follow' | 'noindex, nofollow' | 'noindex, follow' | 'index, nofollow';
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_ORIGIN = 'https://messpro.app';
const DEFAULT_TITLE = 'MessPro 2.0 — Smart Hostel & Mess Management System';
const DEFAULT_DESCRIPTION =
  'MessPro 2.0 is a modern SaaS platform designed for university and private hostel mess operations. Automate meal scheduling, QR & biometric attendance, billing, room management, and analytics.';
const DEFAULT_IMAGE = `${DEFAULT_ORIGIN}/pwa-512x512.png`;

function setOrUpdateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setOrUpdateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setOrUpdateStructuredData(data?: Record<string, any> | Array<Record<string, any>>) {
  const SCRIPT_ID = 'seo-structured-data-jsonld';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!data) {
    if (script) {
      script.remove();
    }
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function useSEO(props: SEOProps) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords,
    canonicalUrl,
    robots = 'index, follow',
    ogType = 'website',
    ogImage = DEFAULT_IMAGE,
    structuredData,
  } = props;

  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = title ? (title.includes('MessPro') ? title : `${title} — MessPro 2.0`) : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Standard Meta Tags
    setOrUpdateMetaTag('name', 'title', fullTitle);
    setOrUpdateMetaTag('name', 'description', description);
    setOrUpdateMetaTag('name', 'robots', robots);
    if (keywords) {
      setOrUpdateMetaTag('name', 'keywords', keywords);
    }

    // 3. Canonical Link
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : DEFAULT_ORIGIN;
    const resolvedCanonical = canonicalUrl
      ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${currentOrigin}${canonicalUrl}`)
      : (typeof window !== 'undefined' ? `${currentOrigin}${window.location.pathname}` : DEFAULT_ORIGIN);

    setOrUpdateCanonical(resolvedCanonical);

    // 4. OpenGraph Tags
    setOrUpdateMetaTag('property', 'og:title', fullTitle);
    setOrUpdateMetaTag('property', 'og:description', description);
    setOrUpdateMetaTag('property', 'og:url', resolvedCanonical);
    setOrUpdateMetaTag('property', 'og:type', ogType);
    setOrUpdateMetaTag('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${currentOrigin}${ogImage}`);

    // 5. Twitter Card Tags
    setOrUpdateMetaTag('name', 'twitter:card', 'summary_large_image');
    setOrUpdateMetaTag('name', 'twitter:title', fullTitle);
    setOrUpdateMetaTag('name', 'twitter:description', description);
    setOrUpdateMetaTag('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${currentOrigin}${ogImage}`);

    // 6. JSON-LD Structured Data
    if (structuredData) {
      setOrUpdateStructuredData(structuredData);
    }

    // Cleanup when unmounting / navigating
    return () => {
      // Remove any dynamic JSON-LD when component unmounts if needed
      setOrUpdateStructuredData(undefined);
    };
  }, [title, description, keywords, canonicalUrl, robots, ogType, ogImage, structuredData]);
}
