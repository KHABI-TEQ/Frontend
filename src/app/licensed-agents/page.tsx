"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type PublicLicensedAgent = {
  _id: string;
  firstName?: string;
  lastName?: string;
  profile_picture?: string;
  profileBio?: string;
  specializations?: string[];
  regionOfOperation?: string[];
  companyName?: string;
  practitionerType?: string;
  publicSlug?: string | null;
  userType?: string;
  isLicensed?: boolean;
  isPageReachable?: boolean;
};

function dealSiteUrl(slug: string) {
  return `https://${slug}.khabiteqrealty.com`;
}

export default function LicensedAgentsPage() {
  const [agents, setAgents] = useState<PublicLicensedAgent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (q?: string) => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q?.trim()) qs.set("search", q.trim());
    qs.set("limit", "40");
    const res = await GET_REQUEST<PublicLicensedAgent[]>(
      `${URLS.BASE}${URLS.publicLicensedAgents}?${qs.toString()}`,
    );
    if (res.success && Array.isArray(res.data)) {
      setAgents(res.data);
      setError(null);
    } else {
      setAgents([]);
      setError(res.message || "Could not load licensed professionals.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="min-h-screen bg-[#F8FAF8] pt-24 sm:pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#09391C]">Home</Link>
          <span className="mx-2">/</span>
          <span>Licensed professionals</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#09391C] mb-3">
          Licensed professionals
        </h1>
        <p className="text-[#5A5D63] mb-8 max-w-2xl">
          Browse verified real estate professionals and open their public pages to
          view listings, request inspections, or start a structured search.
        </p>

        <div className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(search)}
              placeholder="Search by name, company or slug"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => load(search)}
            className="px-5 py-3 rounded-xl bg-[#09391C] text-white font-semibold"
          >
            Search
          </button>
        </div>

        {loading && <p className="text-[#5A5D63]">Loading directory…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const name = `${agent.firstName || ""} ${agent.lastName || ""}`.trim() || "Professional";
            const reachable = agent.isPageReachable !== false && !!agent.publicSlug;
            return (
              <article
                key={agent._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  {agent.profile_picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agent.profile_picture}
                      alt={name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#09391C] text-white font-bold flex items-center justify-center">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-[#09391C]">{name}</h2>
                    <p className="text-sm text-[#5A5D63]">
                      {agent.companyName || agent.userType || "Real estate professional"}
                    </p>
                    {agent.publicSlug && (
                      <p className="text-xs text-[#16a34a] mt-1">@{agent.publicSlug}</p>
                    )}
                    {agent.profileBio && (
                      <p className="text-sm text-[#5A5D63] mt-2 line-clamp-3">{agent.profileBio}</p>
                    )}
                    {!!agent.regionOfOperation?.length && (
                      <p className="text-xs text-gray-500 mt-2">
                        {agent.regionOfOperation.slice(0, 4).join(", ")}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reachable ? (
                        <a
                          href={dealSiteUrl(agent.publicSlug!)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex px-4 py-2 rounded-lg bg-[#09391C] text-white text-sm font-medium"
                        >
                          Open practitioner page
                        </a>
                      ) : (
                        <span className="text-sm text-orange-600">Page currently unreachable</span>
                      )}
                      <Link
                        href="/preference"
                        className="inline-flex px-4 py-2 rounded-lg border border-[#09391C] text-[#09391C] text-sm font-medium"
                      >
                        Share requirements
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
