export const calculateProgress = (createdAt, expirationDate) => {
  if (!createdAt || !expirationDate) return 0;

  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const expiration = new Date(expirationDate).getTime();

  if (isNaN(created) || isNaN(expiration)) return 0;
  if (now >= expiration) return 0;
  if (now <= created) return 100;

  const total = expiration - created;
  const passed = now - created;

  const percent = 100 - (passed / total) * 100;

  return Math.max(0, Math.min(100, percent));
};

export const getProgressColor = (percent) => {
  if (percent > 70) return '#4CAF50';
  if (percent > 40) return '#FBC02D';
  return '#E53935';
};