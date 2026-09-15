/** @format */
"use client";
import { navData } from "@/data";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faClose } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import userIcon from "@/svgs/user.svg";
import { mainNavigationData } from "@/data/navigation-data";

const SideBar = ({
  isModalOpened,
  setIsModalOpened,
}: {
  isModalOpened: boolean;
  setIsModalOpened: (type: boolean) => void;
}) => {
  const pathName = usePathname();
  const router = useRouter();
  const { user, logout } = useUserContext();

  const [openedMenus, setOpenedMenus] = useState<{ [key: string]: boolean }>(
    {},
  );

  const handleItemClick = (path: string) => {
    setIsModalOpened(false);
    router.push(path);
  };

  return (
    <section
      className={`fixed top-0 right-0 z-50 py-[40px] px-[20px] shadow-md h-full bg-[#EEF1F1] transition-all duration-1000 ${
        isModalOpened ? "w-[322px] visible" : "w-0 invisible"
      } lg:hidden flex flex-col justify-between`}
    >
      {isModalOpened && (
        <nav className="w-full h-[100%] pt-[10px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between w-full">
              {(user?._id || user?.id) ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsModalOpened(false)}
                  className="flex items-center gap-[10px] min-w-0"
                >
                  <span className="w-[61px] h-[61px] shrink-0 rounded-full flex items-center justify-center bg-[#FAFAFA]">
                    <Image
                      src={userIcon}
                      width={1000}
                      height={1000}
                      alt=""
                      className="w-[24px] h-[24px]"
                    />
                  </span>
                  <div className="flex flex-col gap-[1px] min-w-0">
                    <h2 className="text-base text-black font-medium truncate">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-[#5A5D63]">{user.userType}</p>
                  </div>
                </Link>
              ) : (
                <div className="w-[136px] flex">
                  <button
                    className="h-full w-[50%] text-base font-bold text-[#8DDB90] border-r-[1px] border-[#A8ADB7] pr-[10px]"
                    onClick={() => {
                      setIsModalOpened(false);
                      router.push("/auth/register");
                    }}
                    type="button"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpened(false);
                      router.push("/auth/login");
                    }}
                    className="h-full w-[50%] text-base font-bold text-black border-l-[1px] border-[#A8ADB7]"
                    type="button"
                  >
                    Login
                  </button>
                </div>
              )}
              <button
                className=""
                onClick={() => {
                  setIsModalOpened(false);
                }}
                type="button"
              >
                {""}
                {/* <svg
                  width='37'
                  height='37'
                  viewBox='0 0 37 37'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <g clipPath='url(#clip0_800_8600)'>
                    <path
                      d='M29.2923 9.88225L27.1186 7.7085L18.5007 16.3264L9.88273 7.7085L7.70898 9.88225L16.3269 18.5002L7.70898 27.1181L9.88273 29.2918L18.5007 20.6739L27.1186 29.2918L29.2923 27.1181L20.6744 18.5002L29.2923 9.88225Z'
                      fill='#504F54'
                    />
                  </g>
                  <defs>
                    <clipPath id='clip0_800_8600'>
                      <rect width='37' height='37' fill='white' />
                    </clipPath>
                  </defs>
                </svg> */}
                <FontAwesomeIcon
                  icon={faClose}
                  size="sm"
                  color="#504F54"
                  className="w-[24px] h-[24px]"
                />
              </button>
            </div>
            <div className="w-full mt-10 flex flex-col gap-[20px]">
              {mainNavigationData.map((item, idx: number) => {
                if (item?.subItems !== undefined) {
                  const isMenuOpen = openedMenus[item.name] || false;

                  return (
                    <div key={idx} className="flex flex-col gap-[5px]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          setOpenedMenus((prev) => ({
                            ...prev,
                            [item.name]: !prev[item.name],
                          }));
                        }}
                        className={`flex items-center justify-between gap-2 w-full pb-1 transition-all duration-500 text-left`}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="5" cy="5" r="5" fill="#09391C" />
                          </svg>
                          <span className="text-[#09391C] text-[18px] leading-[21.09px] font-medium">
                            {item.name}
                          </span>
                        </div>
                        <FontAwesomeIcon
                          size="sm"
                          color="#09391C"
                          className={`w-[20px] h-[20px] transform transition-all duration-300 ${
                            isMenuOpen && "rotate-180"
                          }`}
                          icon={faCaretDown}
                        />
                      </button>

                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-[10px] pl-[20px] py-[10px]">
                              {item.subItems?.map(
                                (content, contentIDX: number) => {
                                  const hasNested = Boolean(content.subItems?.length);
                                  const nestedKey = `${item.name}:${content.name}`;
                                  const isNestedOpen = openedMenus[nestedKey] || false;

                                  if (hasNested) {
                                    return (
                                      <div key={contentIDX} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                          <Link
                                            href={content.url}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIsModalOpened(false);
                                              setOpenedMenus({});
                                            }}
                                            className="text-sm text-[#1E1E1E] hover:text-[#8DDB90] transition-colors py-1"
                                          >
                                            {content.name}
                                          </Link>
                                          <button
                                            type="button"
                                            aria-expanded={isNestedOpen}
                                            aria-label={`${isNestedOpen ? "Collapse" : "Expand"} ${content.name}`}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setOpenedMenus((prev) => ({
                                                ...prev,
                                                [nestedKey]: !prev[nestedKey],
                                              }));
                                            }}
                                            className="p-1"
                                          >
                                            <FontAwesomeIcon
                                              size="sm"
                                              color="#09391C"
                                              className={`h-3 w-3 transform transition-all duration-300 ${
                                                isNestedOpen && "rotate-180"
                                              }`}
                                              icon={faCaretDown}
                                            />
                                          </button>
                                        </div>
                                        <AnimatePresence>
                                          {isNestedOpen && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="flex flex-col gap-1 border-l border-[#09391C]/20 pl-3">
                                                {content.subItems?.map((nested, nestedIdx) => (
                                                  <Link
                                                    key={`${nestedKey}-${nestedIdx}`}
                                                    href={nested.url}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setIsModalOpened(false);
                                                      setOpenedMenus({});
                                                    }}
                                                    className="py-1 text-sm text-[#5A5D63] hover:text-[#8DDB90]"
                                                  >
                                                    {nested.name}
                                                  </Link>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  }

                                  return (
                                    <Link
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsModalOpened(false);
                                        setOpenedMenus({});
                                      }}
                                      className={
                                        content.name === "Property Scout"
                                          ? "rounded-lg bg-[#8DDB90]/15 px-2 py-1.5 text-sm font-semibold text-[#09391C] hover:bg-[#8DDB90]/25"
                                          : "py-1 text-sm text-[#1E1E1E] transition-colors hover:text-[#8DDB90]"
                                      }
                                      key={contentIDX}
                                      href={content.url}
                                    >
                                      {content.name === "Property Scout"
                                        ? "Property Scout →"
                                        : content.name}
                                    </Link>
                                  );
                                },
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    onClick={() => {
                      setIsModalOpened(false);
                    }}
                    className={`flex items-center gap-2 w-fit pb-1 transition-all hover:border-b-2 hover:border-[#09391C] hover:pb-1 duration-500`}
                    href={item.url}
                    key={idx}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="5" cy="5" r="5" fill="#09391C" />
                    </svg>
                    <span className="text-[#09391C] text-[18px] leading-[21.09px] font-medium">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          {(user?._id || user?.id) && (
            <button
              type="button"
              onClick={() => {
                setIsModalOpened(false);
                void logout();
              }}
              className="flex items-center gap-2 w-fit pb-1 text-left"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5" cy="5" r="5" fill="#09391C" />
              </svg>
              <span className="text-[#09391C] text-[18px] leading-[21.09px] font-medium">
                Logout
              </span>
            </button>
          )}
        </nav>
      )}
    </section>
  );
};

export default SideBar;
