/**
 * Determines which image to show as the primary display for a product card.
 * Priority:
 * 1. Admin-pinned image (saved in localStorage by the admin dashboard)
 * 2. DECK type image (non-logo)
 * 3. Any non-logo image
 * 4. First image
 */
export function getDisplayImage(product) {
  if (!product?.images?.length) return '/black_surfboard.png';

  // 1. Admin-pinned choice (from backend isPrimary)
  const pinned = product.images.find((img) => img.isPrimary === true);
  if (pinned) return pinned.url;

  // 2. DECK non-logo
  const deck = product.images.find(
    (img) => img.type === 'DECK' && !img.url.toLowerCase().includes('logo')
  );
  if (deck) return deck.url;

  // 3. Any non-logo
  const any = product.images.find(
    (img) => !img.url.toLowerCase().includes('logo')
  );
  if (any) return any.url;

  // 4. Fallback
  return product.images[0].url;
}

export function getPinnedImageId(product) {
  const pinned = product?.images?.find((img) => img.isPrimary === true);
  return pinned ? pinned.id : null;
}

