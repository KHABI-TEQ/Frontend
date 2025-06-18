/** @format */
"use client";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import filterIcon from "@/svgs/filterIcon.svg";
import Select from "react-select";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import EllipsisOptions from "./ellipsisOptions";
import { usePageContext } from "@/context/page-context";
import { formatDate } from "@/utils/helpers";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ApproveBriefs from "./approveBriefs";
import DeleteBriefs from "./deleteBriefs";
import RejectBriefs from "./rejectBriefs";

import { URLS } from "@/utils/URLS";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function IncomingInspections({
	onPendingCount,
}: {
	onPendingCount?: (count: number) => void;
}) {
	const formik = useFormik({
		initialValues: {
			selectedStat: {
				value: "1",
				label: "Type",
			},
		},
		onSubmit: (values) => {
			// console.log(values);
		},
	});

	const [openRow, setOpenRow] = useState<number | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("Buyer Contact");
	const [selectedInspection, setSelectedInspection] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [totalBriefData, setTotalBriefData] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(3);
	const [briefToApprove, setBriefToApprove] = useState<any>(null);
	const [briefToReject, setBriefToReject] = useState<any>(null);
	const [briefToDelete, setBriefToDelete] = useState<any>(null);
	const { dashboard, setDashboard } = usePageContext();

	const toggleSidebar = (inspection: any) => {
		setSelectedInspection(inspection);
		setIsSidebarOpen(true);
	};

	const confirmApproveBrief = async (briefId: string) => {
		try {
			const response = await POST_REQUEST(`${URLS.BASE + URLS.approveBrief}`, {
				id: briefId,
			});
			if (response?.success) {
				toast.success("Brief approved successfully");
				setTotalBriefData((prev) => prev.filter((item) => item.id !== briefId));
			} else {
				toast.error("Failed to approve brief");
			}
		} catch (error) {
			toast.error("An error occurred while approving the brief");
		} finally {
			setBriefToApprove(null);
		}
	};

	const handleDeleteBrief = async (briefId: string) => {
		try {
			const response = await POST_REQUEST(`${URLS.BASE + URLS.deleteBrief}`, {
				id: briefId,
			});
			if (response?.success) {
				toast.success("Brief deleted successfully");
				setTotalBriefData((prev) => prev.filter((item) => item.id !== briefId));
			} else {
				toast.error("Failed to delete brief");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the brief");
		}
	};

	const handleRejectBrief = async (briefId: string) => {
		try {
			const response = await POST_REQUEST(`${URLS.BASE + URLS.rejectBrief}`, {
				id: briefId,
			});
			if (response?.success) {
				toast.success("Brief rejected successfully");
				setTotalBriefData((prev) => prev.filter((item) => item.id !== briefId));
			} else {
				toast.error("Failed to reject brief");
			}
		} catch (error) {
			toast.error("An error occurred while rejecting the brief");
		}
	};

	const router = useRouter();

	useEffect(() => {
		const getTotalBriefs = async () => {
			const adminToken = Cookies.get("adminToken");
			if (!adminToken) {
				router.push("/admin/auth/login");
			}
			setIsLoading(true);

			try {
				const response = await GET_REQUEST(
					`${
						URLS.BASE + URLS.adminGetAllInspections
					}?page=${currentPage}&limit=10&propertyType=PropertySell`,
					adminToken
				);

				if (response?.success === false) {
					toast.error("Failed to get data");
					return setIsLoading(false);
				}

				const data = response?.requests?.data || [];

				const mappedData = data
					.map((item: any) => ({
						id: item._id,
						buyerContact: {
							name: item.buyer?.fullName || "N/A",
							email: item.buyer?.email || "N/A",
							phone: item.buyer?.phoneNumber || "N/A",
						},
						agentInCharge: {
							name: item.property?.owner?.fullName || "N/A",
							email: item.property?.owner?.email || "N/A",
							phone: item.property?.owner?.phoneNumber || "N/A",
						},
						propertyToInspect: {
							address: `${item.property?.location?.state || "N/A"}, ${
								item.property?.location?.localGovernment || "N/A"
							}, ${item.property?.location?.area || "N/A"}`,
							type: item.property?.propertyType || "N/A",
							size: item.property?.propertyFeatures?.noOfBedrooms
								? `${item.property.propertyFeatures.noOfBedrooms} Bedrooms`
								: "N/A",
						},
						inspectionDate: item.inspectionDate
							? formatDate(item.inspectionDate)
							: "-",
						inspectionStatus: item.status || "-",
						briefDetails: {
							agentInCharge: item.property?.owner?.fullName || "N/A",
							type: item.property?.propertyType || "N/A",
							location: `${item.property?.location?.state || "N/A"}, ${
								item.property?.location?.localGovernment || "N/A"
							}, ${item.property?.location?.area || "N/A"}`,
							price: item.property?.price
								? `₦${item.property.price.toLocaleString()}`
								: "N/A",
							usageOptions:
								item.property?.usageOptions?.length > 0
									? item.property.usageOptions.join(", ")
									: "N/A",
							documents:
								item.property?.docOnProperty
									?.map((doc: any) => doc.docName)
									.join(", ") || "N/A",
						},
					}))
					.filter((item: any) => item.inspectionStatus === "Pending"); // Only include pending briefs

				setTotalBriefData(mappedData);
				onPendingCount?.(mappedData.length);
				setIsLoading(false);
			} catch (error) {
				setIsLoading(false);
			} finally {
				setIsLoading(false);
			}
		};
		getTotalBriefs();
	}, [currentPage, onPendingCount]);

	return (
		<>
			<motion.div
				initial={{ y: 90, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.3 }}
				className="mt-6 p-4 border rounded-md bg-white w-full lg:max-w-[1128px] px-8 mr-2 overflow-hidden md:overflow-x-auto">
				<h3 className="text-[#2E2C34] text-xl font-semibold  py-6">
					Buyers Inspections
				</h3>
				<div className="flex md:flex-row flex-col gap-2 justify-between">
					<Select
						className="text-[#2E2C34] text-sm ml-1"
						styles={{
							control: (styles) => ({
								...styles,
								boxShadow: "none",
								cursor: "pointer",
								outline: "none",
								backgroundColor: "#F9FAFB",
								border: "1px solid #D6DDEB",
								minWidth: "160px",
							}),
						}}
						options={statsOptions}
						defaultValue={statsOptions}
						value={formik.values.selectedStat}
						onChange={(options) => {
							formik.setFieldValue("selectedStat", options);
						}}
					/>

					<div className="flex md:w-[initial] w-fit gap-3 cursor-pointer border px-3 justify-center items-center rounded-md h-[40px] md:h-[initial]">
						<Image
							src={filterIcon}
							alt="filter icon"
							width={24}
							height={24}
							className="w-[24px] h-[24px]"
						/>
						<span className="text-[#2E2C34]">Filter</span>
					</div>
				</div>
				<div className="w-full overflow-x-auto md:overflow-clip mt-6">
					<table className="min-w-[900px] md:w-full border-collapse">
						<thead className="bg-[#fafafa] text-center text-sm font-medium text-gray-600">
							<tr className="border-b">
								<th
									className="p-3"
									style={{ width: "5%" }}>
									<input
										title="checkbox"
										type="checkbox"
									/>
								</th>
								<th
									className="p-3"
									style={{ width: "10%" }}>
									Inspection ID
								</th>
								<th
									className="p-3"
									style={{ width: "10%" }}>
									Buyer Contact
								</th>
								<th
									className="p-3"
									style={{ width: "10%" }}>
									Agent in Charge
								</th>
								<th
									className="p-3"
									style={{ width: "15%" }}>
									Property to Inspect
								</th>
								<th
									className="p-3"
									style={{ width: "10%" }}>
									Inspection Date
								</th>
								<th
									className="p-3"
									style={{ width: "10%" }}>
									Status
								</th>
								<th
									className="p-3"
									style={{ width: "5%" }}>
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{totalBriefData.map((item, index) => (
								<tr
									key={index}
									className="border-b text-sm text-center text-gray-700 hover:bg-gray-50">
									<td className="p-3">
										<input
											title="checkbox"
											type="checkbox"
										/>
									</td>
									<td className="p-3">{item.id}</td>
									<td className="p-3">
										<span
											className="text-blue-500 cursor-pointer underline"
											onClick={() => toggleSidebar(item)}>
											View Details
										</span>
									</td>
									<td className="p-3">
										<span
											className="text-blue-500 cursor-pointer underline"
											onClick={() => toggleSidebar(item)}>
											View Details
										</span>
									</td>
									<td className="p-3">
										<span
											className="text-blue-500 cursor-pointer underline"
											onClick={() => toggleSidebar(item)}>
											View Details
										</span>
									</td>
									<td className="p-3">{item.inspectionDate}</td>
									<td className="p-3">
										<span
											className={`${
												item.inspectionStatus === "Pending"
													? "text-[#FF3D00]"
													: item.inspectionStatus === "Accepted"
													? "text-green-500"
													: ""
											}`}>
											{item.inspectionStatus}
										</span>
									</td>
									<td className="p-3 cursor-pointer text-2xl">
										<FontAwesomeIcon
											onClick={() => {
												setOpenRow(openRow === index ? null : index);
											}}
											icon={faEllipsis}
										/>
										{openRow === index && (
											<EllipsisOptions
												onApproveBrief={() => {
													setBriefToApprove(item);
													// setDashboard({
													//   ...dashboard,
													//   approveBriefsTable: {
													//     ...dashboard.approveBriefsTable,
													//     isApproveClicked: true,
													//   },
													// });
												}}
												onDeleteBrief={() => setBriefToReject(item)}
												onRejectBrief={() => setBriefToDelete(item)}
												closeMenu={setOpenRow}
											/>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{/* <div className='flex justify-end items-center mt-10 gap-1'>
          <button
            type='button'
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-1 rounded-md ${
              currentPage === 1
                ? 'text-gray-300'
                : 'text-black-500 hover:text-[#8DDB90]'
            }`}
            disabled={currentPage === 1}>
            <FaChevronLeft />
            {''}
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              type='button'
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === index + 1
                  ? 'bg-[#8DDB90] text-white'
                  : ' hover:bg-gray-300'
              }`}>
              {index + 1}
            </button>
          ))}
          <button
            type='button'
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`px-4 py-1 rounded-md ${
              currentPage === totalPages
                ? 'text-gray-300'
                : 'text-black-500 hover:text-[#8DDB90]'
            }`}
            disabled={currentPage === totalPages}>
            <FaChevronRight />
            {''}
          </button>
        </div> */}
				<Pagination
					setCurrentPage={setCurrentPage}
					currentPage={currentPage}
					totalPages={totalPages}
				/>
			</motion.div>

			{isSidebarOpen && (
				<div className="fixed top-0 right-0 h-full w-[40%] bg-white shadow-lg z-50 px-8">
					<button
						type="button"
						onClick={() => setIsSidebarOpen(false)}
						className="left-4 text-black hover:bg-gray-300 p-2 rounded-full mt-8">
						<FaTimes size={25} />
						{""}
					</button>
					<div className="items-center p-4 border-b border-[#CFD0D5] mt-4">
						<h4 className="text-lg font-semibold">Inspection Details</h4>
					</div>
					<div className="flex border-b border-[#CFD0D5]">
						{["Buyer Contact", "Agent in Charge", "Property", "Brief"].map((tab) => (
							<button
								type="button"
								key={tab}
								className={`flex-1 py-3 text-center text-base ${
									activeTab === tab ? "border-b-2 border-[#45D884] font-semibold" : ""
								}`}
								onClick={() => setActiveTab(tab)}>
								{tab}
							</button>
						))}
					</div>
					<div className="">
						{activeTab === "Buyer Contact" && (
							<div className="py-6">
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Name</p>
									<p>
										<strong>{selectedInspection?.buyerContact.name}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Email</p>
									<p>
										<strong>{selectedInspection?.buyerContact.email}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Phone</p>
									<p>
										<strong>{selectedInspection?.buyerContact.phone}</strong>
									</p>
								</div>
							</div>
						)}
						{activeTab === "Agent in Charge" && (
							<div className="py-6">
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Name</p>
									<p>
										<strong>{selectedInspection?.agentInCharge.name}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Email</p>
									<p>
										<strong>{selectedInspection?.agentInCharge.email}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Phone</p>
									<p>
										<strong>{selectedInspection?.agentInCharge.phone}</strong>
									</p>
								</div>
							</div>
						)}
						{activeTab === "Property" && (
							<div className="py-6">
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Address</p>
									<p>
										<strong>{selectedInspection?.propertyToInspect.address}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Type</p>
									<p>
										<strong>{selectedInspection?.propertyToInspect.type}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Size</p>
									<p>
										<strong>{selectedInspection?.propertyToInspect.size}</strong>
									</p>
								</div>
							</div>
						)}
						{activeTab === "Brief" && (
							<div className="py-6">
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Agent in Charge</p>
									<p>
										<strong>{selectedInspection?.briefDetails.agentInCharge}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Property Type</p>
									<p>
										<strong>{selectedInspection?.propertyToInspect.type}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Location</p>
									<p>
										<strong>{selectedInspection?.propertyToInspect.address}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Property Prices</p>
									<p>
										<strong>{selectedInspection?.briefDetails.price}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Usage Options</p>
									<p>
										<strong>{selectedInspection?.briefDetails.usageOptions}</strong>
									</p>
								</div>
								<div className="flex justify-between items-center bg-[#F7F7F8] p-3 mb-1">
									<p>Document</p>
									<p>
										<strong>{selectedInspection?.briefDetails.documents}</strong>
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{briefToApprove && (
				<ApproveBriefs
					brief={briefToApprove}
					onConfirm={() => confirmApproveBrief(briefToApprove.id)}
					onCancel={() => setBriefToApprove(null)}
				/>
			)}

			{briefToReject && (
				<RejectBriefs
					brief={briefToReject}
					onConfirm={() => handleRejectBrief(briefToReject.id)}
					onCancel={() => setBriefToReject(null)}
				/>
			)}

			{briefToDelete && (
				<DeleteBriefs
					brief={briefToDelete}
					onConfirm={() => handleDeleteBrief(briefToDelete.id)}
					onCancel={() => setBriefToDelete(null)}
				/>
			)}
		</>
	);
}

const statsOptions = [
	{ value: "1", label: "Type" },
	{ value: "2", label: "Pending" },
	{ value: "3", label: "Overdue" },
];
