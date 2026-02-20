"use client";
import {  useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment } from "react";
import {
  faBars,
  faBorderAll,
  faUserGroup,
  faFileAlt,
  faMoneyCheckAlt,
  faChartBar,
  faBullhorn,
  faUserShield, 
} from "@fortawesome/free-solid-svg-icons";
import khabiteqIcon from "@/svgs/khabi-teq.svg";

const navItems = [
  { href: "/admin", label: "Dashboard Overview", icon: faBorderAll },
  { href: "/admin/agent_management", label: "Agent Management", icon: faUserGroup },
  { href: "/admin/brief_management", label: "Briefs Management", icon: faFileAlt },
  { href: "/admin/transactions", label: "Transaction Management", icon: faMoneyCheckAlt },
  { href: "/admin/analytics", label: "Advance Analytics", icon: faChartBar },
  { href: "/admin/notifications", label: "Notifications and Alerts", icon: faBullhorn },
  { href: "/admin/roles", label: "Role and Permission", icon: faUserShield },
];

export default function AdminNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
  
    return (
      <Fragment>
        <button className="flex py-6 px-8 min-h-full align-top " onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon icon={faBars} color="#fff"
          className="  bg-[#8DDB90] p-4 rounded-full shadow-md" />
        </button>
  
        <div className={`fixed z-50 h-full w-[270px] bg-white shadow-lg transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Image src={khabiteqIcon} width={1000} height={1000} className="md:w-[169px] md:h-[40px] w-[144px] h-[40px] m-8 cursor-pointer" alt="Khabiteq Logo " onClick={() => setIsOpen(false)} />
          <nav className="flex flex-col space-y-2 border-t-2 p-2 pt-4">
            {navItems.map(({ href, label, icon }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href} className={`flex items-center p-4 rounded-md transition-all duration-200 text-base font-medium ${isActive ? "text-[#8DDB90]" : "text-[#515B6F] hover:bg-gray-200"}`}
                onClick={() => setIsOpen(false)} >
                  <FontAwesomeIcon icon={icon} className="mr-3 text-lg" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </Fragment>
    );
  }
  