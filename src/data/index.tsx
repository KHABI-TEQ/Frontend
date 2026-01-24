/** @format */

import { StaticImageData } from 'next/image';
import { ContactInfo } from '@/types/contact.types';
import facebookIcon from '@/svgs/facebook.svg';
import instagramIcon from '@/svgs/instagram.svg';
import twitterIcon from '@/svgs/twitter.svg';
import linkedInIcon from '@/svgs/linkedIn.svg';
import envelopeIcon from '@/svgs/envelope.svg';
import whatsappIcon from '@/svgs/whatsapp.svg';
import headphoneIcon from '@/svgs/headphone.svg';

//Navbar data
export const navData: {
  name: string;
  url: string;
  isClicked: boolean;
  additionalLinks?: { name: string; url: string }[];
}[] = [
  {
    name: 'Home',
    url: '/',
    isClicked: true,
  },
  {
    name: 'Marketplace',
    url: '/market-place',
    isClicked: false,
    additionalLinks: [ 
      {
        name: 'Buy',
        url: '/market-place',
      },
      {
        name: 'Sell',
        url: '/my-listings',
      },
      {
        name: 'Rent',
        url: '/market-place',
      },
      {
        name: 'Joint Venture',
        url: '/market-place',
      },
    ],
  },
  {
    name: 'Landlord',
    url: '/landlord',
    isClicked: false,
  },
  {
    name: 'Agent',
    url: '/agent',
    isClicked: false,
    additionalLinks: [ 
      {
        name: 'Market Place',
        url: '/agent/market-place',
      },
    ],
  },
  {
    name: 'Policies',
    url: '/policies_page',
    isClicked: false,
  },
  {
    name: 'About us',
    url: '/about_us',
    isClicked: false,
  },
  {
    name: 'Contact Us',
    url: '/contact-us',
    isClicked: false,
  },
];

export const agentnavData: {
  name: string;
  url: string;
  isClicked: boolean;
  additionalLinks?: { name: string; url: string }[];
}[] = [
  {
    name: 'Home',
    url: '/',
    isClicked: true,
  },
  {
    name: 'Marketplace',
    url: '/market-place',
    isClicked: false,
    additionalLinks: [
      {
        name: 'list a property',
        url: '/my-listings',
      },
      {
        name: 'Buy a property',
        url: '/market-place',
      },
      {
        name: 'Rent a property',
        url: '/market-place',
      },
      {
        name: 'Joint Venture',
        url: '/market-place',
      },
    ],
  },
  // {
  //   name: 'Landlord',
  //   url: '/landlord_page',
  //   isClicked: false,
  // },
  {
    name: 'Landlord',
    url: '/dashboard',
    isClicked: false,
  },
  {
    name: 'Agent',
    url: '/dashboard',
    isClicked: false,
  },
  {
    name: 'Policies',
    url: '/policies_page',
    isClicked: false,
  },
  {
    name: 'About us',
    url: '/about_us',
    isClicked: false,
  },
  {
    name: 'Contact Us',
    url: '/contact-us',
    isClicked: false,
  },
];

//Footer Data
export const exploreData: { name: string; url: string; isClicked: boolean }[] =
  [
    {
      name: 'List a property',
      url: '/my-listings',
      isClicked: false,
    },
    {
      name: 'Buy a property',
      url: '/market-place',
      isClicked: false,
    },
    {
      name: 'Become an Agent',
      url: '/agent',
      isClicked: false,
    },
    {
      name: 'About Us',
      url: '/about_us',
      isClicked: false,
    },
  ];

export const servicesData: { name: string; url: string }[] = [
  {
    name: 'Property Sales',
    url: '/market-place',
  },
  {
    name: 'Property Rental',
    url: '/market-place',
  },
  {
    name: 'Agent Partnership Program',
    url: '/agent',
  },
  {
    name: 'Property Management',
    url: '/contact-us',
  },
  {
    name: 'Market Insights and Analytic',
    url: '/contact-us',
  },
];

export const supportData: { name: string; url: string }[] = [
  {
    name: 'FAQ',
    url: '/',
  },
  {
    name: 'Contact us',
    url: '/contact-us',
  },
  {
    name: 'Policies',
    url: '/policies_page',
  },
];

