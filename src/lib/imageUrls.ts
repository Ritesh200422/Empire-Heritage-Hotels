const ROOM_IMAGES = {
  standard: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
  deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
  family: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
  penthouse: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
  default: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
} as const;

const MENU_IMAGES = {
  paneer: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
  chicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
  mutton: 'https://images.unsplash.com/photo-1544025162-d76694265947',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96c',
  bread: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4',
  dessert: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
  beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e',
  vegetarian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
  default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
} as const;

function withImageParams(url: string) {
  return `${url}?auto=format&fit=crop&w=1000&q=85`;
}

export function getRoomImage(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('penthouse')) return withImageParams(ROOM_IMAGES.penthouse);
  if (normalizedTitle.includes('family')) return withImageParams(ROOM_IMAGES.family);
  if (normalizedTitle.includes('deluxe') || normalizedTitle.includes('ocean')) {
    return withImageParams(ROOM_IMAGES.deluxe);
  }
  if (normalizedTitle.includes('standard')) return withImageParams(ROOM_IMAGES.standard);
  return withImageParams(ROOM_IMAGES.default);
}

export function getMenuImage(title: string, description = '') {
  const normalizedTitle = `${title} ${description}`.toLowerCase();

  if (normalizedTitle.includes('biryani')) return withImageParams(MENU_IMAGES.biryani);
  if (normalizedTitle.includes('naan') || normalizedTitle.includes('roti')) {
    return withImageParams(MENU_IMAGES.bread);
  }
  if (
    normalizedTitle.includes('gulab') ||
    normalizedTitle.includes('rasmalai') ||
    normalizedTitle.includes('halwa')
  ) {
    return withImageParams(MENU_IMAGES.dessert);
  }
  if (
    normalizedTitle.includes('lassi') ||
    normalizedTitle.includes('soda') ||
    normalizedTitle.includes('chai')
  ) {
    return withImageParams(MENU_IMAGES.beverage);
  }
  if (normalizedTitle.includes('mutton')) return withImageParams(MENU_IMAGES.mutton);
  if (normalizedTitle.includes('chicken')) return withImageParams(MENU_IMAGES.chicken);
  if (normalizedTitle.includes('paneer')) return withImageParams(MENU_IMAGES.paneer);
  if (normalizedTitle.includes('veg') || normalizedTitle.includes('gobi')) {
    return withImageParams(MENU_IMAGES.vegetarian);
  }
  return withImageParams(MENU_IMAGES.default);
}
