/** @format */

"use client";

import React, { Fragment } from "react";
import { usePathname } from "next/navigation";
import HeaderLogic from "@/logic/headerLogic";
import NewFooter from "./new-footer";

import { ReactNode } from "react";
import ViewImage from "../general-components/viewImage";
import { usePageContext } from "@/context/page-context";

interface Props {
	children: ReactNode;
} 

export default function HeaderFooterWrapper({ children }: Props) {
	const pathname = usePathname();
	const { viewImage, imageData } = usePageContext();
	return (
		<Fragment>
			<HeaderLogic />
			{children}
			<NewFooter />
			{viewImage && <ViewImage imageData={imageData} />}
		</Fragment>
	);
}