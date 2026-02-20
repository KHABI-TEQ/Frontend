'use client';

import { useState } from "react";
import {
  faMagnifyingGlass,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AttentionOverview from "@/components/admincomponents/attention_overview";
import AnalysisOverview from "@/components/admincomponents/analysis_overview";

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState("attention");

  return (
    <section>
      {/* Search & Help Button */}
      <div className="flex justify-between items-center">
        <div className="w-3/5 mt-2 h-12 flex relative items-center">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size="lg"
            className="text-[#A7A9AD] absolute left-3"
          />
          <input
            type="text"
            placeholder="Search for Agent, Briefs"
            className="w-full h-full pl-12 border border-gray-300 bg-transparent rounded-md"
          />
        </div>
        <button className="bg-black px-1 rounded-full shadow-md">
          <FontAwesomeIcon
            icon={faQuestion}
            color="#fff"
            size="lg"
            className="bg-[#000] p-2 rounded-full shadow-md"
          />
        </button>
      </div>

      {/* Dashboard Header */}
      <div className="flex justify-between mt-6 mr-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-[#2E2C34]">Dashboard</h2>
          <p className="text-sm text-[#84818A]">
            Showing your Account metrics from{" "}
            <span>1st Jan 2021 to 31st Jan 2021</span>
          </p>
        </div>
        <div className="flex items-center bg-white px-4 rounded-lg">
          <p className="text-[#84818A]">
            Show stats:
            <select className="text-[#2E2C34] text-sm ml-1">
              <option value="1">Today</option>
              <option value="2">Yesterday</option>
              <option value="3">Monthly</option>
              <option value="4">Yearly</option>
            </select>
          </p>
        </div>
      </div>

      {/* Overview Tabs */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setActiveTab("attention")}
          className={`w-1/4 py-2 rounded-lg ${
            activeTab === "attention" ? "bg-[#8DDB90] text-white" : "bg-gray-200 text-black"
          }`}
        >
          <h3 className="text-lg font-bold">Attention Require Overview</h3>
        </button>

        <button
          onClick={() => setActiveTab("analysis")}
          className={`w-1/5 py-2 rounded-lg ${
            activeTab === "analysis" ? "bg-[#8DDB90] text-white" : "bg-gray-200 text-black"
          }`}
        >
          <h3 className="text-lg font-bold">Analysis Overview</h3>
        </button>
      </div>

      {/* Conditional Rendering of Overviews */}
      {activeTab === "attention" ? <AttentionOverview /> : <AnalysisOverview />}
    </section>
  );
}
