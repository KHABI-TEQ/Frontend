/** @format */
import { Metadata } from 'next';
import ForDevelopersShowcase from '@/components/new-homepage/ForDevelopersShowcase';

export const metadata: Metadata = {
  title: 'For Developers | Khabiteq',
  description:
    'Develop. Distribute. Sell with Trust. Showcase completed properties or off-plan projects and work with professionals to expand your reach on Khabiteq.',
};

export default function ForDevelopersPage() {
  return <ForDevelopersShowcase />;
}
