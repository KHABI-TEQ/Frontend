"use client";
import { SetStateAction, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function ActivitiesScroll() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedActivity, setSelectedActivity] = useState<{
    id: number;
    name: string;
    description: string;
    date: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activities = [
    {
      id: 1,
      name: "Hope Tope",
      description:
        "James Joseph Bond account has been deactivated because he’s ag gvhb gcgb yvgfc hvgcg hbhvgvhb",
      date: "Thu, Nov 4, 2021 9:56 AM",
    },
    {
      id: 2,
      name: "Bola Akin",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      date: "Fri, Nov 5, 2021 10:30 AM",
    },
    {
      id: 3,
      name: "Samuel Doe",
      description: "User account suspended due to policy violation...",
      date: "Sat, Nov 6, 2021 11:15 AM",
    },
  ];

  const openModal = (activity: SetStateAction<{ id: number; name: string; description: string; date: string; } | null>) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className="relative w-full py-8 px-20  bg-white rounded-lg shadow-md">
      {/* Carousel Wrapper */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="min-w-[350px] h-40 bg-gray-50  rounded-lg p-4 shadow-sm cursor-pointer"
              onClick={() => openModal(activity)}
            >
              <div className="flex justify-between text-[#7C88B1] text-sm">
                <p>Admin Attendant</p>
                <p className="text-[#414357]">Topic</p>
              </div>
              <div className="flex justify-between items-center border-b-2 pb-2">
                <h3 className="font-medium text-[#25324B]">{activity.name}</h3>
                <p className="text-red-500 cursor-pointer">
                  Deactivate Account
                </p>
              </div>
              <p className="text-gray-700 text-sm mt-2">
                {activity.description}
                <span className="text-blue-500 cursor-pointer"> view more</span>
              </p>
              <p className="flex text-xs justify-end text-gray-400 mt-2">
                Date: {activity.date}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2">
        <div
          className="bg-white border rounded-full shadow-md px-5 py-4 cursor-pointer hover:bg-[#8DDB90] text-gray-600 hover:text-white"
          onClick={() => emblaApi && emblaApi.scrollPrev()}
        >
          <FontAwesomeIcon icon={faChevronLeft} size="lg" />
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 ">
        <div
          className="bg-white border rounded-full shadow-md p-3 cursor-pointer px-5 py-4 hover:bg-[#8DDB90] text-gray-600 hover:text-white"
          onClick={() => emblaApi && emblaApi.scrollNext()}
        >
          <FontAwesomeIcon icon={faChevronRight} size="lg" />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        onClick={closeModal}>
          <div className="bg-white  md:w-2/5 py-4 px-6 rounded-lg  shadow-lg relative">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Admins Activities
              </h2>
              <button onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-[#7C88B1]">Admin Attendant</p>
              <p className="text-gray-600">Topic</p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <h3 className="font-medium text-[#25324B] underline">
                {selectedActivity.name}
              </h3>
              <p className="text-red-500 cursor-pointer">
                Deactivate Account
              </p>
            </div>
            <h5 className="text-gray-700 text-sm py-2 border-y">
              {selectedActivity.description}
            </h5>
           
            <button
              className="px-6 py-2 mt-4 w-[95%] bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
