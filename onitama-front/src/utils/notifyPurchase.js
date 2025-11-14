export function notifyPurchase(detail) {
  try {
    const ev = new CustomEvent('purchase', { detail });
    window.dispatchEvent(ev);
  } catch (_) {}
}