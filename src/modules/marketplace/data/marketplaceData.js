const estateProperties = JSON.parse(localStorage.getItem('estateProperties') || '[]');
const registeredEstateFirms = JSON.parse(localStorage.getItem('estateFirms') || '[]');

const transformedEstateFirms = transformEstateFirms([
    ...estateProperties,
    ...registeredEstateFirms
  ]);