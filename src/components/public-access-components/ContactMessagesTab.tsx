"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Trash2, Eye, Search, MessageCircle } from "lucide-react";
import { GET_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  subject: string;
  message: string;
  status: "pending" | "replied" | "archived" | "spam";
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ContactMessage[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ModalData {
  isOpen: boolean;
  message: ContactMessage | null;
}

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "badge-yellow" },
  replied: { bg: "bg-green-50", text: "text-green-700", badge: "badge-green" },
  archived: { bg: "bg-gray-50", text: "text-gray-700", badge: "badge-gray" },
  spam: { bg: "bg-red-50", text: "text-red-700", badge: "badge-red" },
};

const ContactMessagesTab: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | "all">("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    limit: 10,
  });
  const [modal, setModal] = useState<ModalData>({ isOpen: false, message: null });

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
 
      let url = `${URLS.BASE}/account/dealSite/contact-messages?page=${page}&limit=${pagination.limit}`;

      if (selectedStatus !== "all") {
        url += `&status=${selectedStatus}`;
      }

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const res = await GET_REQUEST<ContactMessage[]>(url, token);

      if (res?.success && res.data) {
        setMessages(res.data);
        if (res.pagination) {
          setPagination({
            total: (res.pagination as any).total,
            pages: (res.pagination as any).pages,
            limit: (res.pagination as any).limit,
          });
        }
      } else {
        toast.error("Failed to load messages");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load contact messages");
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedStatus, searchTerm, pagination.limit]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleDelete = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = Cookies.get("token");
      const res = await DELETE_REQUEST(
        `${URLS.BASE}/account/dealSite/contact-messages/${messageId}`,
        undefined,
        token
      );

      if (res?.success) {
        toast.success("Message deleted successfully");
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        toast.error(res?.message || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilter = (status: string | "all") => {
    setSelectedStatus(status);
    setPage(1);
  };

  const openModal = (message: ContactMessage) => {
    setModal({ isOpen: true, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: null });
  };

  const getStatusBadge = (status: string) => {
    const colors = statusColors[status] || statusColors.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <OverlayPreloader isVisible={isDeleting} message="Deleting..." />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2">
          <MessageCircle size={24} />
          Contact Messages ({pagination.total})
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No messages found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{message.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{message.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs truncate">{message.subject}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(message.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(message)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(message._id)}
                          disabled={isDeleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete message"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {modal.isOpen && modal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#09391C]">Message Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                  <p className="text-sm text-gray-900 mt-1">{modal.message.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{modal.message.email}</p>
                </div>
                {modal.message.phoneNumber && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{modal.message.phoneNumber}</p>
                  </div>
                )}
                {modal.message.whatsAppNumber && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">WhatsApp</label>
                    <p className="text-sm text-gray-900 mt-1">{modal.message.whatsAppNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {getStatusBadge(modal.message.status)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(modal.message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Subject</label>
                <p className="text-sm text-gray-900 mt-1">{modal.message.subject}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{modal.message.message}</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(modal.message!._id);
                  closeModal();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesTab;
