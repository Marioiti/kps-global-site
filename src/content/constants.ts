/**
 * Value lists shared by the schemas and the pages. Kept apart from schema.ts so that
 * pages can use them without loading the schema library in the browser.
 */
export const DOCUMENT_GROUPS = ['counterparty-pack', 'standard-forms', 'engagement', 'services', 'checklists'] as const;
export const DOCUMENT_ISSUERS = ['kps', 'counterparty', 'supplier'] as const;
export const DOCUMENT_ACCESS = ['on-request', 'preview'] as const;
/** Deal step a document belongs to: the tabs of /documents/. */
export const DOCUMENT_STAGES = ['before-loi', 'before-contract', 'contracts', 'before-payment', 'before-shipment', 'services'] as const;
