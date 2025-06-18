/**
 * eslint-disable @typescript-eslint/no-unused-vars
 *
 * @format
 */

/* eslint-disable react-hooks/exhaustive-deps */
/** @format */

"use client";
import { FC, Fragment, useEffect, useState } from "react";
import ShowTable from "@/components/showTable";
import {
	DataProps as AgentDataProps,
	DataProps,
	DataPropsArray,
} from "@/types/agent_data_props";
import DetailsToCheck from "@/components/detailsToCheck";
import { formatDate } from "@/utils/helpers";
import { briefData } from "@/data/sampleDataForAgent";
import Briefs from "./mobileBrief";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import RequestsTable from "./RquestsTable";
import toast from "react-hot-toast";
import { archivo } from "@/styles/font";
import { motion } from "framer-motion";

interface RequestData {
	budgetMin: number;
	budgetMax: undefined;
	docOnProperty: { docName: string; isProvided: boolean; _id: string }[];
	createdAt: string;
	propertyType: string;
	location: {
		localGovernment: any;
		state: string;
		area: string;
	};
	propertyId: {
		propertyType: string;
		location: {
			state: string;
			localGovernment: string;
			area: string;
		};
		price: number;
	};
	price: string | number;
	_id: string;
	requestFrom: {
		fullName: string;
		email: string;
		propertyType: string;
		location: {
			state: string;
			localGovernment: string;
			area: string;
		};
		price: number;
	};
	status: string;
	inspectionDate: string;
	inspectionTime: string;

	date: string;
	propertyPrice: string | number;
	document?: string;
	amountSold?: string | number;
	propertyFeatures?: {
		additionalFeatures: string[];
		noOfBedrooms: number;
	};

	actualLocation?: {
		state: string;
		localGovernment: string;
		area: string;
	};
	pictures?: string[];
}

interface LocalDataProps {
	_id: string;
	propertyType: string;
	location: {
		state: string;
		localGovernment: string;
		area: string;
	};
	price: number;
	docOnProperty: {
		_id: string;
		docName: string;
		isProvided: boolean;
	}[];
	propertyFeatures: {
		additionalFeatures: string[];
		noOfBedrooms: number | null;
	};
	owner: string;
	ownerModel: string;
	areYouTheOwner: boolean;
	usageOptions: string[];
	isAvailable: boolean;
	pictures: string[];
	isApproved: boolean;
	isRejected: boolean;
	landSize: {
		measurementType: string;
		size: number | null;
	};
	createdAt: string;
	updatedAt: string;
	isPreference?: boolean;
}

