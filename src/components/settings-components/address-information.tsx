/** @format */

'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactSelect from 'react-select';
import naijaStates from 'naija-state-local-government';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../general-components/Input';
import axios from 'axios';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import { usePageContext } from '@/context/page-context';
import customStyles from '@/styles/inputStyle';

interface Option {
  value: string;
  label: string;
}
const AddressInformation = () => {
  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Option | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<Option | null>(null);

  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [lgaOptions, setLgaOptions] = useState<Option[]>([]);

  const { userDetails } = usePageContext();

  const validationSchema = Yup.object({
    selectedLGA: Yup.string().required('LGA is required'),
    selectedState: Yup.string().required('State is required'),
    street: Yup.string().required('Street is required'),
    selectedRegion: Yup.string().required('Region of operation is required'),
  });

  const formik = useFormik({
    initialValues: {
      selectedState: '',
      selectedLGA: '',
      street: '',
      selectedRegion: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  useEffect(() => {
    // Load Nigerian states correctly
    setStateOptions(
      naijaStates.states().map((state: string) => ({
        value: state,
        label: state,
      }))
    );
    setRegionOptions(
      naijaStates.states().map((state: string) => ({
        value: state,
        label: state,
      }))
    );
  }, []);

  const handleLGAChange = (selected: Option | null) => {
    formik.setFieldValue('selectedLGA', selected?.value);
    console.log('Selected LGA:', formik.values); // Debugging
    setSelectedLGA?.(selected);
  };

  const handleStateChange = (selected: Option | null) => {
    console.log(formik.values);
    formik.setFieldValue('selectedState', selected?.value);
    setSelectedState?.(selected);

    if (selected) {
      const lgas = naijaStates.lgas(selected.value)?.lgas;
      console.log('Raw LGA Data:', lgas); // Log raw LGA data

      if (Array.isArray(lgas)) {
        setLgaOptions(
          lgas.map((lga: string) => ({
            value: lga,
            label: lga,
          }))
        );
      } else {
        console.error('LGAs not returned as an array:', lgas);
        setLgaOptions([]);
      }
      setSelectedLGA?.(null);
    } else {
      setLgaOptions([]);
      setSelectedLGA?.(null);
    }
  };

  /**Handle Region Change */
  // const handleRegionChange = (selected: Option | null) => {
  //   console.log(formik.values);
  //   formik.setFieldValue('selectedRegion', selected?.value);
  //   setSelectedRegion?.(selected);
  // };

  // useEffect(() => {
  //   const getUserAccount = async () => {
  //     console.log('Processing...');
  //     try {
  //       const response = await axios.get(URLS.BASE + URLS.userAccount, {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get('token')}`,
  //         },
  //       });
  //       console.log(response);
  //       if (response.status === 200) {
  //         const userAccount = response.data;
  //         setUserDetails({
  //           ...userDetails,
  //           address: userAccount.user.address,
  //           regionOfOperation: userDetails.regionOfOperation,
  //         });
  //         console.log(userAccount.user);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getUserAccount();
  // }, []);

  return (
    <motion.form
      onSubmit={formik.handleSubmit}
      initial={{ y: 80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className='lg:w-[662px] bg-[#FFFFFF] border-[#C7CAD0] border-[1px] p-[30px] flex flex-col gap-[40px]'>
      <div className='flex flex-col gap-[20px]'>
        <h2 className='text-[20px] font-semibold leading-[160%] text-[#09391C]'>
          Address Information
        </h2>
        <div className='w-full flex flex-col gap-[20px]'>
          {/**Inputs - Street, state, and Local Govt area */}
          <div className='w-full md:grid md:grid-cols-3 flex flex-col gap-[15px]'>
            {/**Street */}
            <Input
              label='Street'
              name='street'
              value={`${userDetails?.agentData?.address?.homeNo}, ${userDetails?.agentData?.address?.street}`}
              onChange={formik.handleChange}
              type='text'
              isDisabled={true}
            />
            {/**State */}
            <Input
              label='State'
              name='selectedState'
              forState={false}
              forLGA={false}
              value={userDetails?.agentData?.address?.state}
              type='text'
              placeholder='Select State'
              formik={formik}
              selectedState={selectedState}
              stateOptions={stateOptions}
              setSelectedState={handleStateChange}
              isDisabled={true}
              // isDisabled={areInputsDisabled}
            />
            {/**Local Government Area */}
            <Input
              label='Local Government Area'
              name='selectedLGA'
              type='text'
              formik={formik}
              forLGA={false}
              value={userDetails?.agentData?.address?.localGovtArea}
              forState={false}
              selectedLGA={selectedLGA}
              lgasOptions={lgaOptions}
              setSelectedLGA={handleLGAChange}
              isDisabled={true}
              // isDisabled={areInputsDisabled}
            />
          </div>
          {/**Region of Operation */}
          {/* <Input
            label='Region of Operation'
            name='regionOfOperation'
            forState={false}
            forLGA={false}
            forRegion={true}
            type='text'
            placeholder='Select Region of Operation'
            formik={formik}
            selectedRegion={selectedRegion}
            stateOptions={regionOptions}
            setSelectedRegion={handleRegionChange}
            // isDisabled={areInputsDisabled}
          /> */}
          <ReactSelect
            value={userDetails?.agentData?.regionOfOperation?.map((region: any) => ({
              label: region,
              value: region,
            }))}
            isDisabled
            isMulti
            styles={customStyles}
          />
        </div>
      </div>
      {/**Button to Save */}
      <button
        type='submit'
        className={`bg-[#8DDB90] gap-[10px] h-[50px] w-full text-base font-bold text-[#FAFAFA]`}>
        Save
      </button>
    </motion.form>
  );
};

export default AddressInformation;
