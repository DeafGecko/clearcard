import { Category, SystemCategories } from "../types";

const templates = {
  english: {
    professional: {
      pharmacy: { title: "Pharmacy Pickup", content: "I am here to pick up my prescription. My name is [Your Name]. I am Deaf — please write to communicate." },
      doctor: { title: "Doctor Appointment", content: "I have an appointment scheduled. I am Deaf. Please write notes or use text to communicate with me." },
      dentist: { title: "Dentist Visit", content: "I have a dental appointment at [Time]. I am Deaf — please write to communicate. Thank you." },
      coffee: { title: "Coffee Order", content: "I would like to order a [size] [drink], please. Thank you for your assistance." },
      food: { title: "Food Order", content: "I would like to place an order for [item]. I am Deaf — please write to communicate." },
      uber: { title: "Rideshare Notice", content: "I am Deaf. Please communicate via text message only. Do not call. Thank you for your understanding." },
      emergency: { title: "Emergency Alert", content: "I am Deaf. This is an emergency. Please assist me immediately and contact emergency services if needed." },
      hotel: { title: "Hotel Check-in", content: "I have a reservation under [Your Name]. I am Deaf — please write or use a tablet to communicate." },
      store: { title: "Store Assistance", content: "I am Deaf and require assistance locating [item]. Could you please help me? Thank you." },
      bank: { title: "Bank Assistance", content: "I am Deaf and need help with [transaction]. Please write to communicate. Thank you for your patience." },
    },
    casual: {
      pharmacy: { title: "Picking Up Prescription", content: "Hi! I'm here to grab my prescription. Name is [Your Name]. I'm Deaf — can you write it down? Thanks!" },
      doctor: { title: "Doctor Visit", content: "Hey! I have an appointment here. I'm Deaf, so writing or texting works best for me. Thanks!" },
      dentist: { title: "Dentist Appointment", content: "Hi! I'm here for my dental appointment at [Time]. I'm Deaf — writing works best. Thanks!" },
      coffee: { title: "Coffee Order", content: "Hey! Can I get a [size] [drink] please? Thanks so much!" },
      food: { title: "Food Order", content: "Hi! I'd love to order [item]. I'm Deaf — writing works great. Thanks!" },
      uber: { title: "Rideshare Note", content: "Hey! I'm Deaf so please text me instead of calling. Thanks a lot!" },
      emergency: { title: "Emergency!", content: "I'm Deaf. This is an emergency — please help me right away!" },
      hotel: { title: "Hotel Check-in", content: "Hi! I have a reservation under [Your Name]. I'm Deaf so writing or texting works best. Thanks!" },
      store: { title: "Need Help Finding Something", content: "Hi! I'm Deaf — can you help me find [item]? Writing works great. Thanks!" },
      bank: { title: "Bank Help", content: "Hi! I need help with [transaction]. I'm Deaf so writing works best. Thanks!" },
    }
  },
  spanish: {
    professional: {
      pharmacy: { title: "Recoger Receta", content: "Vengo a recoger mi receta. Mi nombre es [Su Nombre]. Soy sordo/a — por favor escríbame para comunicarse." },
      doctor: { title: "Cita Médica", content: "Tengo una cita programada. Soy sordo/a. Por favor escríbame o use texto para comunicarse conmigo." },
      dentist: { title: "Visita al Dentista", content: "Tengo una cita dental a las [Hora]. Soy sordo/a — por favor escríbame. Gracias." },
      coffee: { title: "Orden de Café", content: "Quisiera ordenar un [tamaño] [bebida], por favor. Gracias por su ayuda." },
      food: { title: "Orden de Comida", content: "Quisiera ordenar [artículo]. Soy sordo/a — por favor escríbame para comunicarse." },
      uber: { title: "Aviso de Transporte", content: "Soy sordo/a. Por favor comuníquese solo por mensaje de texto. No llame. Gracias por su comprensión." },
      emergency: { title: "Alerta de Emergencia", content: "Soy sordo/a. Esto es una emergencia. Por favor ayúdeme de inmediato." },
      hotel: { title: "Registro en Hotel", content: "Tengo una reservación a nombre de [Su Nombre]. Soy sordo/a — por favor escríbame para comunicarse." },
      store: { title: "Asistencia en Tienda", content: "Soy sordo/a y necesito ayuda para encontrar [artículo]. ¿Podría ayudarme? Gracias." },
      bank: { title: "Asistencia Bancaria", content: "Soy sordo/a y necesito ayuda con [transacción]. Por favor escríbame. Gracias por su paciencia." },
    },
    casual: {
      pharmacy: { title: "Recoger Receta", content: "¡Hola! Vengo a recoger mi receta. Me llamo [Su Nombre]. Soy sordo/a — ¿puedes escribirlo? ¡Gracias!" },
      doctor: { title: "Visita al Médico", content: "¡Hola! Tengo una cita aquí. Soy sordo/a, así que escribir o enviar mensajes funciona mejor. ¡Gracias!" },
      dentist: { title: "Cita con el Dentista", content: "¡Hola! Tengo una cita dental a las [Hora]. Soy sordo/a — escribir funciona mejor. ¡Gracias!" },
      coffee: { title: "Orden de Café", content: "¡Hola! ¿Me puedes dar un [tamaño] [bebida] por favor? ¡Muchas gracias!" },
      food: { title: "Orden de Comida", content: "¡Hola! Me gustaría ordenar [artículo]. Soy sordo/a — escribir funciona genial. ¡Gracias!" },
      uber: { title: "Nota de Transporte", content: "¡Hola! Soy sordo/a así que por favor mándame mensajes en vez de llamar. ¡Muchas gracias!" },
      emergency: { title: "¡Emergencia!", content: "Soy sordo/a. Esto es una emergencia — ¡por favor ayúdame ahora mismo!" },
      hotel: { title: "Registro en Hotel", content: "¡Hola! Tengo una reservación a nombre de [Su Nombre]. Soy sordo/a — escribir o mensajes funciona mejor. ¡Gracias!" },
      store: { title: "Necesito Ayuda", content: "¡Hola! Soy sordo/a — ¿me puedes ayudar a encontrar [artículo]? Escribir funciona genial. ¡Gracias!" },
      bank: { title: "Ayuda en el Banco", content: "¡Hola! Necesito ayuda con [transacción]. Soy sordo/a — escribir funciona mejor. ¡Gracias!" },
    }
  }
};

