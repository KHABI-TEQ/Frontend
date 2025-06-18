/** @format */
"use client";
import Image from "next/image";
import arrowRight from "@/svgs/arrowR.svg";
import { DataProps } from "@/types/agent_data_props";
import { FC, useEffect, useRef } from "react";
import { usePageContext } from "@/context/page-context";
import { AgentNavData } from "@/enums";
import { useCreateBriefContext } from "@/context/create-brief-context";
import { archivo } from "@/styles/font";

interface DetailsToCheckProps {
	setIsFullDetailsClicked: (type: boolean) => void;
	detailsToCheck: DataProps;
	heading?: string;
	submitBrief?: boolean;
}

const DetailsToCheck: FC<DetailsToCheckProps> = ({
	setIsFullDetailsClicked,
	detailsToCheck,
	heading,
	submitBrief,
}) => {
	const topRef = useRef<HTMLDivElement>(null);
	const { setSelectedNav, setPropertyDetails } = usePageContext();
	const { createBrief, setCreateBrief } = useCreateBriefContext();

	const scrollToTop = () => {
		topRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const excludedKeys = ["__v", "_id", "ownerModel"]; // keys to skip

	useEffect(() => {
		console.log(detailsToCheck);
	}, []);

	useEffect(() => {
		scrollToTop();
	}, []);
	return (
		<div
			ref={topRef}
			className="container w-full min-h-[342px] mt-[5px] lg:mt-0 flex flex-col gap-[20px] lg:gap-[30px]">
			<div className="min-h-[32px] lg:min-w-[268px] flex gap-[24px] items-center">
				<Image
					src={arrowRight}
					width={24}
					height={24}
					alt="Go Back"
					title="Go Back"
					onClick={() => {
						setIsFullDetailsClicked(false);
					}}
					className="w-[24px] h-[24px] cursor-pointer"
				/>
				<div className="flex items-center gap-[8px]">
					<span className="text-[20px] leading-[32px] text-[#25324B] font-normal">
						{heading}
					</span>
					<svg
						width="4"
						height="4"
						viewBox="0 0 4 4"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<circle
							cx="2"
							cy="2"
							r="2"
							fill="#25324B"
						/>
					</svg>
					<span className="text-[20px] leading-[32px] text-[#25324B] font-semibold font-epilogue">
						preference
					</span>
				</div>
			</div>

			<div className="w-full container border-[1px] py-[30px] flex flex-col md:flex-row items-start gap-[39px] border-[#E9EBEB] bg-[#FFFFFF] p-[20px] lg:p-[30px]">
				<div className="w-full lg:w-[539px] h-full bg-[#FAFAFA] py-[30px] px-[28px] flex flex-col gap-[10px] justify-between items-center">
					{/**Reference ID */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Reference ID
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck._id || "N/A"}
						</span>
					</div>
					{/**Date */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Date
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.createdAt}
						</span>
					</div>
					{/**Mandate */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Mandate
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.areYouTheOwner ? "YES" : "NO"}
						</span>
					</div>
					{/**authorised to list the property */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							authorised to list the property
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							YES
						</span>
					</div>
					{/**Property Type */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Property Type
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.propertyType}
						</span>
					</div>
					{/**Location */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Location
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.location?.area || "N/A"},{" "}
							{detailsToCheck.location?.localGovernment || "N/A"},{" "}
						</span>
					</div>
					{/**Property price */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Property Price
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.propertyPrice
								? `N ${Number(detailsToCheck.propertyPrice).toLocaleString()}`
								: "N/A"}
						</span>
					</div>
					{/**List type */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							List Type
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.ownerModel || "N/A"}
						</span>
					</div>
					{/**Documents */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Documents
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.docOnProperty?.length !== 0
								? detailsToCheck.docOnProperty.map(({ docName }) => docName).join(", ")
								: "N/A"}
						</span>
					</div>
					{/***Bedroom */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Bedroom
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{detailsToCheck.propertyFeatures?.noOfBedrooms || "N/A"}
						</span>
					</div>
					{/**Bathroom */}
					<div className="w-full flex justify-between items-center">
						<span className={`text-[#515B6F] text-sm ${archivo.className}`}>
							Bathroom
						</span>
						<span
							className={`text-sm text-[#181336] font-medium ${archivo.className}`}>
							{"N/A"}
						</span>
					</div>
				</div>
				<div className="flex flex-col lg:w-[288px] h-full w-full gap-[20px]">
					{/**Continue */}
					{(detailsToCheck.propertyFeatures?.additionalFeatures.length !== 0 ||
						detailsToCheck?.propertyFeatures?.additionalFeatures.some(
							(item) => item !== undefined
						)) && (
						<div className="py-[20px] px-[15px] flex flex-col gap-[10px] bg-[#FAFAFA] border-[1px] border-[#E9EBEB]">
							<h2 className="text-sm font-archivo font-bold text-black">Condition</h2>
							<div className="w-full grid grid-cols-2 gap-[10px]">
								{detailsToCheck.propertyFeatures?.additionalFeatures.map(
									(item: string, idx: number) => (
										<span
											key={idx}
											className="text-sm font-archivo text-[#141A16]">
											{item}
										</span>
									)
								)}
							</div>
						</div>
					)}
					{/**Features */}
					{detailsToCheck?.features !== undefined && (
						<div className="py-[20px] px-[15px] flex flex-col gap-[10px] bg-[#FAFAFA] border-[1px] border-[#E9EBEB]">
							<h2 className="text-sm font-archivo font-bold text-black">Features</h2>
							<div className="w-full grid grid-cols-2 gap-[10px]">
								{detailsToCheck?.features?.map(
									(item: { featureName: string }, idx: number) => (
										<span
											key={idx}
											className="text-sm font-archivo text-[#141A16]">
											{item?.featureName}
										</span>
									)
								)}
							</div>
						</div>
					)}
				</div>
				<div className=" flex gap-[20px] items-start">
					{/**Images */}
					{detailsToCheck.pictures?.length !== 0 && (
						<div className="flex flex-col gap-[10px]">
							<h2 className="text-[#585B6C] text-[14px] leading-[22.4px] tracking-[0.1px] font-normal">
								Upload Image
							</h2>
							<div className="grid grid-cols-2 gap-[10px] w-full">
								{detailsToCheck?.pictures?.map((picture: any, idx: number) => {
									// const isBlob = picture instanceof Blob;
									// const src = isBlob ? URL.createObjectURL(picture) : picture;
									return (
										<Image
											key={idx}
											src={picture}
											alt=""
											width={200}
											height={200}
											//onLoad={() => isBlob && URL.revokeObjectURL(src)}
											className="w-[131px] h-[98px] object-cover bg-[#D9D9D9]"
										/>
									);
								})}
							</div>
						</div>
					)}

					{/**Submit Brief */}
					{heading === "Require Attention" && (
						<div className="w-[256px] min-h-[100px] flex flex-col gap-[6px]">
							<span className="font-ubuntu text-[#000000] text-[14px] leading-[22.4px] tracking-[0.1px] font-normal">
								If you&apos;ve found a matching brief for this preference, please submit
								it now
							</span>
							<button
								onClick={() => {
									setCreateBrief({
										...createBrief,
										areYouTheOwner:
											detailsToCheck.areYouTheOwner !== undefined &&
											detailsToCheck.areYouTheOwner,
										propertyType: detailsToCheck.propertyType,
										noOfBedroom: detailsToCheck.propertyFeatures?.noOfBedrooms,
										selectedState: {
											value:
												detailsToCheck.location?.state !== undefined
													? detailsToCheck.location.state
													: "",
											label:
												detailsToCheck.location?.state !== undefined
													? detailsToCheck.location.state
													: "",
										},
										selectedLGA: {
											value:
												detailsToCheck.location?.localGovernment !== undefined
													? detailsToCheck.location.localGovernment
													: "",
											label:
												detailsToCheck.location?.localGovernment !== undefined
													? detailsToCheck.location.localGovernment
													: "",
										},
										selectedCity:
											detailsToCheck.location?.area !== undefined
												? detailsToCheck.location.area
												: "",
										documents:
											detailsToCheck.docOnProperty !== undefined
												? detailsToCheck.docOnProperty.map(({ docName }) => docName)
												: [""],
										price: detailsToCheck.price.toString(),
										fileUrl:
											detailsToCheck.pictures !== undefined
												? detailsToCheck.pictures.map((item: string) => ({
														id: item,
														image: item,
												  }))
												: [],
										usageOptions:
											detailsToCheck.usageOptions !== undefined
												? detailsToCheck.usageOptions
												: [],
									});
									setSelectedNav(AgentNavData.CREATE_BRIEF);
									setPropertyDetails({
										price: detailsToCheck.propertyPrice,
										propertyType: detailsToCheck.propertyType,
										selectedState: {
											value: detailsToCheck.location.state,
											label: "",
										},
										selectedCity: { value: "", label: "" },
										usageOptions: ["C of Document", "Lorem ipsum"],
										documents: ["C of Document", "Lorem ipsum"],
										docOnProperty: [],
										noOfBedroom: "5",
										additionalFeatures: "",
									});
								}}
								type="button"
								className="min-h-[50px] w-full bg-[#8DDB90] py-[12px] px-[24px] text-base text-[#FAFAFA] text-center tracking-[0%] leading-[25.6px] font-bold">
								Submit Brief
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

interface ContainerProps {
	heading: string;
	title?: string | undefined;
	containsList?: boolean;
	mapData?: string[];
}

const Container: FC<ContainerProps> = ({
	heading,
	title,
	containsList,
	mapData,
}) => {
	return (
		<div className="min-w-fit h-fit bg-[#FAFAFA] p-[20px] gap-[6px] flex flex-col">
			<h3 className="text-[#585B6C] font-ubuntu text-[14px] font-normal leading-[22.4px] tracking-[0.1px]">
				{heading}
			</h3>
			{containsList ? (
				<ol className="text-[14px] list-disc list-inside leading-[22.4px] tracking-[0.1px] font-medium text-[#141A16]">
					{mapData?.length !== 0 ? (
						mapData?.map((item, idx) => <li key={idx}>{item}</li>)
					) : (
						<li>No data available</li>
					)}
				</ol>
			) : (
				<h2 className="text-[#141A16] font-ubuntu text-[14px] font-medium leading-[22.4px] tracking-[0.1px]">
					{title}
				</h2>
			)}
		</div>
	);
};

export default DetailsToCheck;
