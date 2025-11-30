/** @format */

"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "@/components/general-components/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Calendar, Clock, Users } from "lucide-react";
import ProcessingRequest from "../loading-component/ProcessingRequest";
import useAmount from "@/hooks/useAmount";

interface ShortletBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  mode: "instant" | "request";
} 

const getNightlyRate = (property: any): number => {
  const sd = property?.shortletDetails;
  const nightlyFromDetails = sd?.pricing?.nightly;
  if (typeof nightlyFromDetails === "number" && nightlyFromDetails > 0) return nightlyFromDetails;

  const dailyLegacy = property?.pricing?.daily;
  if (typeof dailyLegacy === "number" && dailyLegacy > 0) return dailyLegacy;

  const weeklyLegacy = property?.pricing?.weekly;
  if (typeof weeklyLegacy === "number" && weeklyLegacy > 0) return Math.round(weeklyLegacy / 7);

  const monthlyLegacy = property?.pricing?.monthly;
  if (typeof monthlyLegacy === "number" && monthlyLegacy > 0) return Math.round(monthlyLegacy / 30);

  const duration = property?.shortletDuration;
  const price = Number(property?.price || 0);
  if (price > 0 && typeof duration === "string") {
    const divisor = duration === "Daily" ? 1 : duration === "Weekly" ? 7 : duration === "Monthly" ? 30 : 0;
    if (divisor > 0) return Math.round(price / divisor);
  }

  return price;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

// Custom input for DatePicker
const DateTimeInput = React.forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void; placeholder?: string; error?: string; label: string }>(
  ({ value, onClick, placeholder, error, label }, ref) => (
    <div className="w-full">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={`w-full text-left bg-white border ${error ? "border-red-400" : "border-gray-300"} rounded-lg px-3 py-2 flex items-center justify-between hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200`}
      >
        <span className={`flex items-center gap-2 text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>
          <Calendar className="w-4 h-4 text-emerald-600" />
          {value || placeholder}
        </span>
        <Clock className="w-4 h-4 text-gray-400" />
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
DateTimeInput.displayName = "DateTimeInput";

const ShortletBookingModal: React.FC<ShortletBookingModalProps> = ({ isOpen, onClose, property, mode }) => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [successOpen, setSuccessOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  const maxGuests = Number(property?.shortletDetails?.maxGuests ?? property?.maxGuests ?? 10);
  const nightly = useMemo(() => getNightlyRate(property), [property]);
  const shortletDuration = property?.shortletDuration;
  const listedPrice = Number(property?.price || 0);
  const cleaningFee = Number(property?.shortletDetails?.pricing?.cleaningFee ?? property?.pricing?.cleaningFee ?? 0);
  const securityDeposit = Number(property?.shortletDetails?.pricing?.securityDeposit ?? property?.pricing?.securityDeposit ?? 0);
  const durationUnit = shortletDuration === "Daily" ? "day" : shortletDuration === "Weekly" ? "week" : shortletDuration === "Monthly" ? "month" : shortletDuration;
  const weeklyDiscountPercent = Number(property?.shortletDetails?.pricing?.weeklyDiscount ?? property?.pricing?.weeklyDiscount ?? 0);
  const monthlyDiscountPercent = Number(property?.shortletDetails?.pricing?.monthlyDiscount ?? property?.pricing?.monthlyDiscount ?? 0);

  const allowedCheckInStr: string = property?.shortletDetails?.houseRules?.checkIn ?? property?.houseRules?.checkIn ?? "15:00";
  const allowedCheckOutStr: string = property?.shortletDetails?.houseRules?.checkOut ?? property?.houseRules?.checkOut ?? "11:00";
  const parseTime = (t: string) => {
    const [h, m] = (t || "").split(":").map((n) => parseInt(n || "0", 10));
    return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
  };
  const withTime = (d: Date, t: string) => {
    const { h, m } = parseTime(t);
    const nd = new Date(d);
    nd.setHours(h, m, 0, 0);
    return nd;
  };
  const endOfDay = (d: Date) => {
    const nd = new Date(d);
    nd.setHours(23, 59, 59, 999);
    return nd;
  };
  const compareTimeOfDay = (d: Date, t: string) => {
    const { h, m } = parseTime(t);
    const mins = d.getHours() * 60 + d.getMinutes();
    return mins - (h * 60 + m);
  };

  const isSameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const startOfDay = (d: Date) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  // Booked periods from the property to disable on the calendar
  const bookedIntervals = useMemo(() => {
    const arr = Array.isArray(property?.bookedPeriods) ? property.bookedPeriods : [];
    return arr
      .map((p: any) => {
        const s = new Date(p?.checkInDateTime);
        const e = new Date(p?.checkOutDateTime);
        return { start: s, end: e };
      })
      .filter((x: any) => x.start instanceof Date && !isNaN(x.start.getTime()) && x.end instanceof Date && !isNaN(x.end.getTime()) && x.start < x.end);
  }, [property?.bookedPeriods]);

  // Disable full calendar days that fall within booked intervals (checkout day becomes available)
  const disabledDateIntervals = useMemo(() => {
    return bookedIntervals
      .map(({ start, end }: { start: string | Date; end: string | Date }) => {
        const s = new Date(start); s.setHours(0, 0, 0, 0);
        const e = new Date(end);
        const eAdj = new Date(e); eAdj.setDate(eAdj.getDate() - 1); eAdj.setHours(23, 59, 59, 999);
        return { start: s, end: eAdj };
      })
      .filter((r: any) => r.start <= r.end);
  }, [bookedIntervals]);

  const hasOverlapWithBooked = (start?: Date | null, end?: Date | null) => {
    if (!start || !end) return false;
    const s = start;
    const e = end;
    return bookedIntervals.some(({ start: bs, end: be }: { start: Date; end: Date }) => s < be && e > bs);
  };

  // Validation schemas per step
  const step1Schema = Yup.object({
    checkIn: Yup.date()
      .typeError("Select check-in")
      .required("Check-in is required")
      .test("afterAllowedCheckIn", "Check-in time must be on/after allowed check-in time", (value) => {
        if (!value) return false;
        return compareTimeOfDay(value as Date, allowedCheckInStr) >= 0;
      }),

    checkOut: Yup.date()
      .typeError("Select check-out")
      .required("Check-out is required")
      .when('checkIn', {
        is: (checkIn: Date | undefined) => !!checkIn,
        then: (schema: Yup.DateSchema) => schema.min(Yup.ref('checkIn'), "Check-out must be after check-in"),
        otherwise: (schema: Yup.DateSchema) => schema,
      })
      .test("beforeAllowedCheckOut", "Check-out time must be on/before allowed check-out time", function (value) {
        if (!value) return false;
        const { checkIn } = this.parent as any;
        // If check-out is on the same day as check-in, enforce allowed check-out time
        if (checkIn && isSameDay(value as Date, checkIn)) {
          return compareTimeOfDay(value as Date, allowedCheckOutStr) <= 0;
        }
        // For later dates, allow any time (host typically expects check-out by allowed time on departure day but many hosts accept later times)
        return true;
      }),

    guests: Yup.number()
      .min(1, "Min 1 guest")
      .max(maxGuests, `Max ${maxGuests}`)
      .required("Guests is required"),

    note: Yup.string()
      .max(500, "Note too long")
      .optional(),
  });

  const step2Schema = Yup.object({
    fullName: Yup.string().trim().min(2, "Enter full name").required("Full name is required"),
    email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
    phoneNumber: Yup.string().trim().min(7, "Enter a valid phone").required("Phone is required"),
    whatsAppNumber: Yup.string().trim().optional(),
  });

  const formik = useFormik({
    initialValues: {
      checkIn: null as Date | null,
      checkOut: null as Date | null,
      guests: 1,
      note: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      whatsAppNumber: "",
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      // Use the already computed payable from amountInfo
      const totalPayable = payable;

      const apiPayload: any = {
        bookedBy: {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phoneNumber: values.phoneNumber.trim(),
          ...(values.whatsAppNumber.trim() ? { whatsAppNumber: values.whatsAppNumber.trim() } : {}),
        },
        propertyId: property?._id,
        bookingDetails: {
          checkInDateTime: values.checkIn?.toISOString(),
          checkOutDateTime: values.checkOut?.toISOString(),
          guestNumber: values.guests,
          ...(values.note.trim() ? { note: values.note.trim() } : {}),
        },
        paymentDetails: {
          amountToBePaid: totalPayable,
        },
        bookingMode: mode,
      };

      setIsSubmitting(true)

      try {
        const token = Cookies.get("token");
        const url = `${URLS.BASE}/inspections/book-request`;

        const response: any = await toast.promise(
          POST_REQUEST(url, apiPayload, token),
          {
            loading: mode === "instant" ? "Initializing payment..." : "Submitting booking request...",
            success: mode === "instant" ? "Payment initialized" : "Request submitted",
            error: "Failed to submit. Please try again.",
          }
        );

        if (mode === "request") {
          onClose();
          return;
        }

        const authUrl =
          response?.data?.transaction?.authorization_url ||
          response?.data?.transaction?.authorizedUrl ||
          response?.transaction?.authorization_url ||
          response?.transaction?.authorizedUrl ||
          response?.data?.authorization_url ||
          response?.authorization_url ||
          null;

        if (authUrl && typeof authUrl === "string") {
          setIsRedirectingToPayment(true)
          setTimeout(() => {
            window.location.href = authUrl as string;
          }, 2000);
          return;
        }
        onClose();
      } catch {

      }finally{
        setIsSubmitting(false)
      }
    },
  });

  const nights = useMemo(() => {
    const { checkIn, checkOut } = formik.values;
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [formik.values.checkIn, formik.values.checkOut]);

  const amountInfo = useMemo(() =>
    useAmount(
      nightly,
      cleaningFee,
      formik.values.checkIn ? formik.values.checkIn.toISOString() : undefined,
      formik.values.checkOut ? formik.values.checkOut.toISOString() : undefined,
      weeklyDiscountPercent,
      monthlyDiscountPercent,
      securityDeposit
    ),
    [nightly, cleaningFee, formik.values.checkIn, formik.values.checkOut, weeklyDiscountPercent, monthlyDiscountPercent, securityDeposit]
  );

  const total = amountInfo.total;
  const serviceCharge = amountInfo.serviceCharge || 0;
  const payable = amountInfo.payable || total;

  const proceedNext = async () => {
    try {
      await step1Schema.validate(formik.values, { abortEarly: false });
      if (hasOverlapWithBooked(formik.values.checkIn, formik.values.checkOut)) {
        toast.error("Selected dates overlap with unavailable periods. Choose different dates.");
        return;
      }
      setStep(2);
    } catch (err: any) {
      const errors: Record<string, string> = {};
      (err.inner || []).forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
      formik.setErrors(errors);
      toast.error("Fix the highlighted fields");
    }
  };

  const submitFinal = async () => {
    try {
      await step2Schema.validate(formik.values, { abortEarly: false });
      await formik.handleSubmit();
    } catch (err: any) {
      const errors: Record<string, string> = {};
      (err.inner || []).forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
      formik.setErrors(errors);
      toast.error("Fix the highlighted fields");
    }
  };

  const resetForm = () => {
    setStep(1);
    formik.resetForm();
  };

  const footerButtonText = step === 1 ? "Next" : mode === "instant" ? "Proceed to Payment" : "Submit Request";
  const canProceedStep1 = payable > 0 && nights > 0;
  const canSubmitStep2 = (
    typeof formik.values.fullName === "string" && formik.values.fullName.trim().length > 0 &&
    typeof formik.values.email === "string" && formik.values.email.trim().length > 0 &&
    typeof formik.values.phoneNumber === "string" && formik.values.phoneNumber.trim().length > 0
  );
  const isFooterDisabled = step === 1 ? !canProceedStep1 : !canSubmitStep2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden"
          onClick={onClose}
        >
          {/* Success Modal for Request Mode */}
          <AnimatePresence>
            {successOpen && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-emerald-100">
                  <h3 className="text-xl font-semibold text-emerald-700">Booking Request Submitted</h3>
                  <p className="text-sm text-gray-700 mt-2">Your booking request has been submitted successfully. Please await the owner&apos;s response.</p>
                  <p className="text-sm text-gray-600 mt-1">Would you like to book more?</p>
                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => {
                        setSuccessOpen(false);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <Button
                      value="Book More"
                      type="button"
                      onClick={() => {
                        setSuccessOpen(false);
                        resetForm();
                      }}
                      className="px-6 bg-[#0B423D] hover:bg-[#09391C] text-white font-bold rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Redirecting to payment overlay */}
          <AnimatePresence>
            {redirecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-emerald-100 text-center">
                  <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900">Redirecting to payment</h3>
                  <p className="text-sm text-gray-600 mt-1">Please wait while we take you to the secure payment page...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ProcessingRequest
            isVisible={isSubmitting || isRedirectingToPayment}
            title={isRedirectingToPayment ? "Redirecting to Payment" : "Processing Booking"}
            message={isRedirectingToPayment
              ? "Your booking has been confirmed. You will be redirected to the payment page shortly..."
              : "Please wait while we process your booking and generate your payment link..."}
            iconColor="#8DDB90"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{mode === "instant" ? "Instant Booking" : "Request to Book"}</h2>
              <p className="text-sm text-gray-600 mt-1">Follow the steps to complete your {mode === "instant" ? "instant" : "request"} booking</p>
            </div>

            <div className="p-6">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 w-24 rounded-full ${step === s ? "bg-emerald-600" : "bg-gray-200"}`} />
                ))}
              </div>

              {/* Flow instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs leading-relaxed mb-4">
                {mode === "instant" ? (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Select check-in/out dates and times. Add guests and an optional note.</li>
                    <li>Enter your contact information (used for receipt and support).</li>
                    <li>Proceed to secure payment. Once paid, your booking is confirmed instantly.</li>
                    <li>Notifications are sent to you and the host with full booking details.</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Select preferred check-in/out dates and times. Add guests and an optional note.</li>
                    <li>Enter your contact information (used to contact you about approval).</li>
                    <li>Submit your request. The host has a limited time window to accept.</li>
                    <li>If accepted, you&apos;ll be prompted to complete payment to confirm the booking. If declined/expired, you&apos;ll be notified.</li>
                  </ul>
                )}
              </div>

              {step === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    selected={formik.values.checkIn}
                    onChange={(date) => {
                      if (!date) { formik.setFieldValue("checkIn", date); return; }
                      // Clamp check-in to allowed earliest time
                      const clampedIn = compareTimeOfDay(date, allowedCheckInStr) < 0 ? withTime(date, allowedCheckInStr) : date;
                      formik.setFieldValue("checkIn", clampedIn);
                      const co = formik.values.checkOut;
                      if (co && clampedIn && co <= clampedIn) {
                        const next = new Date(clampedIn);
                        next.setDate(next.getDate() + 1);
                        const adjusted = withTime(next, allowedCheckOutStr);
                        formik.setFieldValue("checkOut", adjusted);
                      }
                    }}
                    minDate={new Date()}
                    excludeDateIntervals={disabledDateIntervals}
                    showTimeSelect
                    timeIntervals={30}
                    dateFormat="Pp"
                    minTime={withTime(formik.values.checkIn || new Date(), allowedCheckInStr)}
                    maxTime={endOfDay(formik.values.checkIn || new Date())}
                    customInput={
                      <DateTimeInput
                        label="Check-in (Date & Time)"
                        placeholder="Select check-in date & time"
                        error={formik.errors.checkIn as string}
                      />
                    }
                  />

                  <DatePicker
                    selected={formik.values.checkOut}
                    onChange={(date) => {
                      if (!date) { formik.setFieldValue("checkOut", date); return; }
                      // If check-out is on same day as check-in, clamp to allowed latest time otherwise accept selected time
                      const clampedOut = (formik.values.checkIn && isSameDay(date as Date, formik.values.checkIn))
                        ? (compareTimeOfDay(date as Date, allowedCheckOutStr) > 0 ? withTime(date as Date, allowedCheckOutStr) : date)
                        : date;
                      formik.setFieldValue("checkOut", clampedOut);
                    }}
                    minDate={formik.values.checkIn || new Date()}
                    excludeDateIntervals={disabledDateIntervals}
                    showTimeSelect
                    timeIntervals={30}
                    dateFormat="Pp"
                    // For same-day checkout the minTime should be the check-in time, otherwise start of day
                    minTime={(() => {
                      if (!formik.values.checkIn) return withTime(new Date(), '00:00');
                      if (formik.values.checkOut && isSameDay(formik.values.checkOut, formik.values.checkIn)) {
                        return formik.values.checkIn as Date;
                      }
                      return startOfDay(new Date());
                    })()}
                    // Max time is allowed check-out time on any day
                    maxTime={withTime(new Date(), allowedCheckOutStr)}
                    disabled={!formik.values.checkIn}
                    customInput={
                      <DateTimeInput
                        label="Check-out (Date & Time)"
                        placeholder={formik.values.checkIn ? "Select check-out date & time" : "Pick check-in first"}
                        error={formik.errors.checkOut as string}
                      />
                    }
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Guests</label>
                    <div className={`flex items-center bg-white border ${formik.errors.guests ? "border-red-400" : "border-gray-300"} rounded-lg px-3 py-2 gap-2`}>
                      <Users className="w-4 h-4 text-emerald-600" />
                      <button
                        type="button"
                        aria-label="Decrease guests"
                        onClick={() =>
                          formik.setFieldValue(
                            "guests",
                            Math.max(1, Number(formik.values.guests || 1) - 1)
                          )
                        }
                        disabled={Number(formik.values.guests || 1) <= 1}
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 ${Number(formik.values.guests || 1) <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={formik.values.guests}
                        className="w-full select-none text-sm text-center cursor-default bg-transparent outline-none"
                        aria-label="Guest count"
                      />
                      <button
                        type="button"
                        aria-label="Increase guests"
                        onClick={() =>
                          formik.setFieldValue(
                            "guests",
                            Math.min(maxGuests, Number(formik.values.guests || 1) + 1)
                          )
                        }
                        disabled={Number(formik.values.guests || 1) >= maxGuests}
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 ${Number(formik.values.guests || 1) >= maxGuests ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        +
                      </button>
                    </div>
                    {formik.errors.guests && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.guests as string}</p>
                    )}
                    <p className="text-xs text-gray-500">Max {maxGuests} guest(s)</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
                    <textarea
                      value={formik.values.note}
                      onChange={formik.handleChange}
                      name="note"
                      rows={3}
                      placeholder="Any special requests, arrival time info, or questions for the host"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  {bookedIntervals.length > 0 && (
                    <div className="md:col-span-2 bg-red-50 rounded-lg p-3 border border-red-200 text-red-800">
                      <p className="text-sm font-semibold mb-1">Booked dates</p>
                      <ul className="text-xs list-disc pl-5 space-y-0.5 max-h-24 overflow-auto">
                        {bookedIntervals.slice(0, 5).map((b: { start: string | Date; end: string | Date }, i: any) => (
                          <li key={i}>
                            {new Date(b.start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            {" - "}
                            {new Date(b.end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </li>
                        ))}
                        {bookedIntervals.length > 5 && <li>… and more</li>}
                      </ul>
                    </div>
                  )}

                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-sm font-semibold">{shortletDuration || "-"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Listed Price</p>
                      <p className="text-sm font-semibold">{formatCurrency(listedPrice)}{shortletDuration ? ` / ${durationUnit}` : ""}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Nightly</p>
                      <p className="text-sm font-semibold">{formatCurrency(nightly)}</p>
                    </div>
                    {weeklyDiscountPercent > 0 && nights >= 7 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Weekly Discount</p>
                        <p className="text-sm font-semibold">-{Math.min(100, Math.max(0, weeklyDiscountPercent))}%</p>
                      </div>
                    )}
                    {monthlyDiscountPercent > 0 && nights >= 30 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Monthly Discount</p>
                        <p className="text-sm font-semibold">-{Math.min(100, Math.max(0, monthlyDiscountPercent))}%</p>
                      </div>
                    )}
                    {cleaningFee > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Cleaning Fee</p>
                        <p className="text-sm font-semibold">{formatCurrency(cleaningFee)}</p>
                      </div>
                    )}
                    {securityDeposit > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Security Deposit</p>
                        <p className="text-sm font-semibold">{formatCurrency(securityDeposit)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Nights</p>
                      <p className="text-sm font-semibold">{nights}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Estimated Total</p>
                      <p className="text-base font-bold text-emerald-700">{formatCurrency(total)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">Service Charge (8%)</p>
                      <p className="text-sm font-semibold">{formatCurrency(serviceCharge)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600">Total Payable</p>
                      <p className="text-base font-bold text-emerald-700">{formatCurrency(payable)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      className={`w-full border rounded-lg px-3 py-2 ${formik.errors.fullName ? "border-red-400" : "border-gray-300"}`}
                      placeholder="Enter your full name"
                    />
                    {formik.errors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.fullName as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      className={`w-full border rounded-lg px-3 py-2 ${formik.errors.email ? "border-red-400" : "border-gray-300"}`}
                      placeholder="you@example.com"
                    />
                    {formik.errors.email && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.email as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      className={`w-full border rounded-lg px-3 py-2 ${formik.errors.phoneNumber ? "border-red-400" : "border-gray-300"}`}
                      placeholder="Primary phone number"
                    />
                    {formik.errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500">{formik.errors.phoneNumber as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsAppNumber"
                      value={formik.values.whatsAppNumber}
                      onChange={formik.handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Optional WhatsApp number"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (step === 2) setStep(1); else onClose();
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {step === 2 ? "Back" : "Cancel"}
              </button>
              <Button
                value={footerButtonText}
                type="button"
                isDisabled={isFooterDisabled}
                onClick={step === 1 ? proceedNext : submitFinal}
                className={`px-6 ${mode === "instant" ? "bg-[#0B423D] hover:bg-[#09391C]" : "bg-[#1976D2] hover:bg-[#1565C0]"} text-white font-bold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortletBookingModal;
