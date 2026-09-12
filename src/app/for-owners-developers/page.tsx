/** @format */
import { Metadata } from 'next';
import ForOwnersDevelopersShowcase from '@/components/new-homepage/ForOwnersDevelopersShowcase';

export const metadata: Metadata = {
  title: 'For Owners & Developers | Khabiteq',
  description:
    'Showcase your property and control how it is represented. List for sale, rent or joint venture and connect with buyers, investors and real estate professionals through Khabiteq.',
};

export default function ForOwnersDevelopersPage() {
  return <ForOwnersDevelopersShowcase />;
}
