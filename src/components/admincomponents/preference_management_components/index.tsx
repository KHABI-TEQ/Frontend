/** @format */

"use client";
import { archivo, epilogue } from "@/styles/font";
import {
<<<<<<< HEAD
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faEllipsis,
  faPlus,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import Select, { SingleValue } from 'react-select';
import customStyles from '@/styles/inputStyle';
import Image from 'next/image';
import filterIcon from '@/svgs/filterIcon.svg';
import useClickOutside from '@/hooks/clickOutside';
import { URLS } from '@/utils/URLS';
import { POST_REQUEST } from '@/utils/requests';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Pagination from '@/components/pagination';
=======
	faArrowDown,
	faArrowLeft,
	faArrowUp,
	faEllipsis,
	faPlus,
	faSync,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import Select, { SingleValue } from "react-select";
import customStyles from "@/styles/inputStyle";
import Image from "next/image";
import filterIcon from "@/svgs/filterIcon.svg";
import useClickOutside from "@/hooks/clickOutside";
import axios from "axios";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
>>>>>>> main

type PreferenceManagementProps = {};

const PreferenceManagement: React.FC<PreferenceManagementProps> = ({}) => {
<<<<<<< HEAD
  const [selectedTable, setSelectedTable] = useState<string>('Buyer');
  const [pageStatus, setPageStatus] = useState<'home' | 'is edit' | 'is view'>('home');
  const [trackNav, setTrackNav] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [briefsData, setBriefsData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(3);
  const [selectedBrief, setSelectedBrief] = useState<any | null>(null);

  const BRIEF_TYPES = ['Joint Venture', 'Outright Sales', 'Rent'];

  const fetchAllBriefTypes = async (ownerType: string, currentPage: number) => {
    try {
      const adminToken = Cookies.get('adminToken');
      const allResponses = await Promise.all(
        BRIEF_TYPES.map((briefType) =>
          POST_REQUEST(
            URLS.BASE + URLS.adminGetAllBriefs,
            {
              briefType,
              ownerType,
              page: currentPage,
              limit: 10,
            },
            adminToken
          )
        )
      );

      let allBriefs: any[] = [];
      allResponses.forEach((response, idx) => {
        if (response?.success !== false) {
          const data = Array.isArray(response?.properties?.data)
            ? response.properties.data
            : [];
          allBriefs = allBriefs.concat(
            data.map((item: any) => ({
              id: item._id?.slice(0, 8) || '--',
              legalName: item.owner
                ? item.owner.fullName ||
                  `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() ||
                  '--'
                : '--',
              email: item.owner?.email || '--',
              phoneNumber: item.owner?.phoneNumber || '--',
              agentType: item.owner
                ? item.owner.agentType === 'Company'
                  ? 'Incorporated Agent'
                  : item.owner.agentType || '--'
                : '--',
              location: item.location
                ? `${item.location.state || '--'}, ${item.location.localGovernment || '--'}, ${item.location.area || '--'}`
                : '--',
              landSize:
                item.landSize && item.landSize.size !== 'N/A'
                  ? `${item.landSize.size || '--'} ${item.landSize.measurementType || '--'}`
                  : '--',
              amount: item.price ? `₦${item.price.toLocaleString()}` : '--',
              document: item.docOnProperty?.length
                ? item.docOnProperty
                    .filter((doc: any) => doc?.isProvided)
                    .map((doc: any) => doc?.docName)
                    .join(', ') || '--'
                : '--',
              createdAt: item.createdAt || '--',
              propertyId: item._id || '--',
              briefType: item.briefType || BRIEF_TYPES[idx],
              isApproved: item.isApproved || false,
              isRejected: item.isRejected || false,
              noOfBedrooms: item.additionalFeatures?.noOfBedrooms || '--',
              usageOptions:
                Array.isArray(item.usageOptions) && item.usageOptions.length > 0
                  ? item.usageOptions.join(', ')
                  : '--',
              features:
                Array.isArray(item.additionalFeatures?.additionalFeatures) &&
                item.additionalFeatures.additionalFeatures.length > 0
                  ? item.additionalFeatures.additionalFeatures.join(', ')
                  : '--',
              pictures:
                Array.isArray(item.pictures) && item.pictures.length > 0
                  ? item.pictures
                  : [],
              propertyType: item.propertyType || '--',
              propertyCondition: item.propertyCondition || '--',
              tenantCriteria:
                Array.isArray(item.tenantCriteria) && item.tenantCriteria.length > 0
                  ? item.tenantCriteria.join(', ')
                  : '--',
              isPreference: item.isPreference === true,
            }))
          );
        }
      });

      // Only include briefs where isPreference is true
      allBriefs = allBriefs.filter((brief: any) => brief.isPreference);

      // Sort by createdAt descending
      return allBriefs.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching briefs:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Use 'all' as ownerType to match BriefLists default
      const briefs = await fetchAllBriefTypes('all', currentPage);
      setBriefsData(briefs);
      setIsLoading(false);
    };
    fetchData();
  }, [currentPage]);

  const handleActionClick = (brief: any) => {
    setSelectedBrief(brief);
    setPageStatus('is view');
  };

  const closeSidebar = () => {
    setSelectedBrief(null);
    setPageStatus('home');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const Home = () => {
    return (
      <aside className='w-full flex flex-col gap-[35px]'>
        <div className='min-h-[64px] w-full flex md:flex-row flex-col items-start justify-between md:items-center gap-[20px]'>
          <div className='flex flex-col gap-[4px]'>
            <h2 className={`${archivo.className} text-3xl font-semibold text-dark`}>
              Preference Management
            </h2>
            <span className={`${archivo.className} text-sm font-normal text-gray-400`}>
              Showing your Account metrics for July 19, 2021 - July 25, 2021
            </span>
          </div>
          <button
            type='button'
            className='h-[50px] w-[163px] bg-[#8DDB90] rounded-[5px] flex justify-center items-center gap-2'>
            <FontAwesomeIcon
              icon={faPlus}
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
              color='white'
            />
            <span className={`text-base ${archivo.className} font-bold text-white`}>
              Send invite
            </span>
          </button>
        </div>

        <div className='flex gap-[45px] h-[37px] border-b-[1px] border-[#D6DDEB]'>
          {['Buyer', 'Tenant', 'Developer'].map((item: string) => {
            const isSelected = selectedTable === item;
            return (
              <motion.span
                key={item}
                onClick={() => setSelectedTable(item)}
                className={`relative px-2 cursor-pointer text-base ${
                  archivo.className
                } ${
                  isSelected
                    ? 'text-[#181336] font-semibold'
                    : 'text-[#515B6F] font-normal'
                }`}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                {item}
                {isSelected && (
                  <motion.div
                    layoutId='underline'
                    className='absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#8DDB90]'
                  />
                )}
              </motion.span>
            );
          })}
        </div>

        {isLoading ? (
          <div className='w-full h-full flex justify-center items-center'>
            <div className='flex items-center gap-1'>
              <span className='text-base'>Loading</span>
              <FontAwesomeIcon
                icon={faRefresh}
                spin
                width={25}
                height={25}
                className='w-[20px] h-[20px]'
              />
            </div>
          </div>
        ) : (
          <div className='w-full bg-white border-[1px] border-[#E4DFDF] rounded-[4px] flex flex-col gap-[39px] overflow-hidden items-start justify-start py-[30px] px-[32px]'>
            <div className='flex gap-[45px] h-[37px] border-b-[1px] border-[#D6DDEB]'>
              <h2 className='text-xl font-semibold text-[#181336]'>{selectedTable}</h2>
            </div>

            <div className='h-[50px] flex justify-between items-center w-full'>
              <Select
                className='w-[160px]'
                styles={customStyles}
                options={[
                  { value: 'Rent', label: 'Rent' },
                  { value: 'Sale', label: 'Sale' },
                  { value: 'Lease', label: 'Lease' },
                  { value: 'All', label: 'All' },
                ]}
                defaultValue={{ value: 'All', label: 'All' }}
              />

              <div className='flex gap-4 w-[96px] items-center justify-center rounded-[5px] border-[1px] border-gray-300 h-[50px]'>
                <Image
                  alt='filter'
                  width={24}
                  height={24}
                  src={filterIcon}
                  className='w-[24px] h-[24px]'
                />
                <h3 className={`text-base font-medium ${archivo.className}`}>filter</h3>
              </div>
            </div>

            <div className='w-full overflow-x-auto'>
              <table className='min-w-[900px] md:w-full border-collapse'>
                <thead>
                  <tr className='border-b bg-[#fafafa] text-center text-sm font-medium text-gray-600'>
                    <th className='p-3' style={{ width: '5%' }}>
                      <input title='checkbox' type='checkbox' />
                    </th>
                    <th className='p-3' style={{ width: '5%' }}>ID</th>
                    <th className='p-3' style={{ width: '10%' }}>Legal Name</th>
                    <th className='p-3' style={{ width: '10%' }}>Agent Type</th>
                    <th className='p-3' style={{ width: '15%' }}>Location</th>
                    <th className='p-3' style={{ width: '5%' }}>Land Size</th>
                    <th className='p-3' style={{ width: '10%' }}>Amount</th>
                    <th className='p-3' style={{ width: '15%' }}>Document</th>
                    <th className='p-3' style={{ width: '5%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {briefsData.map((item, idx: number) => (
                    <tr key={item.id} className='border-b text-sm text-center text-gray-700 hover:bg-gray-50'>
                      <td className='p-3'>
                        <input title='checkbox' type='checkbox' />
                      </td>
                      <td className='p-3'>{item.id}</td>
                      <td className='p-3'>{item.legalName}</td>
                      <td className={`p-3 font-semibold ${
                        item.agentType === 'Individual'
                          ? 'text-red-500'
                          : item.agentType === 'Incorporated Agent'
                          ? 'text-green-500'
                          : 'text-blue-500'
                      }`}>
                        {item.agentType}
                      </td>
                      <td className='p-3'>{item.location}</td>
                      <td className='p-3'>{item.landSize}</td>
                      <td className='p-3 font-bold'>{item.amount}</td>
                      <td className='p-3'>{item.document}</td>
                      <td className='p-3 cursor-pointer text-2xl'>
                        <FontAwesomeIcon
                          onClick={() => handleActionClick(item)}
                          icon={faEllipsis}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </aside>
    );
  };

  const Details = ({ brief }: { brief: any }) => {
    return (
      <div className='flex flex-col gap-[20px] w-full'>
        <nav className='flex items-center gap-[30px]'>
          <button onClick={closeSidebar} type='button'>
            <FontAwesomeIcon
              icon={faArrowLeft}
              width={24}
              height={24}
              color='#404040'
              className='w-[24px] h-[24px]'
              title='Back'
            />
          </button>
          <div className='flex gap-3'>
            <span className='text-xl text-neutral-700'>Preference Management</span>
            <span className={`text-xl text-neutral-900 ${epilogue.className}`}>
              {brief.legalName}
            </span>
          </div>
        </nav>

        <div className='h-[64px] flex justify-between items-center'>
          <div className='flex gap-[14px]'>
            <div className='w-[64px] h-[64px] rounded-full flex justify-center items-center bg-[#8DDB90]'>
              <span className='text-[#181336] font-archivo font-bold'>
                {brief.legalName?.charAt(0)}
              </span>
            </div>
            <div className='flex flex-col gap-2'>
              <h3>{brief.legalName}</h3>
              <p className='text-sm text-gray-500'>{brief.email}</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='p-4 border rounded-lg'>
            <h4 className='font-semibold mb-2'>Property Details</h4>
            <p>Type: {brief.propertyType}</p>
            <p>Location: {brief.location}</p>
            <p>Land Size: {brief.landSize}</p>
            <p>Amount: {brief.amount}</p>
          </div>
          <div className='p-4 border rounded-lg'>
            <h4 className='font-semibold mb-2'>Additional Information</h4>
            <p>Bedrooms: {brief.noOfBedrooms}</p>
            <p>Features: {brief.features}</p>
            <p>Usage Options: {brief.usageOptions}</p>
            <p>Documents: {brief.document}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContentDynamically = (): React.JSX.Element => {
    switch (pageStatus) {
      case 'home':
        return <Home />;
      case 'is view':
        return <Details brief={selectedBrief} />;
      default:
        return <></>;
    }
  };

  return <Fragment>{pageStatus && renderContentDynamically()}</Fragment>;
};

=======
	const [selectedTable, setSelectedTable] = useState<string>("Buyer");
	const [pageStatus, setPageStatus] = useState<"home" | "is edit" | "is view">(
		"home"
	);
	const [trackNav, setTrackNav] = useState<string[] | null>(null);
	const [preferences, setPreferences] = useState<any[]>([]);
	const [propertySells, setPropertySells] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState<number>(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = Cookies.get("adminToken");
				if (!token) {
					toast.error("Authentication token not found");
					setError("Authentication token not found");
					return;
				}

				if (!URLS.BASE) {
					console.error("API base URL is not set");
					toast.error("API configuration error. Please contact support.");
					setError("API base URL is not configured");
					return;
				}

				// Fetch both preferences and property sells
				const [preferencesResponse, propertySellsResponse] = await Promise.all([
					// Fetch preferences
					axios.get(URLS.BASE + URLS.getAllPreferences, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}),
					// Fetch property sells
					axios.get(URLS.BASE + URLS.getAllPropertySells, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}),
				]);

				// Handle preferences data
				let preferencesData = [];
				if (preferencesResponse.data && preferencesResponse.data.preferences) {
					preferencesData = preferencesResponse.data.preferences;
				} else if (
					preferencesResponse.data &&
					Array.isArray(preferencesResponse.data)
				) {
					preferencesData = preferencesResponse.data;
				} else if (
					preferencesResponse.data &&
					preferencesResponse.data.success &&
					preferencesResponse.data.preferences
				) {
					preferencesData = preferencesResponse.data.preferences;
				}

				// Handle property sells data
				let sellsData = [];
				if (propertySellsResponse.data && propertySellsResponse.data.data) {
					sellsData = propertySellsResponse.data.data;
				} else if (
					propertySellsResponse.data &&
					Array.isArray(propertySellsResponse.data)
				) {
					sellsData = propertySellsResponse.data;
				}

				setPreferences(preferencesData);
				setPropertySells(sellsData);
				setError(null);

				if (preferencesData.length === 0 && sellsData.length === 0) {
					toast("No data found");
				}
			} catch (error: any) {
				console.error("Error fetching data:", error);

				if (error.response) {
					const { status, data } = error.response;
					console.error("Response error details:", { status, data });

					switch (status) {
						case 400:
							toast.error(
								"Bad request: " +
									(data?.message || data?.error || "Invalid request format")
							);
							break;
						case 401:
							toast.error("Authentication failed. Please log in again.");
							Cookies.remove("adminToken");
							window.location.href = "/admin/auth/login";
							break;
						case 403:
							toast.error("Access denied. You do not have permission to view data.");
							break;
						case 404:
							toast.error("Endpoint not found. Please contact support.");
							break;
						case 500:
							const errorMsg = data?.error || data?.message || "Internal server error";
							toast.error("Server error: " + errorMsg);
							break;
						default:
							toast.error(
								`Request failed with status ${status}: ${
									data?.message || "Unknown error"
								}`
							);
					}
				} else if (error.request) {
					console.error("Request error - no response received:", error.request);
					toast.error(
						"Network error: Unable to reach server. Please check your connection."
					);
				} else {
					console.error("Unexpected error:", error.message);
					toast.error("An unexpected error occurred: " + error.message);
				}

				setError(error.message || "Failed to fetch data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [retryCount]);

	// Map backend data to the table format
	const mapDataToTable = (
		data: any[],
		type: "preference" | "sell"
	): DataTable => {
		return data.map((item) => ({
			id: item._id,
			name:
				type === "preference"
					? item.owner
						? `${item.owner.firstName} ${item.owner.lastName}`
						: "N/A"
					: item.owner
					? `${item.owner.firstName} ${item.owner.lastName}`
					: "N/A",

			listingType: type === "preference" ? item.briefType || "N/A" : "Sale",
			propertyType: item.propertyType || "N/A",
			location: {
				state: item.location?.state || "",
				lga: item.location?.localGovernment || "",
				area: item.location?.area || "",
			},
			priceRange:
				type === "preference"
					? item.budgetMin && item.budgetMax
						? `₦${item.budgetMin.toLocaleString()} - ₦${item.budgetMax.toLocaleString()}`
						: "N/A"
					: item.price
					? `₦${item.price.toLocaleString()}`
					: "N/A",
		}));
	};

	// Combine both preferences and property sells data
	const combinedData = [
		...mapDataToTable(preferences, "preference"),
		...mapDataToTable(propertySells, "sell"),
	];

	// Retry function for manual retry
	const retryFetchPreferences = () => {
		setLoading(true);
		setError(null);
		setRetryCount((prev) => prev + 1); // Increment retry count to trigger useEffect
	};

	const Home = ({
		pageStatus,
		setPageStatus,
		setTracker,
		tracker,
	}: {
		pageStatus: "home" | "is edit" | "is view";
		setPageStatus: (type: "home" | "is edit" | "is view") => void;
		tracker?: string[] | null;
		setTracker: (type: string[] | null) => void;
	}): React.JSX.Element => {
		return (
			<aside className="w-full flex flex-col gap-[35px]">
				<div className="min-h-[64px] w-full flex md:flex-row flex-col items-start justify-between md:items-center gap-[20px]">
					<div className="flex flex-col gap-[4px]">
						<h2 className={`${archivo.className} text-3xl font-semibold text-dark`}>
							Preference Management
						</h2>
						<span
							className={`${archivo.className} text-sm font-normal text-gray-400`}>
							Showing your Account metrics for July 19, 2021 - July 25, 2021
						</span>
					</div>
					<div className="flex gap-4">
						<button
							onClick={retryFetchPreferences}
							type="button"
							className="h-[50px] w-[163px] bg-[#0B423D] rounded-[5px] flex justify-center items-center gap-2">
							<FontAwesomeIcon
								icon={faSync}
								width={24}
								height={24}
								className="w-[24px] h-[24px]"
								color="white"
							/>
							<span className={`text-base ${archivo.className} font-bold text-white`}>
								Retry
							</span>
						</button>
						<button
							type="button"
							className="h-[50px] w-[163px] bg-[#8DDB90] rounded-[5px] flex justify-center items-center gap-2">
							<FontAwesomeIcon
								icon={faPlus}
								width={24}
								height={24}
								className="w-[24px] h-[24px]"
								color="white"
							/>
							<span className={`text-base ${archivo.className} font-bold text-white`}>
								Send invite
							</span>
						</button>
					</div>
				</div>

				<div className="flex gap-[30px] overflow-x-auto hide-scrollbar whitespace-nowrap">
					<Rectangle
						heading="Buyer Preference"
						headerStyling={{ color: "#0B423D" }}
						value={preferences.length}
						status={{
							position: "risen",
							percentage: 5.7,
						}}
					/>
					<Rectangle
						heading="Property Sells"
						headerStyling={{ color: "#0B423D" }}
						value={propertySells.length}
						status={{
							position: "risen",
							percentage: 5.7,
						}}
					/>
				</div>

				<div className="flex gap-[45px] h-[37px] border-b-[1px] border-[#D6DDEB]">
					{["Buyer", "Tenant", "Developer"].map((item: string) => {
						const isSelected = selectedTable === item;

						return (
							<motion.span
								key={item}
								onClick={() => {
									setSelectedTable(item);
								}}
								className={`relative px-2 cursor-pointer text-base ${
									archivo.className
								} ${
									isSelected
										? "text-[#181336] font-semibold"
										: "text-[#515B6F] font-normal"
								}`}
								layout
								transition={{ type: "spring", stiffness: 300, damping: 30 }}>
								{item}
								{isSelected && (
									<motion.div
										layoutId="underline"
										className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#8DDB90]"
									/>
								)}
							</motion.span>
						);
					})}
				</div>

				<div className="w-full">
					{loading ? (
						<div className="text-center py-10">Loading preferences...</div>
					) : error ? (
						<div className="text-center text-red-500 py-10">{error}</div>
					) : (
						<Table
							tracker={tracker}
							setTracker={setTrackNav}
							pageStatus={pageStatus}
							setPageStatus={setPageStatus}
							data={combinedData}
							heading="All Preferences"
						/>
					)}
				</div>
			</aside>
		);
	};

	const renderContentDynamically = (): React.JSX.Element => {
		switch (pageStatus) {
			case "home":
				return (
					<Home
						pageStatus={pageStatus}
						setPageStatus={setPageStatus}
						setTracker={setTrackNav}
						tracker={trackNav}
					/>
				);
			case "is edit":
				return (
					<Details
						navHeading={trackNav}
						setPageStatus={setPageStatus}
					/>
				);
			case "is view":
				return (
					<Details
						navHeading={trackNav}
						setPageStatus={setPageStatus}
					/>
				);
			default:
				return (
					<Home
						pageStatus={pageStatus}
						setPageStatus={setPageStatus}
						setTracker={setTrackNav}
						tracker={trackNav}
					/>
				);
		}
	};

	return (
		<div className="w-full flex flex-col gap-[35px]">
			{renderContentDynamically()}
		</div>
	);
};

type RectangleProps = {
	heading: string;
	headerStyling?: React.CSSProperties;
	value: number;
	valueStyling?: React.CSSProperties;
	status?: {
		percentage: number;
		position: "risen" | "fallen";
	};
};

const Rectangle = ({
	heading,
	headerStyling,
	value,
	valueStyling,
	status,
}: RectangleProps): React.JSX.Element => {
	return (
		<div className="w-[356px] h-[127px] shrink-0 flex flex-col gap-[35px] justify-center px-[25px] bg-[#FFFFFF] border-[1px] border-[#E4DFDF] rounded-[4px]">
			<h3
				style={headerStyling}
				className={`text-base font-medium ${archivo.className}`}>
				{heading}
			</h3>
			<div className="flex justify-between items-center">
				<h2
					style={valueStyling}
					className={`${archivo.className} text-3xl font-semibold`}>
					{Number(value).toLocaleString()}
				</h2>
				{status ? (
					<div className="flex gap-[4px]">
						<FontAwesomeIcon
							style={
								status.position === "fallen"
									? { color: "#DA1010", transform: "rotate(30deg)" }
									: { color: "green" }
							}
							width={17}
							height={17}
							className="w-[17px] h-[17px]"
							icon={status.position === "risen" ? faArrowUp : faArrowDown}
						/>
						<span className="text-sm text-black font-archivo">
							{status.percentage}%
						</span>
					</div>
				) : null}
			</div>
		</div>
	);
};

type PropertyListing = {
	id: string;
	name: string;
	listingType: "Rent" | "Sale" | "Lease";
	propertyType: string;
	location: {
		state: string;
		lga: string;
		area: string;
	};
	priceRange: string;
};

type DataTable = PropertyListing[];

const dummyData: DataTable = [
	{
		id: "KA4556",
		name: "Cozy Family Apartment",
		listingType: "Rent",
		propertyType: "Apartment",
		location: {
			state: "Lagos",
			lga: "Ikeja",
			area: "Magodo",
		},
		priceRange: "₦500,000 - ₦700,000",
	},
	{
		id: "KA4556",
		name: "Spacious 3 Bedroom Duplex",
		listingType: "Sale",
		propertyType: "Duplex",
		location: {
			state: "Abuja",
			lga: "Garki",
			area: "Phase 2",
		},
		priceRange: "₦45,000,000 - ₦50,000,000",
	},
	{
		id: "KA4556",
		name: "Commercial Office Space",
		listingType: "Lease",
		propertyType: "Office",
		location: {
			state: "Rivers",
			lga: "Port Harcourt",
			area: "GRA",
		},
		priceRange: "₦2,000,000 per annum",
	},
	{
		id: "KA4556",
		name: "Modern Studio Apartment",
		listingType: "Rent",
		propertyType: "Studio",
		location: {
			state: "Ogun",
			lga: "Abeokuta South",
			area: "Idi-Aba",
		},
		priceRange: "₦250,000 - ₦400,000",
	},
	{
		id: "KA4556",
		name: "Luxury 5 Bedroom Mansion",
		listingType: "Sale",
		propertyType: "Mansion",
		location: {
			state: "Lagos",
			lga: "Lekki",
			area: "Chevron",
		},
		priceRange: "₦250,000,000 - ₦300,000,000",
	},
	{
		id: "KA4556",
		name: "Modern Studio Apartment",
		listingType: "Rent",
		propertyType: "Studio",
		location: {
			state: "Ogun",
			lga: "Abeokuta South",
			area: "Idi-Aba",
		},
		priceRange: "₦250,000 - ₦400,000",
	},
	{
		id: "KA4556",
		name: "Luxury 5 Bedroom Mansion",
		listingType: "Sale",
		propertyType: "Mansion",
		location: {
			state: "Lagos",
			lga: "Lekki",
			area: "Chevron",
		},
		priceRange: "₦250,000,000 - ₦300,000,000",
	},
	{
		id: "KA4556",
		name: "Modern Studio Apartment",
		listingType: "Rent",
		propertyType: "Studio",
		location: {
			state: "Ogun",
			lga: "Abeokuta South",
			area: "Idi-Aba",
		},
		priceRange: "₦250,000 - ₦400,000",
	},
	{
		id: "KA4556",
		name: "Luxury 5 Bedroom Mansion",
		listingType: "Sale",
		propertyType: "Mansion",
		location: {
			state: "Lagos",
			lga: "Lekki",
			area: "Chevron",
		},
		priceRange: "₦250,000,000 - ₦300,000,000",
	},
];

type TableProps = {
	heading: string;
	data: DataTable;
	pageStatus: "home" | "is edit" | "is view";
	setPageStatus: (type: "home" | "is edit" | "is view") => void;
	tracker?: string[] | null;
	setTracker: (type: string[] | null) => void;
};
const Table = ({
	heading,
	data,
	pageStatus,
	setPageStatus,
	setTracker,
}: TableProps) => {
	const controls = useAnimation();
	const [originalData, setOriginalData] = useState(data);
	const [stateData, parsedStateData] = useState<DataTable>(data);
	const [isActionModalClicked, setIsActionModalClicked] =
		useState<boolean>(false);
	const [rowSelected, setRowSelected] = useState<string | number | null>(null);

	type propertyType = "Rent" | "Lease" | "Sale" | "All";

	const filterBy = (type: propertyType) => {
		if (type === "All") {
			return parsedStateData(originalData);
		} else {
			const filteredStateData = originalData.filter(
				(item) => item.listingType === type
			);
			parsedStateData(filteredStateData);
			console.log(type);
		}
	};

	useEffect(() => {
		controls.start({
			x: [30, 0],
			opacity: [0, 1],
			transition: { duration: 0.4, ease: "easeOut" },
		});
	}, [heading]);
	return (
		<div className="w-full bg-white border-[1px] border-[#E4DFDF] rounded-[4px] flex flex-col gap-[39px] overflow-hidden items-start justify-start py-[30px] px-[32px]">
			<AnimatePresence>
				<motion.h2
					animate={controls}
					className="text-xl font-semibold text-[#181336]">
					{heading}
				</motion.h2>
			</AnimatePresence>
			<div className="min-h-[400px] w-full flex flex-col gap-[15px]">
				<div className="h-[50px] flex justify-between items-center">
					<Select
						className="w-[160px]"
						styles={customStyles}
						onChange={(
							event: SingleValue<{
								value: string;
								label: string;
							}>
						) => {
							filterBy(event?.label as propertyType);
						}}
						options={[
							{ value: "Rent", label: "Rent" },
							{ value: "Outright Sales", label: "Sale" },
							{ value: "Joint Venture", label: "Joint Venture" },
							{ value: "All", label: "All" },
						]}
					/>

					<div className="flex gap-4 w-[96px] items-center justify-center rounded-[5px] border-[1px] border-gray-300 h-[50px]">
						<Image
							alt="filter"
							width={24}
							height={24}
							src={filterIcon}
							className="w-[24px] h-[24px]"
						/>
						<h3 className={`text-base font-medium ${archivo.className}`}>filter</h3>
					</div>
				</div>
				<div className="overflow-x-auto hide-scrollbar w-full">
					<table className="min-w-[1000px] max-w-full divide-y divide-gray-200 text-sm">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 text-left font-medium text-gray-700 flex items-center gap-2">
									<input
										type="checkbox"
										name="check"
										id="check"
										title="check"
									/>{" "}
									ID
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Listing Type
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Property Type
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Location
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Price Range
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{stateData.map((item, idx: number) => (
								<tr
									key={item.id}
									className={`hover:bg-gray-50 ${archivo.className}`}>
									<td className="px-4 py-2 font-archivo flex gap-2 items-center">
										<input
											type="checkbox"
											name="check"
											id="check"
											title="check"
										/>{" "}
										{item.id}
									</td>
									<td className="px-4 py-2 font-archivo">{item.name}</td>
									<td className="px-4 py-2 font-archivo">
										<span
											className={`inline-block px-2 py-1 rounded text-black text-xs font-semibold font-archivo`}>
											{item.listingType}
										</span>
									</td>
									<td className="px-4 py-2 font-archivo">{item.propertyType}</td>
									<td className="px-4 py-2 font-archivo">
										<div className="text-xs text-gray-700">
											<div className="font-archivo">{item.location.state}</div>
											{/* <div>
                      {item.location.lga}, {item.location.state}
                    </div> */}
										</div>
									</td>
									<td className="px-4 py-2 font-medium text-gray-900 font-archivo">
										{item.priceRange}
									</td>
									<td className="px-4 py-2 font-medium text-gray-900 font-archivo">
										<div className="flex flex-col items-center justify-center gap-[5px]">
											<FontAwesomeIcon
												onClick={() => {
													setRowSelected(idx);
													//setIsActionModalClicked(true);
												}}
												icon={faEllipsis}
												width={24}
												height={24}
												color="#181336"
												className="w-[24px] h-[24px] cursor-pointer"
											/>
											{rowSelected !== null && rowSelected === idx && (
												<ToggleBox
													editDetails={() => {
														setPageStatus("is edit");
														setTracker([heading]);
													}}
													viewDetails={() => {
														setPageStatus("is view");
														setTracker([heading]);
													}}
													deleteDetails={() => {}}
													setCloseModal={setRowSelected}
												/>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

type ToggleBoxProps = {
	setCloseModal: (type: string | null | number) => void;
	editDetails: () => void;
	viewDetails: () => void;
	deleteDetails: () => void;
};

const ToggleBox: React.FC<ToggleBoxProps> = ({
	setCloseModal,
	editDetails,
	viewDetails,
	deleteDetails,
}) => {
	const toggleRef = useRef<HTMLDivElement | null>(null);

	useClickOutside(toggleRef, () => setCloseModal(null));
	return (
		<motion.div
			ref={toggleRef}
			className="w-[127px] h-[136px] p-[20px] rounded-[5px] bg-white shadow-md flex flex-col gap-[15px] absolute mt-[200px] -ml-[200px]"
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 20, opacity: 0 }}
			transition={{ delay: 0.2 }}>
			<span
				onClick={viewDetails}
				className={`font-archivo text-sm text-black font-normal cursor-pointer`}>
				View details
			</span>
			<span
				onClick={editDetails}
				className={`font-archivo text-sm text-black font-normal cursor-pointer`}>
				Edit details
			</span>
			<span
				onClick={deleteDetails}
				className={`font-archivo text-sm text-black font-normal cursor-pointer`}>
				Delete details
			</span>
		</motion.div>
	);
};

type DetailsProps = {
	navHeading: string[] | null;
	setPageStatus: (type: "home" | "is edit" | "is view") => void;
};

const Details = ({
	navHeading,
	setPageStatus,
}: DetailsProps): React.JSX.Element => {
	const generateRandomColor = (): string => {
		const colors = ["red", "green", "teal", "darkgoldenrod", "maroon", "#CDA4FF"];
		const shuffleIndex = Math.floor(Math.random() * colors["length"]);

		return colors[shuffleIndex];
	};
	return (
		<div className="flex flex-col gap-[20px] w-full">
			<nav className="flex items-center gap-[30px]">
				<button
					onClick={() => setPageStatus("home")}
					type="button">
					<FontAwesomeIcon
						icon={faArrowLeft}
						width={24}
						height={24}
						color="#404040"
						className="w-[24px] h-[24px]"
						title="Back"
					/>
					{""}
				</button>
				<div className="flex gap-3">
					<span className="text-xl text-neutral-700">Preference Management</span>
					<span className={`text-xl text-neutral-900 ${epilogue.className}`}>
						{navHeading !== null && navHeading.map((item: string) => item)}
					</span>
				</div>
			</nav>

			<div className="h-[64px] flex justify-between items-center">
				<div className="flex gap-[14px]">
					<div
						style={{
							background: generateRandomColor(),
						}}
						className="w-[64px] h-[64px] rounded-full flex justify-center items-center">
						<span className="text-[#181336] font-archivo font-bold">WA</span>
					</div>
					<div className="flex flex-col gap-2">
						<h3>Wale Tunde</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

>>>>>>> main
export default PreferenceManagement;
