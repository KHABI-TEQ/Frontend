"use client"
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReactSelect from 'react-select';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import 'react-phone-number-input/style.css';

// Import post property components for exact same structure
import Button from '@/components/general-components/button';
import Input from '@/components/general-components/Input';
import RadioCheck from '@/components/general-components/radioCheck';
import Stepper from '@/components/post-property-components/Stepper';
import ClickableCard from '@/components/post-property-components/ClickableCard';
import PropertySummary from '@/components/post-property-components/PropertySummary';
import CommissionModal from '@/components/post-property-components/CommissionModal';
import customStyles from '@/styles/inputStyle';
import data from '@/data/state-lga';
import { DocOnPropertyData, featuresData, JvConditionData } from '@/data/buy_data';
import { tenantCriteriaData } from '@/data/landlord';
import { propertyReferenceData } from '@/data/buy_page_data';
import { useUserContext } from '@/context/user-context';
import { usePageContext } from '@/context/page-context';
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD, GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import useClickOutside from '@/hooks/clickOutside';
import AgentMarketplaceSteps from '@/components/agent-marketplace/steps';
import Loading from '@/components/loading-component/loading';

// Import your images
import Blue from '@/assets/blue.png';
import Red from '@/assets/red.png';
import Green from '@/assets/green.png';

interface Option {
  value: string;
  label: string;
}

const BriefDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useUserContext();
  const { commission, setCommission } = usePageContext();

  // Add missing state for buyer preference modal and actual brief data
  const [showBuyerPreferenceCard, setShowBuyerPreferenceCard] = useState(false);
  const [briefData, setBriefData] = useState<any>(null);
  const [loadingBrief, setLoadingBrief] = useState<boolean>(false);
  
  if (!params) {
    return <div>Loading...</div>;
  }
  
  const briefId = params.id;

  // States for the submission flow
  const [showSubmissionFlow, setShowSubmissionFlow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCard, setSelectedCard] = useState<'' | 'sell' | 'rent' | 'jv'>('');
  const [images, setImages] = useState<(File | string | null)[]>(Array(4).fill(null));
  const [imageCardCount, setImageCardCount] = useState(4);
  const [showSummary, setShowSummary] = useState(false);
  const [showFinalSubmit, setShowFinalSubmit] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [isLegalOwner, setIsLegalOwner] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areInputsDisabled, setAreInputsDisabled] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // State and LGA handling
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);
  const [formatedPrice, setFormatedPrice] = useState<string>('');
  const [formatedHold, setFormatedHold] = useState<string>('');
  const [formattedLandSizeNumber, setFormatedLandNumber] = useState<string>('');

  // Fetch specific buyer preference
  useEffect(() => {
    const fetchBuyerPreference = async () => {
      if (!briefId) return;
      
      setLoadingBrief(true);
      try {
        // Fix: Use the correct endpoint with pagination parameters and find specific ID
        const url = `https://khabiteq-realty.onrender.com/api/agent/all-preferences?page=1&limit=100`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Fix: Use the correct response structure that matches your API
        if (data && data.success && data.data && Array.isArray(data.data)) {
          const preferences = data.data;
          
          // Find the specific preference by ID
          const specificPreference = preferences.find((pref: any) => 
            (pref._id === briefId || pref.id === briefId)
          );
          
          if (specificPreference) {
            // Transform the data to match your brief structure
            const transformedBrief = {
              id: specificPreference._id || specificPreference.id,
              propertyType: specificPreference.propertyType || 'Residential',
              propertyPrice: specificPreference.budgetMin && specificPreference.budgetMax ? 
                `₦${specificPreference.budgetMin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ₦${specificPreference.budgetMax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : 
                specificPreference.budgetMin ? `₦${specificPreference.budgetMin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : 'N/A',
              propertyFeatures: specificPreference.features || [],
              dateCreated: specificPreference.createdAt ? specificPreference.createdAt.split('T')[0] : 'N/A',
              location: specificPreference.location ? 
                `${specificPreference.location.state || ''}, ${specificPreference.location.localGovernment || ''}, ${specificPreference.location.area || ''}`.replace(/^,+|,+$/g, '').replace(/,\s*,/g, ',').trim() 
                : 'N/A',
              document: specificPreference.documents?.join(', ') || 'N/A',
              matchingMessage: "If you've found a matching brief for this preference, please submit it now",
              
              // Additional details for the modal
              referenceId: specificPreference._id?.slice(-7) || Math.floor(Math.random() * 9999999),
              briefType: specificPreference.preferenceType === 'buy' ? 'Outright sales' : 
                        specificPreference.preferenceType === 'rent' ? 'Rent' : 'Joint Venture(JV)',
              bedroom: specificPreference.noOfBedrooms?.toString() || 'N/A',
              bathroom: specificPreference.noOfBathrooms?.toString() || 'N/A',
              landSize: specificPreference.landSize ? `${specificPreference.landSize} ${specificPreference.measurementType || ''}` : 'N/A',
              budgetRange: specificPreference.budgetMin && specificPreference.budgetMax ? 
                `₦${specificPreference.budgetMin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ₦${specificPreference.budgetMax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : 
                specificPreference.budgetMin ? `₦${specificPreference.budgetMin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : 'N/A',
              preferredArea: specificPreference.location?.area || 'N/A',
              propertyCondition: specificPreference.propertyCondition || 'N/A',
              timeline: specificPreference.timeline || 'Within 3 months',
              buyerType: 'Individual Investor',
              verificationStatus: specificPreference.status === 'approved' ? 'Verified' : 'Pending',
              previousTransactions: 0,
              preferredContact: 'Phone, Email',
              additionalInfo: specificPreference.additionalInfo || 'N/A',
              
              // Buyer information
              buyerName: specificPreference.buyer?.fullName || 'N/A',
              buyerEmail: specificPreference.buyer?.email || 'N/A',
              buyerPhone: specificPreference.buyer?.phoneNumber || 'N/A',
            };
            
            setBriefData(transformedBrief);
          } else {
            console.error('Buyer preference not found for ID:', briefId);
            toast.error('Buyer preference not found');
            router.push('/agent_marketplace');
          }
        } else {
          console.error('Invalid API response structure:', data);
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Error fetching buyer preference:', error);
        toast.error('Failed to load buyer preference details');
        
        // Set fallback data for testing - you can remove this in production
        setBriefData({
          id: briefId,
          propertyType: 'Residential',
          propertyPrice: '₦200,000,000 - ₦250,000,000',
          propertyFeatures: ['4 Bed Room', 'Parking Space', 'Security Features'],
          dateCreated: '2025-06-27',
          location: 'Lagos, Ikeja',
          document: 'C of O Receipt',
          matchingMessage: "If you've found a matching brief for this preference, please submit it now",
          referenceId: '3485756',
          briefType: 'Outright sales',
          bedroom: '4',
          bathroom: '3',
          landSize: '500sqm',
          budgetRange: '₦200,000,000 - ₦250,000,000',
          preferredArea: 'Ikeja, Victoria Island, Lekki',
          propertyCondition: 'New or Renovated',
          timeline: 'Within 3 months',
          buyerType: 'Individual Investor',
          verificationStatus: 'Verified',
          previousTransactions: 3,
          preferredContact: 'Phone, Email',
          additionalInfo: 'N/A',
          buyerName: 'N/A',
          buyerEmail: 'N/A',
          buyerPhone: 'N/A',
        });
      } finally {
        setLoadingBrief(false);
      }
    };

    fetchBuyerPreference();
  }, [briefId, router]);

  // Initialize states and commission on mount
  useEffect(() => {
    const sample = Object.keys(data);
    setStateOptions(
      Object.keys(data).map((state: string) => ({
        value: state,
        label: state,
      }))
    );

    if (user) {
      formik.setFieldValue(
        'ownerFullName',
        `${user.firstName || ''} ${user.lastName || ''}`
      );
      formik.setFieldValue('ownerEmail', user.email || '');
    }

    if (user?.agentData) {
      setCommission({
        userType: 'agent',
        commission: '50%',
        payload: {},
      });
    } else {
      setCommission({
        userType: 'land_owners',
        commission: '50%',
        payload: {},
      });
    }
  }, [user]);

  const formatNumber = (val: string) => {
    const containsLetters = /[A-Za-z]/.test(val);
    if (containsLetters) {
      return;
    }
    const numericValue = val.replace(/,/g, '');
    return numericValue ? Number(numericValue).toLocaleString() : '';
  };

  const handleLGAChange = (selected: Option | null) => {
    formik.setFieldValue('selectedLGA', selected?.value);
    setSelectedLGA(selected);
  };

  const handleStateChange = (selected: Option | null) => {
    formik.setFieldValue('selectedState', selected?.value);
    setSelectedState(selected);

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
      setSelectedLGA(null);
    } else {
      setLgaOptions([]);
      setSelectedLGA(null);
    }
  };

  const getStepRequiredFields = (step: number) => {
    if (step === 1)
      return ['propertyType', 'price', 'selectedState', 'selectedLGA'];
    if (step === 2) {
      if (selectedCard === 'rent') {
        return [];
      }
      if (selectedCard === 'jv') {
        return ['jvConditions'];
      }
      return ['documents'];
    }
    return [];
  };

  const formik = useFormik({
    initialValues: {
      propertyType: 'Residential',
      propertyCondition: '',
      typeOfBuilding: '',
      price: '',
      leaseHold: '',
      documents: [] as string[],
      jvConditions: [] as string[],
      noOfBedroom: '',
      noOfCarPark: '',
      noOfToilet: '',
      noOfBathroom: '',
      features: [] as string[],
      tenantCriteria: [] as string[],
      selectedState: '',
      selectedCity: '',
      selectedLGA: '',
      ownerFullName: '',
      ownerPhoneNumber: '',
      ownerEmail: '',
      areYouTheOwner: true,
      landSize: '',
      measurementType: '',
      addtionalInfo: '',
      isTenanted: '',
      rentalType: '',
    },
    validationSchema: Yup.object({
      propertyType: Yup.string().required('Property type is required'),
      propertyCondition: Yup.string().when('propertyType', {
        is: (val: string) => val !== 'Land',
        then: () => Yup.string().required('Property condition is required'),
      }),
      rentalType: Yup.string().when('selectedCard', {
        is: 'rent',
        then: () => Yup.string().required('Rental type is required'),
      }),
      price: Yup.string().required('Price is required'),
      landSize: Yup.string(),
      measurementType: Yup.string(),
      ownerPhoneNumber: Yup.string()
        .test('is-valid-phone', 'Invalid phone number', (value) =>
          value ? isValidPhoneNumber(value) : false
        ),
      ownerEmail: Yup.string().email('Invalid email'),
    }),
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  const handleSubmitBrief = () => {
    if (!user) {
      // If not logged in, redirect to login or show a modal
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setShowSubmissionFlow(true);
    setCurrentStep(0);
    setSelectedCard('');
  };

  const handleFinalSubmit = async () => {
    setAreInputsDisabled(true);
    setIsSubmitting(true);
    try {
      const url = URLS.BASE + URLS.listNewProperty;
      const token = Cookies.get('token');

      let briefType = '';
      if (selectedCard === 'sell') briefType = 'Outright Sales';
      else if (selectedCard === 'rent') briefType = 'Rent';
      else if (selectedCard === 'jv') briefType = 'Joint Venture';

      // Upload images
      const uploadedImageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image && typeof image !== 'string') {
          const formData = new FormData();
          formData.append('file', image as File);
          const uploadUrl = URLS.BASE + URLS.uploadImg;
          const response = await POST_REQUEST_FILE_UPLOAD(uploadUrl, formData);
          if (response?.url) {
            uploadedImageUrls.push(response.url);
          }
        } else if (typeof image === 'string' && image.startsWith('http')) {
          uploadedImageUrls.push(image);
        }
      }

      const values = formik.values;
      const payload = {
        propertyType: values.propertyType,
        features: values.features,
        docOnProperty: values.documents.map((doc) => ({
          docName: doc,
          isProvided: true,
        })),
        propertyCondition: values.propertyCondition,
        location: {
          state: values.selectedState,
          localGovernment: values.selectedLGA,
          area: values.selectedCity,
        },
        price: values.price,
        owner: {
          fullName: values.ownerFullName,
          phoneNumber: values.ownerPhoneNumber,
          email: values.ownerEmail,
        },
        areYouTheOwner: values.areYouTheOwner,
        landSize: {
          measurementType: values.measurementType,
          size: values.landSize,
        },
        briefType: briefType,
        additionalFeatures: {
          noOfBedroom: values.noOfBedroom,
          noOfBathroom: values.noOfBathroom,
          noOfToilet: values.noOfToilet,
          noOfCarPark: values.noOfCarPark,
        },
        typeOfBuilding: values.typeOfBuilding,
        tenantCriteria: values.tenantCriteria,
        leaseHold: values.leaseHold,
        addtionalInfo: values.addtionalInfo,
        pictures: uploadedImageUrls,
        isTenanted: values.isTenanted,
        matchedBriefId: briefId, // Link to the original brief
      };

      await toast.promise(
        POST_REQUEST(url, payload, token).then((response) => {
          if ((response as any).owner) {
            toast.success('Property submitted successfully');
            setAreInputsDisabled(false);
            setShowSummary(false);
            setShowFinalSubmit(true);
            return 'Property submitted successfully';
          } else {
            const errorMessage = (response as any).error || 'Submission failed';
            toast.error(errorMessage);
            setAreInputsDisabled(false);
            throw new Error(errorMessage);
          }
        }),
        {
          loading: 'Submitting...',
        }
      );
    } catch (error) {
      console.error(error);
      setAreInputsDisabled(false);
    } finally {
      setAreInputsDisabled(false);
      setIsSubmitting(false);
    }
  };

  const handleSummarySubmit = async () => {
    await formik.setTouched(
      Object.keys(formik.initialValues).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      await formik.submitForm();
      await handleFinalSubmit();
    }
  };

  const handleBackClick = () => {
    router.back();
  };
  const redirectToMarketplace = () => {
    router.push('/agent_marketplace');
  };
  

  const getFormTitle = () => {
    switch (selectedCard) {
      case 'sell':
        return 'Submit your property brief';
      case 'rent':
        return 'Provide your Rental Details';
      case 'jv':
        return 'Submit your property brief';
      default:
        return '';
    }
  };

  if (showSubmissionFlow) {
    return (
      <AgentMarketplaceSteps
        briefId={Array.isArray(params.id) ? params.id[0] : params.id || ''}
        buyerPreference={briefData}
       
        // onClose={() => setShowSubmissionFlow(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with breadcrumb */}
      <div className=" ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <button onClick={handleBackClick} className="hover:text-gray-900">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>
            <Link href="/agent_marketplace" className="hover:text-gray-900">Agent marketplace</Link>
            <span>•</span>
            <span className="text-gray-900">preference</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loadingBrief ? (
          <Loading />
        ) : briefData ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#F7F7F9] px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Requested Brief</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Property Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Property Type</h3>
                  <p className="text-base font-semibold text-gray-900">{briefData.propertyType}</p>
                </div>

                {/* Property Price */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Property Price</h3>
                  <p className="text-base font-semibold text-gray-900">{briefData.propertyPrice}</p>
                </div>

                {/* Property Features */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Property Features</h3>
                  <div className="space-y-1">
                    {briefData?.propertyFeatures?.map((feature: string, index: number) => (
                      <p key={index} className="text-base font-semibold text-gray-900">
                        • {feature}
                      </p>
                    ))}
                    {(!briefData?.propertyFeatures || briefData.propertyFeatures.length === 0) && (
                      <p className="text-base font-semibold text-gray-900">N/A</p>
                    )}
                  </div>
                </div>

                {/* Date Created */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Date Created</h3>
                  <p className="text-base font-semibold text-gray-900">{briefData.dateCreated}</p>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                <p className="text-base font-semibold text-gray-900">{briefData.location}</p>
              </div>

              {/* Document */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Document</h3>
                <p className="text-base font-semibold text-gray-900">{briefData.document}</p>
              </div>

              {/* Submit Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{briefData.matchingMessage}</p>
                </div>
                <button 
                  onClick={handleSubmitBrief}
                  className="bg-[#8DDB90] hover:bg-[#7BC97F] text-white px-8 py-3 text-base font-medium rounded-lg transition-colors"
                >
                  Submit Brief
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BriefDetailPage;
