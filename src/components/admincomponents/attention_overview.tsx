"use client";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActivitiesScroll from "@/components/admincomponents/activities_scroll";
import { useState, Fragment } from "react";
import PendingBriefs from "@/components/admincomponents/pending_briefs";
import OverdueBriefs from "@/components/admincomponents/overdue_brief";
export default function AttentionOverview() {
  const [active, setActive] = useState("pending");
  return (
    <Fragment>
      <div className="bg-white flex flex-col border h-auto rounded-md mt-6 mr-3">
        <div className=" border-b flex justify-between items-center px-6 py-2">
          <h3 className="text-[#2E2C34] text-xl font-medium ">
            Admins Activities
          </h3>
          <div className="flex gap-4">
            <div className="flex gap-2 border p-2 rounded-md">
              <FontAwesomeIcon
                icon={faBars}
                size="lg"
                className="text-[#2E2C34]"
              />
              <span className="text-[#2E2C34]">Filter</span>
            </div>
            <div className="flex gap-2 border p-2 rounded-md">
              <p className="text-[#0B423D]">View admin activities</p>
            </div>
          </div>
        </div>
        <ActivitiesScroll />
      </div>
      <div className="pt-6">
        <div className="flex border-b text-lg gap-8 ">
          <button
            onClick={() => setActive("pending")}
            className={`relative rounded-sm py-3 ${
              active === "pending"
                ? "border-b-4 border-[#8DDB90]  text-[#181336] font-semibold"
                : "text-[#515B6F]"
            }`}
          >
            Pending Briefs
            <span className="absolute top-0  bg-[#FF4F4F] text-white rounded-full px-2 py-0.5 ">
              5
            </span>
          </button>
          <button
            onClick={() => setActive("overdue")}
            className={`relative rounded-sm py-3 ${
              active === "overdue"
                ? "border-b-4 border-[#8DDB90]  text-[#181336] font-semibold"
                : "text-[#515B6F]"
            }`}
          >
            Overdues Briefs
            <span className="absolute top-0  bg-[#e51313] text-white rounded-full px-2 py-0.5">
              25
            </span>
          </button>
        </div>
        {active === "pending" ? <PendingBriefs /> : <OverdueBriefs />}
      </div>
    </Fragment>
  );
}