const Overview = () => {
	const [briefs, setBriefs] = useState({
		totalBrief: 0,
		draftBrief: 0,
		referredAgent: 0,
		completeTransaction: 0,
		totalAmount: 3000000000.0,
	});

	const [selectedOption, setSelectedOption] = useState<string>(
		"View Preference Request"
	);
	const [heading, setHeading] = useState<string>(selectedOption);
	const [submitBrief, setSubmitBrief] = useState<boolean>(true);
	const [isLoadingDetails, setIsLoadingDetails] = useState({
		isLoading: false,
		message: "",
	});
	const [allRequests, setAllRequests] = useState<RequestData[]>([]);
	const [buyerPreferences, setBuyerPreferences] = useState<RequestData[]>([]);

	const [isFullDetailsClicked, setIsFullDetailsClicked] =
		useState<boolean>(false);

	const [detailsToCheck, setDetailsToCheck] = useState<DataProps>(briefData[0]);
	const [activeBriefs, setActiveBriefs] = useState<number>(0);
	const [pendingBriefs, setPendingBriefs] = useState<number>(0);
	const [dealClosed, setDealClosed] = useState<number>(0);
	const [totalBriefs, setTotalBriefs] = useState<DataPropsArray>([]);
	const [recentlyPublishedData, setRecentlyPublishedData] = useState<any[]>([]);

	useEffect(() => {
		if (selectedOption === "View Preference Request") {
			setIsLoadingDetails({
				isLoading: true,
				message: "Loading...",
			});
			(async () => {
				const url = URLS.BASE + URLS.agentGetUserPreferences;
				await GET_REQUEST(url, Cookies.get("token")).then((data) => {
					console.log(data);
					if (data.success) {
						console.log(data.preferences);
						setBuyerPreferences(data.preferences);
						setIsLoadingDetails({
							isLoading: false,
							message: "Data Loaded",
						});
					} else {
						setBuyerPreferences([]);
						setIsLoadingDetails({
							isLoading: false,
							message: "Failed to get data",
						});
					}
				});
			})();
		}
	}, [selectedOption]);

	useEffect(() => {
		if (selectedOption === "Inspection Requests") {
			(async () => {
				const url = URLS.BASE + URLS.agent + URLS.getAllRequests;
				await GET_REQUEST(url, Cookies.get("token")).then((data) => {
					if (data.success) {
						setAllRequests(data.data);
					} else {
						setAllRequests([]);
					}
				});
			})();
		}
	}, [selectedOption]);

	useEffect(() => {
		const getBriefsData = async () => {
			setIsLoadingDetails({
				isLoading: true,
				message: "Loading...",
			});
			try {
				const response = await GET_REQUEST(
					URLS.BASE + "/agent/properties",
					Cookies.get("token")
				);

				console.log("Agent properties response:", response);

				if (response?.success === false) {
					console.error("Failed to get agent data:", response);
					toast.error("Failed to get data");
					return setIsLoadingDetails({
						isLoading: false,
						message: "Failed to get data",
					});
				}
				const data = response;

				if (!data?.properties) {
					console.error("Invalid response structure:", data);
					toast.error("Invalid data structure received");
					return setIsLoadingDetails({
						isLoading: false,
						message: "Invalid data structure",
					});
				}

				const combinedProperties = [
					...(data?.properties.active || []),
					...(data?.properties.pending || []),
				];

				console.log("Combined properties before filtering:", combinedProperties);

				// Filter properties to only include those with isPreference === true
				const preferenceProperties = combinedProperties.filter((property) => {
					console.log("Property isPreference value:", property.isPreference);
					return property.isPreference === true;
				});

				console.log("Filtered preference properties:", preferenceProperties);

				setIsLoadingDetails({
					isLoading: false,
					message: "Data Loaded",
				});
				setActiveBriefs(data.properties.active.length);
				setPendingBriefs(data.properties.pending.length);
				setDealClosed(data.properties.dealsClosed);
				setBriefs({
					...briefs,
					totalBrief: preferenceProperties.length,
				});
				setTotalBriefs(preferenceProperties);
			} catch (error) {
				console.error("Error fetching agent data:", error);
				setIsLoadingDetails({
					isLoading: false,
					message: "Failed to get data",
				});
			} finally {
				setIsLoadingDetails({
					isLoading: false,
					message: "",
				});
			}
		};
		getBriefsData();
	}, []);

	const dynamicContent = () => {
		switch (selectedOption) {
			case SELECTED_OPTIONS.REQUIRE_ATTENTION:
				if (!buyerPreferences || buyerPreferences.length === 0) {
					return totalBriefs.length === 0 ? (
						<div className="w-full h-[200px] flex justify-center items-center">
							<motion.h2
								initial={{ y: 20, opacity: 0 }}
								viewport={{ once: true }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.2 }}
								className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
								No buyer preferences found
							</motion.h2>
						</div>
					) : (
						<Table
							headingColor="#FF3D00"
							headerData={headerData}
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							heading="Urgent Property Request"
							description={`A new buyer preference has been submitted! Review the details and
            match it with available property briefs. Upload suitable options to
            the preference form as soon as possible to ensure a fast and
            seamless transaction`}
							data={totalBriefs.map((item) => ({
								...item,
								date: item.createdAt ? formatDate(item.createdAt) : "",
								propertyType: item.propertyType,
								location: {
									localGovernment: item.location.localGovernment,
									state: item.location.state,
									area: item.location.area,
								},
								propertyPrice: item.price
									? `N ${Number(item.price).toLocaleString()}`
									: "N/A",
								document: item.docOnProperty
									? item.docOnProperty.map((doc) => doc.docName).join(", ")
									: "No document",
							}))}
						/>
					);
				} else {
					return (
						<Table
							headingColor="#FF3D00"
							headerData={headerData}
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							heading="Urgent Property Request"
							description={`A new buyer preference has been submitted! Review the details and
            match it with available property briefs. Upload suitable options to
            the preference form as soon as possible to ensure a fast and
            seamless transaction`}
							data={buyerPreferences?.map((item) => ({
								...item,
								date: formatDate(item.createdAt),
								propertyType: item.propertyType,
								location: {
									localGovernment: item.location.localGovernment,
									state: item.location.state,
									area: item.location.area,
								},
								propertyPrice:
									item.budgetMin !== undefined && item.budgetMax !== undefined
										? `N ${Number(item.budgetMin).toLocaleString()} - ${Number(
												item.budgetMax
										  ).toLocaleString()}`
										: item.price,
								document: item.docOnProperty
									? item.docOnProperty.map((doc) => doc.docName).join(", ")
									: "",
							}))}
						/>
					);
				}

			case SELECTED_OPTIONS.INSPECTION_REQUESTS:
				if (allRequests?.length === 0) {
					return (
						<div className="w-full h-[200px] flex justify-center items-center">
							<motion.h2
								initial={{ y: 20, opacity: 0 }}
								viewport={{ once: true }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.2 }}
								className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
								No inspection requests found
							</motion.h2>
						</div>
					);
				} else {
					return <RequestsTable data={allRequests} />;
				}
			case SELECTED_OPTIONS.THREE_MONTHS_AGO_BRIEF:
				if (briefData?.length === 0) {
					return (
						<div className="w-full h-[200px] flex justify-center items-center">
							<motion.h2
								initial={{ y: 20, opacity: 0 }}
								viewport={{ once: true }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.2 }}
								className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
								No inspection requests found
							</motion.h2>
						</div>
					);
				} else {
					return (
						<Table
							headingColor="black"
							headerData={headerData}
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							heading="3 month ago Brief"
							description={`You have property briefs that have been listed for over 3 months without a transaction. Please confirm if these properties are still available or have been sold to keep our listings updated and accurate.`}
							data={briefData}
						/>
					);
				}
			case SELECTED_OPTIONS.RECENTLY_PUBLISH:
				if (recentlyPublishedData?.length === 0) {
					return (
						<div className="w-full h-[200px] flex justify-center items-center">
							<motion.h2
								initial={{ y: 20, opacity: 0 }}
								viewport={{ once: true }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.2 }}
								className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
								No recently published briefs found
							</motion.h2>
						</div>
					);
				} else {
					return (
						<ShowTable
							headerData={headerData}
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							heading="Publish Brief"
							data={recentlyPublishedData}
						/>
					);
				}
			default:
				break;
		}
	};

	const mobileDynamicContent = () => {
		switch (selectedOption) {
			case SELECTED_OPTIONS.REQUIRE_ATTENTION:
				if (!briefData || briefData.length === 0) {
					return totalBriefs.length === 0 ? (
						<div className="w-full h-[200px] flex justify-center items-center">
							<motion.h2
								initial={{ y: 20, opacity: 0 }}
								viewport={{ once: true }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.2 }}
								className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
								No buyer preferences found
							</motion.h2>
						</div>
					) : (
						<Briefs
							header="Urgent Property request"
							isLoading={isLoadingDetails.isLoading}
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							briefData={totalBriefs}
						/>
					);
				} else {
					return (
						<Briefs
							header="Urgent Property request"
							isLoading={isLoadingDetails.isLoading}
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							briefData={buyerPreferences}
						/>
					);
				}

			case SELECTED_OPTIONS.INSPECTION_REQUESTS:
				if (allRequests?.length === 0) {
					<div className="w-full h-[200px] flex justify-center items-center">
						<motion.h2
							initial={{ y: 20, opacity: 0 }}
							viewport={{ once: true }}
							whileInView={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.2 }}
							className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
							No inspection requests found
						</motion.h2>
					</div>;
				} else {
					return <RequestsTable data={allRequests} />;
				}
			case SELECTED_OPTIONS.RECENTLY_PUBLISH:
				if (totalBriefs?.length === 0) {
					<div className="w-full h-[200px] flex justify-center items-center">
						<motion.h2
							initial={{ y: 20, opacity: 0 }}
							viewport={{ once: true }}
							whileInView={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.2 }}
							className="text-3xl font-bold text-gray-600 text-[24px] leading-[32px] tracking-[0.25px] font-archivo">
							No buyer preferences found
						</motion.h2>
					</div>;
				} else {
					return (
						<Briefs
							isLoading={isLoadingDetails.isLoading}
							header="Publish Brief"
							setDetailsToCheck={setDetailsToCheck}
							setShowFullDetails={setIsFullDetailsClicked}
							briefData={totalBriefs}
						/>
					);
				}
			default:
				break;
		}
	};

	return (
		<Fragment>
			{isFullDetailsClicked ? (
				<div className="w-full mt-[30px]">
					<DetailsToCheck
						submitBrief={submitBrief}
						heading={heading ?? "Overview"}
						setIsFullDetailsClicked={setIsFullDetailsClicked}
						detailsToCheck={detailsToCheck}
					/>
				</div>
			) : (
				<div className="lg:w-[1184px] w-full bg-transparent gap-[30px] lg:px-[30px] mt-[30px] md:mt-[60px] flex flex-col">
					<div className="w-full m-auto min-h-[140px] grid md:grid-cols-2 lg:grid-cols-4 items-center gap-[20px] md:gap-[40px] ">
						{/**Active Brief */}
						<div className="w-full lg:w-[279px] h-[127px] bg-[#8DDB90]/[20%] rounded-[4px] border-[1px] border-[#E4DFDF] py-[25px] px-[23px] flex flex-col gap-[35px]">
							<h4
								className={`text-[#2CAF67] text-base leading-[18px] tracking-[1.25px] font-semibold ${archivo.className}`}>
								Active Brief
							</h4>
							<h2 className="text-[#181336] text-[30px] leading-[24px] tracking-[0.25px] font-semibold font-archivo">
								{isLoadingDetails.isLoading ? (
									<i className="animate-pulse text-sm">{isLoadingDetails.message}</i>
								) : (
									activeBriefs.toLocaleString()
								)}
							</h2>
						</div>
						{/**Total Brief */}
						<Boxes
							heading="Total Brief"
							value={
								isLoadingDetails.isLoading ? (
									<i className="animate-pulse text-sm">{isLoadingDetails.message}</i>
								) : (
									briefs.totalBrief
								)
							}
						/>
						{/**Draft Brief */}
						{/* <Boxes heading='Draft Brief' value={briefs.draftBrief} /> */}
						{/**Total Referred Agent */}
						{/* <Boxes heading='Total referred agent' value={'Coming soon'} /> */}
						{/**Pending brief */}
						<Boxes
							heading="Pending Brief"
							value={
								isLoadingDetails.isLoading ? (
									<i className="animate-pulse text-sm">{isLoadingDetails.message}</i>
								) : (
									pendingBriefs.toLocaleString()
								)
							}
						/>
						{/**Deal Closed */}
						<Boxes
							heading="Deal Closed"
							value={
								isLoadingDetails.isLoading ? (
									<i className="animate-pulse text-sm">{isLoadingDetails.message}</i>
								) : (
									dealClosed.toLocaleString()
								)
							}
						/>
					</div>

					<div className="w-full min-h-[51px] flex gap-[15px] md:gap-[25px] overflow-x-auto hide-scrollbar">
						{OptionData.map((item: string, idx: number) => (
							<Options
								onClick={() => {
									setSelectedOption(item);
									setHeading(item);
								}}
								className={`shrink-0 ${
									selectedOption === item
										? "bg-[#8DDB9033] text-[#09391C] font-bold"
										: "font-normal text-[#5A5D63]"
								}`}
								key={idx}
								text={item}
							/>
						))}
					</div>

					{/**Second section */}
					{/**PC View */}
					<div className="hidden md:flex">{selectedOption && dynamicContent()}</div>

					{/**Mobile View */}
					<div className="flex md:hidden w-full">
						{selectedOption && mobileDynamicContent()}
					</div>
				</div>
			)}
		</Fragment>
	);
};

