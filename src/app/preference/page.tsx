/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Button from "@/components/general-components/button";
import Loading from "@/components/loading-component/loading";
import { toast } from "react-hot-toast";
import { archivo } from "@/styles/font";
import { useLoading } from "@/hooks/useLoading";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import useClickOutside from "@/hooks/clickOutside";
import RadioCheck from "@/components/general-components/radioCheck";
import { URLS } from "@/utils/URLS";
import Input from "@/components/general-components/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { featuresData, tenantCriteriaData } from "@/data/landlord";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { usePageContext } from "@/context/page-context";
import "react-phone-number-input/style.css";
import { useRouter } from "next/navigation";
import arrowRightIcon from "@/svgs/arrowR.svg";

import Image from "next/image";
import comingSoon from "@/assets/cominsoon.png";
import { epilogue } from "@/styles/font";
import axios from "axios";
import data from "@/data/state-lga";
import BreadcrumbNav from "@/components/general-components/BreadcrumbNav";
import Select from "react-select";
import Stepper from "@/components/post-property-components/Stepper";
import Submit from "@/components/submit";
import AttachFile from "@/components/general-components/attach_file";

interface Option {
	value: string;
	label: string;
}
const Landlord = () => {
	const isLoading = useLoading();
	const router = useRouter();
	const [isLegalOwner, setIsLegalOwner] = useState<boolean>(false);
	const { setIsSubmittedSuccessfully } = usePageContext();
	const [areInputsDisabled, setAreInputsDisabled] = useState<boolean>(false);
	const [area, setArea] = useState<string>("");
	const [isComingSoon, setIsComingSoon] = useState<boolean>(false);
	const [showFinalSubmit, setShowFinalSubmit] = useState(false);
	const [selectedState, setSelectedState] = useState<Option | null>(null);
	const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);

	const [stateOptions, setStateOptions] = useState<Option[]>([]);
	const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
	const [showBedroom, setShowBedroom] = useState<boolean>(false);
	const [fileUrl, setFileUrl] = useState<{ id: string; image: string }[]>([]);
	const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string | null>(
		null
	);
	const { setViewImage, setImageData } = usePageContext();
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedProperty, setSelectedProperty] =
		useState<string>("Buy a property");

	const [prices, setPrices] = useState({
		minPrice: "",
		maxPrice: "",
	});

	const [bathroom, setBathroom] = useState<string>("");

	const steps: { label: string; status: "completed" | "active" | "pending" }[] =
		[
			{
				label: "Submit preference details",
				status:
					currentStep > 0 ? "completed" : currentStep === 0 ? "active" : "pending",
			},
			{
				label: "contact Detail",
				status:
					currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "pending",
			},
		];

	function formatNumberWithCommas(value: string) {
		const cleaned = value.replace(/\D/g, "");
		return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	const formatNumber = (val: string) => {
		const containsLetters = /[A-Za-z]/.test(val);
		if (containsLetters) {
			// setFormattedValue('');
			return;
		}
		const numericValue = val.replace(/,/g, ""); //to remove commas;

		return numericValue ? Number(numericValue).toLocaleString() : "";
	};

	useEffect(() => {
		const filteredArray: string[] = [];
		if (fileUrl.length !== 0) {
			for (let i = 0; i < fileUrl.length; i++) {
				filteredArray.push(fileUrl[i].image);
			}
		}
		formik.setFieldValue("images", filteredArray);
		console.log(formik.values);
	}, [fileUrl]);

	useEffect(() => {
		// Load Nigerian states correctly
		setStateOptions(
			Object.keys(data).map((state: string) => ({
				value: state,
				label: state,
			}))
		);
	}, []);

	const amountToPay = 5000;

	const renderDynamicComponent = () => {
		switch (selectedProperty) {
			case "Buy a property":
				return {
					propertyConditionComponent: (
						<div className="min-h-[73px] gap-[15px] flex flex-col w-full">
							<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
								Property condition
							</h2>
							<div className="w-full gap-[20px] lg:gap-[20px] flex flex-row flex-wrap">
								<RadioCheck
									selectedValue={formik.values?.propertyCondition}
									handleChange={() => {
										formik.setFieldValue("propertyCondition", "Brand New");
									}}
									type="radio"
									name="propertyCondition"
									value="Brand New"
								/>
								<RadioCheck
									selectedValue={formik.values?.propertyCondition}
									handleChange={() => {
										formik.setFieldValue("propertyCondition", "Good Condition");
									}}
									type="radio"
									name="propertyCondition"
									value="Good Condition"
								/>
							</div>
						</div>
					),
					priceComponent: (
						<div className="flex w-full gap-4">
							<div className="flex flex-col w-1/2">
								<Input
									label="Min Price Range"
									name="min_price_range"
									type="text"
									value={prices.minPrice}
									onChange={(event) => {
										const rawValue = event.target.value.replace(/,/g, "");
										setPrices({
											...prices,
											minPrice: formatNumberWithCommas(rawValue),
										});
									}}
								/>
							</div>
							<div className="flex flex-col w-1/2">
								<Input
									label="Max Price Range"
									name="max_price_range"
									type="text"
									value={prices.maxPrice}
									onChange={(event) => {
										const rawValue = event.target.value.replace(/,/g, "");
										setPrices({
											...prices,
											maxPrice: formatNumberWithCommas(rawValue),
										});
									}}
								/>
							</div>
						</div>
					),
					priceRangeDocType: (
						<div className="flex flex-col w-full gap-2">
							<h3 className="">Document Type</h3>
							<Select
								name="documentType"
								options={documentTypeOptions}
								isMulti
								value={documentTypeOptions.filter((option) =>
									formik.values.documentType.includes(option.value)
								)}
								onChange={(selectedOptions) => {
									formik.setFieldValue(
										"documentType",
										selectedOptions ? selectedOptions.map((option) => option.value) : []
									);
								}}
								onBlur={formik.handleBlur}
								placeholder="Select Document Type"
								isDisabled={areInputsDisabled}
								styles={{
									control: (provided) => ({
										...provided,
										minHeight: 49,
										height: 49,
									}),
									valueContainer: (provided) => ({
										...provided,
										height: 48,
										padding: "0 8px",
									}),
									input: (provided) => ({
										...provided,
										margin: 0,
										padding: 0,
									}),
									indicatorsContainer: (provided) => ({
										...provided,
										height: 48,
									}),
								}}
							/>
						</div>
					),
					features: (
						<div className="flex flex-col gap-[15px]">
							<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
								Features
							</h2>
							<div className="grid lg:grid-cols-3 grid-cols-2 gap-x-[30px] gap-y-[10px] w-full">
								{featuresData.map((item: string, idx: number) => (
									<RadioCheck
										key={idx}
										type="checkbox"
										modifyStyle={{}}
										value={item}
										name="features"
										handleChange={() => {
											const features = formik.values.features.includes(item)
												? formik.values.features.filter((doc) => doc !== item)
												: [...formik.values.features, item];
											formik.setFieldValue("features", features);
										}}
										isDisabled={areInputsDisabled}
									/>
								))}
							</div>
						</div>
					),
					bedroomAndBathroomComponent: (
						<>
							<div className="flex flex-col w-full gap-2">
								{" "}
								<h3>Number of Bedroom</h3>
								<Select
									name="noOfBedroom"
									options={bedroomOptions}
									value={bedroomOptions.find(
										(option) => option.value === formik.values.noOfBedroom
									)}
									onChange={(selectedOption) => {
										formik.setFieldValue("noOfBedroom", selectedOption?.value || "");
									}}
									onBlur={formik.handleBlur}
									placeholder="Select number of bedrooms"
									isDisabled={areInputsDisabled}
									styles={{
										control: (provided) => ({
											...provided,
											minHeight: 48,
											height: 48,
										}),
										valueContainer: (provided) => ({
											...provided,
											height: 48,
											padding: "0 8px",
										}),
										input: (provided) => ({
											...provided,
											margin: 0,
											padding: 0,
										}),
										indicatorsContainer: (provided) => ({
											...provided,
											height: 48,
										}),
									}}
								/>
							</div>
							<Input
								label="Number of Bathroom"
								name="bathroom"
								type="number"
								minNumber={1}
								value={bathroom}
								onChange={(event) => {
									setBathroom(event.target.value);
								}}
							/>
						</>
					),
				};
			case "Find property for joint ventures":
				return {
					propertyConditionComponent: null,
					priceComponent: (
						<div className="flex w-full gap-4">
							<div className="flex flex-col w-1/2">
								<Input
									label="Min Price Range"
									name="min_price_range"
									type="text"
									value={prices.minPrice}
									onChange={(event) => {
										const rawValue = event.target.value.replace(/,/g, "");
										setPrices({
											...prices,
											minPrice: formatNumberWithCommas(rawValue),
										});
									}}
								/>
							</div>
							<div className="flex flex-col w-1/2">
								<Input
									label="Max Price Range"
									name="max_price_range"
									type="text"
									value={prices.maxPrice}
									onChange={(event) => {
										const rawValue = event.target.value.replace(/,/g, "");
										setPrices({
											...prices,
											maxPrice: formatNumberWithCommas(rawValue),
										});
									}}
								/>
							</div>
						</div>
					),
					fetaures: <></>,
					bedroomAndBathroomComponent: null,
					priceRangeDocType: (
						<>
							<div className="flex flex-col w-full gap-2">
								<h3 className="">Document Type</h3>
								<Select
									name="documentType"
									options={documentTypeOptions}
									isMulti
									value={documentTypeOptions.filter((option) =>
										formik.values.documentType.includes(option.value)
									)}
									onChange={(selectedOptions) => {
										formik.setFieldValue(
											"documentType",
											selectedOptions ? selectedOptions.map((option) => option.value) : []
										);
									}}
									onBlur={formik.handleBlur}
									placeholder="Select Document Type"
									isDisabled={areInputsDisabled}
									styles={{
										control: (provided) => ({
											...provided,
											minHeight: 49,
											height: 49,
										}),
										valueContainer: (provided) => ({
											...provided,
											height: 48,
											padding: "0 8px",
										}),
										input: (provided) => ({
											...provided,
											margin: 0,
											padding: 0,
										}),
										indicatorsContainer: (provided) => ({
											...provided,
											height: 48,
										}),
									}}
								/>
							</div>
						</>
					),
				};
			case "Rent/Lease a property":
				if (
					formik.values.propertyType === "Residential" ||
					formik.values.propertyType === "Commercial"
				) {
					return {
						propertyConditionComponent: (
							<div className="min-h-[73px] gap-[15px] flex flex-col w-full">
								<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
									Property condition
								</h2>
								<div className="w-full gap-[20px] lg:gap-[20px] flex flex-row flex-wrap">
									<RadioCheck
										selectedValue={formik.values?.propertyCondition}
										handleChange={() => {
											formik.setFieldValue("propertyCondition", "Brand New");
										}}
										type="radio"
										name="propertyCondition"
										value="Brand New"
									/>
									<RadioCheck
										selectedValue={formik.values?.propertyCondition}
										handleChange={() => {
											formik.setFieldValue("propertyCondition", "Good Condition");
										}}
										type="radio"
										name="propertyCondition"
										value="Good Condition"
									/>
								</div>
							</div>
						),
						bedroomAndBathroomComponent: (
							<div className="flex w-full gap-4">
								<div className="flex flex-col w-1/2 gap-2">
									<h3>Number of Bedroom</h3>
									<Select
										name="noOfBedroom"
										options={bedroomOptions}
										value={bedroomOptions.find(
											(option) => option.value === formik.values.noOfBedroom
										)}
										onChange={(selectedOption) => {
											formik.setFieldValue("noOfBedroom", selectedOption?.value || "");
										}}
										onBlur={formik.handleBlur}
										placeholder="Select number of bedrooms"
										isDisabled={areInputsDisabled}
										styles={{
											control: (provided) => ({
												...provided,
												minHeight: 48,
												height: 48,
											}),
											valueContainer: (provided) => ({
												...provided,
												height: 48,
												padding: "0 8px",
											}),
											input: (provided) => ({
												...provided,
												margin: 0,
												padding: 0,
											}),
											indicatorsContainer: (provided) => ({
												...provided,
												height: 48,
											}),
										}}
									/>
								</div>
								<div className="flex flex-col w-1/2 gap-2">
									<Input
										label="Number of Bathroom"
										name="bathroom"
										type="number"
										minNumber={1}
										value={bathroom}
										onChange={(event) => {
											setBathroom(event.target.value);
										}}
									/>
								</div>
							</div>
						),
						priceComponent: (
							<div className="flex gap-4 w-full">
								<Input
									label="Min Price Range"
									name="min_price_range"
									type="text"
									placeholder="Min"
									value={prices.minPrice}
									onChange={(event) => {
										const rawValue = event.target.value;
										setPrices({
											...prices,
											minPrice: formatNumber(rawValue) ?? "",
										});
									}}
								/>
								<Input
									label="Max Price Range"
									name="max_price_range"
									type="text"
									placeholder="Max"
									value={prices.maxPrice}
									onChange={(event) => {
										const rawValue = event.target.value;
										setPrices({
											...prices,
											maxPrice: formatNumber(rawValue) ?? "",
										});
									}}
								/>
							</div>
						),
						features: (
							<div className="flex flex-col gap-[15px]">
								<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
									Features
								</h2>
								<div className="grid lg:grid-cols-3 grid-cols-2 gap-x-[30px] gap-y-[10px] w-full">
									{featuresData.map((item: string, idx: number) => (
										<RadioCheck
											key={idx}
											type="checkbox"
											modifyStyle={{}}
											value={item}
											name="features"
											handleChange={() => {
												const features = formik.values.features.includes(item)
													? formik.values.features.filter((doc) => doc !== item)
													: [...formik.values.features, item];
												formik.setFieldValue("features", features);
											}}
											isDisabled={areInputsDisabled}
										/>
									))}
								</div>
							</div>
						),
						priceRangeDocType: null,
					};
				} else if (formik.values.propertyType === "Land") {
					return {
						propertyConditionComponent: (
							<div className="min-h-[73px] gap-[15px] flex flex-col w-full">
								<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
									Property condition
								</h2>
								<div className="w-full gap-[20px] lg:gap-[20px] flex flex-row flex-wrap">
									<RadioCheck
										selectedValue={formik.values?.propertyCondition}
										handleChange={() => {
											formik.setFieldValue("propertyCondition", "Brand New");
										}}
										type="radio"
										name="propertyCondition"
										value="Brand New"
									/>
									<RadioCheck
										selectedValue={formik.values?.propertyCondition}
										handleChange={() => {
											formik.setFieldValue("propertyCondition", "Good Condition");
										}}
										type="radio"
										name="propertyCondition"
										value="Good Condition"
									/>
								</div>
							</div>
						),
						priceComponent: (
							<div className="flex w-full gap-4">
								<div className="flex flex-col w-1/2">
									<Input
										label="Min Price Range"
										name="min_price_range"
										type="number"
										value={prices.minPrice}
										onChange={(event) => {
											setPrices({
												...prices,
												minPrice: event.target.value,
											});
										}}
									/>
								</div>
								<div className="flex flex-col w-1/2">
									<Input
										label="Max Price Range"
										name="max_price_range"
										type="number"
										value={prices.maxPrice}
										onChange={(event) => {
											setPrices({
												...prices,
												maxPrice: event.target.value,
											});
										}}
									/>
								</div>
							</div>
						),
						bedroomAndBathroomComponent: null,
						features: null,
						priceRangeDocType: null,
					};
				}
				return {};

			default:
				break;
		}
	};

	const handleLGAChange = (selected: Option | null) => {
		formik.setFieldValue("selectedLGA", selected?.value);
		setSelectedLGA?.(selected);
	};

	const handleStateChange = (selected: Option | null) => {
		formik.setFieldValue("selectedState", selected?.value);
		setSelectedState?.(selected);

		if (selected) {
			const lgas = Object.values(data[selected.label]);

			if (Array.isArray(lgas)) {
				setLgaOptions(
					lgas.map((lga: string) => ({
						value: lga,
						label: lga,
					}))
				);
			} else {
				setLgaOptions([]);
			}
			setSelectedLGA?.(null);
		} else {
			setLgaOptions([]);
			setSelectedLGA?.(null);
		}
	};

	// After uploading file, update both local state and Formik
	const handlePaymentReceipt = (value: React.SetStateAction<string | null>) => {
		const url = typeof value === "function" ? value(paymentReceiptUrl) : value;
		setPaymentReceiptUrl(url);
		if (url) {
			formik.setFieldValue("paymentReceiptUrl", url);
		}
	};

	const formik = useFormik({
		initialValues: {
			propertyType: "Residential",
			propertyCondition: "",
			area: "",
			landSize: {
				measurementType: "",
				size: "",
			},
			price: "",
			features: [] as string[],
			tenantCriteria: [] as string[],
			noOfBedroom: "",
			selectedState: "",
			selectedLGA: "",
			ownerFullName: "",
			ownerPhoneNumber: "",
			ownerEmail: "",
			areYouTheOwner: true,
			rentalPrice: undefined as number | undefined,
			bedroom: undefined as string | undefined,
			images: [],
			documentType: [] as string[],
			additionalInfo: "",
		},
		validationSchema: Yup.object({
			propertyType: Yup.string().required("Property type is required"),
			propertyCondition: Yup.string().when([], {
				is: () => selectedProperty !== "Find property for joint ventures",
				then: (schema) => schema.required("Property condition is required"),
				otherwise: (schema) => schema.notRequired(),
			}),
			selectedState: Yup.string().required("State is required"),
			selectedLGA: Yup.string().required("LGA is required"),
			ownerFullName: Yup.string().required("Owner full name is required"),
			ownerPhoneNumber: Yup.string()
				.required("Owner phone number is required")
				.test("is-valid-phone", "Invalid phone number", (value) =>
					value ? isValidPhoneNumber(value) : false
				),
			ownerEmail: Yup.string()
				.email("Invalid email")
				.required("Owner email is required"),
		}),
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: async (values) => {
			setAreInputsDisabled(true);
			try {
				// const url = 'https://7629-102-88-109-187.ngrok-free.app/api/buyers/submit-preference';
				const url = `${process.env.NEXT_PUBLIC_API_URL}/buyers/submit-preference`;
				const payload = {
					email: values.ownerEmail,
					fullName: values.ownerFullName,
					phoneNumber: values.ownerPhoneNumber,
					propertyType: values.propertyType,
					propertyCondition: values.propertyCondition,
					preferenceType:
						selectedProperty === "Buy a property"
							? "buy"
							: selectedProperty === "Find property for joint ventures"
							? "joint-venture"
							: "rent",
					location: {
						state: values.selectedState,
						localGovernment: values.selectedLGA,
						area: area,
					},
					measurementType: values.landSize.measurementType,
					landSize: Number(values.landSize.size) || 0,
					budgetMin: Number(prices.minPrice.replace(/,/g, "")) || 0,
					budgetMax: Number(prices.maxPrice.replace(/,/g, "")) || 0,
					documents: Array.isArray(values.documentType) ? values.documentType : [],
					noOfBedrooms: Math.max(0, Math.min(Number(values.noOfBedroom || 0), 20)),
					noOfBathrooms: Math.max(0, Math.min(Number(bathroom || 0), 20)),
					features: Array.isArray(values.features) ? values.features : [],
					additionalInfo: values.additionalInfo || "",
				};

				// Pre-submit check: log payload and check for undefined/empty required fields
				console.log("Submitting payload:", payload);

				// Optionally, check for empty required fields
				const requiredFields = [
					"email", "fullName", "phoneNumber", "propertyType",
					"preferenceType", "location", "budgetMin", "budgetMax"
				] as const;

				type PayloadKeys = keyof typeof payload;
				for (const field of requiredFields) {
					const value = (payload as Record<string, any>)[field];
					if (
						value === undefined ||
						value === null ||
						(typeof value === "string" && value.trim() === "")
					) {
						toast.error(`Missing or empty field: ${field}`);
						setAreInputsDisabled(false);
						return;
					}
				}
				if (
					!payload.location.state ||
					!payload.location.localGovernment ||
					!payload.location.area
				) {
					toast.error("Please fill in all location fields.");
					setAreInputsDisabled(false);
					return;
				}

				await toast.promise(
					axios.post(url, payload).then((response) => {
						if ((response as any).status === 201) {
							console.log("Preference submitted successfully:", response);
							toast.success("Preference submitted successfully");
							setShowFinalSubmit(true);
							setAreInputsDisabled(false);
							return "Preference submitted successfully";
						} else {
							console.error("Submission failed:", response);
							const errorMessage = (response as any).error || "Submission failed";
							toast.error(errorMessage);
							setAreInputsDisabled(false);
							throw new Error(errorMessage);
						}
					}),
					{
						loading: "Submitting...",
					}
				);
			} catch (error) {
				setAreInputsDisabled(false);
			} finally {
				setAreInputsDisabled(false);
			}
		},
	});

	useEffect(() => {
		console.log(isLegalOwner);
	}, [isLegalOwner]);
	useEffect(() => {
		console.log(formik.values);
	}, [formik]);

	if (isLoading) return <Loading />;
	if (isComingSoon) return <UseIsComingPage />;
	return (
		<Fragment>
			<section
				className={`min-h-[800px] bg-[#EEF1F1] w-full flex justify-center items-center transition-all duration-500`}>
				<div className="container flex flex-col justify-center items-center gap-[10px] my-[20px] px-[20px]">
					<div className="w-full flex justify-start">
						<BreadcrumbNav
							point="Cancel"
							onBack={() => router.back()}
							arrowIcon={arrowRightIcon}
							backText="MarketPlace"
						/>
					</div>
					<div className="my-7">
						<Stepper steps={steps} />
					</div>
					<h2 className="text-[#0B0D0C] lg:text-[24px] font-semibold text-center text-[18px]">
						{currentStep === 1
							? "Contact information"
							: "Enter the property you are looking for"}
					</h2>
					<h2 className="lg:w-[953px] w-full text-base md:text-lg text-[#515B6F] font-normal text-center">
						Please provide your contact details so we can get back to you.
					</h2>
					<div className="lg:w-[877px] w-full">
						<form
							onSubmit={formik.handleSubmit}
							className="w-full border-[#8D909680] flex flex-col">
							{currentStep === 0 ? (
								<div className="flex items-center justify-center w-full">
									<div className="flex flex-wrap gap-[10px] md:gap-[20px]">
										{[
											"Buy a property",
											"Find property for joint ventures",
											"Rent/Lease a property",
										].map((item: string, idx: number) => (
											<button
												type="button"
												onClick={() => {
													setSelectedProperty(item);
													formik.resetForm({
														values: {
															...formik.initialValues,
															propertyType: "Residential",
														},
													});
													setPrices({ minPrice: "", maxPrice: "" });
													setArea("");
													setBathroom("");
													setSelectedState(null);
													setSelectedLGA(null);
												}}
												className={`${
													item === selectedProperty
														? "bg-[#8DDB90] font-medium text-[#FFFFFF]"
														: "bg-transparent font-normal text-[#5A5D63]"
												} h-[40px] md:h-[51px] min-w-fit border-[1px] border-[#C7CAD0] text-[12px] md:text-lg px-[10px] md:px-[25px]`}
												key={idx}>
												{item === "Rent/Lease a property" ? (
													<>
														<span className="block md:hidden">Rent a property</span>
														<span className="hidden md:block">Rent/Lease a property</span>
													</>
												) : item === "Find property for joint ventures" ? (
													<>
														<span className="block md:hidden">Joint ventures</span>
														<span className="hidden md:block">
															Find property for joint ventures
														</span>
													</>
												) : (
													item
												)}
											</button>
										))}
									</div>
								</div>
							) : null}
							{currentStep === 0 && (
								<div className="min-h-[629px] py-[40px] lg:px-[80px]  w-full">
									<div className="w-full flex flex-col gap-[30px]">
										<div className="min-h-[73px] gap-[15px] flex flex-col w-full">
											<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
												Property Type
											</h2>
											<div className="w-full gap-[20px] lg:gap-[50px] flex flex-row flex-wrap">
												<RadioCheck
													selectedValue={formik.values?.propertyType}
													handleChange={() => {
														formik.setFieldValue("propertyType", "Residential");
													}}
													type="radio"
													value="Residential"
													name="propertyType"
												/>
												<RadioCheck
													selectedValue={formik.values?.propertyType}
													handleChange={() => {
														formik.setFieldValue("propertyType", "Commercial");
													}}
													type="radio"
													name="propertyType"
													value="Commercial"
												/>
												<RadioCheck
													selectedValue={formik.values?.propertyType}
													handleChange={() => {
														formik.setFieldValue("propertyType", "Land");
													}}
													type="radio"
													name="propertyType"
													value="Land"
												/>
											</div>
										</div>
										{selectedProperty &&
											renderDynamicComponent()?.propertyConditionComponent}
										<div className="min-h-[127px] w-full flex flex-col gap-[15px]">
											<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
												Location
											</h2>
											<div className="min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-3 flex-col">
												<Input
													label="State"
													name="selectedState"
													forState={true}
													forLGA={false}
													type="text"
													placeholder="Select State"
													formik={formik}
													selectedState={selectedState}
													stateOptions={stateOptions}
													setSelectedState={handleStateChange}
													isDisabled={areInputsDisabled}
												/>
												<Input
													label="Local Government"
													name="selectedLGA"
													type="text"
													formik={formik}
													forLGA={true}
													forState={false}
													selectedLGA={selectedLGA}
													lgasOptions={lgaOptions}
													setSelectedLGA={handleLGAChange}
													isDisabled={areInputsDisabled}
												/>
												<Input
													label="Area"
													name="area"
													type="text"
													value={area}
													onChange={(event) => {
														setArea(event.target.value);
													}}
													isDisabled={areInputsDisabled}
												/>
											</div>
											{/* Land Size field only for Land */}
											{formik.values.propertyType === "Land" && (
												<div className="min-h-[127px] w-full flex flex-col gap-[15px]">
													<h2 className="text-[20px] leading-[32px] font-medium text-[#1E1E1E]">
														Land Size
													</h2>
													<div className="min-h-[80px] flex gap-[15px] lg:grid lg:grid-cols-2 flex-col">
														<div className="w-full flex flex-col gap-[5px]">
															<h3 className="">Measurement Type</h3>
															<Select
																name="measurementType"
																options={measurementOptions}
																value={measurementOptions.find(
																	(option) =>
																		option.value === formik.values.landSize.measurementType
																)}
																onChange={(selectedOption) => {
																	formik.setFieldValue(
																		"landSize.measurementType",
																		selectedOption?.value
																	);
																}}
																onBlur={formik.handleBlur}
																placeholder="Select measurement type"
																isDisabled={areInputsDisabled}
																styles={{
																	control: (provided) => ({
																		...provided,
																		minHeight: 48,
																		height: 48,
																	}),
																	valueContainer: (provided) => ({
																		...provided,
																		height: 56,
																		padding: "0 8px",
																	}),
																	input: (provided) => ({
																		...provided,
																		margin: 0,
																		padding: 0,
																	}),
																	indicatorsContainer: (provided) => ({
																		...provided,
																		height: 56,
																	}),
																}}
															/>
														</div>
														<Input
															label="Enter Land Size"
															name="landSize.size"
															type="number"
															value={formik.values.landSize.size}
															onChange={formik.handleChange}
															isDisabled={areInputsDisabled}
														/>
													</div>
													{formik.touched.landSize?.size && formik.errors.landSize?.size && (
														<span className="text-red-600 text-sm">
															{formik.errors.landSize.size}
														</span>
													)}
												</div>
											)}
											{/* <div className='grid lg:grid-cols-2 gap-[15px]'> */}
											{selectedProperty && renderDynamicComponent()?.priceComponent}
											{/* Hide bedroom, bathroom, and features if propertyType is Land */}
											{selectedProperty && formik.values.propertyType !== "Land" && renderDynamicComponent()?.bedroomAndBathroomComponent}
											{selectedProperty && renderDynamicComponent()?.priceRangeDocType}
											{/* </div> */}
										</div>
										{selectedProperty && formik.values.propertyType !== "Land" && renderDynamicComponent()?.features}
										<div className="min-h-[73px] flex flex-col gap-[15px] mt-2">
											<Input
												label="Addition information"
												name="additionalInfo"
												type="textArea"
												className="w-full"
												multiline={true}
												rows={3}
												placeholder="Enter any additional information"
												value={formik.values.additionalInfo}
												onChange={formik.handleChange}
												isDisabled={areInputsDisabled}
											/>
										</div>
									</div>
								</div>
							)}
							{currentStep === 1 && (
								<div className="min-h-[348px] py-[10px] lg:px-[80px] border-[#8D909680] border-b-[1px] w-full">
									<div className="w-full min-h-[348px] flex flex-col gap-[20px]">
										<div className="w-full flex flex-col gap-[15px] min-h-[270px]">
											<div className="flex lg:flex-row flex-col w-full gap-[15px]">
												<Input
													label="Full name"
													name="ownerFullName"
													value={formik.values?.ownerFullName}
													onChange={formik.handleChange}
													className="lg:w-1/2 w-full"
													type="text"
												/>
												<div className="flex flex-col gap-2">
													<label
														className={`block text-sm font-medium ${
															!isLegalOwner && "text-[#847F7F]"
														} text-black`}>
														Phone Number:
													</label>
													<PhoneInput
														international
														defaultCountry="NG"
														value={formik.values?.ownerPhoneNumber}
														style={{
															outline: "none",
															cursor: isLegalOwner ? "text" : "not-allowed",
														}}
														onChange={(value) =>
															formik.setFieldValue("ownerPhoneNumber", value)
														}
														placeholder="Enter phone number"
														className={`w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] focus:outline-none focus:ring-0 disabled:bg-[#FAFAFA] disabled:cursor-not-allowed ${
															!isLegalOwner && "text-[#847F7F]"
														}`}
													/>
													{(formik.touched.ownerPhoneNumber ||
														formik.errors.ownerPhoneNumber) && (
														<p className="text-red-500 text-sm mt-1">
															{formik.errors.ownerPhoneNumber}
														</p>
													)}
												</div>
											</div>
											<Input
												label="Email"
												name="ownerEmail"
												className="w-full"
												value={formik.values?.ownerEmail}
												onChange={formik.handleChange}
												type="email"
											/>
										</div>
									</div>
								</div>
							)}
							<div className="w-full flex items-center mt-8 justify-between">
								<Button
									value={currentStep === 0 ? "Cancel" : "Back"}
									type="button"
									onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
									className={`border-[1px] border-black lg:w-[25%] text-black text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] disabled:cursor-not-allowed`}
								/>
								<Button
									value={
										currentStep === steps.length - 1
											? "Submit"
											: currentStep === 0
											? "Next"
											: "Next"
									}
									type={currentStep === steps.length - 1 ? "submit" : "button"}
									onClick={
										currentStep === steps.length - 1
											? undefined
											: () => {
													setCurrentStep((prev) => prev + 1);
											  }
									}
									isDisabled={areInputsDisabled}
									className={`lg:w-[25%] text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] 
					  ${
																							areInputsDisabled
																								? "bg-gray-300 text-gray-400 cursor-not-allowed"
																								: "bg-[#8DDB90] text-white"
																						}`}
								/>
							</div>
						</form>

						<LocalSubmitModal
							open={showFinalSubmit}
							onClose={() => {
								setShowFinalSubmit(false);
								setTimeout(() => {
									router.push("/");
								}, 100);
							}}
						/>
					</div>
				</div>
			</section>
		</Fragment>
	);
};

