/** @format */

"use client";
import React, { Fragment } from "react";
import Header from "@/components/new-homepage/header";
import { usePathname } from "next/navigation";

const HeaderLogic = () => {
	const pathname = usePathname();
	return (
		<Fragment>
			<Header />
		</Fragment>
	);
};

export default HeaderLogic;
