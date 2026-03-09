/**
 * JSON-LD Generator
 * Generates appropriate JSON-LD data based on the page type and provided content
 * Generates JSON-LD data that search engines like Google, Bing, and DuckDuckGo can use to better understand the content of the page.
 * This can improve the page's visibility in search engine results and provide users with additional information about the page.
 */
import { absoluteUrl } from "./absoluteUrl";
import { getLocaleUrlCTM } from "@/lib/utils/i18nUtils";
import trailingSlashChecker from "./trailingSlashChecker";
import social from "@/config/social.json";

// This component dynamically generates appropriate JSON-LD data based on the page type
export type JSONLDProps = {
  canonical?: string; // Canonical URL of the page, used to determine page type
  title?: string; // Title of the page
  description?: string; // Description of the page
  image?: string; // Image URL for blog posts, case studies, or team members
  categories?: string[]; // Categories or tags for blog posts or case studies
  author?: string; // Author for blog posts or case studies
  pageType?: string; // Page type

  [key: string]: any;
};

export default function JsonLdGenerator(content: JSONLDProps, Astro: any) {
  let {
    canonical = "/",
    title = "",
    description = "",
    image = "",
    pageType = "",
    lang,
    alternateLangs = [], // Array of alternate language URLs
    config,
  } = content || {};

  if (!lang) {
    lang = config.settings.multilingual.defaultLanguage;
  }

  // Generate JSON-LD data dynamically based on page type
  let jsonLdData: Record<string, any> = {
    "@context": "https://schema.org",
  };

  // Determine if this is the homepage
  const urlPath = new URL(canonical, config.site.baseUrl || "https://www.netlinks.net").pathname;
  const isHomepage = urlPath === "/" || urlPath === "";

  if (isHomepage) {
    // Organization schema for homepage
    jsonLdData["@type"] = "Organization";
    jsonLdData.name = "NETLINKS";
    jsonLdData.alternateName = "NETLINKS Technology";
    jsonLdData.url = config.site.baseUrl || "https://www.netlinks.net";
    jsonLdData.description = description;
    jsonLdData.foundingDate = "2005";
    jsonLdData.numberOfEmployees = {
      "@type": "QuantitativeValue",
      minValue: 400,
    };
    jsonLdData.hasCredential = [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "ISO 9001 — Quality Management Systems",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "ISO 27001 — Information Security Management",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "ISO 12207 — Software Lifecycle Processes",
      },
    ];
    jsonLdData.knowsAbout = [
      "Odoo ERP Implementation",
      "Custom Software Development",
      "AI & Automation",
      "Digital Transformation",
      "ERP Consulting",
    ];
  } else {
    // WebPage schema for all other pages
    switch (pageType) {
      default:
        jsonLdData["@type"] = "WebPage";
        jsonLdData.name = title;
        jsonLdData.description = description;
        jsonLdData.image = image;
        jsonLdData.url = canonical;

        if (lang) {
          jsonLdData.inLanguage = lang;
        }
    }

    // Add BreadcrumbList for inner pages
    const pathSegments = urlPath.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      const breadcrumbItems = [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: config.site.baseUrl || "https://www.netlinks.net",
        },
      ];
      let currentPath = "";
      pathSegments.forEach((segment: string, index: number) => {
        currentPath += `/${segment}`;
        breadcrumbItems.push({
          "@type": "ListItem",
          position: index + 2,
          name: segment
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          item: `${config.site.baseUrl || "https://www.netlinks.net"}${currentPath}/`,
        });
      });

      jsonLdData.breadcrumb = {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems,
      };
    }
  }

  // Add site metadata to `isPartOf` of jsonLdData
  const siteTitle =
    config.site.title +
    (config.site.tagline &&
      (config.site.taglineSeparator || " - ") + config.site.tagline);

  jsonLdData["isPartOf"] = {
    "@type": "WebSite",
    name: siteTitle,
    description: config.site.description,
    url: trailingSlashChecker(Astro.url.origin),
  };

  // Add alternate languages if provided
  if (alternateLangs.length > 0) {
    jsonLdData.alternateLanguage = alternateLangs
      .filter((alt: any) => Astro.currentLocale !== alt.languageCode)
      .map((alt: any) => ({
        "@type": "WebPage",
        url: getLocaleUrlCTM(canonical, alt.languageCode),
        inLanguage: alt.languageCode,
      }));
  }

  // Add `publisher` to jsonLdData
  jsonLdData.publisher = {
    "@type": "Organization",
    name: config.seo.author,
    url: trailingSlashChecker(Astro.url.origin),
    sameAs: social.main.filter((item) => item.enable).map((item) => item.url),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(config.site.logo, Astro),
    },
  };

  // Utility to remove empty or undefined keys
  return jsonLdData;
}
