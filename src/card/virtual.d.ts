declare module 'virtual:card-qr' {
  interface CardQr {
    url: string;
    size: number;
    d: string;
  }
  export const codes: Record<'whatsapp' | 'telegram' | 'wechat' | 'card', CardQr>;
}
