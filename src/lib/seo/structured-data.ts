import { MENU_FAQS, MENU_PLANS } from './content';
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from './site';

export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://konnexy.com.br/#organization', name: 'Konnexy', url: 'https://konnexy.com.br' },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL,
      inLanguage: 'pt-BR', publisher: { '@id': 'https://konnexy.com.br/#organization' } },
    { '@type': 'WebPage', '@id': `${SITE_URL}/#webpage`, url: SITE_URL, name: SITE_TITLE,
      description: SITE_DESCRIPTION, inLanguage: 'pt-BR', isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#software` } },
    { '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: SITE_NAME,
      url: SITE_URL, description: SITE_DESCRIPTION, applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web', inLanguage: 'pt-BR',
      publisher: { '@id': 'https://konnexy.com.br/#organization' },
      featureList: ['Cardápio digital com fotos e preços', 'QR Code por mesa', 'Carrinho com envio para o WhatsApp', 'Gestão de produtos e categorias'],
      offers: Object.entries(MENU_PLANS).map(([key, plan]) => ({
        '@type': 'Offer', name: key === 'monthly' ? 'Assinatura mensal' : 'Assinatura anual',
        url: `${SITE_URL}/#precos`, price: plan.price, priceCurrency: 'BRL',
        priceSpecification: { '@type': 'UnitPriceSpecification', price: plan.price, priceCurrency: 'BRL', billingDuration: plan.duration },
      })),
    },
    { '@type': 'FAQPage', '@id': `${SITE_URL}/#faq`, url: `${SITE_URL}/#faq`, inLanguage: 'pt-BR',
      mainEntity: MENU_FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
};
