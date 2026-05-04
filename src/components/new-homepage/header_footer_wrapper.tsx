/** @format */

"use client";

import React, { Fragment } from "react";
import { usePathname } from "next/navigation";
import HeaderLogic from "@/logic/headerLogic";
import NewFooter from "./new-footer";

import { ReactNode } from "react";
import PropertyGalleryOverlay from "@/components/common/PropertyGalleryOverlay";
import { usePageContext } from "@/context/page-context";

interface Props {
	children: ReactNode;
} 

export default function HeaderFooterWrapper({ children }: Props) {
	const pathname = usePathname();
	const { viewImage } = usePageContext();
	return (
		<Fragment>
			<HeaderLogic />
			{children}
			<NewFooter />
			{viewImage && <PropertyGalleryOverlay />}
		</Fragment>
	);
}