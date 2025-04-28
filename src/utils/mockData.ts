
import { Recipe } from '../types';

export const sampleRecipe: Recipe = {
  id: '1',
  title: 'Trikatu Churna',
  originalText: `तत्र क्रिकटु चूर्णम्\n
    शुण्ठी पिप्पली मरिच समभागाः\n
    सर्वाणि चूर्णानि कृत्वा त्रिफला मिश्रयेत्\n
    मधुना सह सेवनीयम्\n
    वातकफहरम् अग्निदीपनम् च\n
    मात्रा - १ चमचम्`,
  ingredients: [
    {
      name: 'Dry Ginger (Sunthi)',
      quantity: '1 part',
      doshaEffect: 'decreases'
    },
    {
      name: 'Long Pepper (Pippali)',
      quantity: '1 part',
      doshaEffect: 'decreases'
    },
    {
      name: 'Black Pepper (Maricha)',
      quantity: '1 part',
      doshaEffect: 'decreases'
    },
    {
      name: 'Triphala',
      quantity: 'To mix',
      doshaEffect: 'balances'
    },
    {
      name: 'Honey',
      quantity: 'As needed',
      doshaEffect: 'balances'
    }
  ],
  preparation: [
    'Take equal parts of dry ginger, long pepper, and black pepper.',
    'Powder them finely and mix thoroughly.',
    'Add Triphala powder to the mixture.',
    'Consume with honey.'
  ],
  properties: {
    primaryDosha: 'vata',
    taste: ['pungent', 'bitter'],
    potency: 'hot',
    season: ['winter', 'monsoon']
  }
};

export const emptyRecipe: Recipe = {
  id: '',
  title: '',
  originalText: '',
  ingredients: [],
  preparation: [],
  properties: {
    primaryDosha: 'vata',
    taste: [],
    potency: 'hot',
    season: []
  }
};
