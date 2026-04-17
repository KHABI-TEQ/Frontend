/** @format */
import { Metadata } from 'next';
import ForClientsShowcase from '@/components/new-homepage/ForClientsShowcase';

export const metadata: Metadata = {
  title: 'For Clients | Khabi-Teq',
  description: 'Submit preference for sale, rent, shortlet, and joint ventures. Get connected with trusted agents and schedule property Inspection.',
};

export default function ForClientsPage() {
  return <ForClientsShowcase />;
}
