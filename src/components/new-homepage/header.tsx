/** @format */

"use client";
import React, { Fragment, Suspense, useEffect, useRef, useState } from "react";
import Button from "@/components/general-components/button";
import Image from "next/image";
import {
  mainNavigationData,
  type NavigationItem,
} from "@/data/navigation-data";
import Link from "next/link";
import barIcon from "@/svgs/bars.svg";
import { usePageContext } from "@/context/page-context";
import { useClientPathname } from "@/hooks/useClientPathname";
import { ChevronDown, Home } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "@/context/user-context";
import dynamic from "next/dynamic";
import KhabiteqHeaderLogo from "@/components/branding/KhabiteqHeaderLogo";

// Lazy load heavy components that are only shown on interaction
const SideBar = dynamic(() => import("../general-components/sideBar"), { ssr: false });
// Import profile directly so dropdown always has latest logic (Developer/Landlord menu on /dashboard)
import UserProfile from "./my-profile";

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
  const pathName = useClientPathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, logout } = useUserContext();
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show "Listing owner properties (Request to Market)" for logged-in Agents under Who is it for?
  useEffect(() => {
    const base =
      user?.userType === "Agent"
        ? mainNavigationData.map((item) => {
            if (item.name === "Who is it for?" && item.subItems) {
              return {
                ...item,
                subItems: [
                  ...item.subItems,
                  {
                    name: "Listing owner properties (Request to Market)",
                    url: "/lasrera-marketplace",
                    isClicked: false,
                  },
                ],
              };
            }
            return item;
          })
        : mainNavigationData;
    setNavigationState(base);
  }, [user?.userType]);
  const [isUserProfileModalOpened, setIsUserProfileModal] =
    useState<boolean>(false);
  const [isNotificationModalOpened, setIsNotificationModalOpened] =
    useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    // console.log(isModalOpened);
  }, [isModalOpened]);


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
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
          isComingSoon && "filter blur-sm"
        } ${
          (isContactUsClicked ||
            rentPage.isSubmitForInspectionClicked ||
            isModalOpened ||
            viewImage ||
            isSubmittedSuccessfully ||
            rentPage.submitPreference) &&
          "filter brightness-[30%] transition-all duration-500 overflow-hidden"
        }`}
      >
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className={`mx-3 sm:mx-5 lg:mx-6 mt-3 sm:mt-4 px-4 sm:px-5 lg:px-6 py-3.5 sm:py-4 rounded-2xl flex justify-between items-center gap-3 transition-all duration-500 ${
            isScrolled 
              ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border border-white/50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] lg:w-[calc(100%-3rem)] max-w-[90rem]' 
              : 'bg-[#EEF1F1]/90 backdrop-blur-md w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] lg:w-[calc(100%-3rem)] max-w-[90rem]'
          }`}>
          <Link href="/" className="relative z-10 flex shrink-0 items-center min-w-0">
            <KhabiteqHeaderLogo priority />
          </Link>
          
          <div className="hidden lg:flex flex-1 min-w-0 justify-center items-center gap-0.5 xl:gap-1">
            {navigationState.map((item: NavigationItem, idx: number) => {
              if (item.subItems && item.subItems.length > 0) {
                const isOpen = openDropdown === item.name;
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col navigation-dropdown group"
                    onMouseEnter={() => {
                      setIsNotificationModalOpened(false);
                      setIsUserProfileModal(false);
                      setOpenDropdown(item.name);
                    }}
                    onMouseLeave={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX;
                      const mouseY = e.clientY;

                      if (
                        mouseY > rect.bottom &&
                        mouseX >= rect.left &&
                        mouseX <= rect.right
                      ) {
                        return;
                      }

                      setTimeout(() => {
                        setOpenDropdown(null);
                      }, 300);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Link
                        href={item.url}
                        onClick={() => setOpenDropdown(null)}
                        className={`relative whitespace-nowrap px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-[#8DDB90]/10 ${
                          pathName?.includes(item.url)
                            ? "text-[#09391C] bg-[#8DDB90]/10"
                            : "text-gray-700 hover:text-[#09391C]"
                        }`}
                      >
                        {item.name}
                        <span className={`absolute bottom-1 left-3 right-3 h-0.5 bg-[#8DDB90] rounded-full transition-all duration-300 ${
                          pathName?.includes(item.url) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`} />
                      </Link>
                      <button
                        className="p-1.5 rounded-lg hover:bg-[#8DDB90]/10 transition-all duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenDropdown(isOpen ? null : item.name);
                        }}
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-all duration-300 ${
                            isOpen ? "rotate-180 text-[#09391C]" : "text-gray-500 group-hover:text-[#09391C]"
                          }`}
                        />
                      </button>
                    </div>
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
                  className={`relative whitespace-nowrap px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-[#8DDB90]/10 group ${
                    item.url === pathName 
                      ? "text-[#09391C] bg-[#8DDB90]/10" 
                      : "text-gray-700 hover:text-[#09391C]"
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-1 left-3 right-3 h-0.5 bg-[#8DDB90] rounded-full transition-all duration-300 ${
                    item.url === pathName ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/**Buttons for desktop screens */}
          <div className="hidden lg:flex shrink-0 items-center gap-2 xl:gap-3">
            {user?._id || user?.id ? (
              <>
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
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#8DDB90] to-[#6BC76F] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 ring-2 ring-white/50 hover:ring-[#8DDB90]/30"
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
                      <Suspense fallback={null}>
                        <UserProfile
                          userDetails={user}
                          closeUserProfileModal={setIsUserProfileModal}
                        />
                      </Suspense>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="whitespace-nowrap px-3 xl:px-4 py-2 text-[13px] xl:text-sm font-medium text-gray-700 hover:text-[#09391C] rounded-full hover:bg-gray-100/80 transition-all duration-300"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="whitespace-nowrap px-4 xl:px-5 py-2 xl:py-2.5 text-[13px] xl:text-sm font-semibold text-white bg-[#09391C] hover:bg-[#0B423D] rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex lg:hidden">
            <button
              onClick={() => {
                setIsModalOpened(!isModalOpened);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-[#8DDB90]/30 transition-all duration-300 hover:scale-105"
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
        </motion.nav>
      </header>

      {/* Spacer for navbar bottom spacing - ensures content has clearance */}
      <div className="h-[80px] lg:h-[100px]" aria-hidden="true" />

      {/* Backdrop overlay for sidebar */}
      {isModalOpened && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      <Suspense fallback={null}>
        <SideBar
          isModalOpened={isModalOpened}
          setIsModalOpened={setIsModalOpened}
        />
      </Suspense>
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
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      ref={ref}
      className="w-[min(100vw-2rem,260px)] mt-3 p-2 flex flex-col gap-1 bg-white/95 backdrop-blur-xl shadow-xl shadow-black/10 border border-gray-100/80 rounded-xl absolute left-0 z-[999]"
      onMouseEnter={() => setModal(true)}
      onMouseLeave={(e) => {
        const dropdownRect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

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
            setTimeout(() => {
              window.location.href = item.url;
            }, 100);
          }}
          className="text-sm font-medium text-gray-700 hover:text-[#09391C] transition-all duration-200 py-2.5 px-4 rounded-lg hover:bg-[#8DDB90]/10"
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
