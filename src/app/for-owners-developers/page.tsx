/** @format */
import { Metadata } from 'next';
import ForOwnersDevelopersShowcase from '@/components/new-homepage/ForOwnersDevelopersShowcase';

export const metadata: Metadata = {
  title: 'For Owners & Developers | Khabiteq',
  description:
    'Present your property or development on Khabiteq. List for sale, rent, shortlet or joint venture, connect with verified professionals, and reach serious seekers.',
};

export default function ForOwnersDevelopersPage() {
  return <ForOwnersDevelopersShowcase />;
}
