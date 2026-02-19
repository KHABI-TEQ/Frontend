"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { ArrowLeft, Send, Mail, Users } from "lucide-react";
import { CombinedAuthGuard } from "@/logic/combinedAuthGuard";
import { useUserContext } from "@/context/user-context";

export default function AgentBroadcastPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter a message body");
      return;
    }
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    setIsSubmitting(true);
    try {
      const url = `${URLS.BASE}${URLS.agentBroadcast}`;
      const res = await POST_REQUEST<unknown>(url, { subject: subject.trim(), body: body.trim() }, token);
      if (res?.success) {
        toast.success("Broadcast email sent to all your subscribers.");
        setSubject("");
        setBody("");
        router.push("/dashboard");
      } else {
        toast.error((res?.message as string) || res?.error || "Failed to send broadcast");
      }
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to send broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CombinedAuthGuard
      requireAuth={true}
      allowedUserTypes={["Agent", "Landowners"]}
      requireAgentOnboarding={false}
      requireAgentApproval={false}
      requireActiveSubscription={user?.userType === "Agent"}
      agentCustomMessage="You need an active subscription to broadcast to subscribers."
    >
      <div className="min-h-screen bg-[#EEF1F1] py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#8DDB90]/10 rounded-lg">
                <Mail size={24} className="text-[#09391C]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#09391C] font-display">
                  Broadcast to Subscribers
                </h1>
                <p className="text-sm text-[#5A5D63] flex items-center gap-1 mt-0.5">
                  <Users size={14} />
                  Email all subscribers on your DealSite
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New listings this week"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-[#09391C]"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{subject.length}/200</p>
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message to subscribers..."
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent text-[#09391C] resize-y min-h-[160px]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <Link
                  href="/dashboard"
                  className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-center transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#8DDB90] hover:bg-[#7BC87F] text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  {isSubmitting ? "Sending..." : "Send broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
