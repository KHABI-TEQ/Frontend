/** @format */

"use client";
import React from "react";
import NewMarketPlace from "@/components/new-marketplace";
import PromoMount from '@/components/promo/PromoMount';

const NewMarketplacePage = () => {
  return (
    <>
      <div id="promo-marketplace-top" className="w-full overflow-hidden bg-transparent h-28"></div>
      <PromoMount slot="marketplace-top" targetId="promo-marketplace-top" className="mb-4" height="h-28" />
      <NewMarketPlace />
    </>
  );
};
 
export default NewMarketplacePage;
