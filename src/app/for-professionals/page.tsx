/** @format */
import { Metadata } from 'next';
import ForProfessionalsShowcase from '@/components/new-homepage/ForProfessionalsShowcase';

export const metadata: Metadata = {
  title: 'For Real Estate Professionals | Khabiteq',
  description:
    'Build your digital practice and access real opportunities. Create a professional presence, discover property demand and participate in the Khabiteq ecosystem.',
};

export default function ForProfessionalsPage() {
  return <ForProfessionalsShowcase />;
}
