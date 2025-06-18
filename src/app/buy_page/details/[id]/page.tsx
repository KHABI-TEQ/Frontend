/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { Fragment, MouseEventHandler, useEffect, useState } from "react";
import arrowRightIcon from "@/svgs/arrowR.svg";
import Image from "next/image";
import Link from "next/link";
import { usePageContext } from "@/context/page-context";
import { motion } from "framer-motion";
import arrow from "@/svgs/arrowRight.svg";
import HouseFrame from "@/components/general-components/house-frame";
import noImage from "@/assets/ChatGPT Image Apr 11, 2025, 12_48_47 PM.png";
import { useLoading } from "@/hooks/useLoading";
import Loading from "@/components/loading-component/loading";
import { epilogue } from "@/styles/font";
import { featuresData } from "@/data/buy_data";
import checkIcon from "@/svgs/checkIcon.svg";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "@/components/general-components/button";
import PhoneInput, {
	Country,
	isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select, { SingleValue } from "react-select";
import { useParams, usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { URLS } from "@/utils/URLS";
import customStyles from "@/styles/inputStyle";
import RadioCheck from "@/components/general-components/radioCheck";
import toast from "react-hot-toast";
import { shuffleArray } from "@/utils/shuffleArray";
import { requestFormReset } from "react-dom";

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
	tenantCriteria: { _id: string; criteria: string }[];
	pictures: string[];
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

const Buy = () => {
	const [point, setPoint] = useState<string>("Details");
	const { isContactUsClicked, isModalOpened, setImageData, setViewImage } =
		usePageContext();
	const [scrollPosition, setScrollPosition] = useState(0);
	const isLoading = useLoading();
	const [details, setDetails] = useState<DetailsProps>({
		price: 0,
		propertyType: "",
		bedRoom: 0,
		propertyStatus: "",
		location: {
			state: "",
			localGovernment: "",
			area: "",
		},
		tenantCriteria: [],
		pictures: [],
		propertyId: "",
	});
	const [featureData, setFeatureData] = useState<
		{ _id: string; featureName: string }[]
	>([]);
	const path = usePathname();
	const params = useParams() as { id?: string };
	const id = params.id;
	const router = useRouter();
	const [isDataLoading, setDataLoading] = useState<boolean>(false);
	const [data, setData] = useState<any[]>([]);
	const [agreedToTermsOfUse, setAgreedToTermsUse] = useState<boolean>(false);

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
				const res = await axios.get(URLS.BASE + `/properties/rents/rent/${id}`);
				console.log(res);
				if (res.status === 200) {
					if (typeof res.data === "object") {
						setDetails({
							price: res.data.rentalPrice,
							propertyType: res.data.propertyType,
							bedRoom: res.data.noOfBedrooms,
							propertyStatus: res.data.propertyCondition,
							location: res.data.location,
							tenantCriteria: res.data.tenantCriteria,
							pictures: res.data.pictures,
							propertyId: res.data._id,
						});
						setFeatureData(res.data.features);
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
					className={`flex justify-center w-full bg-[#EEF1F1] pb-[50px] ${
						(isContactUsClicked || isModalOpened) &&
						"filter brightness-[30%] transition-all duration-500 overflow-hidden"
					}`}>
					<div className="flex flex-col items-center gap-[20px] w-full">
						<div className="min-h-[90px] container w-full flex items-center lg:px-[40px]">
							<div className="flex gap-1 items-center px-[10px] lg:px-[0px]">
								<Image
									alt=""
									src={arrowRightIcon}
									width={24}
									height={24}
									className="w-[24px] h-[24px]"
									onClick={() => {
										router.back();
									}}
								/>
								<div className="flex gap-2 items-center justify-center align-middle">
									<Link
										href={"/"}
										className="text-[20px] leading-[32px] text-[#25324B] font-normal">
										Home
									</Link>
									<h3 className="text-[20px] leading-[32px] text-[#25324B] font-semibold">
										.&nbsp;{point}
									</h3>
								</div>
							</div>
						</div>

						<div
							id="scrollableElement"
							className={`${
								details.pictures.length === 0 ? "justify-center" : "justify-start"
							} w-full hide-scrollbar gap-[30px] overflow-x-auto flex mt-0 md:mt-10 lg:mt-0`}>
							{details?.pictures?.length !== 0 ? (
								details.pictures.map((picture, idx: number) => (
									<Image
										src={picture !== "" ? picture : noImage.src}
										alt=""
										key={idx}
										width={500}
										onClick={() => {
											setImageData([picture]);
											setViewImage(true);
										}}
										height={400}
										className="w-[424px] h-[324px] bg-[#D9D9D9] flex-shrink-0"
									/>
								))
							) : (
								<Image
									src={noImage.src}
									alt=""
									onClick={() => {
										setImageData([noImage.src]);
										setViewImage(true);
									}}
									width={500}
									height={400}
									className="w-[424px] h-[324px] bg-[#D9D9D9] object-cover flex-shrink-0"
								/>
							)}
							{/** {details.pictures.map((img: string, idx: number) => (
                <Image
                  src={img !== '' ? img : imgSample}
                  alt=''
                  key={idx}
                  width={500}
                  height={400}
                  className='w-[424px] h-[324px] bg-[#D9D9D9] flex-shrink-0'
                />
              ))} */}
						</div>
						<div className="flex gap-[18px]">
							{/**Previous */}
							<motion.div
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								onClick={handlePreviousSlide}
								className="w-[54px] h-[54px] cursor-pointer flex justify-center items-center border-[#5A5D6380] border-[1px]">
								<Image
									src={arrow}
									width={25}
									height={25}
									alt=""
									className="w-[25px] h-[25px] transform rotate-180"
								/>
							</motion.div>
							{/**Next */}
							<motion.div
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleNextSlide}
								className="w-[54px] h-[54px] cursor-pointer flex justify-center items-center border-[#5A5D6380] border-[1px]">
								<Image
									src={arrow}
									width={25}
									height={25}
									alt=""
									className="w-[25px] h-[25px]"
								/>
							</motion.div>
						</div>

						{/**Next Section */}
						<div className="container px-[20px] md:px-[40px] min-h-[1400px] flex md:flex-row flex-col gap-[40px]">
							<div className="md:w-[70%] w-full h-full flex flex-col gap-[20px]">
								{/**Details */}
								<div className="min-h-[152px] w-full py-[40px] border-b-[1px] border-[#C7CAD0]">
									<h2
										className={`md:text-[24px] md:leading-[38.4px] text-[20px] leading-[32px] font-semibold font-epilogue`}>
										Details
									</h2>

									<div className="w-full min-h-[152px] grid grid-cols-2 grid-rows-2 gap-x-8 gap-y-4">
										{/**Price */}
										<div className="min-w-[122px] min-h-[68px] gap-[10px]">
											<h4 className="text-[18px] text-[#7C8493] leading-[28.8px] font-normal">
												Price
											</h4>
											<h3 className="text-[18px] leading-[28.8px] font-bold text-[#25324B] font-epilogue">
												{Number(details.price).toLocaleString()}
											</h3>
										</div>

										{/**Property Type */}
										<div className="min-w-[122px] min-h-[68px] gap-[10px]">
											<h4 className="text-[18px] text-[#7C8493] leading-[28.8px] font-normal">
												Property Type
											</h4>
											<h3 className="text-[18px] leading-[28.8px] font-bold text-[#25324B] font-epilogue">
												{details.propertyType}
											</h3>
										</div>

										{/**Bed room */}
										<div className="min-w-[122px] min-h-[68px] gap-[10px]">
											<h4 className="text-[18px] text-[#7C8493] leading-[28.8px] font-normal">
												Bed Room
											</h4>
											<h3 className="text-[18px] leading-[28.8px] font-bold text-[#25324B] font-epilogue">
												{details.bedRoom}
											</h3>
										</div>

										{/**Property Status */}
										<div className="min-w-[122px] min-h-[68px] gap-[10px]">
											<h4 className="text-[18px] text-[#7C8493] leading-[28.8px] font-normal">
												Property Status
											</h4>
											<h3 className="text-[18px] leading-[28.8px] font-bold text-[#25324B] font-epilogue">
												{details.propertyStatus}
											</h3>
										</div>
									</div>
								</div>

								{/**Features */}
								<div className="min-h-[152px] w-full py-[40px] border-b-[1px] border-[#C7CAD0]">
									<h2
										className={`md:text-[24px] md:leading-[38.4px] text-[20px] leading-[32px] font-semibold font-epilogue`}>
										Features
									</h2>

									<div className="w-full grid grid-cols-2 mt-[10px] gap-[8px]">
										{featureData?.map((item: { _id: string; featureName: string }) => {
											return (
												<div
													key={item._id}
													className="flex items-center gap-[8px]">
													<Image
														src={checkIcon}
														width={20}
														height={20}
														className="w-[20px] h-[20px]"
														alt=""
													/>
													<span className="text-base leading-[25.6px] font-normal text-[#5A5D63]">
														{item.featureName}
													</span>
												</div>
											);
										})}
									</div>
								</div>

								{/**Contact Information */}
								<div className="min-h-[152px] w-full py-[40px]">
									<h2
										className={`text-[24px] leading-[38.4px] font-semibold font-epilogue`}>
										Contact Information
									</h2>

									<form
										onSubmit={formik.handleSubmit}
										method="post"
										className="w-full min-h-[270px] mt-[10px] flex flex-col gap-[15px]">
										<section className="md:grid md:grid-cols-2 gap-[15px] flex flex-col">
											<Input
												label="name"
												name="
                  Name"
												placeholder="This is a placeholder"
												type="text"
												formik={formik}
											/>
											<Input
												label="phoneNumber"
												name="
                  Phone Number"
												placeholder="This is a placeholder"
												type="number"
												formik={formik}
											/>
											<Input
												label="email"
												name="
                  Email"
												placeholder="This is a placeholder"
												type="email"
												formik={formik}
											/>
											<label
												className=" w-full min-h-[80px] gap-[4px] flex flex-col"
												htmlFor={"gender"}>
												<h2 className="text-base leading-[25.6px] text-[#1E1E1E] font-medium">
													I am
												</h2>
												<Select
													name="gender"
													styles={customStyles}
													options={[
														{ value: "Male", label: "Male" },
														{ value: "Female", label: "Female" },
														{
															value: "Prefer not to say",
															label: "Prefer not to say",
														},
													]}
													value={
														formik.values.gender
															? {
																	value: formik.values.gender,
																	label: formik.values.gender,
															  }
															: null
													}
													onChange={(
														option: SingleValue<{
															value: string;
															label: string;
														}>
													) => {
														formik.setFieldValue("gender", option?.value || "");
													}}
													onBlur={() => formik.setFieldTouched("gender", true)}
													className="bg-white"
													isClearable
												/>
												{formik.errors.gender && formik.touched.gender && (
													<span className="text-sm text-red-500">
														{formik.errors.gender}
													</span>
												)}
											</label>
										</section>

										<label
											className="w-full min-h-[80px] gap-[4px] flex flex-col"
											htmlFor={"message"}>
											<h2 className="text-base leading-[25.6px] text-[#1E1E1E] font-medium">
												Message
											</h2>
											<textarea
												value={formik.values.message}
												onBlur={formik.handleBlur}
												id="message"
												onChange={formik.handleChange}
												placeholder={"Enter your message here"}
												className="min-h-[93px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] resize-none py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7] disabled:cursor-not-allowed focus:outline-[1.5px] focus:outline-[#14b8a6] focus:outline-offset-0 rounded-[5px]"></textarea>
										</label>
										{formik.errors.message && formik.touched.message && (
											<span className="text-sm text-red-500">{formik.errors.message}</span>
										)}

										{/** */}
										<div className="flex items-center gap-[10px] mt-[10px]">
											<input
												title="checkbox"
												style={{
													accentColor: "#8DDB90",
													backgroundColor: "transparent",
													width: "24px",
													height: "24px",
												}}
												type="checkbox"
												onChange={() => {
													setAgreedToTermsUse(!agreedToTermsOfUse);
												}}
											/>
											<p className="text-base leading-[25.6px] text-[#0B423D] font-semibold">
												By submitting this form I agree to Terms of Use
											</p>
										</div>

										<div className="flex md:justify-start md:items-start items-center justify-center">
											<Button
												green={true}
												type="submit"
												onSubmit={formik.handleSubmit}
												value="Submit for inspection"
												className="text-base cursor-pointer leading-[25.6px] text-[#FFFFFF] font-bold w-[244px] min-h-[50px] py-[12px] px-[24px] mt-[10px]"
											/>
										</div>
									</form>
								</div>
							</div>
							<div className="md:w-[30%] hidden h-full md:flex md:flex-col gap-[10px]">
								{data.map((item: HouseFrameProps, idx: number) => {
									return (
										<HouseFrame
											key={idx}
											images={item.pictures}
											title={item.propertyType}
											location={`${item.location.state}, ${item.location.localGovernment}`}
											bedroom={item.noOfBedrooms}
											bathroom={2}
											carPark={3}
											onClick={() => {
												router.push(`/buy_page/details/${item._id}`);
											}}
										/>
									);
								})}
								<button
									type="button"
									className="min-h-[50px] text-[#13EE1B] w-full border-[1px] py-[12px] px-[24px] bg-[#FFFFFF] border-[#33E03A] flex items-center justify-center gap-[10px]">
									{""}
									<svg
										width="25"
										height="24"
										viewBox="0 0 25 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<path
											d="M12.5001 0C5.88338 0 0.500077 5.3833 0.500077 12C0.500077 14.0661 1.03382 16.0977 2.04599 17.8904L0.519382 23.3374C0.469295 23.5163 0.517817 23.7083 0.647208 23.8414C0.74686 23.9442 0.882512 24 1.02182 24C1.06356 24 1.10582 23.9948 1.14703 23.9849L6.8319 22.5767C8.56773 23.5085 10.5227 24 12.5001 24C19.1168 24 24.5001 18.6167 24.5001 12C24.5001 5.3833 19.1168 0 12.5001 0ZM18.5366 16.2344C18.2799 16.945 17.0486 17.5936 16.4569 17.6807C15.9258 17.7584 15.2538 17.7918 14.5161 17.5602C14.0689 17.4193 13.495 17.2325 12.7599 16.919C9.66964 15.601 7.65156 12.5285 7.49712 12.3256C7.34321 12.1226 6.23921 10.6763 6.23921 9.17948C6.23921 7.68261 7.03486 6.94643 7.31764 6.64174C7.60043 6.33704 7.93382 6.26087 8.13938 6.26087C8.34495 6.26087 8.54999 6.26348 8.72999 6.27183C8.91938 6.28122 9.17347 6.20035 9.42338 6.79409C9.68008 7.40348 10.2963 8.90035 10.3724 9.05322C10.4496 9.20556 10.5008 9.38348 10.3985 9.58644C10.2963 9.78939 10.2451 9.91617 10.0907 10.0941C9.93625 10.272 9.76721 10.4906 9.62843 10.6273C9.47399 10.7791 9.31382 10.9435 9.49329 11.2482C9.67277 11.5529 10.291 12.5489 11.2072 13.3555C12.3837 14.3917 13.3766 14.713 13.6844 14.8654C13.9923 15.0177 14.1723 14.9922 14.3517 14.7892C14.5312 14.5857 15.1218 13.9007 15.3269 13.5965C15.5319 13.2923 15.7375 13.3424 16.0203 13.4442C16.303 13.5454 17.8176 14.281 18.1255 14.4334C18.4333 14.5857 18.6389 14.6619 18.7161 14.7887C18.7933 14.915 18.7933 15.5243 18.5366 16.2344Z"
											fill="#33E03A"
										/>
									</svg>
									<span className="text-base leading-[25.6px] font-bold">WhatsApp</span>
								</button>
							</div>
						</div>
					</div>
				</section>
			) : (
				<></>
			)}
		</Fragment>
	);
};

