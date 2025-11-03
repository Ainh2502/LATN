export const formatCurrency = (n: number | undefined | null) =>
  (n ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
