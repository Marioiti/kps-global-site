/** "USD 1,000" (with a no-break space) → { currency: "USD", amount: 1000 }. */
export const parsePrice = (price: string) => {
  const [currency, amount] = price.replace(/\u00a0/g, ' ').split(' ');
  return { currency, amount: Number(amount.replace(/,/g, '')) };
};
