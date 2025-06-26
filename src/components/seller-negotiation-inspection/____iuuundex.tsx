/** @format */
'use client';
import { URLS } from '@/utils/URLS';
import React, { FC, useEffect, useState, Fragment } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from '../loading-component/loading';
import Input from '../general-components/Input';
import SubmitOffer from './submit-offer';
import SelectPreferableInspectionDate from './select-date-time';
import AcceptRejectOfferModal from './accept-reject-offer-modal';
import { archivo } from '@/styles/font';
import SubmitPopUp from '../submit'
import Cookies from 'js-cookie';;
import Image from 'next/image';
import sampleImg from '@/assets/Agentpic.png';
import { GET_REQUEST, POST_REQUEST } from '@/utils/requests';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';

type MainEntryprops = {
  potentialClientID: string;
};

type RenderModalProps = {
  props?: Record<string, any>;
};

type NegotiationType = 'NORMAL' | 'LOI' | null;

const Index: FC<MainEntryprops> = ({ potentialClientID }) => {
  const { user } = useUserContext();
  const [formStatus, setFormStatus] = useState<
    'idle' | 'success' | 'failed' | 'pending'
  >('pending');
  const [details, setDetails] = useState<NegotiationProps | null>(null);
  const [contentTracker, setContentTracker] = useState<
    'Negotiation' | 'Confirm Inspection Date'
  >('Negotiation');
  const [isNegotiated, setIsNegotiated] = useState<boolean>(true);
  const [negotiationType, setNegotiationType] = useState<NegotiationType >('NORMAL');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [dateTimeObj, setDateTimeObj] = useState<{
      selectedDate: string;
      selectedTime: string;
    }>({
      selectedDate: '',
      selectedTime: '',
    });
  

  useEffect(() => {
    const fetchPotentialClientDetails = async (): Promise<void> => {
      setFormStatus('pending');
      try {
        const response = await GET_REQUEST(
        `${URLS.BASE + URLS.getOneNewInspection}/${potentialClientID}`,
        Cookies.get('token')
      );
        // console.log("response", response);
      if (response.success === true) {
        setFormStatus('success');
        const property = response.data.propertyId || {};

        // Check for letterOfIntention
        if (response.data.letterOfIntention && response.data.letterOfIntention !== "") {
          setNegotiationType('LOI');
        } else {
          const briefType = property.briefType;
          setNegotiationType(
            briefType === 'Outright Sales' || briefType === 'Rent' ? 'NORMAL' : 'LOI'
          );
        }

        setCreatedAt(response.data.createdAt || null);

        setDateTimeObj({
          selectedDate: response.data.inspectionDate
            ? new Date(response.data.inspectionDate).toLocaleDateString()
            : 'N/A',
          selectedTime: response.data.inspectionTime || 'N/A',
        });
        // Set contentTracker to 'Confirm Inspection Date' if negotiationPrice is 0
        if (response.data.letterOfIntention && response.data.letterOfIntention !== "") {
          setNegotiationType('LOI');
          setContentTracker('Negotiation');
        } else {
          const briefType = property.briefType;
          setNegotiationType(
            briefType === 'Outright Sales' || briefType === 'Rent' ? 'NORMAL' : 'LOI'
          );
          if (response.data.negotiationPrice === 0) {
            setContentTracker('Confirm Inspection Date');
          } else {
            setContentTracker('Negotiation');
          }
        }

        const ownerData = response.data.owner;

        setDetails({
          firstName: ownerData?.firstName || '',
          lastName: ownerData?.lastName || '',
          currentAmount: property.price || 0,
          buyOffer: response.data.negotiationPrice || 0,
          renderDynamicContent: () => renderContentDynamically(),
          setContentTracker: setContentTracker,
          letterOfIntention: response.data.letterOfIntention || '', 
        });
      }

      } catch (error) {
        setFormStatus('failed');
        console.log(error); 
      }
    };
    if (potentialClientID) fetchPotentialClientDetails();
  }, [potentialClientID]);

  // Unified renderModal
  const renderModal = ({ props }: RenderModalProps): React.ReactNode => {
    if (formStatus === 'pending') return <Loading />;
    if (formStatus === 'failed')
      return (
        <div className='w-full flex items-center justify-center h-[400px]'>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            exit={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}>
            Failed to Load...
          </motion.p>
        </div>
      );
    // Render based on negotiationType
    if (negotiationType === 'LOI') {
      return (
        <LolNegotiation
          {...(props as NegotiationProps)}
          setContentTracker={setContentTracker}
          setIsNegotiated={setIsNegotiated}
          createdAt={createdAt}
        />
      );
    }
    // Default to normal negotiation
    return (
      <Negotiation
        {...(props as NegotiationProps)}
        setContentTracker={setContentTracker}
        createdAt={createdAt}
      />
    );
  };

  // Unified dynamic content
  const renderContentDynamically = (): { content: any; header: string } => {
    switch (contentTracker) {
      case 'Negotiation':
        if (negotiationType === 'LOI') {
          return {
            content: (
              <LolNegotiationPage
                setIsNegotiated={setIsNegotiated}
                setContentTracker={setContentTracker}
                letterOfIntention={details?.letterOfIntention}
              />
            ),
            header: contentTracker,
          };
        }
        return {
          content: <NegotiationPage setContentTracker={setContentTracker} />,
          header: contentTracker,
        };
        case 'Confirm Inspection Date':
          return {
            content: (
              <ConfirmInspectionDate
                isNegotiated={isNegotiated}
                dateTimeObj={dateTimeObj}
                setDateTimeObj={setDateTimeObj}
                potentialClientID={potentialClientID}
              />
            ),
            header: contentTracker,
          };
      default:
        return { content: <></>, header: contentTracker };
    }
  };

  return (
    <Fragment>
      <aside className='w-full flex justify-center items-center'>
        <div className='container flex items-center justify-center'>
          <AnimatePresence>
            {formStatus &&
              renderModal({
                props: {
                  ...details,
                  contentTracker: contentTracker,
                  setContentTracker: setContentTracker,
                  renderDynamicContent: () => renderContentDynamically(),
                  setIsNegotiated: setIsNegotiated,
                },
              })}
          </AnimatePresence>
        </div>
      </aside>
    </Fragment>
  );
};


