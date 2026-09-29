// Verified high quality food image mapping for Campus Canteen items

export const FOOD_IMAGE_MAP: Record<string, string> = {
  'Masala Dosa': '/images/masala_dosa.jpg',
  'Idli (2 Pcs)': '/images/idli.jpg',
  'Idli': '/images/idli.jpg',
  'Bisibele Bath': '/images/bisibele_bath.jpg',
  'Medu Vada (1 Pc)': '/images/medu_vada.jpg',
  'Medu Vada': '/images/medu_vada.jpg',
  'Poori Sagu': '/images/poori_sagu.jpg',
  'Sambar Rice': '/images/sambar_rice.jpg',
  'Lemon Rice': '/images/lemon_rice.jpg',
  'Curd Rice': '/images/curd_rice.jpg',
  'Filter Coffee': '/images/filter_coffee.jpg',
  'Tea (Masala Chai)': '/images/masala_chai.jpg',
  'Tea': '/images/masala_chai.jpg',
};

export function getFoodImage(name?: string, currentImage?: string): string {
  if (!name) return currentImage || '/images/masala_dosa.jpg';

  const trimmed = name.trim();
  if (FOOD_IMAGE_MAP[trimmed]) {
    return FOOD_IMAGE_MAP[trimmed];
  }

  // Partial match by food keywords
  const lower = trimmed.toLowerCase();
  if (lower.includes('dosa')) return '/images/masala_dosa.jpg';
  if (lower.includes('idli')) return '/images/idli.jpg';
  if (lower.includes('bisibele') || lower.includes('bisi bele')) return '/images/bisibele_bath.jpg';
  if (lower.includes('vada')) return '/images/medu_vada.jpg';
  if (lower.includes('poori') || lower.includes('puri')) return '/images/poori_sagu.jpg';
  if (lower.includes('sambar rice') || lower.includes('sambar sadam')) return '/images/sambar_rice.jpg';
  if (lower.includes('lemon rice') || lower.includes('chitranna')) return '/images/lemon_rice.jpg';
  if (lower.includes('curd rice') || lower.includes('mosranna')) return '/images/curd_rice.jpg';
  if (lower.includes('coffee')) return '/images/filter_coffee.jpg';
  if (lower.includes('tea') || lower.includes('chai')) return '/images/masala_chai.jpg';

  if (currentImage && (currentImage.startsWith('/images') || currentImage.startsWith('data:'))) {
    return currentImage;
  }

  return currentImage || '/images/masala_dosa.jpg';
}
