import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.process': 'Import Process',
    'nav.findCar': 'Find My Car',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'Cars from Canada & USA',
    'hero.subtitle': 'Easy, Fast, Affordable',
    'hero.description': 'We handle everything from request to delivery. Your dream car, simplified.',
    'hero.cta': 'Find Your Car',
    'hero.learn': 'Learn More',
    
    // Process
    'process.title': 'How It Works',
    'process.subtitle': 'Simple steps to your dream car',
    'process.step1': 'Request Your Car',
    'process.step1desc': 'Tell us the model, year, and preferences',
    'process.step2': 'We Find & Import',
    'process.step2desc': 'We source from Canada and USA',
    'process.step3': 'Logistics & Customs Clearance',
    'process.step3desc': 'Shipping, Tehnotest, and conversions',
    'process.step4': 'Registration & Delivery',
    'process.step4desc': 'We handle paperwork and deliver to you',
    
    // Find Car Form
    'form.title': 'Find My Car',
    'form.subtitle': 'Tell us what you\'re looking for',
    'form.name': 'Full Name',
    'form.email': 'Email Address',
    'form.phone': 'Phone Number',
    'form.model': 'Car Model (e.g., BMW X5, Tesla Model 3)',
    'form.year': 'Preferred Year',
    'form.color': 'Preferred Color',
    'form.trim': 'Trim / Features',
    'form.additional': 'Additional Requirements',
    'form.submit': 'Submit Request',
    'form.success': 'Request submitted! We\'ll contact you soon.',
    
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'How long does the import process take?',
    'faq.a1': 'Typically 6-8 weeks from purchase to delivery in Bulgaria, depending on shipping and customs.',
    'faq.q2': 'What are the total costs?',
    'faq.a2': 'Total cost includes car price, shipping, customs/taxes, and our service fee. We provide a detailed quote upfront.',
    'faq.q3': 'Do you handle registration?',
    'faq.a3': 'Yes! We handle all paperwork including Tehnotest, conversions, and registration with Bulgarian authorities.',
    'faq.q4': 'What brands do you import?',
    'faq.a4': 'We import all major brands: BMW, Mercedes, Audi, Tesla, Porsche, and more. Tell us what you want!',
    'faq.q5': 'Can I see the car before purchase?',
    'faq.a5': 'We provide detailed photos, videos, and vehicle history reports. Virtual inspections are also available.',
    'faq.q6': 'What about warranty?',
    'faq.a6': 'We work with cars that can be registered in Bulgaria and help you understand any remaining manufacturer warranties.',
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Ready to import your dream car?',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.location': 'Sofia, Bulgaria',
    'contact.viber': 'Chat on Viber',
    
    // Features
    'features.title': 'Why Choose KEY4U?',
    'features.endToEnd': 'Full Service',
    'features.endToEndDesc': 'From request to registration, we handle everything',
    'features.affordable': 'Affordable Luxury',
    'features.affordableDesc': 'Premium cars at competitive prices',
    'features.trust': 'Trusted & Transparent',
    'features.trustDesc': 'Clear pricing and honest communication',
    'features.local': 'Local Expertise',
    'features.localDesc': 'Bulgarian team that knows the process',
  },
  bg: {
    // Navigation
    'nav.home': 'Начало',
    'nav.process': 'Процес',
    'nav.findCar': 'Намери Автомобил',
    'nav.faq': 'Въпроси',
    'nav.contact': 'Контакт',
    
    // Hero
    'hero.title': 'Автомобили от Канада и САЩ',
    'hero.subtitle': 'Лесно, Бързо, Достъпно',
    'hero.description': 'Вие мечтаете, ние изпълняваме!',
    'hero.cta': 'Намери Автомобил',
    'hero.learn': 'Научи Повече',
    
    // Process
    'process.title': 'Как Работи',
    'process.subtitle': 'Прости стъпки до мечтания автомобил',
    'process.step1': 'Поискай Автомобила',
    'process.step1desc': 'Кажи ни модела, годината и предпочитанията',
    'process.step2': 'Започваме търсене',
    'process.step2desc': 'Търсим от Канада и САЩ',
    'process.step3': 'Логистика и митническо оформление',
    'process.step3desc': 'Ние ще се погрижим за доставката и цялата документация',
    'process.step4': 'Регистрация и Доставка',
    'process.step4desc': 'Документи и доставка до вас',
    
    // Find Car Form
    'form.title': 'Намери Автомобил',
    'form.subtitle': 'Кажи ни какво търсиш',
    'form.name': 'Пълно Име',
    'form.email': 'Имейл Адрес',
    'form.phone': 'Телефон',
    'form.model': 'Модел Автомобил (напр. BMW X5, Tesla Model 3)',
    'form.year': 'Предпочитана Година',
    'form.color': 'Предпочитан Цвят',
    'form.trim': 'Версия / Характеристики',
    'form.additional': 'Допълнителни Изисквания',
    'form.submit': 'Изпрати Заявка',
    'form.success': 'Заявката е изпратена! Ще се свържем скоро.',
    
    // FAQ
    'faq.title': 'Често Задавани Въпроси',
    'faq.q1': 'Колко време отнема процесът на внос?',
    'faq.a1': 'Обикновено 6-8 седмици от покупката до доставката в България, в зависимост от доставката и митниците.',
    'faq.q2': 'Какви са общите разходи?',
    'faq.a2': 'Общата цена включва цената на колата, доставка, мита/данъци и нашата такса за услуга. Даваме детайлна оферта предварително.',
    'faq.q3': 'Занимавате ли се с регистрацията?',
    'faq.a3': 'Да, бихме могли да се погрижим, както за регистрацията на автомобила, така и за всички останали дейности по него.',
    'faq.q4': 'Какви марки внасяте?',
    'faq.a4': 'Внасяме всички марки, които присъстват на канадския и американския пазар, с други думи почти всички марки, които присъстват и на европейския пазар.',
    'faq.q5': 'Мога ли да видя колата преди покупка?',
    'faq.a5': 'Предоставяме пълна и обстойна информация за всеки автомобил, за да може клиентът ни да е сигурен в покупката си, преди да е заплатил за нея.',
    'faq.q6': 'Какво става с гаранцията?',
    'faq.a6': 'Работим с автомобили, които могат да бъдат регистрирани в България и ви помагаме да разберете останалите заводски гаранции.',
    
    // Contact
    'contact.title': 'Свържи се с Нас',
    'contact.subtitle': 'Готови ли сте да внесете мечтания автомобил?',
    'contact.phone': 'Телефон',
    'contact.email': 'Имейл',
    'contact.location': 'София, България',
    'contact.viber': 'Чат във Viber',
    
    // Features
    'features.title': 'Защо да изберете KEY4U?',
    'features.endToEnd': 'Пълна Услуга',
    'features.endToEndDesc': 'От заявка до регистрация, ние се грижим за всичко',
    'features.affordable': 'Достъпен Лукс',
    'features.affordableDesc': 'Премиум автомобили на конкурентни цени',
    'features.trust': 'Доверие и Прозрачност',
    'features.trustDesc': 'Ясно ценообразуване и честна комуникация',
    'features.local': 'Местна Експертиза',
    'features.localDesc': 'Български екип, който познава процеса',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('bg');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