function matchTemplate(prompt: string, language: 'english' | 'spanish', tone: 'professional' | 'casual', categories: Category[]) {
  const lower = prompt.toLowerCase();
  const langTemplates = templates[language][tone];

  for (const [key, item] of Object.entries(langTemplates)) {
    if (lower.includes(key) ||
      (key === 'pharmacy' && (lower.includes('prescription') || lower.includes('receta') || lower.includes('farmacia'))) ||
      (key === 'doctor' && (lower.includes('medical') || lower.includes('médico') || lower.includes('clinic'))) ||
      (key === 'coffee' && (lower.includes('starbucks') || lower.includes('café') || lower.includes('latte'))) ||
      (key === 'food' && (lower.includes('restaurant') || lower.includes('order') || lower.includes('eat') || lower.includes('comer'))) ||
      (key === 'uber' && (lower.includes('lyft') || lower.includes('ride') || lower.includes('driver') || lower.includes('taxi'))) ||
      (key === 'emergency' && (lower.includes('help') || lower.includes('urgent') || lower.includes('ayuda')))
    ) {
      const cat = categories.includes(SystemCategories.MEDICAL) && ['pharmacy','doctor','dentist'].includes(key)
        ? SystemCategories.MEDICAL
        : key === 'emergency' ? SystemCategories.EMERGENCY
        : ['uber','hotel','bank','store'].includes(key) ? SystemCategories.SERVICES
        : SystemCategories.DAILY;
      return { title: item.title, content: item.content, category: categories.includes(cat) ? cat : categories[0] };
    }
  }

  // Generic fallback
  const isSpanish = language === 'spanish';
  const isPro = tone === 'professional';
  return {
    title: prompt.split(' ').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    content: isSpanish
      ? isPro
        ? `Soy sordo/a. ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}. Por favor escríbame para comunicarse. Gracias.`
        : `¡Hola! Soy sordo/a. ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}. ¡Escribir funciona mejor, gracias!`
      : isPro
        ? `I am Deaf. ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}. Please write to communicate. Thank you.`
        : `Hi! I'm Deaf. ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}. Writing works best — thanks!`,
    category: categories.includes(SystemCategories.DAILY) ? SystemCategories.DAILY : categories[0],
  };
}

export async function generateSmartCard(prompt: string, categories: Category[], language: 'english' | 'spanish' = 'english', tone: 'professional' | 'casual' = 'professional') {
  await new Promise(r => setTimeout(r, 400));
  return matchTemplate(prompt, language, tone, categories);
}

export async function rewriteMessage(content: string, tone: "professional" | "casual") {
  await new Promise(r => setTimeout(r, 300));
  if (tone === 'professional') {
    return content.replace(/[!]+/g, '.').replace(/hey|hi|hello/gi, 'Good day,').trim();
  } else {
    return content.replace(/\.$/, '!').replace(/Good day,/gi, 'Hi!').trim();
  }
}
