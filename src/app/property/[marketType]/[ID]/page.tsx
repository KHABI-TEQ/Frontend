/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, {
	FC,
	Fragment,
	MouseEventHandler,
	useEffect,
	useState,
} from "react";
import arrowRightIcon from "@/svgs/arrowR.svg";
import Image from "next/image";
import { usePageContext } from "@/context/page-context";
import { useLoading } from "@/hooks/useLoading";
import Loading from "@/components/loading-component/loading";
import { epilogue } from "@/styles/font";
import checkIcon from "@/svgs/checkIcon.svg";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput, {
	Country,
	isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useParams, usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { URLS } from "@/utils/URLS";
import { useSelectedBriefs } from "@/context/selected-briefs-context";
import toast from "react-hot-toast";
import { shuffleArray } from "@/utils/shuffleArray";
import sampleImage from "@/assets/Rectangle.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import copy from "@/utils/copyItem";
import Card from "@/components/general-components/card";
import { IsMobile } from "@/hooks/isMobile";
import MobileSelectedBottomBar from "@/components/marketplace/MobileSelectedBottomBar";
import BreadcrumbNav from "@/components/general-components/BreadcrumbNav";
import Link from "next/link";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

// const selectedBriefs = 9;

interface DetailsProps {
	propertyId: string;
	price: number;
	propertyType: string;
	bedRoom: number;
	propertyStatus: string;
	location: {
		state: string;
		localGovernment: string;
		area: string;
	};
	landSize: {
		measurementType: string;
		size: number | null;
	};
	additionalFeatures: {
		additionalFeatures: string[];
		noOfBedrooms?: number;
		noOfBathrooms?: number;
		noOfToilets?: number;
		noOfCarParks?: number;
	};
	features: string[];
	tenantCriteria: { _id: string; criteria: string }[];
	areYouTheOwner: boolean;
	isAvailable: boolean | string;
	isApproved?: boolean;
	isRejected?: boolean;
	isPreference?: boolean;
	isPremium?: boolean;
	pictures: string[];
	createdAt: string;
	updatedAt: string;
	owner: string;
	docOnProperty: { isProvided: boolean; _id: string; docName: string }[];
	briefType?: string;
	propertyCondition?: string;
	_id?: string;
	__v?: number;
	noOfCarParks?: number;
	noOfBathrooms?: number;
	noOfToilets?: number;
}

interface FormProps {
	name: string;
	email: string;
	phoneNumber: string;
	gender: string;
	message: string;
}

type HouseFrameProps = {
	propertyType: string;
	pictures: string[];
	features: { featureName: string; id: string }[];
	location: {
		state: string;
		area: string;
		localGovernment: string;
	};
	noOfBedrooms: number;
	_id: string;
};

const ProductDetailsPage = () => {
	const { selectedBriefs, setSelectedBriefs } = useSelectedBriefs();
	// const searchParams = useSearchParams();
	// const selectedBriefsList = JSON.parse(searchParams?.get('selectedBriefs') || '[]');
	// const selectedBriefs = selectedBriefsList.length;

	const [point, setPoint] = useState<string>("Details");
	const { isContactUsClicked, isModalOpened, setImageData, setViewImage } =
		usePageContext();
	const [scrollPosition, setScrollPosition] = useState(0);
	const isLoading = useLoading();
	const [details, setDetails] = useState<DetailsProps>({
		propertyId: "",
		price: 0,
		propertyType: "",
		bedRoom: 0,
		propertyStatus: "",
		location: {
			state: "",
			localGovernment: "",
			area: "",
		},
		landSize: {
			measurementType: "",
			size: null,
		},
		additionalFeatures: {
			additionalFeatures: [],
		},
		features: [],
		tenantCriteria: [],
		areYouTheOwner: false,
		isAvailable: false,
		isApproved: false,
		isRejected: false,
		isPreference: false,
		isPremium: false,
		pictures: [],
		createdAt: "",
		updatedAt: "",
		owner: "",
		docOnProperty: [],
		briefType: "",
		propertyCondition: "",
		noOfCarParks: 0,
		noOfBathrooms: 0,
		noOfToilets: 0,
		_id: "",
		__v: 0,
	});
	const [featureData, setFeatureData] = useState<
		{ _id: string; featureName: string }[]
	>([]); 
	const path = usePathname();
	const params = useParams();
	const marketType = params.marketType as string;
	// const id = Array.isArray(params?.id)
	// 	? params.id[0]
	// 	: typeof params?.id === "string"
	// 	? params.id
	// 	: "";

	const id = params.ID as string;

	const router = useRouter();
	const [isDataLoading, setDataLoading] = useState<boolean>(false);
	const [data, setData] = useState<any[]>([]);
	const [agreedToTermsOfUse, setAgreedToTermsUse] = useState<boolean>(false);
	// const [selectedBriefs, setSelectedBriefs] = useState(2);
	// const [selectedBriefsList, setSelectedBriefsList] = useState<any[]>([]);
	const [isAddForInspectionModalOpened, setIsAddForInspectionModalOpened] =
		useState<boolean>(false);
	const is_mobile = IsMobile();
	const { setPropertySelectedForInspection, setIsComingFromPriceNeg } =
		usePageContext();

	const handlePreviousSlide = () => {
		const scrollableElement = document.getElementById(
			"scrollableElement"
		) as HTMLElement;

		if (scrollableElement) {
			const maxScrollPosition =
				scrollableElement.scrollWidth - scrollableElement.clientWidth;
			const increment = 500; // The amount to scroll each time (in pixels)

			// Calculate the next scroll position
			const newScrollPosition = Math.min(
				scrollPosition - increment,
				maxScrollPosition
			);

			// Scroll the element
			scrollableElement.scrollTo({
				left: newScrollPosition,
				behavior: "smooth",
			});

			// Update the state with the new scroll position
			setScrollPosition(newScrollPosition);
		}
	};

	const handleNextSlide = () => {
		const scrollableElement = document.getElementById(
			"scrollableElement"
		) as HTMLElement;

		if (scrollableElement) {
			const maxScrollPosition =
				scrollableElement.scrollWidth - scrollableElement.clientWidth;
			const increment = 500; // The amount to scroll each time (in pixels)

			// Calculate the next scroll position
			const newScrollPosition = Math.min(
				scrollPosition + increment,
				maxScrollPosition
			);

			// Scroll the element
			scrollableElement.scrollTo({
				left: newScrollPosition,
				behavior: "smooth",
			});

			// Update the state with the new scroll position
			setScrollPosition(newScrollPosition);
		}
	};

	const validationSchema = Yup.object({
		name: Yup.string().required("Name is required"),
		email: Yup.string()
			.email()
			.required()
			.matches(/^[^\s@]+@[^\s@]+\.com$/, "Invalid email address"),
		phoneNumber: Yup.string()
			.required()
			.required("Contact number is required")
			.test("isValidPhoneNumber", "Invalid phone number", (value) =>
				isValidPhoneNumber(value || "")
			),
		gender: Yup.string().required("Gender is required"),
		message: Yup.string().required(),
	});

	const formik = useFormik({
		initialValues: {
			name: "",
			email: "",
			phoneNumber: "",
			gender: "",
			message: "",
		},
		validationSchema,
		onSubmit: async (values: FormProps, { resetForm }) => {
			const payload = {
				propertyId: details.propertyId,
				requestFrom: {
					email: values.email,
					phoneNumber: values.phoneNumber,
					fullName: values.name,
				},
				propertyType: "PropertyRent",
			};
			if (agreedToTermsOfUse) {
				try {
					const response = await toast.promise(
						() => axios.post(URLS.BASE + "/property/request-inspection", payload),
						{
							loading: "Submitting request...",
							success: "Successfully submitted for inspection",
							// error: 'Failed to submit request',
						}
					);

					// Display the API response message in a toast
					if (response?.data?.message) {
						toast.success(response.data.message);
					}
				} catch (error: any) {
					// Handle error and display the error message from the API
					if (error.response?.data?.message) {
						toast.error(error.response.data.message);
					} else {
						console.error(error);
					}

					formik.setValues({
						name: "",
						email: "",
						phoneNumber: "",
						gender: "",
						message: "",
					});
				}
				return;
			}
			toast.error("You need to agree to the terms of use.");
			return;
		},
	});

	useEffect(() => {

		const getProductDetails = async () => {
			try {
				const res = await axios.get(URLS.BASE + URLS.getOneProperty + id);

				if (res.status === 200) {
					if (typeof res.data === "object") {
						setDetails({
							price: res.data.price,
							propertyType: res.data.propertyType,
							bedRoom:
								res.data.bedRoom ||
								res.data.noOfBedrooms ||
								res.data.additionalFeatures?.noOfBedrooms ||
								0,
							propertyStatus: res.data.propertyCondition || "",
							location: res.data.location,
							tenantCriteria: res.data.tenantCriteria || [],
							pictures:
								res.data.pictures && res.data.pictures.length > 0
									? res.data.pictures
									: [sampleImage.src],
							propertyId: res.data._id,
							createdAt: res.data.createdAt,
							owner: res.data.owner,
							updatedAt: res.data.updatedAt,
							isAvailable:
								res.data.isAvailable === "yes" || res.data.isAvailable === true,
							docOnProperty: res.data.docOnProperty || [],
							landSize: res.data.landSize || { measurementType: "", size: null },
							additionalFeatures: {
								additionalFeatures:
									res.data.additionalFeatures?.additionalFeatures || [],
								noOfBedrooms: res.data.additionalFeatures?.noOfBedrooms || 0,
								noOfBathrooms: res.data.additionalFeatures?.noOfBathrooms || 0,
								noOfToilets: res.data.additionalFeatures?.noOfToilets || 0,
								noOfCarParks: res.data.additionalFeatures?.noOfCarParks || 0,
							},
							features: res.data.features || [],
							areYouTheOwner: res.data.areYouTheOwner ?? false,
							isApproved: res.data.isApproved ?? false,
							isRejected: res.data.isRejected ?? false,
							isPreference: res.data.isPreference ?? false,
							isPremium: res.data.isPremium ?? false,
							briefType: res.data.briefType || "",
							propertyCondition: res.data.propertyCondition || "",
							_id: res.data._id || "",
							__v: res.data.__v || 0,
						});
						setFeatureData(
							Array.isArray(res.data.features)
								? res.data.features.map((feature: string, idx: number) => ({
										_id: String(idx),
										featureName: feature,
								  }))
								: []
						);
					}
				}
			} catch (error) {
				console.log(error);
			}
		};
		getProductDetails();
	}, [id]);

	useEffect(() => {
		const getAllRentProperties = async () => {
			setDataLoading(true);
			try {
				const resposne = await axios.get(URLS.BASE + "/properties/rents/all");
				// console.log(resposne);
				if (resposne.status === 200) {
					const shuffledData = shuffleArray(resposne.data.data);
					//  console.log(shuffledData);
					setData(shuffledData.slice(0, 3));
					setDataLoading(false);
				}
			} catch (error) {
				console.log(error);
				setDataLoading(false);
			} finally {
				setDataLoading(false);
			}
		};

		getAllRentProperties();
	}, []);

	if (isLoading) return <Loading />;

	return (
		<Fragment>
			{path && path.match(/[0-9]/) ? (
				<section
					className={`flex justify-center w-full bg-[#EEF1F1] md:pb-[50px] ${
						(isContactUsClicked || isModalOpened) &&
						"filter brightness-[30%] transition-all duration-500 overflow-hidden"
					}`}>
					<div className="flex flex-col items-center gap-[20px] w-full">
						<div className="container w-full flex flex-col items-start px-[10px] lg:px-[40px]">
							<div className="w-full flex justify-start md:mb-5">
								<BreadcrumbNav
									point={point}
									onBack={() => router.back()}
									arrowIcon={arrowRightIcon}
									backText="Home"
								/>
							</div>
							{/* <h2
                className={`${epilogue.className} text-base sm:text-xl md:text-2xl font-semibold mt-6 text-black px-3 md:px-5`}>
                Newly Built 5 bedroom Duplex with BQ in a highly secured area in
                the heart of GRA
              </h2> */}
						</div>

						{/* <div className='w-full flex justify-center items-center'> */}
						<div className="flex flex-col md:flex-row justify-between items-start container px-[15px] md:px-[20px]">
							<div className="w-full md:w-[70%] flex flex-col">
								<div className="lg:w-[837px] flex flex-col gap-[20px]">
									<ImageSwiper
										images={
											details.pictures["length"] !== 0
												? details.pictures
												: [sampleImage.src]
										}
									/>

									<div className="w-full md:w-[90%] h-full flex flex-col gap-[20px]">
										{details.pictures["length"] !== 0 ? (
											<div className="flex gap-[12px] overflow-x-auto w-full justify-center md:justify-start">
												{details.pictures.map((src: string, idx: number) => (
													<img
														src={src}
														key={idx}
														width={200}
														height={200}
														onClick={() => {
															setImageData([src]);
															setViewImage(true);
														}}
														className="md:w-[80px] md:h-[60px] w-[63px] h-[48px] sm:w-[120px] sm:h-[92px] object-cover bg-gray-200 rounded"
														// style={{ maxWidth: '100%', flex: '0 0 auto' }}
														alt={"image"}
													/>
												))}
											</div>
										) : null}

										{/**Details */}
										<div className="w-full grid grid-cols-4 md:grid-cols-4 gap-[10px] border-b-[1px] border-[#C7CAD0] pb-[40px]">
											<BoxContainer
												heading="Bedrooms"
												subHeading={
													details.additionalFeatures?.noOfBedrooms &&
													details.additionalFeatures.noOfBedrooms > 0
														? details.additionalFeatures.noOfBedrooms.toString()
														: details.bedRoom && details.bedRoom > 0
														? details.bedRoom.toString()
														: "-"
												}
											/>
											<BoxContainer
												heading="Bathroom"
												subHeading={
													details.additionalFeatures?.noOfBathrooms &&
													details.additionalFeatures.noOfBathrooms > 0
														? details.additionalFeatures.noOfBathrooms.toString()
														: details.noOfBathrooms && details.noOfBathrooms > 0
														? details.noOfBathrooms.toString()
														: "-"
												}
											/>
											<BoxContainer
												heading="Toilet"
												subHeading={
													details.additionalFeatures?.noOfToilets &&
													details.additionalFeatures.noOfToilets > 0
														? details.additionalFeatures.noOfToilets.toString()
														: details.noOfToilets && details.noOfToilets > 0
														? details.noOfToilets.toString()
														: "-"
												}
											/>
											<BoxContainer
												heading="Parking space"
												subHeading={
													details.additionalFeatures?.noOfCarParks &&
													details.additionalFeatures.noOfCarParks > 0
														? details.additionalFeatures.noOfCarParks.toString()
														: details.noOfCarParks && details.noOfCarParks > 0
														? details.noOfCarParks.toString()
														: "-"
												}
											/>
										</div>

										{/* <div className='w-full py-[40px] border-b-[1px] border-[#C7CAD0]'> */}
										<div className="w-full grid grid-cols-2 md:grid-cols-3 gap-[10px] border-b-[1px] border-[#C7CAD0] pb-[20px]">
											<BoxContainer
												heading="Listing Type"
												subHeading={details.briefType || "Nil"}
											/>
											<BoxContainer
												heading="Property Type"
												subHeading={details.propertyType || "-"}
											/>
											<BoxContainer
												heading="Location"
												subHeading={
													details.location.state && details.location.localGovernment
														? `${details.location.state}, ${details.location.localGovernment}`
														: "-"
												}
											/>
											<BoxContainer
												heading="Price"
												subHeading={
													details.price !== undefined && details.price !== null
														? Number(details.price).toLocaleString()
														: "-"
												}
											/>
											<BoxContainer
												heading="Property Title"
												subHeading={"Nil"}
											/>
											<BoxContainer
												heading="Property Condition"
												subHeading={details.propertyStatus || "Nil"}
											/>
											<BoxContainer
												heading="Land Size"
												subHeading={
													details.landSize &&
													details.landSize.size !== null &&
													details.landSize.size !== undefined
														? details.landSize.measurementType
															? `${details.landSize.size} ${details.landSize.measurementType}`
															: details.landSize.size.toString()
														: "-"
												}
											/>
										</div>
										{/* </div> */}

										{/**Property Features */}
										{featureData["length"] !== 0 ? (
											<SimilarComponent
												heading="Property Features"
												data={featureData.map((item) => item?.featureName)}
											/>
										) : null}

										{details.tenantCriteria["length"] !== 0 ? (
											<SimilarComponent
												heading="Tenant Criteria"
												data={details.tenantCriteria.map((item) => item?.criteria)}
											/>
										) : null}

										<div className="w-full flex flex-col gap-[10px] bg-[#F7F7F8] p-6">
											<h2
												className={`${epilogue.className} text-base sm:text-xl md:text-2xl font-semibold text-black`}>
												Additional information
											</h2>
											<p>
												{/* {details.additionalFeatures?.additionalFeatures &&
                        details.additionalFeatures.additionalFeatures.length > 0
                          ? details.additionalFeatures.additionalFeatures.join(
                              ', '
                            )
                          : 'No additional information provided.'
                          } */}
											</p>
										</div>

										<div className="w-full flex flex-col gap-[10px] p-6">
											<p className="text-sm text-[#25324B] font-extralight">
												I hereby agree to indemnify and hold harmless Khabi-Teq Realty, its
												affiliates, directors, and agents from and against any and all
												claims, losses, liabilities, or damages arising from or related to
												any transaction conducted by me on its platform
											</p>
										</div>

										<div className="w-full flex flex-row items-center mt-10 gap-3 justify-between">
											<Link href={"/market-place"}>
												<button
													type="button"
													onClick={() => {
														setPropertySelectedForInspection(details);
														setIsAddForInspectionModalOpened(true);
													}}
													className="w-full px-[10px] md:px-0 md:w-[200px] h-[48px] md:h-[56px] bg-[#8DDB90] text-base font-bold text-white">
													Select for inspection
												</button>
											</Link>
											<Link href={"/market-place"}>
												<button
													onClick={() => {
														setPropertySelectedForInspection(details);
														setIsAddForInspectionModalOpened(true);
														setIsComingFromPriceNeg(true);
													}}
													type="button"
													className="w-full px-[10px] md:px-0 md:w-[200px] h-[48px] md:h-[56px] bg-[#1976D2] text-base font-bold text-white">
													Price Negotiation
												</button>
											</Link>
										</div>
									</div>
								</div>
							</div>
							<div className="hidden md:flex w-full md:w-[30%] flex-col items-end">
								<div className="w-full lg:w-[282px] flex justify-center items-center">
									<div className="flex justify-between items-start container">
										<div className="w-full flex flex-col gap-[26px] h-[inherit]">
											<div className="flex flex-col flex-wrap bg-white gap-[10px] border-[1px] border-[#D6DDEB] w-full py-[15px] px-[10px] overflow-x-auto hide-scrollbar">
												<div className="flex w-full gap-[10px] flex-nowrap items-center">
													<span className="text-base text-[#7C8493] whitespace-nowrap">
														Reference ID:
													</span>
													<span
														// onClick={() => copy(details.owner)}
														className={`${epilogue.className} text-base text-clip text-[#25324B] break-all min-w-0 flex-1`}
														style={{ wordBreak: "break-all" }}>
														{details.owner}
													</span>
												</div>
												{/**Date Added */}
												<div className="flex gap-[10px] w-full">
													<span className="text-base text-[#7C8493]">Date added:</span>{" "}
													<span className={`${epilogue.className} text-lg text-[#25324B]`}>
														{details.createdAt.split("T")[0]}
													</span>
												</div>
												{/**Last Update */}
												<div className="flex gap-[10px] w-full">
													<span className="text-base text-[#7C8493]">Last Update:</span>{" "}
													<span className={`${epilogue.className} text-lg text-[#25324B]`}>
														{details.updatedAt.split("T")[0]}
													</span>
												</div>
												{/**Market Status */}
												<div className="flex gap-[10px] w-full">
													<span className="text-base text-[#7C8493]">Market Status</span>{" "}
													<span className={`${epilogue.className} text-lg text-[#25324B]`}>
														{details.isAvailable ? "Available" : "Not Available"}
													</span>
												</div>
											</div>

											<div className="w-full lg:w-[282px] flex flex-col gap-[15px]">
												<h2 className="text-base text-black">
													Click here to view the selected brief for inspection
												</h2>
												<button
													type="button"
													className="w-full h-[60px] border-[1px] border-[#FF3D00] text-[#FF3D00] font-medium text-lg">
													{Array.from(selectedBriefs).length} selected brief
												</button>
											</div>
											<div className="w-full items-end hidden h-full md:flex md:flex-col gap-[10px]">
												{data.map((property, idx: number) => {
													return (
														<Card
															isAddForInspectionModalOpened={isAddForInspectionModalOpened}
															style={is_mobile ? { width: "100%" } : { width: "281px" }}
															images={property?.pictures}
															onCardPageClick={() => {
																router.push(`/property/Rent/${property._id}`);
															}}
															// onClick={() =>
															//   handlePropertiesSelection(idx.toLocaleString())
															// }
															cardData={[
																{
																	header: "Property Type",
																	value: property.propertyType,
																},
																{
																	header: "Price",
																	value: `₦${Number(property.rentalPrice).toLocaleString()}`,
																},
																{
																	header: "Bedrooms",
																	value: property.noOfBedrooms || "N/A",
																},
																{
																	header: "Location",
																	value: `${property.location.state}, ${property.location.localGovernment}`,
																},
																{
																	header: "Documents",
																	value: `<ol class='' style='list-style: 'dics';'>${property?.docOnProperty?.map(
																		(item: { _id: string; docName: string }) =>
																			`<li key={${item._id}>${item.docName}</li>`
																	)}<ol>`,
																},
															]}
															key={idx}
															// isDisabled={uniqueProperties.has(idx.toLocaleString())}
														/>
													);
												})}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						{selectedBriefs && selectedBriefs.length > 0 && (
							<MobileSelectedBottomBar
								selectedBriefs={selectedBriefs.length}
								selectedBriefsList={selectedBriefs}
								onRemoveAllBriefs={() => {
									console.log("View Briefs", selectedBriefs);
								}}
								onSubmitForInspection={() => {
									console.log("Submit for inspection", selectedBriefs);
								}}
							/>
						)}
					</div>
				</section>
			) : (
				<></>
			)}
		</Fragment>
	);
};

// const Input = ({
//   name,
//   placeholder,
//   type,
//   formik,
//   onChange,
//   label,
// }: {
//   name: string;
//   placeholder: string;
//   type: string;
//   formik: any;
//   onChange?: (name: string, value: string) => void;
//   label: string;
// }) => {
//   return (
//     <label
//       className='md:1/2 w-full min-h-[80px] gap-[4px] flex flex-col'
//       htmlFor={name}>
//       <h2 className='text-base leading-[25.6px] text-[#1E1E1E] font-medium'>
//         {name}
//       </h2>
//       {type === 'number' ? (
//         <PhoneInputField
//           id='phoneNumber'
//           name='phoneNumber'
//           value={formik.values[name]}
//           onChange={formik.setFieldValue}
//           onBlur={formik.handleBlur}
//           error={formik.errors[name]}
//           touched={formik.touched[name]}
//           // className='min-h-[50px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7]'
//           placeholder='Enter Your phone number'
//         />
//       ) : (
//         <input
//           type={type}
//           id={label}
//           value={formik.values[label]}
//           onBlur={formik.handleBlur}
//           onChange={formik.handleChange}
//           name={label}
//           placeholder={placeholder}
//           className='min-h-[50px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7]  disabled:cursor-not-allowed focus:outline-[1.5px] focus:outline-[#14b8a6] focus:outline-offset-0 rounded-[5px]'
//         />
//       )}

//       {(formik.touched[label] || formik.errors[label]) && (
//         <span className='text-sm text-red-500'>{formik.errors[label]}</span>
//       )}
//     </label>
//   );
// };

// components/PhoneInputField.tsx

interface PhoneInputFieldProps {
	name: string;
	value: string;
	onChange: (name: string, value: string) => void;
	onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
	error?: string;
	touched?: boolean;
	placeholder?: string;
	defaultCountry?: Country | undefined;
	id: string;
	className?: string;
}

// const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
//   name,
//   value,
//   onChange,
//   onBlur,
//   error,
//   touched,
//   placeholder = 'Enter phone number',
//   defaultCountry = 'NG', // Default country set to Nigeria
//   className,
// }) => {
//   return (
//     <div className='w-full'>
//       <PhoneInput
//         international
//         defaultCountry={defaultCountry}
//         placeholder={placeholder}
//         value={value}
//         onChange={(value) => onChange(name, value || '')}
//         onBlur={onBlur}
//         id={name}
//         name={name}
//         className='min-h-[50px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7]'
//       />
//       {touched && error && (
//         <span className='text-sm text-red-500'>{error}</span>
//       )}
//     </div>
//   );
// };

//specifically built for image swiper

type NavigationButtonProps = {
	handleNav: () => void;
	type: "arrow left" | "arrow right";
	className?: string;
};
const NavigationButton: FC<NavigationButtonProps> = ({
	handleNav,
	type,
	className,
}): React.JSX.Element => {
	const renderArrow = () => {
		switch (type) {
			case "arrow left":
				return (
					<FaCaretLeft
						width={16}
						height={16}
						color="#09391C"
						className="w-[16px] h-[16px]"
					/>
				);
			case "arrow right":
				return (
					<FaCaretRight
						width={16}
						height={16}
						color="#09391C"
						className="w-[16px] h-[16px]"
					/>
				);
		}
	};
	return (
		<button
			onClick={handleNav}
			type="button"
			className={`w-[35px] h-[35px] border-[1px] border-[#5A5D63]/[50%] flex items-center justify-center ${className}`}>
			{type && renderArrow()}
		</button>
	);
};

const ImageSwiper = ({ images }: { images: string[] }) => {
	//const images = [sampleImage.src, sampleImage.src];

	const swiperRef = React.useRef<any>(null);

	const handleNext = () => {
		if (swiperRef.current) {
			swiperRef.current.slideNext();
		}
	};

	const handlePrev = () => {
		if (swiperRef.current) {
			swiperRef.current.slidePrev();
		}
	};

	return (
		<Swiper
			modules={[Pagination, Navigation, Autoplay]}
			spaceBetween={30}
			slidesPerView={1}
			onSwiper={(swiper) => (swiperRef.current = swiper)}
			pagination={{ clickable: true }}
			autoplay={{ delay: 3000 }}
			loop={true}
			className="w-full max-w-full lg:w-[837px]">
			{images.map((src, i) => (
				<SwiperSlide key={i}>
					<img
						src={src}
						alt={`Slide ${i + 1}`}
						className="w-full object-cover lg:w-[837px] h-[422px]"
					/>
				</SwiperSlide>
			))}
			<NavigationButton
				handleNav={handlePrev}
				type="arrow left"
				className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10"
			/>
			<NavigationButton
				handleNav={handleNext}
				type="arrow right"
				className="absolute right-5 top-1/2 transform -translate-y-1/2 z-10"
			/>
		</Swiper>
	);
};

const SimilarComponent = ({
	data,
	heading,
}: {
	data: string[];
	heading: string;
}) => {
	return (
		<div className="min-h-fit bg-[#F7F7F8] p-[15px] flex flex-col gap-[24px]">
			<h2
				className={`md:text-[24px] md:leading-[38.4px] text-[20px] leading-[32px] font-semibold font-epilogue`}>
				{heading}
			</h2>

			<div className="w-full grid grid-cols-2 md:grid-cols-3 gap-[8px]">
				{data.map((item: string, idx: number) => {
					return (
						<div
							key={idx}
							className="flex items-center gap-[8px]">
							<Image
								src={checkIcon}
								width={20}
								height={20}
								className="w-[20px] h-[20px]"
								alt=""
							/>
							<span className="text-base leading-[25.6px] font-normal text-[#5A5D63]">
								{item}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const BoxContainer = ({
	heading,
	subHeading,
}: {
	heading: string;
	subHeading: string;
}) => {
	const changeColorBehaviors = () => {
		switch (heading) {
			case "Price":
				return { bg: "bg-green-100", color: "text-[#25324B]" };
			case "Property Type":
				return { bg: "bg-white", color: "text-[#09391C]" };
			default:
				return { bg: "bg-white", color: "text-[#25324B]" };
		}
	};
	return (
		<div
			className={`w-full ${
				heading && changeColorBehaviors().bg
			}  py-[5px] px-[5] md:px-[10px] h-[58px] md:h-[83px] flex justify-center flex-col border-[1px] border-[#D6DDEB]`}>
			<h4 className="text-xs md:text-lg text-[#7C8493]">{heading}</h4>
			<h3
				className={`text-sm md:text-lg font-semibold ${
					heading && changeColorBehaviors().color
				} ${epilogue.className}`}>
				{subHeading}
			</h3>
		</div>
	);
};

export default ProductDetailsPage;
