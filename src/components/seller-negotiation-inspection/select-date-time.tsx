/** @format */

'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { archivo } from '@/styles/font';
import { format } from 'date-fns';
import { useNegotiationActions, useNegotiationData } from '@/context/negotiation-context';

const SelectPreferableInspectionDate = ({
  closeModal,
}: {
  closeModal: (type: boolean) => void;
}) => {

  const { submitBasedOnStatus } = useNegotiationActions();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { 
    details, 
    setInspectionDateStatus, 
    inspectionDateStatus, 
    inspectionStatus,
    dateTimeObj,
    counterDateTimeObj,
    setCounterDateTimeObj,
   } = useNegotiationData();

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.match(/^[A-Za-z]{3} \d{1,2}, \d{4}$/)) return dateString;
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return format(date, 'MMM d, yyyy');
    }
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const revertFormattedDate = (formatted: string): string => {
    if (!formatted) return '';
  
    // Try to parse formatted "MMM d, yyyy"
    try {
      const date = new Date(formatted);
      if (isNaN(date.getTime())) return formatted;
  
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
  
      return `${year}-${month}-${day}`;
    } catch {
      return formatted;
    }
  };

  const formattedSelectedDate = formatSelectedDate(counterDateTimeObj.selectedDate || dateTimeObj.selectedDate);
  const selectedTime = counterDateTimeObj.selectedTime || dateTimeObj.selectedTime;

  const getAvailableDates = () => {
    const dates: string[] = [];
    let date = new Date();
    date.setDate(date.getDate() + 1);
    while (dates.length < 14) {
      if (date.getDay() !== 0) {
        dates.push(format(date, 'MMM d, yyyy'));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const getAvailableTimesForDate = (selectedDate: string) => {
    if (!selectedDate) return [];
    const today = new Date();
    const selected = new Date(selectedDate);
    const isToday = selected.toDateString() === today.toDateString();
    const currentHour = today.getHours();
    const allTimes = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
      '4:00 PM', '5:00 PM', '6:00 PM',
    ];
    if (isToday) {
      return allTimes.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        const isPM = time.includes('PM');
        const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
        return hour24 > currentHour + 2;
      });
    }
    return allTimes;
  };

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimesForDate(formattedSelectedDate);

  const handleDateSelect = (date: string) => {
    const isSameDate = date === formatSelectedDate(dateTimeObj.selectedDate);
    const isSameTime = counterDateTimeObj.selectedTime === dateTimeObj.selectedTime;
  
    setCounterDateTimeObj({ ...counterDateTimeObj, selectedDate: revertFormattedDate(date) });
  
    if (isSameDate && isSameTime) {
      setInspectionDateStatus('none');
    } else {
      setInspectionDateStatus('countered');
    }
  };
  
  const handleTimeSelect = (time: string) => {
    const isSameTime = time === dateTimeObj.selectedTime;
    const isSameDate = counterDateTimeObj.selectedDate === dateTimeObj.selectedDate;
  
    setCounterDateTimeObj({ ...counterDateTimeObj, selectedTime: time });
  
    if (isSameDate && isSameTime) {
      setInspectionDateStatus('none');
    } else {
      setInspectionDateStatus('countered');
    }
  };

  const submitAction = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log(inspectionDateStatus, inspectionStatus,  "dddd");
      await submitBasedOnStatus(details.negotiationID);
      closeModal(false);
    } catch (error: unknown) {
      console.error('Error submitting:', error);
      // Optionally handle or display error to user
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 px-[10px]'>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
        viewport={{ once: true }}
        className='lg:w-[658px] w-full flex flex-col gap-[26px] rounded-md overflow-hidden'>
        <div className='flex items-center justify-end'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            type='button'
            className='w-[51px] h-[51px] rounded-full bg-white flex items-center justify-center'>
            <FontAwesomeIcon
              icon={faClose}
              width={24}
              height={24}
              onClick={() => closeModal(false)}
              className='w-[24px] h-[24px]'
              color='#181336'
            />
          </motion.button>
        </div>
        <form
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            closeModal(false);
          }}
          className=' bg-white overflow-y-auto w-full py-[36px] px-[32px] border-[1px] border-[#D9D9D9] flex flex-col gap-[25px] hide-scrollbar'>
          <div className='flex flex-col gap-[5px] md:gap-[18px]'>
            <h2 className={`font-bold text-black ${archivo.className} text-xl`}>
              Select preferable inspection Date
            </h2>
          </div>

          <div className=' overflow-x-auto w-full flex gap-[21px] hide-scrollbar border-b-[1px] border-[#C7CAD0]'>
            {availableDates.map((date: string, idx: number) => (
              <button
                type='button'
                onClick={() => handleDateSelect(date)}
                className={`h-[42px] ${
                  formattedSelectedDate === date && 'bg-[#8DDB90] text-white'
                } min-w-fit px-[10px] ${
                  archivo.className
                } text-sm font-medium text-[#5A5D63]`}
                key={idx}>
                {date}
              </button>
            ))}
          </div>

          <h3 className={`text-xl font-medium ${archivo.className} text-black`}>
            Select preferable inspection time
          </h3>
          <h4 className={`text-lg font-medium ${archivo.className} text-black`}>
            {formattedSelectedDate || 'Please select a date'}
          </h4>

          {formattedSelectedDate && (
            <div className='grid grid-cols-3 gap-[14px]'>
              {availableTimes.length > 0 ? (
                availableTimes.map((time, idx: number) => (
                  <button
                    onClick={() => handleTimeSelect(time)}
                    className={`border-[1px] border-[#A8ADB7] h-[57px] ${
                      selectedTime === time && 'bg-[#8DDB90] text-white'
                    } text-lg font-medium ${archivo.className} text-black`}
                    type='button'
                    key={idx}>
                    {time}
                  </button>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-gray-500">
                  No available times for this date. Please select another date.
                </div>
              )}
            </div>
          )}

          <div className='h-[103px] py-[28px] w-full bg-[#8DDB90]/[20%] flex justify-center flex-col gap-[5px] px-[28px]'>
            <h3 className={`text-lg font-medium ${archivo.className} text-black font-semibold`}>
              Booking details
            </h3>
            <p className={`text-lg font-medium ${archivo.className} text-black`}>
              Date: <time>{formattedSelectedDate || 'Not selected'}</time>{' '}
              Time: <time>{selectedTime || 'Not selected'}</time>
            </p>
          </div>

          <div className='lg:w-[569px] w-full flex gap-[15px] h-[57px]'>
            <button
              onClick={submitAction}
              disabled={inspectionDateStatus !== "countered" || isLoading}
              className={`w-full h-[50px] text-lg font-bold ${
                inspectionDateStatus !== 'countered' || isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#71dc75] text-white'
              }`}
              type="button">
              {isLoading ? 'Submitting....' : 'Submit'}
            </button>
            <button
              onClick={() => closeModal(false)}
              type='button'
              className={`w-[277px] h-[53px] bg-transparent border-[1px] border-[#5A5D63] text-[#414357] font-medium text-lg ${archivo.className}`}>
              Close
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SelectPreferableInspectionDate;