const UseIsComingPage = () => {
	return (
		<div className="w-full flex justify-center items-center">
			<div className="container min-h-[600px] flex flex-col justify-center items-center gap-[20px] px-4 md:px-8">
				<div className="lg:w-[654px] flex flex-col justify-center items-center gap-[20px] w-full">
					<div className="w-full flex justify-center">
						<Image
							src={comingSoon}
							width={400}
							height={50}
							alt="Coming Soon Icon"
							className="w-full max-w-[400px] h-auto"
						/>
					</div>
					<div className="flex flex-col justify-center items-center gap-[10px]">
						<p
							className={`text-4xl md:text-2xl font-bold text-center text-[#5A5D63] leading-[160%] tracking-[5%] ${epilogue.className}`}>
							We are working hard to bring you an amazing experience. Stay tuned for
							updates!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const measurementOptions = [
	{ value: "Plot", label: "Plot" },
	{ value: "Acres", label: "Acres" },
	{ value: "Square Meter", label: "Square Meter" },
];

const documentTypeOptions = [
	{ value: "Governor Consent", label: "Governor Consent" },
	{ value: "C of O", label: "C of O" },
	{ value: "Survey Document", label: "Survey Document" },
	{ value: "Deed of Assignment", label: "Deed of Assignment" },
	{ value: "Land Certificate", label: "Land Certificate" },
	{
		value: "Registered Deed of Conveyance",
		label: "Registered Deed of Conveyance",
	},
	{ value: "Deed of Ownership", label: "Deed of Ownership" },
	{ value: "Contract Of Sale", label: "Contract Of Sale" },
	{ value: "Gazette", label: "Gazette" },
	{ value: "Excision", label: "Excision" },
];

const bedroomOptions = [
	{ value: "1", label: "1" },
	{ value: "2", label: "2" },
	{ value: "3", label: "3" },
	{ value: "4", label: "4" },
	{ value: "5", label: "5" },
	{ value: "6", label: "6" },
	{ value: "7", label: "7" },
	{ value: "8", label: "8" },
	{ value: "9", label: "9" },
	{ value: "10", label: "10" },
	{ value: "More", label: "More" },
];

interface LocalSubmitModalProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	subheader?: string;
	buttonText?: string;
}

const LocalSubmitModal: React.FC<LocalSubmitModalProps> = ({
	open,
	onClose,
	title = "Successfully Submitted",
	subheader = "We will reach out to you soon",
	buttonText = "Home",
}) => {
	const ref = useRef<HTMLDivElement>(null);
	useClickOutside(ref, () => {
		if (onClose) onClose();
	});

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<motion.div
				ref={ref}
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 20, opacity: 0 }}
				className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
				<h2 className="text-2xl font-bold mb-2 text-center">{title}</h2>
				<p className="text-base text-gray-600 mb-6 text-center">{subheader}</p>
				<button
					onClick={onClose}
					className="bg-[#8DDB90] text-white font-bold py-3 px-8 rounded w-full">
					{buttonText}
				</button>
			</motion.div>
		</div>
	);
};

