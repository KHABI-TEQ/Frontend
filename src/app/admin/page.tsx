/** @format */

"use client";
import { useEffect, useState } from "react";
import {
	faMagnifyingGlass,
	faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AttentionOverview from "@/components/admincomponents/attention_overview";
import AnalysisOverview from "@/components/admincomponents/analysis_overview";
import { archivo } from "@/styles/font";
import Select from "react-select";
import { useFormik } from "formik";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export default function AdminHome() {
	const [activeTab, setActiveTab] = useState("attention");
	const isLoading = useLoading();
	const router = useRouter();

	const formik = useFormik({
		initialValues: {
			selectedStat: { value: "Today", label: "Today" },
		},
		onSubmit: (values) => {
			// console.log(values);
		},
	});

	/**
	 * validate user before going into admin dashboard
	 */

	useEffect(() => {
		const getAdminInfo = async () => {
			const adminToken = Cookies.get("adminToken");
			if (!adminToken) {
				router.push("/admin/auth/login");
			}
			try {
				const response = await GET_REQUEST(URLS.BASE + "/", adminToken);
				console.log(response);
				if (response.status === 200) {
					//do something
				}
			} catch (error) {
				console.log(error);
			}
		};
		getAdminInfo();
	}, []);

	if (isLoading) return <Loading />;

	return (
		<section className="flex flex-col w-full md:w-[initial]">
			{/* Search & Help Button */}
			<div className="flex justify-between items-center">
				<div className="md:w-3/5 mt-2 h-12 flex relative items-center">
					<FontAwesomeIcon
						icon={faMagnifyingGlass}
						size="lg"
						width={24}
						height={24}
						className="text-[#A7A9AD] absolute left-3 w-[24px] h-[24px]"
					/>
					<input
						type="text"
						placeholder="Search for Agent, Briefs"
						className="w-full h-full pl-12 border border-gray-300 bg-transparent rounded-md"
					/>
				</div>
				<button
					type="button"
					className="bg-black w-[30px] h-[30px] flex items-center justify-center rounded-full shadow-md">
					{""}
					<FontAwesomeIcon
						icon={faQuestion}
						color="#fff"
						size="sm"
						className="bg-[#000] rounded-full shadow-md"
					/>
				</button>
			</div>

			{/* Dashboard Header */}
			<div className="flex md:flex-row flex-col justify-between mt-6 md:mr-6 w-full md:w-[initial] gap-2 md:gap-0">
				<div className="flex flex-col gap-1 md:gap-0">
					<h2 className={`text-3xl font-bold text-[#2E2C34] ${archivo.className}`}>
						Dashboard
					</h2>
					<p className={`text-sm text-[#84818A] ${archivo.className}`}>
						Showing your Account metrics from{" "}
						<span>1st Jan 2021 to 31st Jan 2021</span>
					</p>
				</div>
				<div className="flex h-[48px] w-fit md:w-[initial] items-center bg-white px-4 rounded-lg">
					<div className="text-[#84818A] flex items-center text-sm">
						Show stats:
						<Select
							className="text-[#2E2C34] text-sm ml-1"
							styles={{
								control: (styles) => ({
									...styles,
									border: "none",
									boxShadow: "none",
									cursor: "pointer",
									outline: "none",
								}),
							}}
							options={statsOptions}
							defaultValue={statsOptions}
							value={formik.values.selectedStat}
							onChange={(options) => {
								formik.setFieldValue("selectedStat", options);
							}}
						/>
					</div>
				</div>
			</div>

			{/* Overview Tabs */}
			<div className="flex md:flex-row flex-col gap-4 mt-6">
				<button
					type="button"
					onClick={() => setActiveTab("attention")}
					className={`w-fit md:min-w-fit transition-all duration-500 ${
						archivo.className
					} lg:max-w-[226px] py-2 px-[7px] rounded-lg ${
						activeTab === "attention"
							? "bg-[#45D884] text-white"
							: "bg-gray-200 text-black"
					}`}>
					<h3 className="text-base font-bold">Attention Require Overview</h3>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("analysis")}
					className={`w-fit transition-all duration-500 md:min-w-fit px-[17px] ${
						archivo.className
					} lg:max-w-[226px] py-2 rounded-lg ${
						activeTab === "analysis"
							? "bg-[#45D884] text-white"
							: "bg-gray-200 text-black"
					}`}>
					<h3 className="text-base font-bold">Analysis Overview</h3>
				</button>
			</div>

			{/* Conditional Rendering of Overviews */}
			<div className="w-full">
				{activeTab === "attention" ? <AttentionOverview /> : <AnalysisOverview />}
			</div>
		</section>
	);
}

const statsOptions = [
	{ value: "Today", label: "Today" },
	{ value: "Yesterday", label: "Yesterday" },
	{ value: "Monthly", label: "Monthly" },
	{ value: "Yearly", label: "Yearly" },
];
