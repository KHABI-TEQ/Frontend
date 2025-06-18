/**
 * eslint-disable react-hooks/exhaustive-deps
 *
 * @format
 */

"use client";
import Button from "@/components/general-components/button";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import Loading from "@/components/loading-component/loading";

interface Slot {
	_id: string;
	slotDay: string;
	slotDate: string;
	slotStartTime: string;
	slotEndTime: string;
	slotStatus: string;
}

const SlotsPage = () => {
	const [slots, setSlots] = useState<Slot[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

	const params = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const token = params?.get("token") ?? "";

		if (!token || token.length < 100) {
			router.push("/");
			return;
		}
		// Fetch slots from API
		const fetchSlots = async () => {
			const url = URLS.BASE + URLS.allAvailableSLots;
			const data = await GET_REQUEST(url);
			setSlots(data.slots);
		};
		fetchSlots();
	}, []);

	const handleSelectSlot = (slot: Slot) => {
		setSelectedSlot(slot);
	};

	const [booking, setBooking] = useState(false);

	const handleBookSlot = async () => {
		console.log("Slot Booked!", selectedSlot);
		if (!selectedSlot) return;
		setBooking(true);

		const url = URLS.BASE + URLS.scheduleInspection;
		const payload = {
			token: params?.get("token"),
			inspectionDate: selectedSlot?.slotDate,
			slotId: selectedSlot?._id,
			inspectionTime: `${selectedSlot?.slotStartTime} - ${selectedSlot?.slotEndTime}`,
		};
		await POST_REQUEST(url, payload)
			.then((result) => {
				if (result.success) {
					toast.success(result.message || "Inspection successfully booked!");
				} else {
					toast.error(result.message || "Failed to book inspection");
				}
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setBooking(false);
			});
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
			<h2 className="text-2xl font-bold text-center mb-4">
				Select an Inspection Slot
			</h2>

			{slots.length === 0 ? (
				<p className="text-gray-500 text-center">No slots available.</p>
			) : (
				<div className="flex gap-6">
					{/* Slots List */}
					<div className="w-2/3 space-y-4">
						{Object.entries(
							slots.reduce((acc, slot) => {
								const date = new Date(slot.slotDate).toDateString();
								acc[date] = acc[date] || [];
								acc[date].push(slot);
								return acc;
							}, {} as Record<string, Slot[]>)
						).map(([date, slots]) => (
							<div
								key={date}
								className="border p-4 rounded-lg">
								<h3 className="text-lg font-semibold text-gray-700">{date}</h3>
								<div className="grid grid-cols-2 gap-3 mt-2">
									{slots.map((slot) => (
										<button
											key={slot._id}
											className={`p-3 border rounded-lg text-sm ${
												selectedSlot?._id === slot._id
													? "bg-foreground text-white"
													: "bg-gray-100 hover:bg-gray-200"
											}`}
											onClick={() => handleSelectSlot(slot)}>
											{slot.slotStartTime} - {slot.slotEndTime}
										</button>
									))}
								</div>
							</div>
						))}
					</div>

					{/* Selected Slot Details */}
					{
						<div className="w-1/3 p-4 border rounded-lg bg-gray-100 shadow-md">
							<h3 className="text-lg font-semibold text-center mb-2">Selected Slot</h3>

							{selectedSlot ? (
								<>
									<p>
										<strong>Date:</strong>{" "}
										{new Date(selectedSlot.slotDate).toDateString()}
									</p>
									<p>
										<strong>Day:</strong> {selectedSlot.slotDay}
									</p>
									<p>
										<strong>Time:</strong> {selectedSlot.slotStartTime} -{" "}
										{selectedSlot.slotEndTime}
									</p>
									<p>
										<strong>Status:</strong> {selectedSlot.slotStatus}
									</p>
									<Button
										className="min-h-[50px] mt-4 w-full py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold"
										title={booking ? "Booking..." : "Book Slot"}
										value={booking ? "Booking..." : "Book Slot"}
										onClick={() => handleBookSlot()}
										// disabled={selectedSlot.slotStatus !== 'available'}
									/>
								</>
							) : (
								<p>No Slot Selected</p>
							)}
						</div>
					}
				</div>
			)}
		</div>
	);
};

export default function Page() {
	return (
		<Suspense fallback={<Loading />}>
			<SlotsPage />
		</Suspense>
	);
}
