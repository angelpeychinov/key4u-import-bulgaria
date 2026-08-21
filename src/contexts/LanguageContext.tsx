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
    'nav.carSearch': 'Korea',
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
    'process.step1': 'Defining Parameters',
    'process.step1desc': 'Make, model, mileage, year...',
    'process.step2': 'Offers',
    'process.step2desc': 'Full description of condition and service history',
    'process.step3': 'Auction Participation',
    'process.step3desc': 'With a defined budget, deposit and contract',
    'process.step4': 'First Payment',
    'process.step4desc': 'Cost of the car, auction fees and transport',
    'process.step5': 'Tracking Number',
    'process.step5desc': 'Tracking number after the container is loaded',
    'process.step5b': 'Photos',
    'process.step5bdesc': 'We send photos from every logistics point along the car\'s route',
    'process.step6': 'Car Arrival',
    'process.step6desc': 'Arrival in Europe and customs clearance',
    'process.step7': 'In Bulgaria',
    'process.step7desc': 'Payment for the car carrier upon receipt',
    'process.step8': 'Before You Drive Off',
    'process.step8desc': 'We assist with technical inspection, transit plates, indicator change and registration at the Traffic Police',
    'process.badge': 'Easy and transparent process',
    'process.ctaTitle': 'Ready to get started?',
    'process.ctaSubtitle': 'Call now and let\'s find your dream car',
    'process.ctaButton': 'CALL NOW',
    
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
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Ready to import your dream car?',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.location': 'Sofia, Bulgaria',
    'contact.viber': 'Chat on Viber',
    
    // Features
    'features.title': 'Why Choose Key4U?',
    'features.endToEnd': 'Full Service',
    'features.endToEndDesc': 'From request to registration, we handle everything',
    'features.realKm': 'Real Mileage',
    'features.realKmDesc': 'Verified kilometers from official sources - no manipulation',
    'features.affordable': 'Affordable Luxury',
    'features.affordableDesc': 'Premium cars at competitive prices',
    'features.trust': 'Trusted & Transparent',
    'features.trustDesc': 'Clear pricing and honest communication',
    'features.local': 'Local Expertise',
    'features.localDesc': 'Bulgarian team that knows the process',
    
    // Stats
    'stats.title': 'Our Experience in Numbers',
    'stats.subtitle': 'Trust proven with every imported vehicle',
    'stats.carsImported': 'Cars Imported',
    'stats.inLastYear': 'in the last year',
    'stats.happyClients': 'Happy Clients',
    'stats.recommendUs': 'recommend us',
    'stats.averageTime': 'Average Time',
    'stats.forDelivery': 'for delivery',
    'stats.days': 'days',
    
    // Transparency
    'transparency.title': 'We provide 100% of the information we have.',
    'transparency.subtitle': 'No empty promises about "healthy" cars',
    
    // Mobile.bg
    'mobile.offers': 'Here you can find our offers.',
    'mobile.viewListings': 'View Listings on Mobile.bg',
    
    // Licensed Importer
    'licensed.badge': 'Licensed Importer',
    'licensed.title': 'Licensed Car Importer from Canada and USA',
    'licensed.subtitle': 'We work with the largest and most trusted auto auction and sales platforms in North America.',
    
    // CTA
    'cta.title': 'Ready for your',
    'cta.titleHighlight': 'dream car?',
    'cta.subtitle': 'We handle everything - from finding to delivery.',
    
    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.contacts': 'Contact',
    'footer.emailLabel': 'Email:',
    'footer.phoneLabel': 'Phone:',
    'footer.allRightsReserved': 'All rights reserved.',
  },
  bg: {
    // Navigation
    'nav.home': 'Начало',
    'nav.process': 'Процес',
    'nav.findCar': 'Намери Автомобил',
    'nav.carSearch': 'Корея',
    'nav.faq': 'Въпроси',
    'nav.contact': 'Контакт',
    
    // Hero
    'hero.title': 'Внос на Автомобили от Канада и САЩ',
    'hero.subtitle': 'Лесно, Бързо, Достъпно',
    'hero.description': 'Вашата мечтана кола е наша работа!',
    'hero.cta': 'Намери Автомобил',
    'hero.learn': 'Научи Повече',
    
    // Process
    'process.title': 'Как Работи',
    'process.subtitle': 'Прости стъпки до мечтания автомобил',
    'process.step1': 'Определяне на параметрите',
    'process.step1desc': 'Марка, модел, километри, година...',
    'process.step2': 'Предложения',
    'process.step2desc': 'Пълно описание на състоянието и сервизната история',
    'process.step3': 'Участие в търг',
    'process.step3desc': 'С определен бюджет, депозит и договор',
    'process.step4': 'Първо плащане',
    'process.step4desc': 'Цената на автомобила, такси на търга и транспорт',
    'process.step5': 'Tracking номер',
    'process.step5desc': 'Номер за проследяване, след натоварване на контейнер',
    'process.step5b': 'Снимки',
    'process.step5bdesc': 'Изпращаме снимки от всяка логистична точка по маршрута на колата',
    'process.step6': 'Пристигане на автомобила',
    'process.step6desc': 'В Европа и обмитяване',
    'process.step7': 'В България',
    'process.step7desc': 'Заплащане на автовоз при получаване',
    'process.step8': 'Преди да потеглите',
    'process.step8desc': 'Съдействаме с технотест, транзитни номера, смяна на мигачи и регистрация в КАТ',
    'process.badge': 'Лесен и прозрачен процес',
    'process.ctaTitle': 'Готови ли сте да започнете?',
    'process.ctaSubtitle': 'Обадете се сега и нека намерим мечтания ви автомобил',
    'process.ctaButton': 'ОБАДИ СЕ СЕГА',
    
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
    
    // Contact
    'contact.title': 'Свържи се с Нас',
    'contact.subtitle': 'Готови ли сте да внесете мечтания автомобил?',
    'contact.phone': 'Телефон',
    'contact.email': 'Имейл',
    'contact.location': 'София, България',
    'contact.viber': 'Чат във Viber',
    
    // Features
    'features.title': 'Защо да изберете Key4U?',
    'features.endToEnd': 'Пълна Услуга',
    'features.endToEndDesc': 'От заявка до регистрация, можем да се погрижим за всичко',
    'features.realKm': 'Реални Километри',
    'features.realKmDesc': 'Проверени километри от официални източници - без манипулация',
    'features.affordable': 'Достъпен Лукс',
    'features.affordableDesc': 'Премиум автомобили на конкурентни цени',
    'features.trust': 'Доверие и Прозрачност',
    'features.trustDesc': 'Ясно ценообразуване и честна комуникация',
    'features.local': 'Местна Експертиза',
    'features.localDesc': 'Български екип, който познава процеса',
    
    // Stats
    'stats.title': 'Нашият опит в цифри',
    'stats.subtitle': 'Доверие, което се доказва с всеки внесен автомобил',
    'stats.carsImported': 'Внесени автомобила',
    'stats.inLastYear': 'за последната година',
    'stats.happyClients': 'Доволни клиенти',
    'stats.recommendUs': 'ни препоръчват',
    'stats.averageTime': 'Средно време',
    'stats.forDelivery': 'за доставка',
    'stats.days': 'дни',
    
    // Transparency
    'transparency.title': 'Предоставяме 100% от информацията, която притежаваме.',
    'transparency.subtitle': 'Без празни обещания за "здрави" автомобили',
    
    // Mobile.bg
    'mobile.offers': 'Тук може да намерите нашите предложения.',
    'mobile.viewListings': 'Виж Обявите в Mobile.bg',
    
    // Licensed Importer
    'licensed.badge': 'Лицензиран Вносител',
    'licensed.title': 'Лицензиран вносител на автомобили от Канада и САЩ',
    'licensed.subtitle': 'Работим с най-големите и доверени платформи за автомобилни търгове и продажби в Северна Америка.',
    
    // CTA
    'cta.title': 'Готови ли сте за',
    'cta.titleHighlight': 'мечтания автомобил?',
    'cta.subtitle': 'Ние се грижим за всичко - от намирането до доставката.',
    
    // Footer
    'footer.quickLinks': 'Бързи Връзки',
    'footer.contacts': 'Контакти',
    'footer.emailLabel': 'Имейл:',
    'footer.phoneLabel': 'Телефон:',
    'footer.allRightsReserved': 'Всички права запазени.',
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
