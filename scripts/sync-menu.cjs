require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qnfoycxcalvdczhtgpxj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const allItems = [
  {
    id: 'menu_101',
    name: 'Bisibele Bath',
    description: 'Authentic Karnataka spiced rice cooked with lentils, mixed vegetables, and pure ghee.',
    price: 40,
    image: '/images/bisibele_bath.jpg',
    category: 'Meals',
    available: true,
    is_today_special: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_102',
    name: 'Masala Dosa',
    description: 'Crispy golden fermented crepe stuffed with spiced potato palya and served with coconut chutney & sambar.',
    price: 50,
    image: '/images/masala_dosa.jpg',
    category: 'Breakfast',
    available: true,
    is_today_special: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_103',
    name: 'Idli (2 Pcs)',
    description: 'Steaming hot, fluffy rice cakes accompanied by freshly ground coconut chutney and piping hot sambar.',
    price: 30,
    image: '/images/idli.jpg',
    category: 'Breakfast',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_104',
    name: 'Sambar Rice',
    description: 'Homestyle aromatic South Indian rice dish flavored with drumsticks, shallots, tamarind, and fresh coriander.',
    price: 35,
    image: '/images/sambar_rice.jpg',
    category: 'Meals',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_105',
    name: 'Curd Rice',
    description: 'Cooling seasoned yogurt rice tempered with mustard seeds, curry leaves, ginger, and green chilies.',
    price: 30,
    image: '/images/curd_rice.jpg',
    category: 'Meals',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_106',
    name: 'Lemon Rice',
    description: 'Tangy and crunchy turmeric rice tossed with roasted peanuts, curry leaves, and fresh lime juice.',
    price: 35,
    image: '/images/lemon_rice.jpg',
    category: 'Meals',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_107',
    name: 'Filter Coffee',
    description: 'Traditional South Indian filter coffee brewed with chicory and frothy hot milk in stainless steel tumbler.',
    price: 20,
    image: '/images/filter_coffee.jpg',
    category: 'Beverages',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_108',
    name: 'Tea (Masala Chai)',
    description: 'Cardamom and ginger infused steaming hot college canteen style milk tea.',
    price: 15,
    image: '/images/masala_chai.jpg',
    category: 'Beverages',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_109',
    name: 'Medu Vada (1 Pc)',
    description: 'Crispy fried lentil donut with crunchy exterior and soft fluffy interior served with chutney.',
    price: 20,
    image: '/images/medu_vada.jpg',
    category: 'Breakfast',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'menu_110',
    name: 'Poori Sagu',
    description: 'Two fluffy puffed wheat pooris served with flavorful spiced mixed vegetable sagu.',
    price: 45,
    image: '/images/poori_sagu.jpg',
    category: 'Breakfast',
    available: true,
    is_today_special: false,
    date: new Date().toISOString().split('T')[0],
  },
];

async function sync() {
  console.log('Syncing menu items with Supabase...');
  for (const item of allItems) {
    const { error } = await supabase.from('menu_items').upsert(item, { onConflict: 'name' });
    if (error) {
      console.warn(`Error syncing ${item.name}:`, error.message);
    } else {
      console.log(`Synced ${item.name}`);
    }
  }
  console.log('Finished syncing menu items with Supabase!');
}

sync().catch(console.error);
