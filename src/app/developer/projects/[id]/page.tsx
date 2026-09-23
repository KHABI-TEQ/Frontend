"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { handleApiError } from "@/utils/handleApiError";
import toast from "react-hot-toast";

export default function DeveloperProjectDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    void GET_REQUEST(`${URLS.BASE}${URLS.developerProjects}/${id}`, Cookies.get("token")).then((res) => {
      if (res.success) setProject(res.data);
    });
  }, [id]);

  const submit = async () => {
    const res = await POST_REQUEST(`${URLS.BASE}${URLS.developerProjects}/${id}/submit`, {}, Cookies.get("token"));
    if (!res.success) {
      handleApiError(res);
      return;
    }
    toast.success("Project submitted for review.");
    setProject(res.data);
  };

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["Developer"]} requireAgentOnboarding={false} requireAgentApproval={false}>
      <div className="min-h-screen bg-[#EEF1F1] py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <Link href="/developer/projects" className="text-sm font-semibold text-[#09391C]">← All projects</Link>
          {!project ? (
            <p className="text-sm text-[#5A5D63]">Loading…</p>
          ) : (
            <>
              <div className="flex justify-between gap-3">
                <h1 className="text-2xl font-bold text-[#09391C]">{project.name}</h1>
                <span className="text-xs capitalize bg-slate-100 px-2 py-1 rounded-full h-fit">
                  {String(project.status || "").replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-[#5A5D63]">
                {project.location?.area} {project.location?.localGovtArea}
              </p>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[#5A5D63]">Development type</dt><dd>{project.developmentType || "—"}</dd></div>
                <div><dt className="text-[#5A5D63]">Stage</dt><dd>{project.developmentStage || "—"}</dd></div>
                <div><dt className="text-[#5A5D63]">Units</dt><dd>{project.unitCount ?? "—"}</dd></div>
                <div><dt className="text-[#5A5D63]">Available</dt><dd>{project.availableUnits ?? "—"}</dd></div>
                <div><dt className="text-[#5A5D63]">Price range</dt><dd>
                  {project.priceMin || project.priceMax
                    ? `₦${Number(project.priceMin || 0).toLocaleString()} – ₦${Number(project.priceMax || 0).toLocaleString()}`
                    : "—"}
                </dd></div>
                <div><dt className="text-[#5A5D63]">Expected completion</dt><dd>{project.expectedCompletionDate || "—"}</dd></div>
              </dl>
              {project.reviewNote && (
                <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">{project.reviewNote}</p>
              )}
              {["draft", "rejected"].includes(project.status) && (
                <button onClick={() => void submit()} className="rounded-lg bg-[#09391C] text-white px-4 py-2 text-sm font-semibold">
                  Submit for review
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
