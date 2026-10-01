/** @format */

"use client";

import React, { Fragment } from "react";
import HeaderLogic from "@/logic/headerLogic";
import NewFooter from "./new-footer";

import { ReactNode } from "react";
import PropertyGalleryOverlay from "@/components/common/PropertyGalleryOverlay";
import { usePageContext } from "@/context/page-context";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useUserContext } from "@/context/user-context";
import { KycSubmittedCongratsOverlay } from "@/components/dashboard/KycSubmittedCongratsOverlay";

interface Props {
	children: ReactNode;
	hasAccountToken?: boolean;
}

function isAuthChromeHiddenPath(pathname: string | null): boolean {
	if (!pathname) return false;
	return (
		pathname === "/auth/login" ||
		pathname.startsWith("/auth/login/") ||
		pathname === "/auth/register" ||
		pathname.startsWith("/auth/register/") ||
		pathname === "/auth/forgot-password" ||
		pathname.startsWith("/auth/forgot-password/") ||
		pathname === "/auth/verification-sent" ||
		pathname === "/auth/verify-account" ||
		pathname.startsWith("/auth/verify-account/") ||
		pathname === "/auth/reset-password" ||
		pathname.startsWith("/auth/reset-password/")
	);
}

function hasAccountSession(): boolean {
	if (typeof window === "undefined") return false;
	return Boolean(Cookies.get("token"));
}

export default function HeaderFooterWrapper({ children, hasAccountToken = false }: Props) {
	const { viewImage } = usePageContext();
	const pathname = usePathname();
	const { user } = useUserContext();
	const hideSiteChrome =
		isAuthChromeHiddenPath(pathname) ||
		Boolean(pathname?.startsWith("/buyer")) ||
		Boolean(user?._id || user?.id) ||
		hasAccountToken ||
		hasAccountSession();

	return (
		<Fragment>
			{!hideSiteChrome && <HeaderLogic />}
			{children}
			{!hideSiteChrome && <NewFooter />}
			{viewImage && <PropertyGalleryOverlay />}
			{user ? <KycSubmittedCongratsOverlay user={user} /> : null}
		</Fragment>
	);
}
