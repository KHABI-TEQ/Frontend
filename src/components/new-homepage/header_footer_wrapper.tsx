/** @format */

"use client";

import React, { Fragment } from "react";
import HeaderLogic from "@/logic/headerLogic";
import NewFooter from "./new-footer";

import { ReactNode } from "react";
import PropertyGalleryOverlay from "@/components/common/PropertyGalleryOverlay";
import { usePageContext } from "@/context/page-context";

interface Props {
	children: ReactNode;
} 

export default function HeaderFooterWrapper({ children }: Props) {
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