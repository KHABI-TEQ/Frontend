"use client";
import React from "react";
import { useUserContext } from "@/context/user-context";
import KycSubmittedConfirmation from "@/components/kyc/KycSubmittedConfirmation";
import { FileText, MapPin, Briefcase, Award, Mail, Phone, User } from "lucide-react";

const Section: React.FC<{ title: React.ReactNode; children: React.ReactNode }>
  = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-[#0C1E1B] flex items-center gap-2">
      {title}
    </h3>
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      {children}
    </div>
  </div>
);

const List: React.FC<{ items?: (string | undefined | null)[] }>
  = ({ items }) => (
  <ul className="list-disc ml-5 text-sm text-[#3A3F3D]">
    {(items || []).filter(Boolean).map((it, idx) => (
      <li key={idx}>{it}</li>
    ))}
  </ul>
);

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString();
};

const avatarInitials = (first?: string, last?: string) => {
  const a = (first || "").trim()[0] || "";
  const b = (last || "").trim()[0] || "";
  return (a + b).toUpperCase() || "U";
};

const PendingKycReview: React.FC = () => {
  const { user } = useUserContext();

  const agent = (user as any)?.agentData || {};
  const kyc = agent?.kycData || {};

  const meansOfId: any[] = agent?.meansOfId || kyc?.meansOfId || [];
  const address = agent?.address || kyc?.address || {};
  const regions: string[] = agent?.regionOfOperation || kyc?.regionOfOperation || [];
  const agentType: string | undefined = agent?.agentType || kyc?.agentType;

  return (
    <KycSubmittedConfirmation userType={user?.userType}>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="mx-6 mt-4 mb-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-[#09391C]">What you can do while waiting</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#5A5D63]">
            <li>Return to your dashboard and review your account.</li>
            <li>Set up your practitioner / public page (logo, footer, and branding).</li>
            <li>Choose a paid subscription so you are ready to list as soon as KYC is approved.</li>
            <li>Listing a property stays locked until KYC is approved and a paid plan is active.</li>
          </ul>
        </div>

          {/* Profile summary */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="h-12 w-12 rounded-full bg-[#E8F7EE] text-[#0B572B] flex items-center justify-center font-semibold">
                {avatarInitials((user as any)?.firstName, (user as any)?.lastName)}
              </div>
              <div>
                <div className="font-semibold text-[#0C1E1B] flex items-center gap-2">
                  <User size={16} className="text-[#0B572B]" />
                  <span>{(user as any)?.firstName} {(user as any)?.lastName}</span>
                </div>
                <div className="text-sm text-[#3A3F3D] flex items-center gap-2">
                  <Mail size={14} className="text-gray-500" />
                  <span>{(user as any)?.email || "-"}</span>
                </div>
                <div className="text-sm text-[#3A3F3D] flex items-center gap-2">
                  <Phone size={14} className="text-gray-500" />
                  <span>{(user as any)?.phoneNumber || "-"}</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                <div className="text-[#6A716E]">Agent Type</div>
                <div className="font-medium text-[#0C1E1B]">{agentType || "-"}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                <div className="text-[#6A716E]">License Number</div>
                <div className="font-medium text-[#0C1E1B]">{kyc?.agentLicenseNumber || "-"}</div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-6">
            <h3 className="text-lg font-semibold text-[#0C1E1B]">Preview of Submitted Details</h3>

            {/* Identity */}
            <Section title={<span className="inline-flex items-center gap-2"><FileText size={18} className="text-[#0B572B]"/> Identity Documents</span>}>
              <div className="space-y-3">
                {(meansOfId || []).map((doc: any, idx: number) => (
                  <div key={idx} className="bg-white border rounded-lg p-3 space-y-2">
                    <div className="text-sm font-medium text-[#0C1E1B]">{doc?.name || `Document ${idx + 1}`}</div>
                    <div className="flex flex-wrap gap-3">
                      {(doc?.docImg || []).map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-28 h-20 border rounded overflow-hidden">
                          <img src={url} alt={`doc-${idx}-${i}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                {(!meansOfId || meansOfId.length === 0) && (
                  <p className="text-sm text-gray-500">No identity document uploaded.</p>
                )}
              </div>
            </Section>

            {/* Professional */}
            <Section title={<span className="inline-flex items-center gap-2"><Briefcase size={18} className="text-[#0B572B]"/> Professional Information</span>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#3A3F3D]">
                <div><span className="font-medium text-[#0C1E1B]">Agent Type:</span> {agentType || "-"}</div>
                <div><span className="font-medium text-[#0C1E1B]">License No.:</span> {kyc?.agentLicenseNumber || "-"}</div>
                <div className="md:col-span-2">
                  <span className="block font-medium text-[#0C1E1B] mb-1">Bio</span>
                  <p className="whitespace-pre-wrap">{kyc?.profileBio || "-"}</p>
                </div>
                <div>
                  <span className="font-medium text-[#0C1E1B]">Specializations</span>
                  <List items={kyc?.specializations} />
                </div>
                <div>
                  <span className="font-medium text-[#0C1E1B]">Languages Spoken</span>
                  <List items={kyc?.languagesSpoken} />
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-[#0C1E1B]">Services Offered</span>
                  <List items={kyc?.servicesOffered} />
                </div>
              </div>
            </Section>

            {/* Address & Regions */}
            <Section title={<span className="inline-flex items-center gap-2"><MapPin size={18} className="text-[#0B572B]"/> Address & Regions</span>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#3A3F3D]">
                <div><span className="font-medium text-[#0C1E1B]">Street:</span> {address?.street || "-"}</div>
                <div><span className="font-medium text-[#0C1E1B]">House No.:</span> {address?.homeNo || "-"}</div>
                <div><span className="font-medium text-[#0C1E1B]">State:</span> {address?.state || "-"}</div>
                <div><span className="font-medium text-[#0C1E1B]">LGA:</span> {address?.localGovtArea || "-"}</div>
                <div className="md:col-span-2">
                  <span className="font-medium text-[#0C1E1B]">Regions of Operation</span>
                  <List items={regions} />
                </div>
              </div>
            </Section>

            {/* Achievements */}
            {(kyc?.achievements?.length || 0) > 0 && (
              <Section title={<span className="inline-flex items-center gap-2"><Award size={18} className="text-[#0B572B]"/> Achievements</span>}>
                <div className="space-y-3">
                  {kyc.achievements.map((a: any, idx: number) => (
                    <div key={idx} className="bg-white border rounded-lg p-3 text-sm text-[#3A3F3D]">
                      <div className="font-medium text-[#0C1E1B]">{a.title || `Achievement ${idx + 1}`}</div>
                      <div className="text-xs text-gray-500">{formatDate(a.dateAwarded)}</div>
                      <p className="mt-1">{a.description || ""}</p>
                      {a.fileUrl && (
                        <a href={a.fileUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-[#0B572B] underline text-sm">View file</a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
    </KycSubmittedConfirmation>
  );
};

export default PendingKycReview;
