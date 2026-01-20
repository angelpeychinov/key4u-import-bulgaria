import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

const defaultSEO = {
  siteName: 'Key4U',
  title: 'Key4U - Внос на автомобили от Канада и САЩ | България',
  description: 'Внос на луксозни автомобили от Канада и САЩ в България. Пълна услуга от заявка до доставка - BMW, Mercedes, Audi, Tesla. Достъпен лукс с местна експертиза.',
  siteUrl: 'https://key4u.bg',
  ogImage: 'https://key4u.bg/og-image.jpg',
};

export function SEO({
  title,
  description = defaultSEO.description,
  canonicalUrl,
  ogImage = defaultSEO.ogImage,
  ogType = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Key4U България`
    : defaultSEO.title;
  
  const canonical = canonicalUrl || defaultSEO.siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="bg" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="внос на автомобили, внос на коли, коли от Канада, коли от САЩ, Key4U, внос автомобили България, BMW внос, Mercedes внос, Audi внос, Tesla внос, луксозни автомобили внос, употребявани коли внос" />
      <meta name="author" content="Key4U" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={defaultSEO.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="bg_BG" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="geo.region" content="BG" />
      <meta name="geo.placename" content="България" />
      <meta name="language" content="Bulgarian" />
    </Helmet>
  );
}

// JSON-LD Structured Data Component
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Key4U",
    "description": "Внос на луксозни автомобили от Канада и САЩ в България. Пълна услуга от заявка до доставка.",
    "url": "https://key4u.bg",
    "logo": "https://key4u.bg/logo.png",
    "image": "https://key4u.bg/og-image.jpg",
    "telephone": "+359898252434",
    "email": "key4uimport@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "София",
      "addressCountry": "BG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "42.6977",
      "longitude": "23.3219"
    },
    "areaServed": {
      "@type": "Country",
      "name": "България"
    },
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.facebook.com/key4uimport",
      "https://www.instagram.com/key4u.import"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "100"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Service Schema for Car Import
export function CarImportServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Внос на автомобили",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Key4U"
    },
    "name": "Внос на автомобили от Канада и САЩ",
    "description": "Професионален внос на луксозни автомобили от Канада и САЩ. Включва търсене, покупка, транспорт, митническо обслужване и регистрация в България.",
    "areaServed": {
      "@type": "Country",
      "name": "България"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Внос на автомобили",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Внос на автомобили от Канада"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Внос на автомобили от САЩ"
          }
        }
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// FAQ Schema
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