type NegotiationProps = {
  firstName: string;
  lastName: string;
  currentAmount: number;
  buyOffer: number;
  contentTracker?: 'Negotiation' | 'Confirm Inspection Date';
  setContentTracker?: (type: 'Negotiation' | 'Confirm Inspection Date') => void;
  renderDynamicContent: () => { content: any; header: string };
  createdAt?: string | null;
  letterOfIntention?: string; // Added for LOI negotiation
};

const Negotiation = (props: NegotiationProps): React.ReactNode => {
  const { firstName, lastName } = props;
  const { createdAt } = props;

const getInitialTimeLeft = () => {
  if (!createdAt) return 48 * 60 * 60;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diff = 48 * 60 * 60 * 1000 - (now - created); 
  return Math.max(Math.floor(diff / 1000), 0); // seconds left, never negative
};

const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft());

useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);
  return () => clearInterval(interval);
}, []);

const formatTime = (secs: number) => {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  return `${hours.toString().padStart(2, '0')} : ${minutes
    .toString()
    .padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
};

useEffect(() => {
  setTimeLeft(getInitialTimeLeft());
  // eslint-disable-next-line
}, [createdAt]);

  useEffect(() => console.log(props.contentTracker), [props.contentTracker]);

  return (
    <motion.div className='w-full flex items-center justify-center flex-col gap-[20px] md:gap-[40px] md:py-[50px] px-[20px] pb-[20px]'>
      <div className='flex gap-[20px] md:gap-[40px] justify-center items-center flex-col'>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className='font-display text-4xl text-center font-semibold text-[#09391C]'>
          {props.contentTracker && props.renderDynamicContent().header}
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className='flex flex-col gap-[1px] items-center justify-center'>
          <p className='text-center text-base md:text-lg text-black'>
            Hi, {firstName} {lastName},
          </p>
          <p className='text-center text-base md:text-lg text-black'>
            A potential client has submitted an offer and is waiting for your
            response
          </p>
          <p className='text-center text-base md:text-lg text-black'>
            Please reply within{' '}
            <span className='text-base md:text-lg text-[#FF3D00]'>
              48 hours
            </span>{' '}
            — the countdown starts now.
          </p>
        </motion.div>
      </div>
      <AnimatePresence>
        {props.contentTracker && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            exit={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className='lg:w-[933px] w-full flex flex-col gap-[30px] bg-[#FFFFFF] py-[30px] md:py-[50px] md:px-[50px] px-[30px] border-[1px] border-[#C7CAD0]'>
            <time
              dateTime=''
              className='font-semibold text-black font-display text-2xl text-center'>
              {formatTime(timeLeft)}
            </time>
            {props.contentTracker && props?.renderDynamicContent()?.content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

type PriceProps = {
  amount: number;
  heading: string;
  subHeading: string;
  viewPropertyDetails: boolean;
  setContentTracker?: (type: 'Negotiation' | 'Confirm Inspection Date') => void;
  isViewed?: boolean;
  setIsViewed?: (type: boolean) => void;
};

const Price = ({
  viewPropertyDetails,
  amount,
  heading,
  subHeading,
  isViewed,
  setIsViewed,
}: PriceProps): React.ReactNode => {
  useEffect(() => console.log(isViewed), [isViewed]);
  return (
    <Fragment>
      <div className='w-full flex flex-col gap-[15px]'>
        <div className='flex md:flex-row flex-col md:items-center justify-between'>
          <h2 className='text-[#1E1E1E] font-medium text-xl'>{heading}</h2>
          {viewPropertyDetails ? (
            <span
              className='text-base cursor-pointer text-[#1976D2] underline'
              onClick={() => setIsViewed?.(true)}>
              view property details
            </span>
          ) : null}
        </div>
        <Input
          label={subHeading}
          name='current_amount'
          type='text'
          value={Number(amount).toLocaleString()}
          isDisabled
        />
      </div>
    </Fragment>
  );
};

const NegotiationPage = ({
  setContentTracker,
}: {
  setContentTracker?: (type: 'Negotiation' | 'Confirm Inspection Date') => void;
}) => {
  const [isViewed, setIsViewed] = useState<boolean>(false);
  const [contentToPass, setContentToPass] = useState<{
    heading: string;
    passContent: string;
    handleSubmitFunction: () => void;
  } | null>(null);
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);

  const AcceptOffer = () => {};
  const RejectOffer = () => {};

  const handleButtonClick = (type: 'Accept offer' | 'Reject offer') => {
    setIsButtonClicked(true);
    switch (type) {
      case 'Accept offer':
        return setContentToPass({
          heading: type,
          passContent: `Lorem ipsum dolor sit amet consectetur. Sed gravida nec molestie sociis vel amet. Metus penatibus facilisis eu eget.`,
          handleSubmitFunction: AcceptOffer,
        });
      case 'Reject offer':
        return setContentToPass({
          heading: type,
          passContent: `Lorem ipsum dolor sit amet consectetur. Sed gravida nec molestie sociis vel amet. Metus penatibus facilisis eu eget.`,
          handleSubmitFunction: RejectOffer,
        });
      default:
        return null;
    }
  };
  return (
    <Fragment>
      <div className='w-full flex flex-col gap-[35px]'>
        <div className='w-full flex flex-col'>
          <p className='text-base font-semibold text-black'>
            {' '}
            Note: The buyer has made a deposit to initiate this negotiation.
          </p>
          <p className='text-base font-semibold text-black'>
            {' '}
            Please respond to the proposed price—whether you{' '}
            <span className='text-[#34A853] text-base font-semibold'>
              accept
            </span>{' '}
            ,{' '}
            <span className='text-[#FF2539] text-base font-semibold'>
              reject
            </span>{' '}
            , or make a{' '}
            <span className='text-[#4285F4] text-base font-semibold'>
              counter-offer
            </span>
            .{' '}
          </p>
          <p className='text-base font-semibold text-black'>
            Your timely response is appreciated
          </p>
        </div>
        {/**prices */}
        <div className='w-full flex flex-col justify-between gap-[25px] border-t-[1px] pt-[30px] border-[#8D9096]/[50%]'>
          {[
            {
              heading: 'Current property Price',
              subHeading: 'Current amount',
              viewPropertyDetails: true,
              amount: 350000000,
            },
            {
              heading: 'Buyer negotiation price',
              subHeading: 'Buyer Offer',
              viewPropertyDetails: false,
              amount: 300000000,
            },
          ].map((item: PriceProps, idx: number) => (
            <Price
              isViewed={isViewed}
              setIsViewed={setIsViewed}
              setContentTracker={setContentTracker}
              key={idx}
              {...item}
            />
          ))}
        </div>
        {/**buttons */}
        <div className='w-full flex flex-wrap justify-between gap-[15px] md:gap-[35px]'>
          <button
            type='button'
            onClick={() => {
              handleButtonClick('Accept offer');
            }}
            className='bg-[#8DDB90] hover:bg-[#38723a] transition-all duration-200 w-[221px] h-[50px] text-base text-[#FAFAFA] font-bold'>
            Accept offer
          </button>
          <button
            type='button'
            onClick={() => {
              handleButtonClick('Reject offer');
            }}
            className='bg-[#FF3D00] hover:bg-[#993719] transition-all duration-200 w-[221px] h-[50px] text-base text-[#FAFAFA] font-bold'>
            Reject offer
          </button>
          <button
            type='button'
            onClick={() => setIsViewed(true)}
            className='bg-[#1976D2] hover:bg-[#114d89] transition-all duration-200 w-[221px] h-[50px] text-base text-[#FAFAFA] font-bold'>
            Negotiation
          </button>
        </div>
      </div>
      <AnimatePresence>
        {' '}
        {isViewed && (
          <SubmitOffer nextPage={setContentTracker} closeModal={setIsViewed} />
        )}
        {isButtonClicked && (
          <AcceptRejectOfferModal
            closeModal={setIsButtonClicked}
            {...contentToPass}
          />
        )}
      </AnimatePresence>
    </Fragment>
  );
};


// --- Normal Negotiation and ConfirmInspectionDate remain unchanged ---

// ...existing Negotiation, NegotiationPage, ConfirmInspectionDate, Price, ShowDateTimeSelected...

// --- LOL Negotiation Components (from seller-lol) ---

const LolNegotiation = (props: any): React.ReactNode => {
  const { firstName, lastName } = props;

  const { createdAt } = props;

const getInitialTimeLeft = () => {
  if (!createdAt) return 48 * 60 * 60;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diff = 48 * 60 * 60 * 1000 - (now - created); 
  return Math.max(Math.floor(diff / 1000), 0); // seconds left, never negative
};

const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft());

useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);
  return () => clearInterval(interval);
}, []);

const formatTime = (secs: number) => {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  return `${hours.toString().padStart(2, '0')} : ${minutes
    .toString()
    .padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
};

useEffect(() => {
  setTimeLeft(getInitialTimeLeft());
  // eslint-disable-next-line
}, [createdAt]);

  useEffect(() => console.log(props.contentTracker), [props.contentTracker]);


  return (
    <motion.div className='w-full flex items-center justify-center flex-col gap-[20px] md:gap-[40px] md:py-[50px] px-[20px] pb-[20px]'>
      <div className='flex gap-[20px] md:gap-[40px] justify-center items-center flex-col'>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className='font-display text-3xl md:text-4xl text-center font-semibold text-[#09391C]'>
          {props.contentTracker && props.renderDynamicContent().header}
        </motion.h2>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className='flex flex-col gap-[1px] items-center justify-center'>
          <p className='text-center text-base md:text-lg text-black'>
            Hi, {firstName} {lastName},
          </p>
          <p className='text-center text-base md:text-lg text-black'>
            A potential client has submitted an offer and is waiting for your
            response
          </p>
          <p className='text-center text-base md:text-lg text-black'>
            Please reply within{' '}
            <span className='text-base md:text-lg text-[#FF3D00]'>
              48 hours
            </span>{' '}
            — the countdown starts now.
          </p>
        </motion.div>
      </div>
      <AnimatePresence>
        {props.contentTracker && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            exit={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className='lg:w-[933px] w-full flex flex-col gap-[30px] bg-[#FFFFFF] py-[30px] md:py-[50px] md:px-[50px] px-[30px] border-[1px] border-[#C7CAD0]'>
            <time
              dateTime=''
              className='font-semibold text-black font-display text-2xl text-center'>
              {formatTime(timeLeft)}
            </time>
            {props.contentTracker && props?.renderDynamicContent()?.content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LolNegotiationPage = ({
  setContentTracker,
  setIsNegotiated,
  letterOfIntention,
}: {
  setContentTracker?: (type: 'Negotiation' | 'Confirm Inspection Date') => void;
  setIsNegotiated?: (type: boolean) => void;
  letterOfIntention?: string; 
}) => {
  const [isViewed, setIsViewed] = useState<boolean>(false);
  const [contentToPass, setContentToPass] = useState<{
    heading: string;
    passContent: string | React.ReactNode;
    handleSubmitFunction: () => void;
  } | null>(null);
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);

  const AcceptOffer = () => setContentTracker?.('Confirm Inspection Date');
  const RejectOffer = () => {
    setIsNegotiated?.(true);
    setContentTracker?.('Confirm Inspection Date');
  };

  const handleButtonClick = (type: 'Accept offer' | 'Reject offer') => {
    setIsButtonClicked(true);
    switch (type) {
      case 'Accept offer':
        return setContentToPass({
          heading: type,
          passContent: (
            <p
              className={`text-lg text-[#515B6F] text-center ${archivo.className}`}>
              <span
                className={`text-lg text-black font-semibold ${archivo.className}`}>
                {' '}
                Have you reviewed the submitted LOI before accepting the offer?
              </span>
              <br />
              Please note that your response will be communicated to the
              developer.
            </p>
          ),
          handleSubmitFunction: AcceptOffer,
        });
      case 'Reject offer':
        return setContentToPass({
          heading: type,
          passContent: (
            <p
              className={`text-lg text-[#515B6F] text-center ${archivo.className}`}>
              <span
                className={`text-lg text-black font-semibold ${archivo.className}`}>
                {' '}
                Have you reviewed the submitted LOI before accepting the offer?
              </span>
              <br />
              Please note that your response will be communicated to the
              developer.
            </p>
          ),
          handleSubmitFunction: RejectOffer,
        });
      default:
        return null;
    }
  };
  return (
    <Fragment>
      <div className='w-full flex flex-col gap-[35px]'>
        <div className='w-full flex flex-col'>
          <p className='text-base font-semibold text-[#1976D2]'>
            {' '}
            Note: The buyer has made a deposit to initiate this negotiation.
          </p>
          <p className='text-base font-semibold text-[#1976D2]'>
            {' '}
            Please respond to the proposed price—whether you{' '}
            <span className='text-[#34A853] text-base font-semibold'>
              accept
            </span>{' '}
            ,{' '}
            <span className='text-[#FF2539] text-base font-semibold'>
              reject
            </span>
            .{' '}
          </p>
          <p className='text-base font-semibold text-[#1976D2]'>
            Your timely response is appreciated
          </p>
        </div>
        {/* LOI Document */}
        <div className='w-full flex flex-col gap-[10px] md:gap-[25px] pt-[10px]'>
          <div className='flex justify-between items-center'>
            <h2 className='text-base md:text-xl text-[#1E1E1E] font-medium'>
              LOI Document
            </h2>
            <span
              className='text-sm md:text-base cursor-pointer text-[#1976D2] underline'
              //onClick={() => setIsViewed(true)}
            >
              view property details
            </span>
          </div>
          <div className='flex md:flex-row flex-col gap-[15px] justify-between items-start'>
            <h3 className='text-sm md:text-base font-semibold text-[#202430]'>
              Developer LOI document: kindly click on the document before you
              <br />
              Accept or reject offer
            </h3>
              <div className='flex flex-col relative w-[80px] h-[57px]'>
                <a
                  href={typeof window !== "undefined" && (window as any)?.__LOI_URL__ ? (window as any).__LOI_URL__ : letterOfIntention}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <Image
                    style={{
                      backgroundBlendMode: 'luminosity',
                      backgroundColor: '',
                    }}
                    src={letterOfIntention || sampleImg}
                    className='w-[80px] h-[57px] object-cover'
                    alt='LOI Document'
                    width={80}
                    height={57}
                  />
                  <p className='absolute left-1 bottom-1 text-[8px] text-slate-700 px-2 py-1 rounded'>
                    View details
                  </p>
                </a>
              </div>
          </div>
        </div>
        {/* buttons */}
        <div className='h-[50px] w-full flex justify-between gap-[35px]'>
          <button
            type='button'
            onClick={() => {
              handleButtonClick('Accept offer');
            }}
            className='bg-[#8DDB90] hover:bg-[#38723a] transition-all duration-200 w-[349px] h-[50px] text-base text-[#FAFAFA] font-bold'>
            Accept offer
          </button>
          <button
            type='button'
            onClick={() => {
              handleButtonClick('Reject offer');
            }}
            className='bg-[#FF3D00] hover:bg-[#993719] transition-all duration-200 w-[349px] h-[50px] text-base text-[#FAFAFA] font-bold'>
            Reject offer
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isViewed && (
          <SubmitOffer nextPage={setContentTracker} closeModal={setIsViewed} />
        )}
        {isButtonClicked && (
          <AcceptRejectOfferModal
            closeModal={setIsButtonClicked}
            {...contentToPass}
          />
        )}
      </AnimatePresence>
    </Fragment>
  );
};

  const ConfirmInspectionDate: React.FC<{
    isNegotiated: boolean;
    dateTimeObj: { selectedDate: string; selectedTime: string };
    setDateTimeObj: React.Dispatch<React.SetStateAction<{ selectedDate: string; selectedTime: string }>>;
    potentialClientID: string; 
  }> = ({ 
      isNegotiated, 
      dateTimeObj, 
      setDateTimeObj,
      potentialClientID
    }) => {

    const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
    const [isProceedClicked, setIsProceedClicked] = useState<boolean>(false);
    const [contentToPass, setContentToPass] = useState<{
      heading: string;
      passContent: string | React.ReactNode;
      handleSubmitFunction: () => void;
      headerTextStyling?: React.CSSProperties;
    } | null>(null);
    const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();

    const handleInspectionUpdate = async (payload: Record<string, any>, successMsg: string, loadingMsg: string) => {
      setIsSubmitting(true);
      try {
        const url = `${URLS.BASE + URLS.updateInspection}/${potentialClientID}`;
        await toast.promise(
          POST_REQUEST(url, payload, Cookies.get('token')).then((response) => {
            if (response.success) {
              toast.success(successMsg);
              router.push('/my_listing');
              return 'Action successful';
            } else {
              throw new Error(response.error || 'Action failed');
            }
          }),
          {
            loading: loadingMsg,
            success: successMsg,
            error: (error: { message: any }) => {
              console.log('error', error);
              return error.message || 'Action failed, please try again!';
            },
          }
        );
        setIsButtonClicked(false);
        setIsModalOpened(false);
      } catch (error) {
        setIsButtonClicked(false);
        setIsModalOpened(false);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleOfferResponse = async (action: 'accept' | 'reject') => {
      setIsSubmitting(true);
      try {
        const url = `${URLS.BASE + URLS.updateInspection}/${potentialClientID}`;
        const payload = {
         status: action === 'accept' ? 'available' : 'unavailable',
        };

        await toast.promise(
          POST_REQUEST(url, payload, Cookies.get('token')).then((response) => {
            if (response.success) {
              toast.success(
                action === 'accept'
                  ? 'Inspection date confirmed successfully!'
                  : 'Inspection date rejected successfully!'
              );
              router.push('/my_listing');
              return 'Action successful';
            } else {
              throw new Error(response.error || 'Action failed');
            }
          }),
          {
            loading: action === 'accept' ? 'Confirming date...' : 'Rejecting date...',
            success: action === 'accept' ? 'Date confirmed!' : 'Date rejected!',
            error: (error: { message: any }) => {
              console.log('error', error);
              return error.message || 'Action failed, please try again!';
            },
          }
        );
        setIsButtonClicked(false);
        } catch (error) {
          setIsButtonClicked(false);
        } finally {
          setIsSubmitting(false);
        }
    };
  
    const handleButtonClick = (
      type: 'Available of Inspection' | 'Unavailable of Inspection'
    ) => {
      setIsButtonClicked(true);
      switch (type) {
        case 'Available of Inspection':
          return setContentToPass({
            heading: type,
            headerTextStyling: { color: '#000000' },
            passContent: (
              <p className={`${archivo.className} text-lg text-[#515B6F]`}>
                Please ensure that this property is always available for
                inspection. If the property is unavailable,{' '}
                <span
                  className={`${archivo.className} text-lg text-black font-semibold`}>
                  your account may be flagged and restricted from using the system
                </span>
              </p>
            ),
            handleSubmitFunction: () =>   
              handleInspectionUpdate(
                  { status: 'available' },
                  'Inspection date confirmed successfully!',
                  'Confirming date...'
                )
          });
        case 'Unavailable of Inspection':
          return setContentToPass({
            heading: type,
            passContent: (
              <p className={`${archivo.className} text-lg text-[#515B6F]`}>
                If the property is unavailable for inspection, it will be disabled
                from the system. You will need to provide evidence to reactivate
                it
              </p>
            ),
            handleSubmitFunction: () => 
                handleInspectionUpdate(
                { status: 'unavailable' },
                'Inspection date rejected successfully!',
                'Rejecting date...'
              )
          });
        default:
          return null;
      }
    };
    return (
      <Fragment>
        <div className='w-full flex flex-col gap-[35px]'>
          <div className='w-full flex flex-col'>
            <p className='text-base font-semibold text-[#0C70D3]'>
              {' '}
              Note: The buyer has made a deposit to initiate this negotiation.
            </p>
            <p className='text-base font-semibold text-[#0C70D3]'>
              {' '}
              Please respond to the proposed price—whether you{' '}
              <span className='text-[#34A853] text-base font-semibold'>
                Available
              </span>{' '}
              ,{' '}
              <span className='text-[#FF2539] text-base font-semibold'>
                Unavailable
              </span>{' '}
              , or{' '}
              <span className='text-[#4285F4] text-base font-semibold'>
                Update inspection
              </span>
              .{' '}
            </p>
            <p className='text-base font-semibold text-[#0C70D3]'>
              Your timely response is appreciated
            </p>
          </div>
          {/**Buyer Inspection Date */}
          <div className='w-full flex flex-col gap-[15px]'>
            <div className='flex md:flex-row flex-col justify-between md:items-end'>
              <h2 className='text-[#1E1E1E] text-xl font-medium'>
                Buyer Inspection Date
              </h2>
              <span
                className='text-base cursor-pointer text-[#1976D2] underline'
                //onClick={() => setIsViewed(true)}
              >
                view property details
              </span>
            </div>
            <div className='w-full flex md:flex-row flex-col gap-[15px]'>
              <ShowDateTimeSelected
                heading='Select Date'
                value={dateTimeObj.selectedDate ?? 'N/A'}
                id='select_date'
                name='select_date'
  
              />
              <ShowDateTimeSelected
                heading='Select Time'
                value={dateTimeObj.selectedTime ?? 'N/A'}
                id='select_time'
                name='select_time'
              />
            </div>
            <div className="w-full mt-6 flex flex-col gap-[10px] md:flex-row md:gap-[35px]">
              {isNegotiated ? (
                <>
                  <button
                    onClick={() => handleButtonClick('Available of Inspection')}
                    className={`md:w-[349px] w-full bg-[#8DDB90] text-white h-[50px] text-lg ${archivo.className} font-bold`}
                    type="button"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleButtonClick('Unavailable of Inspection')}
                    className={`md:w-[349px] w-full bg-[#FF2539] text-white h-[50px] text-lg ${archivo.className} font-bold`}
                    type="button"
                  >
                    Unavailable
                  </button>
                  <button
                    onClick={() => setIsModalOpened(true)}
                    className={`md:w-[349px] w-full bg-[#000000] text-white h-[50px] text-lg ${archivo.className} font-bold`}
                    type="button"
                  >
                    Update Inspection date
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsModalOpened(true)}
                    className={`md:w-[349px] w-full bg-[#000000] text-white h-[50px] text-lg ${archivo.className} font-bold`}
                    type="button"
                  >
                    Update Inspection date
                  </button>
                  <button
                    onClick={() => setIsProceedClicked(true)}
                    className={`md:w-[349px] w-full bg-[#8DDB90] text-white h-[50px] text-lg ${archivo.className} font-bold`}
                    type="button"
                  >
                    Proceed
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isModalOpened && (
            <SelectPreferableInspectionDate
              closeModal={setIsModalOpened}
              details={dateTimeObj}
              setDetails={setDateTimeObj}
              onSubmit={() =>
                handleInspectionUpdate(
                  {
                    inspectionDate: dateTimeObj.selectedDate,
                    inspectionTime: dateTimeObj.selectedTime,
                  },
                  'Inspection date and time updated successfully!',
                  'Updating inspection date...'
                )
              }
              isSubmitting={isSubmitting}
            />
          )}
          {isProceedClicked && <SubmitPopUp />}
          {isButtonClicked && (
            <AcceptRejectOfferModal
              closeModal={setIsButtonClicked}
              {...contentToPass}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>
      </Fragment>
    );
  };

type ShowDateSelectedProps = {
  heading: 'Select Date' | 'Select Time';
  value: string;
  id: string;
  name: string;
  isModalOpened?: boolean;
  setIsModalOpened?: (type: boolean) => void;
};

const ShowDateTimeSelected = ({
  id,
  heading,
  value,
  name,
  setIsModalOpened,
  isModalOpened,
}: ShowDateSelectedProps) => {
  return (
    <Fragment>
      <label htmlFor={id} className='flex flex-col gap-[4px]'>
        <h5 className='text-base font-medium text-[#1E1E1E]'>{heading}</h5>
        <input
          type='text'
          readOnly
          onClick={() => setIsModalOpened?.(!isModalOpened)}
          value={value}
          name={name}
          className='w-[183px] cursor-pointer py-[16px] px-[12px] bg-[#FAFAFA] border-[1px] border-[#D6DDEB] text-base text-[#000000] font-semibold'
        />
      </label>
    </Fragment>
  );
};

export default Index;