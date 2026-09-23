"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import AttachFile from "@/components/general-components/attach_file";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import { getLGAsByState, PILOT_STATE } from "@/utils/location-utils";
import { handleApiError } from "@/utils/handleApiError";
import toast from "react-hot-toast";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8DDB90]";

function Field({ label, why, children }: { label: string; why: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#09391C]">{label}</span>
      <p className="text-xs text-[#5A5D63]">{why}</p>
      {children}
    </label>
  );
}

export default function NewOffPlanProjectPage() {
  const router = useRouter();
  const lgas = useMemo(() => getLGAsByState(PILOT_STATE), []);
  const [saving, setSaving] = useState(false);
  const [doc, setDoc] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    area: "",
    localGovtArea: "",
    state: PILOT_STATE,
    developmentType: "",
    developmentStage: "",
    unitCount: "",
    unitTypes: "",
    priceMin: "",
    priceMax: "",
    expectedCompletionDate: "",
    availableUnits: "",
  });

  const submit = async (asSubmit: boolean) => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        location: {
          state: form.state,
          localGovtArea: form.localGovtArea,
          area: form.area,
        },
        developmentType: form.developmentType,
        developmentStage: form.developmentStage,
        unitCount: Number(form.unitCount) || undefined,
        unitTypes: form.unitTypes.split(",").map((s) => s.trim()).filter(Boolean),
        priceMin: Number(form.priceMin) || undefined,
        priceMax: Number(form.priceMax) || undefined,
        expectedCompletionDate: form.expectedCompletionDate,
        availableUnits: Number(form.availableUnits) || undefined,
        documents: doc ? [{ name: "Project document", url: doc }] : [],
      };
      const created = await POST_REQUEST(`${URLS.BASE}${URLS.developerProjects}`, payload, Cookies.get("token"));
      if (!created.success) {
        handleApiError(created);
        return;
      }
      const id = (created.data as any)?._id;
      if (asSubmit && id) {
        const sub = await POST_REQUEST(`${URLS.BASE}${URLS.developerProjects}/${id}/submit`, {}, Cookies.get("token"));
        if (!sub.success) {
          handleApiError(sub);
          router.push(`/developer/projects/${id}`);
          return;
        }
        toast.success("Project submitted for review.");
      } else {
        toast.success("Draft saved.");
      }
      router.push(id ? `/developer/projects/${id}` : "/developer/projects");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["Developer"]} requireAgentOnboarding={false} requireAgentApproval={false}>
      <div className="min-h-screen bg-[#EEF1F1] py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-[#09391C]">List Off-Plan Project</h1>
            <p className="text-sm text-[#5A5D63] mt-1">
              Submit an off-plan or under-construction development for project review. This is not a normal property listing.
            </p>
          </div>
          <Field label="Project name" why="The public name of this development.">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Project location" why="The neighbourhood or estate where the development sits.">
            <input className={inputClass} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          </Field>
          <Field label="LGA" why="The Lagos local government of the development.">
            <select className={inputClass} value={form.localGovtArea} onChange={(e) => setForm({ ...form, localGovtArea: e.target.value })}>
              <option value="">Select LGA</option>
              {lgas.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
            </select>
          </Field>
          <Field label="Development type" why="For example residential estate, mixed-use, or commercial block.">
            <input className={inputClass} value={form.developmentType} onChange={(e) => setForm({ ...form, developmentType: e.target.value })} />
          </Field>
          <Field label="Development stage" why="How far construction has progressed, for example planning, foundation, or finishing.">
            <input className={inputClass} value={form.developmentStage} onChange={(e) => setForm({ ...form, developmentStage: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Number of units" why="Total units planned in this development.">
              <input className={inputClass} type="number" value={form.unitCount} onChange={(e) => setForm({ ...form, unitCount: e.target.value })} />
            </Field>
            <Field label="Available units" why="How many units are currently available to buyers.">
              <input className={inputClass} type="number" value={form.availableUnits} onChange={(e) => setForm({ ...form, availableUnits: e.target.value })} />
            </Field>
          </div>
          <Field label="Unit types" why="Comma-separated unit types, for example 2-bedroom, 3-bedroom terrace.">
            <input className={inputClass} value={form.unitTypes} onChange={(e) => setForm({ ...form, unitTypes: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Minimum price (₦)" why="Lowest advertised price in this development.">
              <input className={inputClass} type="number" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
            </Field>
            <Field label="Maximum price (₦)" why="Highest advertised price in this development.">
              <input className={inputClass} type="number" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
            </Field>
          </div>
          <Field label="Expected completion date" why="When you expect the development to be ready for handover.">
            <input className={inputClass} type="date" value={form.expectedCompletionDate} onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })} />
          </Field>
          <Field
            label="Project documents"
            why="Upload relevant supporting documents. Uploading a document does not mean Khabiteq has independently verified the underlying property or title unless a separate verification service has actually been completed."
          >
            <AttachFile id="project-doc" heading="Upload document" setFileUrl={setDoc} acceptedFileTypes="image/*,.pdf" />
          </Field>
          <div className="flex flex-wrap gap-3">
            <button disabled={saving} onClick={() => void submit(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">
              Save draft
            </button>
            <button disabled={saving} onClick={() => void submit(true)} className="rounded-lg bg-[#09391C] text-white px-4 py-2 text-sm font-semibold">
              Submit for review
            </button>
          </div>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
