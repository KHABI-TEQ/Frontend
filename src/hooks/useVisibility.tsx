/** @format */

//import React from 'react'

import React, { useEffect, useState } from 'react';

export const useVisibility = (
  ref: React.RefObject<
    | HTMLDivElement
    | HTMLSpanElement
    | HTMLElement
    | HTMLHeadingElement
    | HTMLButtonElement
    | HTMLLabelElement
    | null
  >
) => {
  const [isSectionShown, setIsSectionShown] = useState<boolean>(false);

  const makeSectionVisible = () => {
    if (!ref.current) return;
    const getTop = ref.current?.getBoundingClientRect().top;
    const height = window.innerHeight;

    setIsSectionShown(getTop < height);
  };

  useEffect(() => {
    window.addEventListener('scroll', makeSectionVisible);
    return () => {
      window.removeEventListener('scroll', makeSectionVisible);
    };
  });

  return isSectionShown;
};
