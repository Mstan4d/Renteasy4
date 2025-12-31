// src/modules/marketplace/data/serviceCategories.js
export const serviceCategories = [
    {
      id: 'property-managers',
      name: 'Property Managers',
      icon: '🏢',
      description: 'Professional property management firms',
      providers: ['estate-firms', 'property-managers', 'real-estate-agents']
    },
    {
      id: 'skilled-trades',
      name: 'Skilled Trades',
      icon: '🔧',
      description: 'Licensed tradespeople and contractors',
      subCategories: [
        { id: 'electrician', name: 'Electricians', icon: '⚡' },
        { id: 'plumber', name: 'Plumbers', icon: '🚰' },
        { id: 'carpenter', name: 'Carpenters', icon: '🪚' },
        { id: 'painter', name: 'Painters', icon: '🎨' },
        { id: 'mason', name: 'Masons', icon: '🧱' },
        { id: 'welder', name: 'Welders', icon: '🔥' },
        { id: 'mechanic', name: 'Mechanics', icon: '🔧' },
        { id: 'ac-technician', name: 'AC Technicians', icon: '❄️' }
      ]
    },
    {
      id: 'cleaning-services',
      name: 'Cleaning Services',
      icon: '🧹',
      description: 'Professional cleaning and sanitation',
      subCategories: [
        { id: 'home-cleaning', name: 'Home Cleaning', icon: '🏠' },
        { id: 'office-cleaning', name: 'Office Cleaning', icon: '🏢' },
        { id: 'industrial-cleaning', name: 'Industrial Cleaning', icon: '🏭' },
        { id: 'carpet-cleaning', name: 'Carpet Cleaning', icon: '🧶' },
        { id: 'window-cleaning', name: 'Window Cleaning', icon: '🪟' }
      ]
    },
    {
      id: 'maintenance-repair',
      name: 'Maintenance & Repair',
      icon: '🛠️',
      description: 'General maintenance and repair services',
      subCategories: [
        { id: 'appliance-repair', name: 'Appliance Repair', icon: '🔌' },
        { id: 'furniture-repair', name: 'Furniture Repair', icon: '🪑' },
        { id: 'roofing', name: 'Roofing', icon: '🏠' },
        { id: 'fencing', name: 'Fencing', icon: '🌳' },
        { id: 'pest-control', name: 'Pest Control', icon: '🐜' }
      ]
    }
  ];
  
  export const serviceTags = [
    { id: 'emergency', name: 'Emergency Service', icon: '🚨', color: '#ef4444' },
    { id: '24-7', name: '24/7 Available', icon: '⏰', color: '#3b82f6' },
    { id: 'licensed', name: 'Licensed', icon: '📜', color: '#10b981' },
    { id: 'insured', name: 'Insured', icon: '🛡️', color: '#8b5cf6' },
    { id: 'residential', name: 'Residential', icon: '🏠', color: '#3b82f6' },
    { id: 'commercial', name: 'Commercial', icon: '🏢', color: '#8b5cf6' },
    { id: 'industrial', name: 'Industrial', icon: '🏭', color: '#f59e0b' },
    { id: 'luxury', name: 'Luxury Properties', icon: '💎', color: '#ec4899' }
  ];