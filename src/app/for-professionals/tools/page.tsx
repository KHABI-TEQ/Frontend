/** @format */
import { Metadata } from 'next';
import ForProfessionalsToolsShowcase from '@/components/new-homepage/ForProfessionalsToolsShowcase';

export const metadata: Metadata = {
  title: 'Professional Tools | Khabiteq',
  description:
    'Create your professional profile and use the dashboard tools for marketplace demand, property marketing, services and transaction partnerships.',
};

export default function ForProfessionalsToolsPage() {
  return <ForProfessionalsToolsShowcase />;
}
