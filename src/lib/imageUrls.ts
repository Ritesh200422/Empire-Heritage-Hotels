const ROOM_IMAGES: Record<string, string> = {
  'standard room': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
  'deluxe ocean view': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
  'family suite': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
  'penthouse suite': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
};

const MENU_IMAGES: Record<string, string> = {
  'paneer tikka': 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
  'gobi 65': 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f',
  'chicken 65': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
  'mutton pepper fry': 'https://images.unsplash.com/photo-1544025162-d76694265947',
  'chicken tikka kebab': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
  'mutton seekh kebab': 'https://images.unsplash.com/photo-1628294895950-9805252327bc',
  'hara bhara kebab': 'https://images.unsplash.com/photo-1547592180-85f173990554',
  'butter chicken': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
  'mutton rogan josh': 'https://images.unsplash.com/photo-1545247181-516773cae754',
  'paneer butter masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7',
  'dal makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d',
  'kadai veg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  'chicken dum biryani': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
  'mutton dum biryani': 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972',
  'veg biryani': 'https://images.unsplash.com/photo-1596797038530-2c107229654b',
  'butter naan': 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7',
  'garlic naan': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4',
  'tandoori roti': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
  'roomali roti': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3',
  'gulab jamun': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
  rasmalai: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  'gajar ka halwa': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
  'sweet lassi': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
  'fresh lime soda': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
  'masala chai': 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9',
};

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304';
const FALLBACK_MENU_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';

function withImageParams(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}auto=format&fit=crop&w=1000&q=85`;
}

export function getRoomImage(title: string) {
  const normalizedTitle = title.trim().toLowerCase();
  return withImageParams(ROOM_IMAGES[normalizedTitle] ?? FALLBACK_ROOM_IMAGE);
}

export function getMenuImage(title: string, description = '') {
  const normalizedTitle = title.trim().toLowerCase();
  const image = MENU_IMAGES[normalizedTitle];

  if (image) return withImageParams(image);

  const normalizedText = `${normalizedTitle} ${description.toLowerCase()}`;
  if (normalizedText.includes('dessert')) {
    return withImageParams('https://images.unsplash.com/photo-1571877227200-a0d98ea607e9');
  }
  if (normalizedText.includes('beverage') || normalizedText.includes('drink')) {
    return withImageParams('https://images.unsplash.com/photo-1544145945-f90425340c7e');
  }
  return withImageParams(FALLBACK_MENU_IMAGE);
}