export const iconsData: { image: StaticImageData; url: string }[] = [
  {
    image: facebookIcon,
    url: 'https://www.facebook.com/profile.php?id=61568584928290&mibextid=ZbWKwL',
  },
  {
    image: instagramIcon,
    url: 'https://www.instagram.com/khabiteq_realty/profilecard/?igsh=YjRvanQ3YmlmdDNl',
  },
  {
    image: linkedInIcon,
    url: '#',
  },
  {
    image: twitterIcon,
    url: 'https://x.com/Khabi_Teq?t=Jq6MpEMfwfJ6aQ46CYGPpQ&s=09',
  },
];

//Section1 data
export const section1Data: { name: string; count: number }[] = [
  {
    name: 'Deals Completed',
    count: 22,
  },
  {
    name: 'Years of Experiences',
    count: 4,
  },
  {
    name: 'Satisfied Clients',
    count: 34,
  },
];

//Highlight of Our Real Estate Expertise Section

export const HighlightData: { title: string; text: string }[] = [
  {
    title: 'Market Analysis',
    text: `In-depth understanding of market trends to guide pricing and strategy.`,
  },
  {
    title: 'Property Valuation',
    text: `Accurate assessments to determine the true value of your favourite apartment, cottage etc.`,
  },
  {
    title: 'Legal Assistance',
    text: `Helping clients navigate the complexities of legal paperwork to ensure a smooth transaction`,
  },
  {
    title: 'Negotiation Skill',
    text: `In-depth understanding of market trends to guide pricing and strategy`,
  },
  {
    title: 'Tailored Marketing plan',
    text: `Providing assistance even after the sale, ensuring clients feel supported throughout their journey`,
  },
  {
    title: 'Post - Sale Support',
    text: `Developing customized strategies to showcase properties and attract buyers.`,
  },
];

//Agenty - Benefit of partnering with Khabi-teq
export const benefitData: { title: string; text: string }[] = [
  {
    title: 'Marketing Support',
    text: `Gain exposure through our platform and marketing efforts, ensuring your listings reach the right audience`,
  },
  {
    title: 'Access to Investors',
    text: `Connect with verified buyers and investors actively seeking properties in your area.`,
  },
  {
    title: 'Transparency',
    text: `Enjoy clear and straightforward processes, fostering trust and efficiency in every transaction.`,
  },
  {
    title: 'Due Diligence',
    text: `Benefit from our thorough verification of buyers and sellers, ensuring secure and reliable deals.`,
  },
  {
    title: 'Networking Opportunities',
    text: `Join a growing community of agents and industry professionals, creating opportunities for collaboration and growth.`,
  },
  {
    title: 'Scalable Platform',
    text: `Utilize a user-friendly platform designed to support your business as it grows, with tools that simplify property management and transactions.`,
  },
];

//FAQs
export const GeneralFAQsData: { heading: string; text: string }[] = [
  {
    heading: `How do I find a property on Khabi-Teq?`,
    text: `Use our intuitive search tool to input your preferences, such as property type,
location, and budget. Our system will then match you with the best available
options tailored to your criteria`,
  },
  {
    heading: `What makes Khabi-Teq different?`,
    text: `"We combine real estate expertise with innovative technology to simplify
property transactions and management, offering tailored solutions to meet your needs."`,
  },
  {
    heading: `How can I contact Khabi-Teq for support?`,
    text: `You can reach us through email, phone, or WhatsApp. Visit our Contact Us page
for detailed contact information`,
  },
  {
    heading: `Is there a fee for using Khabi-Teq?`,
    text: `Searching for properties on our platform is completely free. However, fees may
apply for engaging in property transactions or using property management
services`,
  },
  {
    heading: `Can I inspect a property before renting or buying`,
    text: `Yes, we encourage you to request an inspection for any property that interests you. This allows you to ensure it meets your expectations before finalizing any decisions.`,
  },
];

