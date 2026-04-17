/** @format */
import { Metadata } from 'next';
import ForDevelopersShowcase from '@/components/new-homepage/ForDevelopersShowcase';

export const metadata: Metadata = {
  title: 'For Developers | Khabi-Teq',
  description: 'Showcase your real estate projects to thousands of buyers. List developments for sale, rent, or joint venture. Connect with verified agents and reach serious investors.',
};

export default function ForDevelopersPage() {
  return <ForDevelopersShowcase />;
}
