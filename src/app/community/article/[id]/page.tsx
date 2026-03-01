import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleClient from './article-client';
import Script from 'next/script';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface ArticleData {
  id: string;
  title: string;
  content: string;
  category: string;
  labels?: string[];
  authorName: string;
  authorPhotoURL?: string;
  userId: string;
  createdAt: any;
  views: number;
}

// ============================================================================
// DATA FETCHING
// ============================================================================
async function getArticleData(id: string): Promise<ArticleData | null> {
  try {
    const projectId = "studio-7363006266-37b51";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/articles/${id}`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    
    const data = await res.json();
    const fields = data.fields;
    
    return {
      id,
      title: fields.title?.stringValue || '',
      content: fields.content?.stringValue || '',
      category: fields.category?.stringValue || '',
      labels: fields.labels?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
      authorName: fields.authorName?.stringValue || '',
      authorPhotoURL: fields.authorPhotoURL?.stringValue,
      userId: fields.userId?.stringValue || '',
      createdAt: fields.createdAt?.timestampValue,
      views: fields.views?.integerValue || 0,
    };
  } catch (e) {
    console.error('❌ Error fetching article data:', e);
    return null;
  }
}

// ============================================================================
// METADATA GENERATION (SEO)
// ============================================================================
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getArticleData(params.id);
  
  if (!data) {
    return {
      title: 'Artikel Tidak Ditemukan - MAIN Q',
      description: 'Halaman artikel yang Anda cari tidak tersedia.',
    };
  }
  
  const canonicalUrl = `https://mainq.my.id/community/article/${params.id}`;
  const metaDescription = data.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...';
  
  return {
    title: `${data.title} - ${data.category} | MAIN Q`,
    description: metaDescription,
    keywords: [data.title, data.category, ...(data.labels || []), 'artikel pendidikan', 'guru indonesia'].join(', '),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: data.title,
      description: metaDescription,
      type: 'article',
      siteName: 'MAIN Q',
      locale: 'id_ID',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: metaDescription,
    },
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default async function ArticlePage({ params }: { params: { id: string } }) {
  const data = await getArticleData(params.id);
  
  if (!data) {
    notFound();
  }

  // Generate Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.content.replace(/<[^>]*>/g, '').substring(0, 160),
    "articleBody": data.content.replace(/<[^>]*>/g, '').substring(0, 1000),
    "author": {
      "@type": "Person",
      "name": data.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "MAIN Q",
      "url": "https://mainq.my.id"
    },
    "datePublished": data.createdAt || new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mainq.my.id/community/article/${data.id}`
    },
    "articleSection": data.category,
    "keywords": (data.labels || []).join(', '),
    "inLanguage": "id"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mainq.my.id" },
      { "@type": "ListItem", "position": 2, "name": "Komunitas", "item": "https://mainq.my.id/community" },
      { "@type": "ListItem", "position": 3, "name": data.category, "item": `https://mainq.my.id/community?category=${data.category.toLowerCase()}` },
      { "@type": "ListItem", "position": 4, "name": data.title }
    ]
  };

  return (
    <>
      {/* JSON-LD: Article Schema */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        strategy="afterInteractive"
      />
      
      {/* JSON-LD: Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />

      <ArticleClient article={data} />
    </>
  );
}