export const LandlordFAQsData: { heading: string; text: string }[] = [
  {
    heading: `How does Khabi-Teq help landlords?`,
    text: `Khabi-Teq connects you with verified tenants, offers comprehensive property management services through trusted partners, and facilitates seamless rent collection and property maintenance.`,
  },
  {
    heading: `Can I list my property for free?`,
    text: `Yes, submitting a property brief is free of charge. Our team will review and list it
on the platform to attract potential tenants or buyers.`,
  },
  {
    heading: `What types of properties can I list?`,
    text: `You can list residential, commercial, and land properties available for rent or sale.`,
  },
  {
    heading: `How does property management work?`,
    text: `We handle all aspects of tenant onboarding, rent collection, property maintenance, and dispute resolution to make property management as seamless as possible for you.`,
  },
];

export const TenantsFAQsData: { heading: string; text: string }[] = [
  {
    heading: `How do I find a property on Khabi-Teq?`,
    text: `Use our search feature to set your preferences, including property type, location, and budget. The system will display relevant listings matching your criteria.`,
  },
  {
    heading: `Is there a fee for using Khabi-Teq?`,
    text: `Searching for properties on the platform is free. However, if you proceed with a property transaction or use additional services, relevant fees may apply.`,
  },
  {
    heading: `Can I inspect a property before renting or buying?`,
    text: `Yes, you can request an inspection for any property that meets your needs. This allows you to see the property firsthand and make an informed decision.`,
  },
  {
    heading: `What happens after I select a property?`,
    text: `Our team will contact you to arrange a property inspection and guide you through the subsequent steps, ensuring a smooth transition from selection to leasing or purchase`,
  },
];

//Agent ~ Frequently Asked Question
export const agentFAQsData: { heading: string; text: string }[] = [
  {
    heading: `How can I partner with Khabi-Teq as an agent?`,
    text: `Agents can join by submitting their details through our registration form. We'll review your application and onboard you as part of our network.`,
  },
  {
    heading: `What are the benefits of partnering with Khabi-Teq?`,
    text: `Agents can join by submitting their details through our registration form. We'll review your application and onboard you as part of our network.`,
  },
  {
    heading: `HIs there a fee to join as an agent?`,
    text: `Agents can join by submitting their details through our registration form. We'll review your application and onboard you as part of our network.`,
  },
  {
    heading: `Is my data secure with Khabi-Teq?`,
    text: `Agents can join by submitting their details through our registration form. We'll review your application and onboard you as part of our network.`,
  },
];

//CLients feedbacks
export const clientData: { name: string; text: string; starsRated: number }[] =
  [
    {
      name: 'Michael .A',
      text: `Khabi-Teq made finding my dream home so easy! The process was seamless, and the team was incredibly supportive every step of the way`,
      starsRated: 5,
    },
    {
      name: 'Johnson Kent',
      text: `Khabi-Teq made finding my dream home so easy! The process was seamless, and the team was incredibly supportive every step of the way`,
      starsRated: 4,
    },
    {
      name: 'Jordan Faraway',
      text: `Khabi-Teq made finding my dream home so easy! The process was seamless, and the team was incredibly supportive every step of the way`,
      starsRated: 5,
    },
  ];

//Contact Us data
export const contactUsData: ContactInfo[] = [
  {
    value: 'info@khabiteqrealty.com',
    icon: envelopeIcon,
    type: 'mail',
  },
  {
    value: '02013306352',
    icon: headphoneIcon,
    type: 'call',
  },
  {
    value: '08132108659',
    icon: whatsappIcon,
    type: 'social_media',
  },
];

//CardData for section 1
export const cardData: {
  header: string;
  value: string;
}[] = [
  {
    header: 'Property Type',
    value: 'Residential',
  },
  {
    header: 'Location',
    value: 'Lagos Ikeja',
  },
  {
    header: 'Property Prices',
    value: 'Residential',
  },
  {
    header: 'Document',
    value: 'C of o, recepit,...',
  },
  {
    header: 'Land size',
    value: `500 m<sup>2</sup>`,
  },
  {
    header: 'Property Features',
    value: `<ul className='list disc list-inside'><li>4 bed Room</li><li>Parking Space</li><li>Security Features</li></ul>`,
  },
];

