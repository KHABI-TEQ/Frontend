/** @format */
import { Metadata } from 'next';
import ForAgentsShowcase from '@/components/new-homepage/ForAgentsShowcase';

export const metadata: Metadata = {
  title: 'For Agents | Khabi-Teq',
  description: 'Register and verify your account. Access properties to market and earn commission when you close deals.',
};

export default function ForAgentsPage() {
  return <ForAgentsShowcase />;
}
