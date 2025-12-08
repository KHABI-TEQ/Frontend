/** @format */

"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import khabiteqIcon from "@/svgs/khabi-teq.svg";
import Button from "@/components/general-components/button";
import Image from "next/image";
import {
  mainNavigationData,
  type NavigationItem,
} from "@/data/navigation-data";
import Link from "next/link";
import barIcon from "@/svgs/bars.svg";
import { usePageContext } from "@/context/page-context";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "@/context/user-context";
import { useNotifications } from "@/context/notification-context";
import notificationBellIcon from "@/svgs/bell.svg";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load heavy components that are only shown on interaction
const SideBar = dynamic(() => import("../general-components/sideBar"), { ssr: false });
const UserNotifications = dynamic(() => import("./user-notifications"), { ssr: false });
const UserProfile = dynamic(() => import("./my-profile"), { ssr: false });

const Header = ({ isComingSoon }: { isComingSoon?: boolean }) => {
  const {
    isContactUsClicked,
    rentPage,
    isModalOpened,
    setIsModalOpened,
    viewImage,
    isSubmittedSuccessfully,
  } = usePageContext();
  const [navigationState, setNavigationState] = useState(mainNavigationData);
  const pathName = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, logout } = useUserContext();
  const { unreadCount, fetchNotifications } = useNotifications();
  const [isNotificationModalOpened, setIsNotificationModalOpened] =
    useState<boolean>(false);
  const [isUserProfileModalOpened, setIsUserProfileModal] =
    useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    id: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // console.log(isModalOpened);
  }, [isModalOpened]);

  // Fetch notifications when user is available
  useEffect(() => {
    if ((user?._id || user?.id) && !isComingSoon) {
      fetchNotifications();
    }
  }, [user?._id || user?.id, fetchNotifications, isComingSoon]);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    try {
      const parsedUser = user ? JSON.parse(user) : null;
      if (parsedUser && typeof parsedUser === "object") {
        setUserDetails(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      setUserDetails(null);
    }
  }, []);

  useEffect(() => {
    // console.log(user);
  }, [user]);

  // Global click handler to close dropdowns
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't close if clicking on dropdown elements
      const target = e.target as HTMLElement;
      if (
        target.closest(".navigation-dropdown") ||
        target.closest(".notification-dropdown") ||
        target.closest(".profile-dropdown")
      ) {
        return;
      }

      // Close all dropdowns
      setOpenDropdown(null);
      setIsNotificationModalOpened(false);
      setIsUserProfileModal(false);
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  useEffect(() => {
    // console.log(pathName)
  }, [pathName]);

  // Handle backdrop click to close sidebar
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      setIsModalOpened(false);
    }
  };

  return (
    <Fragment>
      <header
        className={`w-full flex justify-center ${
          isComingSoon && "filter blur-sm"
        } items-center py-[20px] pl-[10px] bg-[#EEF1F1] pr-[20px] ${
          (isContactUsClicked ||
            rentPage.isSubmitForInspectionClicked ||
            isModalOpened ||
            viewImage ||
            isSubmittedSuccessfully ||
            rentPage.submitPreference) &&
          "filter brightness-[30%] transition-all duration-500 overflow-hidden"
        }`}
      >
        <nav className={`h-[50px] container flex justify-between items-center`}>
          <Link href="/">
            <Image
              src={khabiteqIcon}
              width={1000}
              height={1000}
              className="md:w-[169px] md:h-[25px] w-[144px] h-[30px]"
              alt=""
            />
          </Link>
          
          <div className="lg:flex gap-[20px] hidden">
            {navigationState.map((item: NavigationItem, idx: number) => {
              if (item.subItems && item.subItems.length > 0) {
                const isOpen = openDropdown === item.name;
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col navigation-dropdown"
                    onMouseEnter={() => {
                      // Close other dropdowns if any
                      setIsNotificationModalOpened(false);
                      setIsUserProfileModal(false);
                      setOpenDropdown(item.name);
                    }}
                    onMouseLeave={(e) => {
                      // Check if mouse is moving to the dropdown or staying within the container
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX;
                      const mouseY = e.clientY;

                      // If mouse is below the container (moving to dropdown), don't close
                      if (
                        mouseY > rect.bottom &&
                        mouseX >= rect.left &&
                        mouseX <= rect.right
                      ) {
                        return;
                      }

                      // Add delay to prevent flickering when moving to dropdown
                      setTimeout(() => {
                        setOpenDropdown(null);
                      }, 300);
                    }}
                  >
                    <button
                      className="flex items-center gap-1 cursor-pointer py-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenDropdown(isOpen ? null : item.name);
                      }}
                    >
                      <span
                        className={`transition-all duration-300 font-medium text-[18px] leading-[21px] hover:text-[#8DDB90] ${
                          pathName?.includes(item.url) || isOpen
                            ? "text-[#8DDB90]"
                            : "text-[#000000]"
                        }`}
                      >
                        {item.name}
                      </span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 w-3 h-3 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <DropdownOptions
                          setModal={(open) =>
                            setOpenDropdown(open ? item.name : null)
                          }
                          items={item.subItems}
                          parentName={item.name}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link
                  key={idx}
                  href={item.url}
                  onClick={() => {
                    // Close any open dropdowns
                    setOpenDropdown(null);
                    const updatedNav = navigationState.map((navItem) =>
                      navItem.name === item.name
                        ? { ...navItem, isClicked: true }
                        : { ...navItem, isClicked: false },
                    );
                    setNavigationState(updatedNav);
                  }}
                  className={`transition-all duration-300 font-medium text-[18px] leading-[21px] hover:text-[#8DDB90] py-2 ${
                    item.url === pathName ? "text-[#8DDB90]" : "text-[#000000]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/**Buttons for desktop screens */}
          <div className="hidden lg:flex items-center gap-6">
            {user?._id || user?.id ? (
              <>
                {/* Notifications */}
                <div className="relative notification-dropdown">
                  <button
                    type="button"
                    title="Notifications"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotificationModalOpened(!isNotificationModalOpened);
                      // Close other dropdowns
                      setOpenDropdown(null);
                      setIsUserProfileModal(false);
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 relative"
                  >
                    <Image
                      src={notificationBellIcon}
                      width={20}
                      height={20}
                      alt="Notifications"
                      className="w-5 h-5"
                    />
                    {/* Notification Badge */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {isNotificationModalOpened && (
                      <UserNotifications
                        closeNotificationModal={setIsNotificationModalOpened}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile */}
                <div className="relative profile-dropdown">
                  <button
                    type="button"
                    title="Profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserProfileModal(!isUserProfileModalOpened);
                      // Close other dropdowns
                      setOpenDropdown(null);
                      setIsNotificationModalOpened(false);
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#8DDB90] to-[#09391C] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {user?.profile_picture ? (
                      <Image
                        src={user?.profile_picture}
                        width={40}
                        height={40}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isUserProfileModalOpened && (
                      <UserProfile
                        userDetails={user}
                        closeUserProfileModal={setIsUserProfileModal}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  value="Login"
                  onClick={() => {
                    router.push("/auth/login");
                  }}
                  className="text-base bg-transparent border border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white transition-all duration-300 leading-[25px] font-medium px-6 h-[44px] rounded-lg"
                />
                <Button
                  value="Sign up"
                  green={true}
                  onClick={() => {
                    window.localStorage.setItem("signupFromHeader", "true");
                    router.push("/auth/register");
                  }}
                  className="text-base text-[#FFFFFF] leading-[25px] font-medium px-6 h-[44px] rounded-lg bg-[#8DDB90] hover:bg-[#7BC87F] transition-all duration-300"
                />
              </div>
            )}
          </div>

          {/**Mobile controls */}
          <div className="flex items-center gap-3 lg:hidden">
            {user?._id || user?.id ? (
              <>
                {/* Mobile Notifications */}
                <div className="notification-dropdown">
                  <button
                    type="button"
                    title="Notifications"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotificationModalOpened(!isNotificationModalOpened);
                      // Close other dropdowns
                      setOpenDropdown(null);
                      setIsUserProfileModal(false);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 relative"
                  >
                    <Image
                      src={notificationBellIcon}
                      width={18}
                      height={18}
                      alt="Notifications"
                      className="w-[18px] h-[18px]"
                    />
                    {/* Mobile Notification Badge */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{unreadCount}</span>
                      </div>)
                    }

                  </button>
                </div>

                {/* Mobile User Profile */}
                <div className="relative profile-dropdown">
                  <button
                    type="button"
                    title="Profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserProfileModal(!isUserProfileModalOpened);
                      // Close other dropdowns
                      setOpenDropdown(null);
                      setIsNotificationModalOpened(false);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#8DDB90] to-[#09391C] shadow-sm"
                  >
                    {user?.profile_picture ? (
                      <Image
                        src={user?.profile_picture}
                        width={32}
                        height={32}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-xs">
                        {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isUserProfileModalOpened && (
                      <UserProfile
                        userDetails={user}
                        closeUserProfileModal={setIsUserProfileModal}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Notifications Modal */}
                <AnimatePresence>
                  {isNotificationModalOpened && (
                    <UserNotifications
                      closeNotificationModal={setIsNotificationModalOpened}
                    />
                  )}
                </AnimatePresence>
              </>
            ) : null}

            <button
              onClick={() => {
                setIsModalOpened(!isModalOpened);
              }}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100"
              aria-label="Menu"
            >
              <Image
                src={barIcon}
                width={20}
                height={14}
                alt="Menu"
                className="w-5 h-[14px]"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Backdrop overlay for sidebar */}
      {isModalOpened && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      <SideBar
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
      />
    </Fragment>
  );
};

const DropdownOptions = ({
  setModal,
  items,
  parentName,
}: {
  setModal: (open: boolean) => void;
  items: NavigationItem[];
  parentName: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { setSelectedType } = usePageContext();

  useClickOutside(ref, () => setModal(false));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      ref={ref}
      className="w-[231px] mt-[15px] p-[19px] flex flex-col gap-[15px] bg-[#FFFFFF] shadow-xl border border-gray-100 rounded-lg absolute left-0 z-[999]"
      onMouseEnter={() => setModal(true)}
      onMouseLeave={(e) => {
        // Check if mouse is moving back to parent container
        const dropdownRect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // If mouse is above the dropdown (moving back to parent), don't close immediately
        if (
          mouseY < dropdownRect.top &&
          mouseX >= dropdownRect.left &&
          mouseX <= dropdownRect.right
        ) {
          return;
        }

        setTimeout(() => {
          setModal(false);
        }, 150);
      }}
      style={{
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {items.map((item: NavigationItem, idx: number) => (
        <Link
          onClick={(e) => {
            e.preventDefault();
            // Handle marketplace specific logic
            if (parentName === "Marketplace") {
              if (item.name === "Buy") {
                setSelectedType("Buy a property");
              } else if (item.name === "Rent") {
                setSelectedType("Rent/Lease a property");
              } else if (item.name === "Shortlet") {
                setSelectedType("Shortlet");
              } else if (item.name === "Joint Venture") {
                setSelectedType("Find property for joint venture");
              }
            }
            setModal(false);
            // Navigate after setting type
            setTimeout(() => {
              window.location.href = item.url;
            }, 100);
          }}
          className="text-base font-medium text-[#000000] hover:text-[#8DDB90] transition-colors py-2 px-1 rounded hover:bg-gray-50"
          href={item.url}
          key={idx}
        >
          {item.name}
        </Link>
      ))}
    </motion.div>
  );
};

export default Header;
