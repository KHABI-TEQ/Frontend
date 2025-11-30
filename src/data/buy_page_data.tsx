/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const propertyReferenceData: {
  heading: string;
  options: any[];
}[] = [
  {
    heading: 'Type of Residential Buildings',
    options: ['Bungalow', 'Duplex', 'Flat/Apartment', 'Terrace House', 'Mansion', 'Others'],
  },
  {
    heading: 'Type of Commercial Building',
    options: ['Office Buildings', 'Shopping Malls/Plazas', 'Warehouses', 'Hotels', 'Factories', 'Worshops', 'School', 'Hospitals/Clinics', 'Petrol Station', 'Religious Buildings Church/Mosque', 'Others'],
  },
  {
    heading: 'Type of Property',
    options: ['Land', 'Residential', 'Commercial'],
  },
  {
    heading: 'Usage Options',
    options: ['Lease', 'Outright Sale', 'All', 'Joint Venture'],
  },
  {
    heading: 'Budget Range',
    options: [
      'N50 Million - N100 Million',
      ' N100 Million - N500 Million',
      'N500 Million - N1 Billion',
      'Above N1 Billion',
    ],
  },
  {
    heading: 'Preferred Location',
    options: ['Lagos Mainland', 'Lagos Island'],
  },
  {
    heading: 'Land Size',
    options: ['1500 square meter', '2500 square meter', '3000 square meter'],
  },
 
  {
    heading: 'Document Type',
    options: ['Governor Consent', 'C of O', 'Survey Document'],
  },
  {
    heading: 'Desires Features',
    options: [
      'Contemporary Designs',
      'Modern Interior Finishing',
      'Guest Toilet',
      'Parking for up to 5 Cars',
      'All Rooms Ensuite',
      'POP Ceilings',
      'Fully Fitted Kitchen',
      'Chandeliers',
      'Bluetooth Speakers',
      'Spacious Dining Area',
      'Concrete Floors',
      'Smart Switches',
      'Roof Top Terrace',
      'Spacious Compound',
      'Security',
      'Balconies',
      'Closets',
      'Walk in Closet',
      'Walk in Showers',
      'Bath Tub',
      'CCTV',
      'Swimming Pool',
    ],
  },
  {
    heading: 'Bedroom',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "More"],
  },
  {
    heading: 'Type of Measurement',
    options: ['Plot', 'Square Meter', 'Acres'],
  },
];


export const propertyReferenceDataWithoutUsageOption: {
  heading: string;
  options: string[];
}[] = [
  {
    heading: 'Type of Property',
    options: ['Land', 'Residential', 'Commercial'],
  },
  // {
  //   heading: 'Usage Options',
  //   options: ['Sample 1', ' Sample 2', 'Sample 3'],
  // },
  {
    heading: 'Budget Range',
    options: [
      'N50 Million - N100 Million',
      ' N100 Million - N500 Million',
      'N500 Million - N1 Billion',
    ],
  },
  {
    heading: 'Preferred Location',
    options: ['Lagos Mainland', 'Lagos Island'],
  },
  {
    heading: 'Land Size',
    options: ['1500 square meter', '2500 square meter', '3000 square meter'],
  },
  {
    heading: 'Document Type',
    options: ['Governor Consent', 'C of O', 'Survey Document'],
  },
  {
    heading: 'Desires Features',
    options: [
      // '1 Bedroom',
      // '2 Bedrooms',
      // '3 Bedrooms',
      // '4 Bedrooms and more',
      'Contemporary Designs',
      'Modern Interior Finishing',
      'Guest Toilet',
      'Parking for up to 5 Cars',
      'All Rooms Ensuite',
      'POP Ceilings',
      'Fully Fitted Kitchen',
      'Chandeliers',
      'Bluetooth Speakers',
      'Spacious Dining Area',
      'Concrete Floors',
      'Smart Switches',
      'Roof Top Terrace',
      'Spacious Compound',
      'Security',
      'Balconies',
      'Closets',
      'Walk in Closet',
      'Walk in Showers',
      'Bath Tub',
      'CCTV',
      'Swimming Pool',
    ],
  },
];
