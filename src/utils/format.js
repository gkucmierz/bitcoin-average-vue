export const format = (price, precision = 2, split = false) => {
  const num = (price ?? 0);
  const fixed = (Number.isNaN(num) ? 0 : num).toFixed(precision);
  if (!split) return fixed;
  const [int, dec] = fixed.split('.');
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec ? `${formattedInt}.${dec}` : formattedInt;
};
