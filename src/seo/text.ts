/** Cuts `text` to at most `max` characters at a word boundary, ending with an ellipsis. */
export const shorten = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.·—-]+$/, '')}…`;
};
