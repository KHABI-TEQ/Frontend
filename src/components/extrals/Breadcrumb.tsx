"use client";

import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex flex-wrap items-center text-sm text-[#5A5D63] mb-4 md:mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="no-underline hover:no-underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#09391C] font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="mx-2">›</span>}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
