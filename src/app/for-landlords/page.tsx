/** @format */
import { Metadata } from 'next';
import ForLandlordsShowcase from '@/components/new-homepage/ForLandlordsShowcase';

export const metadata: Metadata = {
  title: 'For Landlords | Khabi-Teq',
  description: 'List your property for sale, rent, shortlet, or joint venture. Reach more serious buyers with Khabi-Teq.',
};

export default function ForLandlordsPage() {
  return <ForLandlordsShowcase />;
}
