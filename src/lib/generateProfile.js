/**
 * Deterministic profile generator — always works offline, no API key needed.
 *
 * TODO: Replace the body of generateProfile() with a real Claude API call:
 *   const response = await anthropic.messages.create({
 *     model: "claude-sonnet-4-6",
 *     max_tokens: 1024,
 *     messages: [{ role: "user", content: buildPrompt(answers) }]
 *   })
 *   return parseClaudeResponse(response.content[0].text)
 */

const ARCHETYPES = [
  {
    id: 'luxury-curator',
    title: 'The Luxury Curator ✨',
    emoji: '✨',
    blurb: "You don't just travel — you curate experiences that make people stop scrolling. Your content drips with aspirational energy and your audience trusts your taste implicitly.",
    style: 'High-end, aspirational, aesthetic-first',
    color: '#6D28D9',
  },
  {
    id: 'adventure-seeker',
    title: 'The Wild Card 🏔️',
    emoji: '🏔️',
    blurb: "Off the beaten path is where you live. You turn hidden gems into viral moments and your audience lives vicariously through every adrenaline-fuelled reel.",
    style: 'Adventure, raw, authentic',
    color: '#059669',
  },
  {
    id: 'culture-connector',
    title: 'The Culture Connector 🌍',
    emoji: '🌍',
    blurb: "You bridge worlds. Your content dives deep into local life, food, and stories — your followers learn something every time they swipe.",
    style: 'Immersive, educational, culturally rich',
    color: '#D97706',
  },
  {
    id: 'budget-nomad',
    title: 'The Freedom Nomad 🎒',
    emoji: '🎒',
    blurb: "You prove that incredible travel doesn't require a trust fund. Your hacks and finds inspire millions who thought travel was out of reach.",
    style: 'Relatable, value-driven, inspiring',
    color: '#0891B2',
  },
  {
    id: 'foodie-wanderer',
    title: 'The Flavor Chaser 🍜',
    emoji: '🍜',
    blurb: "Every destination is a restaurant waiting to be discovered. Your food content is so vivid your audience can practically taste it through the screen.",
    style: 'Sensory, mouth-watering, lifestyle',
    color: '#DC2626',
  },
]

const SUPPLIER_RECS = {
  'luxury-curator': ['5-star hotels & resorts', 'Private transfer services', 'Fine dining & Michelin restaurants', 'Luxury fashion & retail'],
  'adventure-seeker': ['Outdoor gear brands', 'Adventure tour operators', 'Sports & activity booking platforms', 'Insurance & safety providers'],
  'culture-connector': ['Local tour guides & experiences', 'Artisan markets & craft brands', 'Language learning apps', 'Cultural immersion retreats'],
  'budget-nomad': ['Budget airline partners', 'Hostel & co-living networks', 'Travel hack apps', 'Group tour companies'],
  'foodie-wanderer': ['Restaurant booking platforms', 'Food & beverage brands', 'Cooking class operators', 'Gourmet food delivery'],
}

const COLLAB_IDEAS = {
  'luxury-curator': [
    '3-night stay swap with a boutique Santorini hotel for a full reel series',
    'Brand ambassador deal with a premium luggage brand — "pack with me" content',
    'Curated luxury itinerary ebook sponsored by 4 complementary brands',
  ],
  'adventure-seeker': [
    'Trek-and-create partnership with a Nepal adventure operator — fly out, content rights shared',
    'Gear unboxing + 30-day challenge with an outdoor equipment brand',
    'Live-stream series from extreme locations with a satellite comms sponsor',
  ],
  'culture-connector': [
    'Mini-documentary series for a tourism board — 6 episodes, one per region',
    'Local artisan spotlight collab with a global marketplace platform',
    '"Eat like a local" series co-produced with a food delivery super-app',
  ],
  'budget-nomad': [
    '"€500 in 10 days" challenge series sponsored by a fintech travel card',
    'Hostel affiliate program — behind-the-scenes collab with 5 iconic hostels globally',
    'Group travel package co-design with a young travellers tour brand',
  ],
  'foodie-wanderer': [
    '"World food ranking" series — 12 countries, one iconic dish each, sponsored by a sauce brand',
    'Chef collab series: cook a dish with a local Michelin star chef in 6 cities',
    'Food festival coverage deal with a global events company',
  ],
}

const DESTINATIONS = {
  'luxury-curator': 'Amalfi Coast, Italy 🇮🇹',
  'adventure-seeker': 'Patagonia, Argentina 🇦🇷',
  'culture-connector': 'Kyoto, Japan 🇯🇵',
  'budget-nomad': 'Chiang Mai, Thailand 🇹🇭',
  'foodie-wanderer': 'Oaxaca, Mexico 🇲🇽',
}

function pickArchetype(answers) {
  const { travelVibe, contentType, travelStyle } = answers

  if (travelStyle === 'luxury' || contentType === 'lifestyle') return ARCHETYPES[0]
  if (travelStyle === 'adventure' || travelVibe === '🏔️') return ARCHETYPES[1]
  if (travelStyle === 'culture' || contentType === 'documentary') return ARCHETYPES[2]
  if (travelStyle === 'budget' || travelVibe === '🎒') return ARCHETYPES[3]
  if (contentType === 'food' || travelVibe === '🍜') return ARCHETYPES[4]

  // Fallback: deterministic hash from all answers
  const hash = Object.values(answers).join('').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return ARCHETYPES[hash % ARCHETYPES.length]
}

export function generateProfile(answers) {
  const archetype = pickArchetype(answers)
  return {
    archetype,
    travelStyle: archetype.style,
    recommendedSuppliers: SUPPLIER_RECS[archetype.id],
    collabIdeas: COLLAB_IDEAS[archetype.id],
    dreamDestination: DESTINATIONS[archetype.id],
    generatedAt: new Date().toISOString(),
  }
}

export function getLandingArchetype(vibe) {
  if (vibe === '🏄') return 'a Free-Spirit Nomad'
  if (vibe === '🏙️') return 'a City Slicker Creator'
  if (vibe === '🏔️') return 'a Wild Card Adventurer'
  if (vibe === '🍜') return 'a Flavor-Chasing Foodie'
  return 'a Travelpreneur in the making'
}
