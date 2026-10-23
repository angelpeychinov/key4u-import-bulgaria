import { Listing, formatNumber } from './listings';
import { CONTACT_PHONE_DISPLAY } from './contact';
import { listingShareUrl } from './listingNavigation';

// Exact owner-approved Bulgarian share text. Missing specs are skipped
// instead of printing placeholders; the link lives inside the text.
export function buildListingShareText(listing: Listing): string {
  const name = [listing.brand, listing.modelBase ?? listing.model, listing.year].filter(Boolean).join(' ');
  const lines = [`🇰🇷 ${name} от Южна Корея`];

  const gear = listing.specs['Скоростна кутия'];
  const specs = [
    listing.mileage !== undefined ? `${formatNumber(listing.mileage)} км` : undefined,
    listing.specs['Гориво'] || undefined,
    gear ? (gear === 'Ръчна' ? 'Ръчна' : 'Автоматик') : undefined,
  ].filter(Boolean);
  if (specs.length) lines.push(specs.join(' · '));

  lines.push(
    listing.importPrice
      ? `💶 ~${formatNumber(Math.round(listing.importPrice.total))} € до България, с всичко включено`
      : '💶 Цена при запитване',
  );

  lines.push('', `📞 За повече информация – ${CONTACT_PHONE_DISPLAY}`, listingShareUrl(listing));
  return lines.join('\n');
}