export const cardDataArray: {
  header: string;
  value: string;
}[][] = [
  [
    {
      header: 'Property Type',
      value: 'Residential',
    },
    {
      header: 'Location',
      value: 'Lagos Ikeja',
    },
    {
      header: 'Property Prices',
      value: '₦75,000,000',
    },
    {
      header: 'Document',
      value: 'C of O, Receipt,...',
    },
    {
      header: 'Land size',
      value: `500 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>4 Bed Room</li><li>Parking Space</li><li>Security Features</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Commercial',
    },
    {
      header: 'Location',
      value: 'Abuja, Garki',
    },
    {
      header: 'Property Prices',
      value: '₦120,000,000',
    },
    {
      header: 'Document',
      value: "Governor's Consent, Deed of Assignment",
    },
    {
      header: 'Land size',
      value: `800 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>Office Space</li><li>Ample Parking</li><li>24/7 Security</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Land',
    },
    {
      header: 'Location',
      value: 'Lekki, Lagos',
    },
    {
      header: 'Property Prices',
      value: '₦50,000,000',
    },
    {
      header: 'Document',
      value: 'Excision, Registered Survey',
    },
    {
      header: 'Land size',
      value: `600 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>Dry Land</li><li>Well Titled</li><li>Close to Major Road</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Apartment',
    },
    {
      header: 'Location',
      value: 'Victoria Island, Lagos',
    },
    {
      header: 'Property Prices',
      value: '₦90,000,000',
    },
    {
      header: 'Document',
      value: 'C of O, Deed of Assignment',
    },
    {
      header: 'Land size',
      value: `350 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>3 Bed Room</li><li>Swimming Pool</li><li>24/7 Power Supply</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Detached Duplex',
    },
    {
      header: 'Location',
      value: 'Banana Island, Lagos',
    },
    {
      header: 'Property Prices',
      value: '₦450,000,000',
    },
    {
      header: 'Document',
      value: "Governor's Consent, C of O",
    },
    {
      header: 'Land size',
      value: `1000 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>5 Bed Room</li><li>Smart Home System</li><li>Private Cinema</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Mini Flat',
    },
    {
      header: 'Location',
      value: 'Yaba, Lagos',
    },
    {
      header: 'Property Prices',
      value: '₦25,000,000',
    },
    {
      header: 'Document',
      value: 'C of O, Survey Plan',
    },
    {
      header: 'Land size',
      value: `250 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>1 Bed Room</li><li>Furnished</li><li>Good Road Network</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Penthouse',
    },
    {
      header: 'Location',
      value: 'Ikoyi, Lagos',
    },
    {
      header: 'Property Prices',
      value: '₦500,000,000',
    },
    {
      header: 'Document',
      value: "Governor's Consent",
    },
    {
      header: 'Land size',
      value: `1200 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>6 Bed Room</li><li>Elevator</li><li>Private Pool</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Bungalow',
    },
    {
      header: 'Location',
      value: 'Ibadan, Oyo State',
    },
    {
      header: 'Property Prices',
      value: '₦40,000,000',
    },
    {
      header: 'Document',
      value: 'Deed of Assignment, Registered Survey',
    },
    {
      header: 'Land size',
      value: `500 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>3 Bed Room</li><li>Gated Compound</li><li>Borehole Water</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Terrace Duplex',
    },
    {
      header: 'Location',
      value: 'Surulere, Lagos',
    },
    {
      header: 'Property Prices',
      value: '₦65,000,000',
    },
    {
      header: 'Document',
      value: 'C of O, Survey Plan',
    },
    {
      header: 'Land size',
      value: `400 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>4 Bed Room</li><li>24/7 Security</li><li>Gated Estate</li></ul>`,
    },
  ],
  [
    {
      header: 'Property Type',
      value: 'Studio Apartment',
    },
    {
      header: 'Location',
      value: 'GRA, Port Harcourt',
    },
    {
      header: 'Property Prices',
      value: '₦18,000,000',
    },
    {
      header: 'Document',
      value: 'C of O, Deed of Lease',
    },
    {
      header: 'Land size',
      value: `200 m<sup>2</sup>`,
    },
    {
      header: 'Property Features',
      value: `<ul className='list-disc list-inside'><li>Furnished</li><li>Gym Access</li><li>24/7 Electricity</li></ul>`,
    },
  ],
];

/**propertyType: 'Residential',
    location: 'Lagos Ikeja',
    propertyPrices: 'Residential',
    document: 'C of o, recepit,...', */