const headerData: string[] = [
	"Date",
	"Property Type",
	"Location",
	"Price Range",
	"Document",
	"Full details",
];

interface OptionType {
	className: string;
	text: string;
	onClick: () => void;
}

const Options: FC<OptionType> = ({ text, onClick, className }) => {
	return (
		<button
			onClick={onClick}
			type="button"
			className={`min-h-[51px] min-w-[162px] border-[1px] py-[15px] px-[20px] text-[18px] leading-[21.09px] tracking-[0%] border-[#C7CAD0] ${className} transition-all duration-500`}>
			{text}
		</button>
	);
};

const OptionData: string[] = [
	"View Preference Request",
	// 'Total referred Agent',
	// '3 month ago Brief',
	"Manage Inspection Requests",
];

interface TableProps {
	data: DataPropsArray;
	showFullDetails?: boolean;
	headerData?: string[];
	setShowFullDetails: (type: boolean) => void;
	setDetailsToCheck: (data: DataProps) => void;
	heading: string;
	description: string;
	headingColor: string;
}

const Table: FC<TableProps> = ({
	data,
	setShowFullDetails,
	setDetailsToCheck,
	description,
	heading,
	headingColor,
}) => {
	return (
		<section className="w-full flex flex-col">
			<div className="container min-h-fit py-[43.9px] px-[41.16px] bg-white flex flex-col gap-[41.6px]">
				<div className="min-h-[99px] flex flex-col gap-[10px]">
					<h2
						style={{ color: headingColor }}
						className={`font-archivo text-[24.7px] font-semibold leading-[24.7px] tracking-[0%]`}>
						{heading}
					</h2>
					<span className="text-[20px] leading-[32px] tracking-[5%] font-normal text-[#000000]">
						{description}
					</span>
				</div>
				{/**table */}
				<table
					cellPadding={10}
					className="w-full flex flex-col gap-[15px]">
					<thead className="min-h-[54px] py-[6px] px-[8px] bg-[#FAFAFA]">
						{""}
						<tr className="w-full flex">
							{headerData?.map((item: string, idx: number) => (
								<td
									key={idx}
									className="text-[14px] leading-[22.4px] font-normal font-archivo text-[#7C8493]">
									{item}
								</td>
							))}
						</tr>
					</thead>
					<tbody className="space-y-96 overflow-y-scroll hide-scrollbar px-[8px]">
						{data?.map((item, idx: number) => (
							<tr
								className="w-full"
								key={idx}>
								<td className="text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]">
									{item.createdAt?.split("T")[0]}
								</td>
								<td className="text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]">
									{item.propertyType}
								</td>
								<td className="text-[14px] text-left leading-[22.4px] font-normal font-archivo text-[#181336]">
									{item.location.localGovernment}
								</td>
								<td className="text-[14px] leading-[22.4px] font-semibold font-archivo text-[#181336]">
									{/* N {Number(item.propertyPrice).toLocaleString()} */}
									{item.propertyPrice}
								</td>
								{item.docOnProperty.length !== 0 ? (
									<td className="text-[14px] leading-[22.4px] font-normal font-archivo text-nowrap overflow-hidden text-[#181336]">
										{item.docOnProperty
											.slice(0, 2)
											.map(({ docName }) => docName)
											.join(", ")}
										{item.docOnProperty.length > 2 && "..."}
									</td>
								) : (
									<td className="text-[14px] leading-[22.4px] font-normal font-archivo text-nowrap overflow-hidden text-[#181336]">
										No document
									</td>
								)}
								{/* {item.propertyPrice ? (
                  <td className='text-[14px] text-[#14B01A] leading-[22.4px] font-normal font-archivo'>
                    N {Number(item.propertyPrice).toLocaleString()}
                  </td>
                ) : null} */}
								<td className="text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]">
									<button
										type="button"
										onClick={() => {
											console.log(idx);
											setShowFullDetails(true);
											setDetailsToCheck({
												...item,
												location: item.location,
												propertyFeatures: item.propertyFeatures,
											});
										}}
										className="bg-[#8DDB90] min-h-[50px] py-[12px] px-[24px] text-base leading-[25.6px] font-bold tracking-[0%] text-center text-[#FAFAFA]">
										Submit brief
									</button>
									{/* <FontAwesomeIcon
                    onClick={() => {
                      console.log(idx);
                      setShowFullDetails(true);
                      setDetailsToCheck(item);
                    }}
                    icon={faEllipsis}
                    width={24}
                    height={24}
                    title={'See full details'}
                    className='w-[24px] h-[24px] cursor-pointer'
                    color={'#181336'}
                  /> */}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
};

type BoxProps = {
	heading: string;
	value: number | string | React.JSX.Element | React.ReactNode;
};

const Boxes: FC<BoxProps> = ({ heading, value }) => {
	return (
		<div className="w-full lg:w-[279px] h-[127px] bg-[#FFFFFF] rounded-[4px] border-[1px] border-[#E4DFDF] py-[25px] px-[23px] flex flex-col gap-[35px]">
			<h4 className="text-[#000000] text-base leading-[18px] tracking-[1.25px] font-normal font-archivo">
				{heading}
			</h4>
			<h2 className="text-[#181336] text-[30px] leading-[24px] tracking-[0.25px] font-semibold font-archivo">
				{value}
			</h2>
		</div>
	);
};

enum SELECTED_OPTIONS {
	REQUIRE_ATTENTION = "View Preference Request",
	RECENTLY_PUBLISH = "Recently Published",
	INSPECTION_REQUESTS = "Manage Inspection Requests",
	THREE_MONTHS_AGO_BRIEF = "3 month ago Brief",
}
export default Overview;
