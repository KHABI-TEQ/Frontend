/** @format */

import UserTypesShowcase from '@/components/new-homepage/UserTypesShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Who Khabiteq Is For | Khabiteq',
  description:
    'Discover how Khabiteq supports property seekers, owners and developers, real estate professionals, lawyers, and surveyors.',
};

export default function UserTypesPage() {
  return <UserTypesShowcase />;
}
