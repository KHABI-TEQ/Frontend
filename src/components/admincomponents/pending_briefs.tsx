"use client";
import { faBars, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const data = [
  {
    id: "KA4556",
    legalName: "Samuel Woodfree",
    agentType: "individual",
    location: "Ifako Ijaye",
    landSize: "5000m",
    amount: "N 200,000,000,000",
    document: "C of O, Receipt",
  },
  {
    id: "KA4556",
    legalName: "Samuel Woodfree",
    agentType: "incorporated",
    location: "Ifako Ijaye",
    landSize: "5000m",
    amount: "N 200,000,000,000",
    document: "C of O, Receipt",
  },
  {
    id: "KA4556",
    legalName: "Samuel Woodfree",
    agentType: "individual",
    location: "Ifako Ijaye",
    landSize: "5000m",
    amount: "N 200,000,000,000",
    document: "C of O, Receipt",
  },
];

export default function PendingBriefs() {
  return (
    <div className="mt-6 p-4 border rounded-md bg-white px-8">
      <h3 className="text-[#2E2C34] text-xl font-semibold  py-6">
        Approve Briefs
      </h3>
      <div className="flex justify-between">
        <select className="w-1/6 border border-gray-300 bg-transparent rounded-md p-3">
          <option value="1">Type</option>
          <option value="2">Pending</option>
          <option value="3">Overdue</option>
        </select>
        <div className="flex gap-3 border px-3 justify-center items-center rounded-md">
          <FontAwesomeIcon icon={faBars} size="lg" className="text-[#2E2C34]" />
          <span className="text-[#2E2C34]">Filter</span>
        </div>
      </div>
      <table className="w-full mt-6">
        <thead>
          <tr className="border-b bg-[#fafafa] text-left text-sm font-medium text-gray-600">
            <th className="p-3">
              <input type="checkbox" />
            </th>
            <th className="p-3">ID</th>
            <th className="p-3">Legal Name</th>
            <th className="p-3">Type of Agent</th>
            <th className="p-3">Location</th>
            <th className="p-3">Land Size</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Document</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b text-sm text-gray-700 hover:bg-gray-50"
            >
              <td className="p-3">
                <input type="checkbox" />
              </td>
              <td className="p-3">{item.id}</td>
              <td className="p-3">{item.legalName}</td>
              <td
                className={`p-3 font-semibold ${
                  item.agentType === "individual"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {item.agentType}
              </td>
              <td className="p-3">{item.location}</td>
              <td className="p-3">{item.landSize}</td>
              <td className="p-3 font-bold">{item.amount}</td>
              <td className="p-3">{item.document}</td>
              <td className="p-3 cursor-pointer text-2xl">
                <FontAwesomeIcon icon={faEllipsis} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