// const Select: React.FC<SelectProps> = ({
//   heading,
//   options,
//   formik,
//   allowMultiple,
//   name,
//   isDisabled,
// }) => {
//   // const [valueSelected, setValueSelected] =
//   //   useState<SingleValue<OptionType>>(null);

//   const opts = options.map((item) => ({
//     value: typeof item === 'string' ? item.toLowerCase() : `${item} Bedroom`,
//     label: typeof item === 'number' ? Number(item) : item,
//   }));
//   return (
//     <label
//       htmlFor='select'
//       className='min-h-[80px] w-full flex flex-col gap-[4px]'>
//       <h2 className='text-base font-medium leading-[25.6px] text-[#1E1E1E]'>
//         {name}
//       </h2>
//       <ReactSelect
//         isMulti={allowMultiple}
//         isDisabled={isDisabled}
//         name={heading}
//         onChange={(selectedOption) =>
//           allowMultiple
//             ? formik.setFieldValue(
//                 heading,
//                 [
//                   ...(Array.isArray(selectedOption)
//                     ? selectedOption.map((opt: any) => opt.label)
//                     : []),
//                 ].filter(Boolean) // Removes undefined values
//               )
//             : formik.setFieldValue(heading, selectedOption?.label ?? '')
//         }
//         onBlur={formik.handleBlur}
//         value={formik.values[heading]?.label}
//         options={opts}
//         className={`w-full`}
//         styles={customStyles}
//         placeholder='Select'
//       />
//     </label>
//   );
// };

export default Landlord;
