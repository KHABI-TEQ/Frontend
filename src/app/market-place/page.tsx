/** @format */

"use client";
import React from "react";
import NewMarketPlace from "@/components/new-marketplace";
import PromoMount from '@/components/promo/PromoMount';

const NewMarketplacePage = () => {
  return (
    <>
      <div id="promo-marketplace-top" className="w-full overflow-hidden bg-transparent h-28 mb-4">
        <div className="container mx-auto px-4 h-full flex items-center justify-center bg-[#F8FAFC] border border-dashed border-gray-200">
          <div className="flex items-center gap-4">
            <img src="/vercel.svg" alt="promo-sample" className="h-16 w-auto object-contain" />
            <div>
              <div className="text-lg font-semibold">Marketplace Ad Slot</div>
              <div className="text-sm text-gray-500">Advertise your listings here — contact us</div>
            </div>
          </div>
        </div>
      </div>
      <PromoMount slot="marketplace-top" targetId="promo-marketplace-top" height="h-28" />
      <NewMarketPlace />
    </>
  );
};
 
export default NewMarketplacePage;
