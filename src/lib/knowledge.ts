/**
 * Knowledge base loader — fetches hotel data from MySQL
 * and formats it for the Gemini system prompt.
 * Also provides keyword-based FAQ fallback when Gemini is unavailable.
 */

import { prisma } from '@/lib/prisma';

export interface KnowledgeBase {
  hotel: {
    id: string;
    name: string;
    description: string;
    address: string;
    checkInTime: string;
    checkOutTime: string;
    contact: string;
  } | null;
  roomTypes: Array<{
    id: string;
    name: string;
    description: string;
    maxAdults: number;
    maxOccupancy: number;
    pricePerNight: number;
    bedType: string;
    amenities: unknown;
  }>;
  amenities: Array<{
    id: string;
    name: string;
    description: string;
    hours: string | null;
    extraCost: number | null;
  }>;
  policies: Array<{
    id: string;
    key: string;
    title: string;
    content: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    tags: unknown;
  }>;
  menuItems: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    isVeg: boolean;
    spiceLevel: number;
    isBestseller: boolean;
    category: {
      name: string;
    };
  }>;
}

let _cachedKB: KnowledgeBase | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Load the full knowledge base from MySQL, with a 5-minute cache */
export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  const now = Date.now();
  if (_cachedKB && now - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedKB;
  }

  const [hotel, roomTypes, amenities, policies, faqs, menuItems] = await Promise.all([
    prisma.hotel.findFirst(),
    prisma.roomType.findMany({ orderBy: { pricePerNight: 'asc' } }),
    prisma.amenity.findMany(),
    prisma.policy.findMany(),
    prisma.faq.findMany(),
    prisma.menuItem.findMany({
      where: { available: true },
      include: { category: true }
    }),
  ]);

  _cachedKB = { hotel, roomTypes, amenities, policies, faqs, menuItems };
  _cacheTimestamp = now;
  return _cachedKB;
}

/** Clear the KB cache (useful for tests) */
export function clearKBCache() {
  _cachedKB = null;
  _cacheTimestamp = 0;
}

/** Format the knowledge base as a text block for the Gemini system prompt */
export function formatKBForPrompt(kb: KnowledgeBase): string {
  const sections: string[] = [];

  if (kb.hotel) {
    sections.push(
      `## Hotel Information [source: hotel-001]
Name: ${kb.hotel.name}
Description: ${kb.hotel.description}
Address: ${kb.hotel.address}
Check-in: ${kb.hotel.checkInTime}
Check-out: ${kb.hotel.checkOutTime}
Contact: ${kb.hotel.contact}`,
    );
  }

  if (kb.roomTypes.length > 0) {
    const roomLines = kb.roomTypes
      .map(
        (rt) =>
          `- [source: ${rt.id}] ${rt.name}: ${rt.description} | Max adults: ${rt.maxAdults}, Max occupancy: ${rt.maxOccupancy} | ₹${rt.pricePerNight}/night | Bed: ${rt.bedType} | Amenities: ${JSON.stringify(rt.amenities)}`,
      )
      .join('\n');
    sections.push(`## Room Types\n${roomLines}`);
  }

  if (kb.amenities.length > 0) {
    const amenityLines = kb.amenities
      .map(
        (a) =>
          `- [source: ${a.id}] ${a.name}: ${a.description}${a.hours ? ` | Hours: ${a.hours}` : ''}${a.extraCost != null ? ` | Extra cost: ₹${a.extraCost}` : ' | Free'}`,
      )
      .join('\n');
    sections.push(`## Amenities\n${amenityLines}`);
  }

  if (kb.policies.length > 0) {
    const policyLines = kb.policies
      .map((p) => `- [source: ${p.id}] ${p.title}: ${p.content}`)
      .join('\n');
    sections.push(`## Policies\n${policyLines}`);
  }

  if (kb.faqs.length > 0) {
    const faqLines = kb.faqs
      .map((f) => `- [source: ${f.id}] Q: ${f.question} A: ${f.answer}`)
      .join('\n');
    sections.push(`## Frequently Asked Questions\n${faqLines}`);
  }

  if (kb.menuItems && kb.menuItems.length > 0) {
    const menuLines = kb.menuItems
      .map((m) => {
        const vegStr = m.isVeg ? 'Vegetarian' : 'Non-Vegetarian';
        const spiceStr = ['Mild', 'Medium', 'Hot', 'Very Hot'][m.spiceLevel] || 'No spice';
        const bestStr = m.isBestseller ? ' | Bestseller' : '';
        return `- [source: ${m.id}] ${m.name} (${m.category.name}): ${m.description} | ${vegStr} | ${spiceStr} | ₹${m.price}${bestStr}`;
      })
      .join('\n');
    sections.push(`## Restaurant Menu\n${menuLines}`);
  }

  return sections.join('\n\n');
}

/**
 * Keyword-based FAQ matching — degraded mode when Gemini is unavailable.
 * Returns the best matching FAQ answer, or null if no match.
 */
export function matchFaqByKeywords(
  query: string,
  faqs: KnowledgeBase['faqs'],
): { answer: string; sourceId: string } | null {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  let bestMatch: { answer: string; sourceId: string; score: number } | null =
    null;

  for (const faq of faqs) {
    let score = 0;
    const tags = (Array.isArray(faq.tags) ? faq.tags : []) as string[];

    // Check tags
    for (const tag of tags) {
      if (queryLower.includes(tag.toLowerCase())) {
        score += 3;
      }
    }

    // Check question words
    const questionWords = faq.question.toLowerCase().split(/\s+/);
    for (const word of queryWords) {
      if (word.length > 3 && questionWords.includes(word)) {
        score += 1;
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer: faq.answer, sourceId: faq.id, score };
    }
  }

  return bestMatch ? { answer: bestMatch.answer, sourceId: bestMatch.sourceId } : null;
}

/**
 * Returns a human-readable label for a given source ID.
 */
export function getSourceLabel(id: string, kb: KnowledgeBase): string {
  if (id === 'hotel-001' && kb.hotel) {
    return 'Hotel Information';
  }
  
  const room = kb.roomTypes.find((r) => r.id === id);
  if (room) return `Room: ${room.name}`;
  
  const amenity = kb.amenities.find((a) => a.id === id);
  if (amenity) return `Amenity: ${amenity.name}`;
  
  const policy = kb.policies.find((p) => p.id === id);
  if (policy) return `Policy: ${policy.title}`;
  
  const faq = kb.faqs.find((f) => f.id === id);
  if (faq) return `FAQ: ${faq.question}`;
  
  const menuItem = kb.menuItems?.find((m) => m.id === id);
  if (menuItem) return `Menu: ${menuItem.name}`;
  
  return id;
}
