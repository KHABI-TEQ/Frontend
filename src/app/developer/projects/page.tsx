"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";

export default function DeveloperProjectsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await GET_REQUEST(`${URLS.BASE}${URLS.developerProjects}`, Cookies.get("token"));
      if (res.success && Array.isArray(res.data)) setRows(res.data);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["Developer"]} requireAgentOnboarding={false} requireAgentApproval={false}>
      <div className="min-h-screen bg-[#EEF1F1] py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#09391C]">My Projects</h1>
              <p className="text-sm text-[#5A5D63]">Off-plan and under-construction developments. These are not normal property listings.</p>
            </div>
            <Link href="/developer/projects/new" className="rounded-lg bg-[#09391C] text-white px-4 py-2 text-sm font-semibold">
              List Off-Plan Project
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-[#5A5D63]">Loading projects…</p>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-[#5A5D63]">You haven&apos;t submitted an off-plan project yet.</p>
              <Link href="/developer/projects/new" className="inline-block mt-3 font-semibold text-[#09391C]">
                List Off-Plan Project →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((p) => (
                <Link
                  key={p._id}
                  href={`/developer/projects/${p._id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#09391C]">{p.name}</p>
                      <p className="text-xs text-[#5A5D63]">
                        {p.location?.localGovtArea || "—"} · {p.developmentStage || "Stage not set"}
                      </p>
                    </div>
                    <span className="text-xs font-medium capitalize bg-slate-100 px-2 py-1 rounded-full h-fit">
                      {String(p.status || "").replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