const Input = ({
	name,
	placeholder,
	type,
	formik,
	onChange,
	label,
}: {
	name: string;
	placeholder: string;
	type: string;
	formik: any;
	onChange?: (name: string, value: string) => void;
	label: string;
}) => {
	return (
		<label
			className="md:1/2 w-full min-h-[80px] gap-[4px] flex flex-col"
			htmlFor={name}>
			<h2 className="text-base leading-[25.6px] text-[#1E1E1E] font-medium">
				{name}
			</h2>
			{type === "number" ? (
				<PhoneInputField
					id="phoneNumber"
					name="phoneNumber"
					value={formik.values[name]}
					onChange={formik.setFieldValue}
					onBlur={formik.handleBlur}
					error={formik.errors[name]}
					touched={formik.touched[name]}
					// className='min-h-[50px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7]'
					placeholder="Enter Your phone number"
				/>
			) : (
				<input
					type={type}
					id={label}
					value={formik.values[label]}
					onBlur={formik.handleBlur}
					onChange={formik.handleChange}
					name={label}
					placeholder={placeholder}
					className="min-h-[50px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7]  disabled:cursor-not-allowed focus:outline-[1.5px] focus:outline-[#14b8a6] focus:outline-offset-0 rounded-[5px]"
				/>
			)}

			{(formik.touched[label] || formik.errors[label]) && (
				<span className="text-sm text-red-500">{formik.errors[label]}</span>
			)}
		</label>
	);
};

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

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
	name,
	value,
	onChange,
	onBlur,
	error,
	touched,
	placeholder = "Enter phone number",
	defaultCountry = "NG", // Default country set to Nigeria
	className,
}) => {
	return (
		<div className="w-full">
			<PhoneInput
				international
				defaultCountry={defaultCountry}
				placeholder={placeholder}
				value={value}
				onChange={(value) => onChange(name, value || "")}
				onBlur={onBlur}
				id={name}
				name={name}
				className="min-h-[50px] w-full border-[1px] bg-[#FAFAFA] border-[#D6DDEB] py-[12px] px-[16px] text-base leading-[25.6px] text-[#1E1E1E] outline-none font-normal placeholder:text-[#A8ADB7]"
			/>
			{touched && error && <span className="text-sm text-red-500">{error}</span>}
		</div>
	);
};

export default Buy;
