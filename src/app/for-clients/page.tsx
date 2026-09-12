/** @format */
import { Metadata } from 'next';
import ForClientsShowcase from '@/components/new-homepage/ForClientsShowcase';

export const metadata: Metadata = {
  title: 'For Clients | Khabiteq',
  description: 'Tell Khabiteq what you are looking for and take a structured path to find the right property, connect with professionals, and access due diligence when you are ready.',
};

export default function ForClientsPage() {
  return <ForClientsShowcase />;
}
