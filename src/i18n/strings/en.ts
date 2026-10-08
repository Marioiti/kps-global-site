/**
 * English interface strings. Figures, names, contacts and legal details are
 * not written here: they come from src/data/canon.ts through `{placeholders}`.
 */
export const en: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.commodities': 'Commodities',
  'nav.mandates': 'Mandates',
  'nav.documents': 'Documents',
  'nav.insights': 'Insights',
  'nav.news': 'News',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.menuTitle': 'Menu',

  // Common
  'common.comingSoon': 'This section is being prepared.',
  'common.learnMore': 'Learn more',
  'common.feeOnRequest': 'Fee on request',

  // Hero (home)
  'hero.badge': 'Independent advisory · Commodity deals · Fractional COO',
  'hero.title': 'Commodity deals and cross-border operations, run to completion',
  'hero.subtitle':
    '{brand} works on two equal lines: structuring and running commodity deals, and Fractional COO leadership for international projects.',
  'hero.cta': 'Start a conversation',
  'hero.secondaryCta': 'Our services',
  'hero.lineA.label': 'Line A',
  'hero.lineA.title': 'Commodity deal structuring',
  'hero.lineA.desc':
    'Seller and buyer checks, deal structure, the document route and support through discharge.',
  'hero.lineB.label': 'Line B',
  'hero.lineB.title': 'Fractional COO & project management',
  'hero.lineB.desc':
    'Senior operational leadership for international projects: processes, partners and delivery.',
  'hero.suppliersLabel': 'Suppliers',
  'hero.buyersLabel': 'Buyers',

  // Track record
  'stats.caption': 'Team track record since {since}',
  'stats.since': 'Practice since',
  'stats.deals': 'Cross-border transactions',
  'stats.volume': 'Aggregate contract value of mandates',
  'stats.supplierMandates': 'Supplier mandates',

  // History
  'history.label': 'History',
  'history.title': 'One practice, three names',
  'history.lineLabel': 'History of the practice',
  'history.period': 'Period',
  'history.name': 'Company',
  'history.since': 'since {date}',
  'history.merger': 'After a merger with partners',
  'history.note':
    '{legalName} is a new company, registered on {registered}. The practice and the team track record date back to {since}.',

  // Home: placeholders for future sections
  'home.insights.label': 'Insights',
  'home.insights.title': 'Latest insights',
  'home.insights.all': 'All insights',
  'home.mandates.label': 'Mandates',
  'home.mandates.title': 'Open mandates',
  'home.mandates.all': 'All mandates',
  'home.cta.title': 'An offer to check, or a project to run?',
  'home.cta.subtitle': 'Tell us about it. We reply within two business days.',

  // Our role (the block formerly “What we are not”)
  'role.label': 'Our role in a mandate',
  'role.text':
    'In advisory engagements we act as an independent consultant: we do not take title to the cargo, do not sit in the payment chain and do not hold client funds.',

  // About
  'about.sectionLabel': 'Who We Are',
  'about.title': 'Operational depth, without the payroll',
  'about.lead':
    '{brand} is a boutique management-consulting practice. We embed alongside your team to run the operational and transactional work that moves a cross-border deal or project from intent to completion — structuring, counterparty engagement, compliance and documentation — with the discipline of an in-house operator and the independence of an outside adviser.',
  'about.team':
    'The team behind the practice brings together specialists in management, finance, law, international supply and logistics.',
  'about.p1.title': 'Independent by design',
  'about.p1.desc':
    'In advisory engagements we act for our client alone: we do not take title to the cargo, do not sit in the payment chain and do not hold client funds.',
  'about.p2.title': 'Compliance-first',
  'about.p2.desc':
    'Every engagement starts with KYC, sanctions and legal structuring. If a deal cannot be done cleanly, we say so early.',
  'about.p3.title': 'Outcome-focused',
  'about.p3.desc':
    'We are measured by completion, not activity: signed contracts, closed transactions and operations that keep running after we step back.',

  // Founder
  'founder.label': 'Founder',
  'founder.linkedin': 'LinkedIn profile',
  'founder.photoAlt': 'Portrait of {name}',

  // Legal entity
  'legal.label': 'Legal entity',
  'legal.title': 'Company details',
  'legal.company': 'Company',
  'legal.form': 'Legal form',
  'legal.registered': 'Registered',
  'legal.decision': 'Ministry of Law decision',
  'legal.nib': 'NIB (business ID)',
  'legal.kbli': 'Licensed activity (KBLI)',
  'legal.address': 'Registered address',

  // Services overview
  'services.sectionLabel': 'What We Do',
  'services.title': 'Two lines of work, one standard',
  'services.subtitle':
    'Commodity deal structuring and Fractional COO leadership carry equal weight. Compliance and KYC sit under both.',
  'services.supportLabel': 'Under both lines',
  'services.dealStructuring.title': 'Commodity deal structuring and support',
  'services.dealStructuring.desc':
    'We organise cross-border commodity deals under a mandate — from the first offer to discharge at the destination port.',
  'services.fractionalCoo.title': 'Fractional COO & project management',
  'services.fractionalCoo.desc':
    'Part-time, senior operational leadership for ventures and projects that need execution capacity without a full-time hire.',
  'services.complianceKyc.title': 'Compliance, KYC & deal structuring',
  'services.complianceKyc.desc':
    'The governance layer under every deal: KYC/AML, sanctions review, legal structuring and a bank-ready document package.',

  // Engagement model
  'approach.sectionLabel': 'How We Work',
  'approach.title': 'A transparent engagement model',
  'approach.subtitle':
    'Every engagement follows the same disciplined sequence, so you always know what happens next — and what it costs.',
  'approach.step1.title': 'Discovery & Scope',
  'approach.step1.desc': 'We map the project, objectives and constraints, then agree a clear scope and deliverables.',
  'approach.step2.title': 'KYC & Due Diligence',
  'approach.step2.desc': 'Collection and verification of KYC, counterparty and background checks before any engagement.',
  'approach.step3.title': 'Sanctions & Legal Structuring',
  'approach.step3.desc':
    'Sanctions screening (OFAC, EU, UN, UK), source-of-funds and jurisdiction review, and a structure that keeps you compliant — including non-sanctioned origin where required.',
  'approach.step4.title': 'Counterparty Engagement',
  'approach.step4.desc': 'We onboard suppliers and counterparties and run negotiations on your behalf and in your interest.',
  'approach.step5.title': 'Structuring & Documentation',
  'approach.step5.desc': 'Full deal structuring and the complete contract and transaction documentation package.',
  'approach.step6.title': 'Execution Support & Closing',
  'approach.step6.desc':
    'Hands-on support through execution and closing — the principals transact directly; we coordinate, not intermediate.',
  'approach.feeTitle': 'Engagement & fees',
  'approach.feeDesc':
    'Engagements combine a fixed retainer, milestone-based fees for delivered stages, and a success fee on completion. Retainer and milestone fees are earned for work delivered — independent of the final transaction. In these engagements we do not hold client funds and take no position in the payment chain.',

  // Line A: commodity deal structuring
  'deal.label': 'Line A',
  'deal.title': 'Commodity deal structuring and support',
  'deal.lead':
    'We organise cross-border commodity deals from the first offer to discharge at the destination port. We act as the deal organiser under a mandate; the principals contract and pay each other directly.',
  'deal.commoditiesLabel': 'Commodities',
  'deal.originNote':
    'Only goods of non-sanctioned origin. Sanctions screening of all parties is mandatory.',
  'deal.stagesLabel': 'What we do',
  'deal.stagesTitle': 'From the offer to discharge',
  'deal.stage1.title': 'Seller and buyer checks',
  'deal.stage1.desc':
    'KYC on both sides: ownership, authority to sign and source of funds. Sanctions screening (OFAC, EU, UN, UK) of companies, beneficial owners and vessels. Confirmation of the product: origin, specification and evidence that the seller controls the goods.',
  'deal.stage2.title': 'Deal structure',
  'deal.stage2.desc':
    'An Incoterms 2020 basis, payment by documentary letter of credit or SBLC under UCP 600, inspection and quantity and quality terms — a contract that both sides’ banks will accept.',
  'deal.stage3.title': 'Document route',
  'deal.stage3.desc':
    'Who issues which document and when — from the offer and contract through inspection certificates and the bill of lading to the LC presentation — so the payment conditions can actually be met.',
  'deal.stage4.title': 'Support through discharge',
  'deal.stage4.desc':
    'We coordinate the parties, inspectors and logistics through loading, voyage and discharge, and keep the document chain clean until payment.',
  'deal.productsLabel': 'Fixed scope',
  'deal.productsTitle': 'Two fixed-scope products',
  'deal.productsSubtitle': 'A defined scope and turnaround. The fee is agreed before work starts.',
  'deal.offerCheck.summary': 'One offer, a written verdict.',
  'deal.offerCheck.desc':
    'We review one supplier offer: who the seller is and whether they can sign, the product and its origin, the Incoterms basis and payment terms, and the warning signs typical of fraudulent offers. You receive a written verdict — real, fixable or walk away — with the reasons.',
  'deal.offerCheck.turnaround': 'Turnaround: {hours} hours',
  'deal.healthCheck.summary': 'A review of a live or stalled deal.',
  'deal.healthCheck.desc':
    'We go through the contract, the payment instrument, the document chain and the counterparties of a deal that is under way or has stopped, and identify what blocks it. You receive a written report with the causes and a step-by-step plan to close the deal or exit it.',
  'deal.healthCheck.turnaround': 'Turnaround: up to {days} working days',
  'deal.request': 'Request {product}',

  // Line B: Fractional COO
  'coo.label': 'Line B',
  'coo.title': 'Fractional COO and project management',
  'coo.lead':
    'We step in as your Fractional COO to build and run operations for international ventures and projects: setting up processes, coordinating partners and vendors, standing up cross-border structures and driving delivery to completion. For founders and investors entering new markets who need seasoned operational leadership on a flexible, retained basis.',
  'coo.areasLabel': 'What we take on',
  'coo.areasTitle': 'Operational leadership, scoped to the project',
  'coo.area1.title': 'Operations set-up',
  'coo.area1.desc': 'Processes, reporting and controls, so the project runs on a clear operating rhythm.',
  'coo.area2.title': 'Partners and vendors',
  'coo.area2.desc': 'Selecting and coordinating contractors, suppliers and advisers across jurisdictions.',
  'coo.area3.title': 'Project delivery',
  'coo.area3.desc':
    'Budget, schedule and contractor management through to completion.',
  'coo.area4.title': 'Cross-border structures',
  'coo.area4.desc':
    'Working with local advisers on entities, banking and compliance so the structure supports the operation.',
  'coo.formatTitle': 'Format',
  'coo.formatDesc':
    'A retained, part-time engagement with an agreed scope, milestones and reporting line. We work inside your team and hand over a running operation.',

  // Compliance & KYC
  'compliance.label': 'Under both lines',
  'compliance.title': 'Compliance, KYC and deal structuring',
  'compliance.lead':
    'We build the compliance and legal backbone of your transaction: KYC and counterparty due diligence, sanctions screening, source-of-funds and jurisdiction review, and structuring aligned with anti-bribery standards and applicable data-protection law — so the deal stands up to a bank’s or counterparty’s scrutiny.',
  'compliance.itemsLabel': 'What we cover',
  'compliance.itemsTitle': 'The checks a bank expects to see',
  'compliance.kyc.title': 'KYC & AML',
  'compliance.kyc.desc':
    'Identity, ownership, authority to sign and source of funds for every counterparty, before any engagement.',
  'compliance.sanctions.title': 'Sanctions screening',
  'compliance.sanctions.desc':
    'OFAC, EU, UN and UK screening of companies, beneficial owners and, in commodity deals, vessels and origin.',
  'compliance.bankPack.title': 'Bank-ready package',
  'compliance.bankPack.desc':
    'KYC documents, ownership charts, source-of-funds evidence and transaction documents assembled the way a compliance officer expects.',
  'compliance.structure.title': 'Legal structuring',
  'compliance.structure.desc':
    'Contract and jurisdiction structure aligned with the FCPA, the UK Bribery Act and applicable data-protection law.',

  // Where we operate
  'sectors.sectionLabel': 'Sectors & Reach',
  'sectors.title': 'Where we operate',
  'sectors.subtitle': 'A narrow focus: a short list of commodities and one corridor, plus international project delivery.',
  'sectors.industries.title': 'Sectors',
  'sectors.industries.projects': 'International project delivery and management.',
  'sectors.presenceTitle': 'Offices and corridor',
  'sectors.officesLabel': 'Offices',
  'sectors.corridorLabel': 'Deal corridor',

  // Governance
  'governance.sectionLabel': 'Governance',
  'governance.title': 'Compliance is the foundation, not an afterthought',
  'governance.subtitle':
    'The standards we apply on every engagement — the reason the deals we work on survive due diligence.',
  'governance.kyc.title': 'KYC & AML',
  'governance.kyc.desc': 'Identity, ownership and source-of-funds checks on every counterparty before we engage.',
  'governance.sanctions.title': 'Sanctions screening',
  'governance.sanctions.desc':
    'OFAC, EU, UN and UK screening of all parties. We decline or exit any engagement with sanctions exposure.',
  'governance.anticorruption.title': 'Anti-bribery',
  'governance.anticorruption.desc': 'Conduct aligned with the FCPA and the UK Bribery Act — legitimate representation only.',
  'governance.data.title': 'Data protection',
  'governance.data.desc': 'Personal data handled under Indonesia’s Personal Data Protection Law (UU PDP).',

  // Contact
  'contact.sectionLabel': 'Contact',
  'contact.title': 'Start a conversation',
  'contact.subtitle': 'Tell us about your project or transaction. We reply within two business days.',
  'contact.name': 'Name',
  'contact.namePlaceholder': 'Full name',
  'contact.company': 'Company & jurisdiction',
  'contact.companyPlaceholder': 'e.g. Acme Trading Ltd, Singapore',
  'contact.role': 'I am contacting you as',
  'contact.rolePlaceholder': 'Select your role',
  'contact.roleBuyer': 'Buyer',
  'contact.roleSeller': 'Seller',
  'contact.roleInvestor': 'Investor',
  'contact.roleOther': 'Other',
  'contact.topic': 'Topic',
  'contact.topicPlaceholder': 'e.g. Offer Check, a mandate or a document',
  'contact.message': 'How can we help?',
  'contact.messagePlaceholder': 'A few lines about your project, deal or goal.',
  'contact.privacyPrefix': 'I consent to the processing of my personal data in accordance with the ',
  'contact.privacyLink': 'Privacy Policy',
  'contact.privacySuffix': '.',
  'contact.submit': 'Send message',
  'contact.submitting': 'Sending…',
  'contact.error': 'Failed to send. Please try again or email us at {email}.',
  'contact.directLabel': 'Or reach us directly',
  'contact.whatsappLabel': 'WhatsApp',
  'contact.telegramLabel': 'Telegram',
  'contact.wechatLabel': 'WeChat ID',
  'contact.linkedinCompany': 'LinkedIn — company',
  'contact.linkedinFounder': 'LinkedIn — founder',

  // Footer
  'footer.tagline': 'Commodity deal structuring · Fractional COO',
  'footer.registered':
    '{brand} is the brand of {legalName}, a management-consulting company registered in Indonesia. In advisory engagements we act as an independent consultant: we do not take title to the cargo, do not sit in the payment chain and do not hold client funds.',
  'footer.kbliLabel': 'Management Consulting',
  'footer.privacy': 'Privacy Policy',
  'footer.rights': 'All rights reserved.',
  'footer.trust1': 'Independent',
  'footer.trust2': 'Compliance-first',
  'footer.trust3': 'Reputation over speed',


  // SEO (page <head>)
  'seo.titleSuffix': '{title} — {brand}',
  'seo.home.title': '{brand} — Commodity Deal Structuring & Fractional COO',
  'seo.home.description':
    'Independent advisory on two lines: structuring and running commodity deals between the Gulf, Central Asia, China and Southeast Asia, and Fractional COO leadership.',
  'seo.home.socialDescription':
    'Commodity deal structuring and Fractional COO leadership for cross-border projects. Independent, compliance-first.',
  'seo.services.description':
    'Two equal lines of work — commodity deal structuring and Fractional COO leadership — with compliance and KYC under both.',
  'seo.dealStructuring.description':
    'Seller and buyer checks, Incoterms 2020 and LC/SBLC structure, document route and support through discharge for aluminium, LNG, sulphur, copper and diesel.',
  'seo.fractionalCoo.description':
    'Part-time senior operational leadership for international ventures and projects: operations set-up, partners, delivery and cross-border structures.',
  'seo.complianceKyc.description':
    'KYC/AML, sanctions screening, legal structuring and a bank-ready document package for cross-border transactions.',
  'seo.about.description':
    'The practice behind {brand}: history, founder, team, governance and company details of {legalName}.',
  'seo.contact.description':
    'Contact {brand} about a commodity deal, an offer to check or a project that needs a Fractional COO.',
  'seo.privacy.description':
    'How {legalName} handles personal data collected through kpsglobal.id, in line with Indonesia’s Personal Data Protection Law (UU PDP).',
  'seo.stub.description': '{title}: this section of {brand} is being prepared.',
  'seo.ogImageAlt': '{brand} — commodity deal structuring and Fractional COO',

  // Privacy Policy
  'privacy.title': 'Privacy Policy',
  'privacy.backHome': 'Back to Home',
  'privacy.lastUpdatedLabel': 'Last updated',
  'privacy.lastUpdatedDate': '8 October 2026',
  'privacy.intro': `{brand} is the brand of **{legalName}** ("KPS", "we", "us"), a management-consulting company registered in the Republic of Indonesia. This Policy explains how we handle personal data collected through this website (kpsglobal.id), in line with **Law of the Republic of Indonesia No. 27 of 2022 on Personal Data Protection (UU PDP)** and internationally recognised data protection principles.\n\nThis Policy covers only the personal data we collect through this website. Data processed under separate business or agency agreements is governed by those agreements and their own data-protection terms.`,

  'privacy.s1.title': '1. Data We Collect',
  'privacy.s1.body': `When you submit the contact form, we collect the information you provide:\n\n- Your name and email address\n- Company and country\n- The role in which you contact us (buyer, seller, investor, intermediary or other)\n- The commodity, the topic and the documents you request\n- The content of your message\n\nWe also automatically record limited technical data when you submit the form: an approximate timestamp, the selected interface language, the page from which the form was sent, browser user-agent, and the IP address seen by our form provider. We do **not** knowingly collect special-category data (health, religion, biometrics) and ask that you do not include such data in free-text fields.`,

  'privacy.s2.title': '2. Why We Process Your Data',
  'privacy.s2.body': `We process your personal data to:\n\n- Respond to and evaluate your enquiry\n- Carry out counterparty due diligence (KYC) and compliance screening\n- Prepare and perform contracts and consulting engagements\n- Keep records required for legal and accounting purposes`,

  'privacy.s3.title': '3. Legal Basis',
  'privacy.s3.body': `We rely on your **consent** (given when you tick the consent box and submit the form), on the necessity of taking **steps prior to entering into a contract** at your request, and on our **legitimate interest** in assessing and conducting business engagements — as permitted under the UU PDP.`,

  'privacy.s4.title': '4. Sharing & International Transfers',
  'privacy.s4.body': `We do not sell your personal data. We share it only with service providers who help us operate this website and communications, and with professional advisers where necessary.\n\nOur contact form is delivered through **Formspree**, a form-processing service operated from the United States, and via our email provider. This means data submitted through the form is transferred to and stored on servers outside Indonesia. We take reasonable steps to ensure such transfers are subject to appropriate safeguards and a level of protection consistent with the UU PDP.`,

  'privacy.s5.title': '5. Data Retention',
  'privacy.s5.body': `We keep personal data only for as long as necessary for the purposes above: enquiry and due-diligence records for up to five (5) years from our last interaction, and contract-related data for the term of the contract plus the applicable limitation period. After that, data is deleted or anonymised.`,

  'privacy.s6.title': '6. Your Rights',
  'privacy.s6.body': `Subject to the UU PDP, you may request to access, correct, update, delete, or restrict the processing of your personal data, withdraw your consent at any time, and object to certain processing. To exercise any of these rights, contact us using the details in Section 9. We respond within the timeframe required by applicable law.`,

  'privacy.s7.title': '7. Cookies & Tracking',
  'privacy.s7.body': `This website does **not** use cookies, local storage or tracking tools. The interface language is part of the page address (for example, /ru/ or /zh/), so nothing about your visit is stored in your browser.\n\nFonts, images and scripts are served from this website itself; pages do not load resources from third-party servers. The only external service is Formspree (see Section 4), and only when you submit the contact form.`,

  'privacy.s8.title': '8. Data Security',
  'privacy.s8.body': `We apply technical and organisational measures appropriate to the risk, including encryption in transit (TLS), access on a need-to-know basis, and a prohibition on storing personal data permanently in email or messengers. No method of transmission over the internet is completely secure, but we work to protect your data at all times.`,

  'privacy.s9.title': '9. Contact Us',
  'privacy.s9.body': `For any privacy question or to exercise your rights, contact:\n\n**{legalName} ({brand})**\n{address}\nE-mail: {email}`,

  'privacy.s10.title': '10. Changes to This Policy',
  'privacy.s10.body': `We review this Policy at least annually and whenever our processing operations or applicable law change. The current version is always available on this page, with the "Last updated" date shown above.`,

  // Content: insights and news
  'insights.lead': 'Notes on commodity deals and cross-border operations: what to check, and why.',
  'insights.empty': 'The first articles are being prepared.',
  'insights.noMatches': 'No articles match these filters.',
  'filter.line': 'Line',
  'filter.commodity': 'Commodity',
  'filter.all': 'All',
  'filter.reset': 'Reset filters',
  'line.deals': 'Commodity deals',
  'line.operations': 'Operations',
  'news.lead': 'New mandates, services, documents and events.',
  'news.empty': 'The first news items are being prepared.',
  'news.kind.mandate': 'Mandate',
  'news.kind.service': 'Service',
  'news.kind.document': 'Document',
  'news.kind.event': 'Event',
  'article.readingTime': '{minutes} min read',
  'article.author': 'Author',
  'article.discussTitle': 'Discuss on LinkedIn',
  'article.discussText': 'This piece is also posted on LinkedIn. Questions and comments are welcome there.',
  'article.discussLink': 'Open the LinkedIn post',
  'article.related': 'Related materials',
  'article.fallbackNote': 'This text is not yet available in your language; the English original is shown below.',
  'article.backInsights': 'All insights',
  'article.backNews': 'All news',
  'article.ctaTitle': 'Working on a deal like this?',
  'article.ctaSubtitle': 'Send us the offer or the structure. We reply within two business days.',
  'feed.title': '{brand} — insights and news',
  'feed.description': 'Insights on commodity deals and cross-border operations, and news from {brand}.',
  'feed.insights': 'Insight',
  'feed.news': 'News',
  'seo.insights.description': 'Insights from {brand} on commodity deals and cross-border operations: offers, structures, documents and checks.',
  'seo.news.description': 'News from {brand}: new mandates, services, documents and events.',

  // Commodities and procedures
  'nav.procedures': 'Procedures',
  'commodities.title': 'Commodities we work with',
  'commodities.lead': 'For each commodity: how the buyer and its bank see the deal, what we check at the seller, the usual structure, the document route and where these deals stall.',
  'commodities.proceduresText': 'The order of a deal step by step: who acts, with which document, and what the other side receives.',
  'commodities.proceduresLink': 'Deal procedures',
  'commodity.dealTitle': 'The deal from the buyer’s side',
  'commodity.checksLabel': 'Seller checks',
  'commodity.checksTitle': 'What we check at the seller',
  'commodity.structureLabel': 'Structure',
  'commodity.structureTitle': 'Typical structure',
  'commodity.basis': 'Delivery basis',
  'commodity.payment': 'Payment instrument',
  'commodity.inspection': 'Inspection',
  'commodity.routeLabel': 'Documents',
  'commodity.routeTitle': 'Document route, step by step',
  'commodity.stallsLabel': 'Risks',
  'commodity.stallsTitle': 'Where these deals stall',
  'commodity.related': 'Related',
  'commodity.ctaTitle': 'Have a deal in this commodity?',
  'commodity.ctaLabel': 'Discuss the deal',
  'procedures.lead': 'The order of a deal step by step: who acts, with which document, and what the other side receives.',
  'procedures.empty': 'The first procedures are being prepared.',
  'procedures.back': 'All procedures',
  'procedures.audience.buyer': 'For buyers',
  'procedures.audience.seller': 'For sellers',
  'procedures.audience.investor': 'For investors',
  'procedure.actor': 'Who acts',
  'procedure.document': 'Document',
  'procedure.receives': 'The other side receives',
  'deal.crossTitle': 'By commodity and step by step',
  'deal.crossCommodities': 'Commodity pages: what we check and how the documents move for each commodity.',
  'deal.crossProcedures': 'Deal procedures: who acts, with which document, at each step.',
  'seo.commodities.description': 'Aluminium, LNG, sulphur, copper and diesel: seller checks, deal structure, document route and where commodity deals stall.',
  'seo.procedures.description': 'Step-by-step procedures for commodity deals: who acts, with which document, and what the other side receives.',

  // Mandates
  'mandates.lead': 'Anonymised mandates: commodity, volume, delivery basis, origin region, payment instrument and status. Details after KYC.',
  'mandates.empty': 'The first mandates are being prepared.',
  'mandates.noMatches': 'No mandates match these filters.',
  'filter.side': 'Side',
  'filter.status': 'Status',
  'mandate.label': 'Mandate',
  'mandate.cardTitle': '{side}: {commodity}',
  'mandate.side.supply': 'Supply',
  'mandate.side.demand': 'Demand',
  'mandate.status.open': 'Open',
  'mandate.status.in-work': 'In work',
  'mandate.status.closed': 'Closed',
  'mandate.region.Gulf': 'Gulf',
  'mandate.region.Central Asia': 'Central Asia',
  'mandate.region.Southeast Asia': 'Southeast Asia',
  'mandate.region.Other': 'Other',
  'mandate.instrument.DLC': 'Documentary LC',
  'mandate.instrument.SBLC': 'SBLC',
  'mandate.instrument.DLC or SBLC': 'Documentary LC or SBLC',
  'mandate.field.id': 'Number',
  'mandate.field.commodity': 'Commodity',
  'mandate.field.side': 'Side',
  'mandate.field.volume': 'Volume',
  'mandate.field.basis': 'Delivery basis',
  'mandate.field.originRegion': 'Origin region',
  'mandate.field.instrument': 'Payment instrument',
  'mandate.field.status': 'Status',
  'mandate.field.published': 'Published',
  'mandate.field.validUntil': 'Valid until',
  'mandate.processLabel': 'Getting the details',
  'mandate.processTitle': 'Request, KYC, NDA, details',
  'mandate.step1.title': 'Request',
  'mandate.step1.desc': 'Send a request with the mandate number and the role in which you contact us.',
  'mandate.step2.title': 'KYC',
  'mandate.step2.desc': 'We verify your company, its ownership and the signatory, and screen the parties against sanctions lists.',
  'mandate.step3.title': 'NDA',
  'mandate.step3.desc': 'The parties sign a non-disclosure agreement before any detail of the mandate is shared.',
  'mandate.step4.title': 'Details',
  'mandate.step4.desc': 'You receive the details of the mandate and the next steps of the deal.',
  'mandate.proceduresLink': 'How a deal runs, step by step',
  'mandate.role': '{brand} acts under a mandate as an independent consultant; the parties contract and pay each other directly.',
  'mandate.requestTitle': 'Request the details',
  'mandate.requestSubtitle': 'The mandate number is already in the topic. We reply within two business days.',
  'mandate.back': 'All mandates',
  'mandate.news.title': '{side}: {commodity}, mandate {id}',
  'mandate.news.link': 'Mandate details and request form',
  'seo.mandates.description': 'Anonymised commodity mandates from {brand}: commodity, volume, delivery basis, origin region, payment instrument and status.',
  'seo.mandate.title': 'Mandate {id}: {side}, {commodity}',

  // Document library
  'documents.lead': 'How the documents of a deal fit together: what each one is, who issues it and at which step. Files are sent on request, with a watermark for the recipient.',
  'documents.empty': 'The document library is being prepared.',
  'filter.group': 'Group',
  'documents.group.counterparty-pack': 'Counterparty pack',
  'documents.group.standard-forms': 'Standard forms',
  'documents.group.engagement': 'Engagement agreements',
  'documents.group.services': 'Service one-pagers',
  'documents.group.checklists': 'Checklists by deal step',
  'documents.issuer.kps': '{brand}',
  'documents.issuer.counterparty': 'The counterparty',
  'documents.issuer.supplier': 'The supplier',
  'documents.access.on-request': 'Description online, file on request',
  'documents.access.preview': 'Preview online, file on request',
  'documents.field.issuer': 'Issued by',
  'documents.field.dealStep': 'Deal step',
  'documents.field.access': 'Access',
  'documents.field.version': 'Version',
  'documents.field.date': 'Date',
  'documents.field.turnaround': 'Turnaround',
  'documents.whatItIs': 'What it is',
  'documents.contents': 'What is inside',
  'documents.preview': 'Preview',
  'documents.previewSoon': 'Preview coming soon.',
  'documents.previewAlt': '{title}, page {n}: preview with watermark',
  'documents.request': 'Request',
  'documents.requestText': 'After a request we send the document and the terms of engagement by email.',
  'documents.disclaimer': 'Information material. Not an offer, not legal advice. Confidential.',
  'documents.jva': 'Joint Venture Agreement — for investors, by arrangement.',
  'documents.back': 'All documents',
  'documents.related': 'Documents',
  'documents.version': 'Version {version}',
  'home.documents.label': 'Documents & procedures',
  'home.documents.title': 'Documents & procedures',
  'home.documents.all': 'All documents',
  'procedure.request': 'Request procedure form',
  'seo.documents.description': 'The document library of {brand}: counterparty pack, standard forms, engagement agreements, service one-pagers and checklists by deal step.',

  // Request form
  'contact.roleIntermediary': 'Intermediary',
  'contact.country': 'Country',
  'contact.countryPlaceholder': 'Country of the company',
  'contact.email': 'Email',
  'contact.emailPlaceholder': 'name@company.com',
  'contact.commodity': 'Commodity',
  'contact.commodityPlaceholder': 'Select a commodity',
  'contact.commodityOther': 'Other or not applicable',
  'contact.documents': 'Documents',
  'contact.documentsHint': 'Select the documents you need, if any.',
  'contact.success': 'Thank you. We reply from {email} with the documents and terms of engagement.',
  'contact.noForm': 'Send your request to {email}: your name, company, country, role and the documents you need.',
  'contact.emailUs': 'Email {email}',
};
