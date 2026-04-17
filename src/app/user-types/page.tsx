/** @format */

import UserTypesShowcase from '@/components/new-homepage/UserTypesShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Developers, Agents & Buyers | Khabiteq',
  description: 'Discover how Khabiteq helps developers, agents, and buyers connect in the real estate market.',
};

export default function UserTypesPage() {
  return <UserTypesShowcase />;
}
