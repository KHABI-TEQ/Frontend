/** @format */
import sampleImg from '@/assets/noImageAvailable.png';

// Sample Nigerian states (for demo purposes)
const nigeriaStates = [
  { name: 'Lagos', code: 'LA' },
  { name: 'Abuja', code: 'FC' },
  { name: 'Ibadan', code: 'OY' },
  { name: 'Kano', code: 'KN' },
  { name: 'Port Harcourt', code: 'RV' },
];

// Helper function to get a random state
const getRandomState = () => {
  const states = nigeriaStates;
  return states[Math.floor(Math.random() * states.length)].name;
};

// Helper function to get a random city (placeholder)
const getRandomCity = (stateCode: string) => {
  const cityMap: Record<string, string[]> = {
    'LA': ['Ikeja', 'Lekki', 'Badagry', 'Ikorodu'],
    'FC': ['Abuja', 'Gwagwalada', 'Kuje'],
    'OY': ['Ibadan', 'Eruwa', 'Oyo'],
    'KN': ['Kano', 'Tarauni', 'Warawa'],
    'RV': ['Port Harcourt', 'Obio-Akpor', 'Okrika'],
  };
  const cities = cityMap[stateCode] || ['Default City'];
  return cities[Math.floor(Math.random() * cities.length)];
};

/**
 * export interface DataProps {
  date: string;
  propertyType: string;
  location: string;
  propertyPrice: string | number;
  document?: string;
  amountSold?: string | number;
  propertyFeatures?: {
    additionalFeatures: string[];
    noOfBedrooms: number;
  };
  docOnProperty?: { _id: string; isProvided: boolean; docName: string }[];
  actualLocation?: {
    state: string;
    localGovernment: string;
    area: string;
  };
  pictures?: string[];
}
 */

// Updated briefData with actual locations
export const briefData = Array.from({ length: 7 }, (_, i) => ({
  areYouTheOwner: true,
  createdAt: new Date().toISOString(),
  docOnProperty: [
    {
      docName: 'C of O',
      isProvided: true,
      _id: '',
    },
  ],
  isApproved: false,
  isAvailable: true,
  isRejected: false,
  location: {
    state: 'Lagos',
    localGovernment: 'Agege',
    area: `Area ${i + 1}`,
  },
  owner: '67f7dbaa9a4c7c00654e69e8',
  ownerModel: 'Agent',
  pictures: [sampleImg.src],
  price: 400000 + i * 5000,
  propertyPrice: 4000000,
  propertyFeatures: {
    additionalFeatures: ['Guest Toilet', 'Swimming pool'],
    noOfBedrooms: 45,
  },
  propertyType: 'Commercial',
  updatedAt: new Date().toISOString(),
  usageOptions: ['Joint Venture'],
  __v: 0,
  _id: `67f948841164d900648b21${String(i).padStart(2, '0')}`,
}));

// export const fetchTotalBrief = async () => {
//   try {
//     // const response = await fetch('API_ENDPOINT');
//     const response = await fetch(URLS.BASE + URLS.agentfetchTotalBriefs, {
//       signal,
//     });
//     const result = await response.json();

//     if (result.success) {
//       const combinedData = [...result.data.sellProperties, ...result.data.rentProperties];
//       const formattedData = combinedData.map((property) => ({
//         date: new Date(property.createdAt).toLocaleDateString(),
//         propertyType: property.propertyType,
//         location: `${property.location.state}, ${property.location.localGovernment}`,
//         propertyPrice: property.price || property.rentalPrice,
//         document: property.docOnProperty ? property.docOnProperty.map(doc => doc.docName).join(', ') : 'N/A',
//       }));
//       return { success: true, data: formattedData };
//     } else {
//       return { success: false, message: 'Failed to fetch data' };
//     }
//   } catch (error) {
//     console.error('An error occurred while fetching data:', error);
//     return { success: false, message: 'An error occurred while fetching data' };
//   }
// };

// Updated completeTransactionData with actual locations
export const completeTransactionData = [
  {
    date: '12/12/2024',
    propertyType: 'Residential',
    location: `Lagos, ${getRandomCity('LA')}`, // Random city in Lagos
    propertyPrice: 200000000,
    amountSold: 200000000,
  },
  {
    date: '09/12/2024',
    propertyType: 'Residential',
    location: `Lagos, ${badagryCity?.name || 'Badagry'}`, // Badagry city in Lagos
    propertyPrice: 200000000,
    amountSold: 200000000,
  },
  {
    date: '12/12/2024',
    propertyType: 'Residential',
    location: `Abuja, ${getRandomCity('FC')}`, // Random city in Abuja
    propertyPrice: 200000000,
    amountSold: 200000000,
  },
  // Add more entries as needed
];
