/** @format */

'use client';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';
import {
  faUserGroup,
  faFileAlt,
  faMoneyCheckAlt,
  faChartBar,
  faBullhorn,
  faUserShield,
  faBorderAll,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import khabiteqIcon from '@/svgs/khabi-teq.svg';
import { archivo } from '@/styles/font';

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard Overview',
    icon: faBorderAll,
    disabled: false,
  },
  {
    href: '/admin/agent_management',
    label: 'Agent Management',
    icon: faUserGroup,
    disabled: false,
  },
  {
    href: '/admin/brief_management',
    label: 'Briefs Management',
    icon: faFileAlt,
    disabled: false,
  },
  {
    href: '/admin/contact_management',
    label: 'Contact Management',
    icon: faMoneyCheckAlt,
    disabled: false,
  },
  {
    href: '/admin/buyer_tenant_preferences',
    label: 'Buyer/tenant Preferences',
    icon: faUserShield,
    disabled: true,
  },
  {
    href: '/admin/preference_management',
    label: 'Preference Management',
    icon: faUserShield,
    disabled: false,
  },
  {
    href: '/admin/inspection-manegement',
    label: 'Inspection Management',
    icon: faMagnifyingGlass,
    disabled: false,
  },
  // {
  //   href: '/admin/notifications',
  //   label: 'Notifications and Alerts',
  //   icon: faBullhorn,
  //   disabled: true,
  // },
  // {
  //   href: '/admin/roles',
  //   label: 'Role and Permission',
  //   icon: faUserShield,
  //   disabled: true,
  // },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Fragment>
      <div
        className={`relative z-50 min-h-screen w-[270px] bg-white transition-transform duration-300 md:flex flex-col hidden`}>
        <Image
          src={khabiteqIcon}
          width={1000}
          height={1000}
          className='md:w-[169px] md:h-[40px] w-[144px] h-[40px] m-8 cursor-pointer'
          alt='Khabiteq Logo '
          onClick={() => router.push('/')}
        />

        <nav className='flex flex-col space-y-2 border-t-2 p-2 pt-4'>
          {navItems.map(({ href, label, icon, disabled }) => {
            const isActive = pathname === href;
            return (
              <div
                key={href}
                className={`flex items-center ${
                  archivo.className
                } p-4 rounded-md transition-all duration-200 text-base font-medium ${
                  isActive
                    ? 'text-[#8DDB90]'
                    : disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#515B6F] hover:bg-gray-200'
                }`}>
                <FontAwesomeIcon
                  width={24}
                  height={24}
                  icon={icon}
                  className='mr-3 text-lg w-[24px] h-[24px]'
                />
                {disabled ? (
                  <span>{label}</span>
                ) : (
                  <Link href={href}>
                    <span>{label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </Fragment>
  );
}
