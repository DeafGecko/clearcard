import { Template } from '../types';

export const BUILT_IN_TEMPLATES: Template[] = [
  // Medical
  {
    id: 'med-1',
    title: 'I am Deaf',
    content: 'I am Deaf. Please write down what you want to say, or type it on your phone for me to read.',
    category: 'Medical',
    tags: ['deaf', 'communication', 'essential'],
  },
  {
    id: 'med-2',
    title: 'Emergency - Deaf',
    content: 'EMERGENCY: I am Deaf and cannot hear you. Please write down information or show me your screen.',
    category: 'Medical',
    tags: ['emergency', 'deaf', 'critical'],
  },
  {
    id: 'med-3',
    title: 'Pain Level',
    content: 'My pain level is: [1-2] [3-4] [5-6] [7-8] [9-10]\nThe pain is located at: ___\nIt feels like: Sharp / Dull / Throbbing / Burning / Aching',
    category: 'Medical',
    tags: ['pain', 'medical', 'hospital'],
  },
  {
    id: 'med-4',
    title: 'Medication Info',
    content: 'I take the following medications:\n1. ___\n2. ___\n3. ___\n\nI am allergic to: ___',
    category: 'Medical',
    tags: ['medication', 'allergy', 'medical'],
  },
  // Shopping
  {
    id: 'shop-1',
    title: 'Assistance Needed',
    content: 'Hello! I am Deaf. Could you help me find:\n___\n\nThank you so much!',
    category: 'Shopping',
    tags: ['shopping', 'help', 'store'],
  },
  {
    id: 'shop-2',
    title: 'Price Check',
    content: 'Could you write down the price for this item? Thank you!',
    category: 'Shopping',
    tags: ['price', 'shopping'],
  },
  {
    id: 'shop-3',
    title: 'Order Confirmation',
    content: 'I would like to order:\n___\n\nCould you write down the total cost? Thank you!',
    category: 'Shopping',
    tags: ['order', 'food', 'restaurant'],
  },
  // Transportation
  {
    id: 'trans-1',
    title: 'Taxi/Ride Request',
    content: 'I am Deaf. My destination is:\n___\n\nPlease confirm the price and route in writing. Thank you!',
    category: 'Transportation',
    tags: ['taxi', 'ride', 'transport'],
  },
  {
    id: 'trans-2',
    title: 'Lost - Need Help',
    content: 'I am Deaf and I need help. I am trying to get to:\n___\n\nCould you write directions for me? Thank you!',
    category: 'Transportation',
    tags: ['lost', 'directions', 'help'],
  },
  // Social
  {
    id: 'social-1',
    title: 'Nice to Meet You',
    content: 'Nice to meet you! I am Deaf, so I communicate through writing or sign language. Feel free to write to me!',
    category: 'Social',
    tags: ['greeting', 'social', 'introduction'],
  },
  {
    id: 'social-2',
    title: 'Repeat Please',
    content: 'I am sorry, I missed that. Could you please write it down for me? Thank you for your patience!',
    category: 'Social',
    tags: ['repeat', 'communication', 'polite'],
  },
  {
    id: 'social-3',
    title: 'Phone Call Help',
    content: 'I am Deaf and cannot make phone calls. Could you please make this call for me?\nNumber: ___\nPurpose: ___\n\nThank you so much for your help!',
    category: 'Social',
    tags: ['phone', 'help', 'social'],
  },
  // Restaurant
  {
    id: 'rest-1',
    title: 'Restaurant Order',
    content: 'Hello! I am Deaf. I would like to order:\n___\n\nDrink: ___\nAny modifications: ___\n\nThank you!',
    category: 'Restaurant',
    tags: ['restaurant', 'food', 'order'],
  },
  {
    id: 'rest-2',
    title: 'Allergy Notice',
    content: '⚠️ IMPORTANT ALLERGY NOTICE ⚠️\nI am allergic to: ___\n\nPlease ensure my food does not contain these ingredients. This is a medical necessity.',
    category: 'Restaurant',
    tags: ['allergy', 'food', 'medical', 'restaurant'],
  },
  // Services
  {
    id: 'serv-1',
    title: 'Appointment Request',
    content: 'I am Deaf. I would like to schedule an appointment for:\n___\n\nPreferred date/time: ___\nMy contact info: ___\n\nPlease respond via text or email. Thank you!',
    category: 'Services',
    tags: ['appointment', 'schedule', 'services'],
  },
  {
    id: 'serv-2',
    title: 'Service Request',
    content: 'Hello, I am Deaf. I need assistance with:\n___\n\nPlease communicate with me through writing or text. My email is: ___\n\nThank you for your understanding!',
    category: 'Services',
    tags: ['service', 'help', 'request'],
  },
];

export const TEMPLATE_CATEGORIES = ['All', 'Medical', 'Shopping', 'Transportation', 'Social', 'Restaurant', 'Services'];

export function generateAITemplate(prompt: string): Template {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('doctor') || lowerPrompt.includes('hospital') || lowerPrompt.includes('medical')) {
    return {
      id: `ai-${Date.now()}`,
      title: 'Medical Communication',
      content: `I am Deaf and need medical assistance.\n\n${prompt}\n\nPlease communicate with me in writing. Thank you for your patience.`,
      category: 'Medical',
      tags: ['medical', 'ai-generated'],
    };
  }

  if (lowerPrompt.includes('help') || lowerPrompt.includes('emergency')) {
    return {
      id: `ai-${Date.now()}`,
      title: 'Help Request',
      content: `I am Deaf and need help.\n\n${prompt}\n\nPlease write your response. Thank you!`,
      category: 'Medical',
      tags: ['help', 'emergency', 'ai-generated'],
    };
  }

  if (lowerPrompt.includes('order') || lowerPrompt.includes('food') || lowerPrompt.includes('restaurant')) {
    return {
      id: `ai-${Date.now()}`,
      title: 'Food/Restaurant',
      content: `Hello! I am Deaf. ${prompt}\n\nThank you for your patience and understanding!`,
      category: 'Restaurant',
      tags: ['restaurant', 'ai-generated'],
    };
  }

  if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('buy')) {
    return {
      id: `ai-${Date.now()}`,
      title: 'Shopping',
      content: `Hello! I am Deaf. ${prompt}\n\nCould you write down your response? Thank you!`,
      category: 'Shopping',
      tags: ['shopping', 'ai-generated'],
    };
  }

  return {
    id: `ai-${Date.now()}`,
    title: 'Custom Card',
    content: `I am Deaf.\n\n${prompt}\n\nPlease communicate with me in writing. Thank you for your understanding!`,
    category: 'Custom',
    tags: ['custom', 'ai-generated'],
  };
}
