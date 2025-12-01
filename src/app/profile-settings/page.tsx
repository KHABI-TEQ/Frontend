"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "@/context/user-context";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  User as UserIcon,
  ArrowLeft as ArrowLeftIcon,
  Camera as CameraIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Trash2 as Trash2Icon,
  Save as SaveIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  AlertTriangle as AlertTriangleIcon,
  X,
} from "lucide-react";
import Loading from "@/components/loading-component/loading";
import ProcessingRequest from "@/components/loading-component/ProcessingRequest";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "@/utils/axiosConfig";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  accountId?: string;
  profileImage?: string;
  userType: "Agent" | "Landowners" | "FieldAgent";
  accountApproved?: boolean;
  createdAt: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileSettingsPage() {
  const { user, setUser } = useUserContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "account"
  >("profile");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeletionRequested, setIsDeletionRequested] = useState(false);
  const [deletionDate, setDeletionDate] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [isEmailChangeRequested, setIsEmailChangeRequested] = useState(false);
  const [newEmailRequest, setNewEmailRequest] = useState<string>("");
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showDeletionConfirmModal, setShowDeletionConfirmModal] = useState(false);
  const [isDeletionLoading, setIsDeletionLoading] = useState(false);

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlTab = (searchParams.get('tab') || undefined) as ("profile" | "password" | "account") | undefined;

  // Apply URL tab if provided
  useEffect(() => {
    if (urlTab) {
      // Validate and set
      const allowed = ['profile', 'password', 'account'];
      if (allowed.includes(urlTab)) {
        setActiveTab(urlTab as any);
      }
    }
  }, [urlTab, setActiveTab]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);

      if (!user) {
        setIsLoading(false);
        return;
      }

      const userProfile: UserProfile = {
        _id: user._id || "1",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address?.street || "",
        profileImage: user.profile_picture,
        userType: user.userType || "Agent",
        accountApproved: user.accountApproved || false,
        createdAt: user.createdAt || new Date().toISOString(),
        accountId: user.accountId || "",
      };

      setUserProfile(userProfile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const profileFormik = useFormik({
    initialValues: {
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      email: userProfile?.email || "",
      phoneNumber: userProfile?.phoneNumber || "",
      address: userProfile?.address || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      phoneNumber: Yup.string(),
      address: Yup.string(),
    }),
    onSubmit: async (values) => {
      setIsUpdatingProfile(true);
      try {
        const updatePayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          address: values.address,
        };

        const response = await api.patch("/account/updateAccount", updatePayload);

        if (response.data.success) {
          const updatedProfile = { ...userProfile, ...values };
          setUserProfile(updatedProfile as UserProfile);
          setUser({ ...user, ...values } as any);
          toast.success("Profile updated successfully");
        } else {
          throw new Error(response.data.message || "Failed to update profile");
        }
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      } finally {
        setIsUpdatingProfile(false);
      }
    },
  });

  const passwordFormik = useFormik<PasswordChangeData>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => {
      setIsChangingPassword(true);
      try {
        const response = await api.put("/account/changePassword", {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        if (response.data.success) {
          toast.success("Password changed successfully");
          passwordFormik.resetForm();
        } else {
          throw new Error(response.data.message || "Failed to change password");
        }
      } catch (error) {
        console.error("Failed to change password:", error);
        toast.error(error instanceof Error ? error.message : "Failed to change password");
      } finally {
        setIsChangingPassword(false);
      }
    },
  });

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImageFile) return;

    setIsUploadingProfileImage(true);
    try {
      const formData = new FormData();
      formData.append("file", profileImageFile);

      const uploadResponse = await api.post("/upload-single-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!uploadResponse.data.success) {
        throw new Error("Upload failed");
      }

      const imageUrl = uploadResponse.data.data.url;

      const updateResponse = await api.patch("/accounts/updateProfilePicture", {
        profile_picture: imageUrl,
      });

      if (updateResponse.data.success) {
        const updatedProfile = { ...userProfile, profileImage: imageUrl };
        setUserProfile(updatedProfile as UserProfile);
        setUser({ ...user, profile_picture: imageUrl } as any);

        setProfileImageFile(null);
        setProfileImagePreview(null);
        toast.success("Profile image updated successfully");
      } else {
        throw new Error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Failed to upload profile image:", error);
      toast.error("Failed to upload profile image");
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

  const handleRequestAccountDeletion = () => {
    setShowDeletionConfirmModal(true);
  };

  const handleConfirmAccountDeletion = async () => {
    setIsDeletionLoading(true);
    try {
      const response = await api.delete("/accounts/requestAccountDeletion");

      if (response.data.success) {
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 7);

        setIsDeletionRequested(true);
        setDeletionDate(deletionDate.toLocaleDateString());
        setShowDeletionConfirmModal(false);

        toast.success(
          "Account deletion request submitted. Your account will be deleted in 7 days.",
        );
      } else {
        throw new Error("Failed to request account deletion");
      }
    } catch (error) {
      console.error("Failed to request account deletion:", error);
      toast.error("Failed to request account deletion");
    } finally {
      setIsDeletionLoading(false);
    }
  };

  const handleCancelAccountDeletion = async () => {
    try {
      const response = await api.post("/accounts/cancelAccountDeletion");

      if (response.data.success) {
        setIsDeletionRequested(false);
        setDeletionDate(null);
        toast.success("Account deletion request cancelled");
      } else {
        throw new Error("Failed to cancel account deletion");
      }
    } catch (error) {
      console.error("Failed to cancel account deletion:", error);
      toast.error("Failed to cancel account deletion");
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmailRequest || !newEmailRequest.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (newEmailRequest === userProfile?.email) {
      toast.error("New email cannot be the same as current email");
      return;
    }

    setIsRequestingEmailChange(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsEmailChangeRequested(true);
      setShowEmailChangeModal(false);
      setNewEmailRequest("");

      toast.success(
        `Email change request submitted. Please check ${newEmailRequest} for verification instructions.`,
      );
    } catch (error) {
      console.error("Failed to request email change:", error);
      toast.error("Failed to request email change");
    } finally {
      setIsRequestingEmailChange(false);
    }
  };

  const handleCancelEmailChange = async () => {
    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsEmailChangeRequested(false);
      toast.success("Email change request cancelled");
    } catch (error) {
      console.error("Failed to cancel email change:", error);
      toast.error("Failed to cancel email change");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Link
              href={'/dashboard'}
              className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#7BC87F] font-medium"
            >
              <ArrowLeftIcon size={20} />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#09391C] font-display">
                Profile Settings
              </h1>
              <p className="text-[#5A5D63] mt-2">
                Manage your account information and preferences
              </p>
            </div>
            <div className="text-sm text-[#5A5D63] bg-white px-4 py-2 rounded-lg">
              {user.userType === "Agent"
                ? "Agent Account"
                : user.userType === "Landowners"
                ? "Landowner Account"
                : user.userType === "FieldAgent"
                ? "Field Agent Account"
                : ""}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: "profile", label: "Profile Details", icon: UserIcon },
              { id: "password", label: "Change Password", icon: LockIcon },
              {
                id: "account",
                label: "Account Settings",
                icon: AlertTriangleIcon,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#8DDB90] text-[#8DDB90]"
                    : "text-[#5A5D63] hover:text-[#09391C]"
                }`}
              >
                <tab.icon size={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))} 
          </div>
 
          <div className="p-6">
            {/* Profile Details Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Image Section */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                      {profileImagePreview || userProfile.profileImage ? (
                        <img
                          src={profileImagePreview || userProfile.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserIcon size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-[#8DDB90] text-white p-2 rounded-full cursor-pointer hover:bg-[#7BC87F] transition-colors">
                      <CameraIcon size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#09391C] mb-2">
                      Profile Picture
                    </h3>
                    <p className="text-sm text-[#5A5D63] mb-4">
                      Upload a profile picture to personalize your account
                    </p>
                    {profileImageFile && (
                      <button
                        onClick={handleUploadProfileImage}
                        className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Upload Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <form
                  onSubmit={profileFormik.handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#09391C] mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileFormik.values.firstName}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                      {profileFormik.touched.firstName &&
                        profileFormik.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {profileFormik.errors.firstName}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#09391C] mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileFormik.values.lastName}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                      {profileFormik.touched.lastName &&
                        profileFormik.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {profileFormik.errors.lastName}
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-[#09391C]">
                        Email Address
                      </label>
                      {!isEmailChangeRequested && (
                        <button
                          type="button"
                          onClick={() => setShowEmailChangeModal(true)}
                          className="text-[#8DDB90] hover:text-[#7BC87F] text-sm font-medium"
                        >
                          Request Change
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <MailIcon
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        name="email"
                        value={profileFormik.values.email}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                    {isEmailChangeRequested && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-blue-800 font-medium mb-1">
                              Email change request pending
                            </p>
                            <p className="text-xs text-blue-700">
                              Please check your new email for verification
                              instructions.
                            </p>
                          </div>
                          <button
                            onClick={handleCancelEmailChange}
                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {profileFormik.touched.email &&
                      profileFormik.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileFormik.errors.email}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileFormik.values.phoneNumber}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                    </div>
                    {profileFormik.touched.phoneNumber &&
                      profileFormik.errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileFormik.errors.phoneNumber}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPinIcon
                        size={20}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <textarea
                        name="address"
                        value={profileFormik.values.address}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                        placeholder="Enter your address"
                      />
                    </div>
                    {profileFormik.touched.address &&
                      profileFormik.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileFormik.errors.address}
                        </p>
                      )}
                  </div>


                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <SaveIcon size={16} />
                    {isUpdatingProfile ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#09391C] mb-2">
                    Change Password
                  </h3>
                  <p className="text-sm text-[#5A5D63] mb-6">
                    Update your password to keep your account secure
                  </p>
                </div>

                <form
                  onSubmit={passwordFormik.handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <LockIcon
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordFormik.values.currentPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOffIcon size={20} />
                        ) : (
                          <EyeIcon size={20} />
                        )}
                      </button>
                    </div>
                    {passwordFormik.touched.currentPassword &&
                      passwordFormik.errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordFormik.errors.currentPassword}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <LockIcon
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordFormik.values.newPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOffIcon size={20} />
                        ) : (
                          <EyeIcon size={20} />
                        )}
                      </button>
                    </div>
                    {passwordFormik.touched.newPassword &&
                      passwordFormik.errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordFormik.errors.newPassword}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#09391C] mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockIcon
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon size={20} />
                        ) : (
                          <EyeIcon size={20} />
                        )}
                      </button>
                    </div>
                    {passwordFormik.touched.confirmPassword &&
                      passwordFormik.errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordFormik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-[#8DDB90] hover:bg-[#7BC87F] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <LockIcon size={16} />
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#09391C] mb-2">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-[#5A5D63]">Account Type</p>
                      <p className="font-medium text-[#09391C]">
                        {userProfile.userType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#5A5D63]">Member Since</p>
                      <p className="font-medium text-[#09391C]">
                        {new Date(userProfile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#5A5D63]">Account Status</p>
                      <p className="font-medium text-green-600">
                        {userProfile.accountApproved
                          ? "Active"
                          : "Pending Approval"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#5A5D63]">Account ID</p>
                      <p className="font-medium text-[#09391C] text-xs">
                        {userProfile.accountId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Deletion Section */}
                <div className="border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangleIcon
                      size={24}
                      className="text-red-500 mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-600 mb-2">
                        Delete Account
                      </h3>

                      {!isDeletionRequested ? (
                        <>
                          <p className="text-sm text-[#5A5D63] mb-4">
                            Once you delete your account, there is no going
                            back. Please be certain. Your account will be
                            scheduled for deletion 7 days after confirmation.
                          </p>
                          <button
                            onClick={handleRequestAccountDeletion}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <Trash2Icon size={16} />
                            Request Account Deletion
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800 mb-2">
                              <strong>Account deletion scheduled</strong>
                            </p>
                            <p className="text-sm text-red-700">
                              Your account is scheduled to be deleted on{" "}
                              {deletionDate}. You can cancel this request at any
                              time before the deletion date.
                            </p>
                          </div>
                          <button
                            onClick={handleCancelAccountDeletion}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Cancel Deletion Request
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Change Modal */}
        {showEmailChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#09391C]">
                  Change Email Address
                </h3>
                <button
                  onClick={() => {
                    setShowEmailChangeModal(false);
                    setNewEmailRequest("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#5A5D63] mb-3">
                    Enter your new email address. You will receive a
                    verification email to confirm the change.
                  </p>
                  <p className="text-xs text-blue-600 mb-4">
                    Current email: {userProfile?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#09391C] mb-2">
                    New Email Address
                  </label>
                  <div className="relative">
                    <MailIcon
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={newEmailRequest}
                      onChange={(e) => setNewEmailRequest(e.target.value)}
                      placeholder="Enter new email address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Important:</strong> After submitting this request,
                    you will need to verify both your current and new email
                    addresses. Your login email will remain unchanged until
                    verification is complete.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEmailChangeModal(false);
                      setNewEmailRequest("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestEmailChange}
                    disabled={isRequestingEmailChange || !newEmailRequest}
                    className="flex-1 px-4 py-2 bg-[#8DDB90] text-white rounded-lg hover:bg-[#7BC87F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MailIcon size={16} />
                    {isRequestingEmailChange ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Deletion Confirmation Modal */}
        {showDeletionConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  Confirm Account Deletion
                </h3>
                <button
                  onClick={() => setShowDeletionConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-3">
                    <strong>Are you sure you want to delete your account?</strong>
                  </p>
                  <p className="text-sm text-red-700">
                    Once you delete your account, there is no going back. Your account will be permanently deleted in 7 days. You can cancel this request at any time before the deletion date.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> You will be able to cancel this deletion request within the next 7 days. After 7 days, your account and all associated data will be permanently removed.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeletionConfirmModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAccountDeletion}
                    disabled={isDeletionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2Icon size={16} />
                    {isDeletionLoading ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Preloaders */}
        <ProcessingRequest
          isVisible={isUpdatingProfile}
          title="Updating Profile"
          message="Please wait while we update your profile details..."
        />
        <ProcessingRequest
          isVisible={isUploadingProfileImage}
          title="Uploading Profile Picture"
          message="Please wait while we upload your profile picture..."
        />
      </div>
    </div>
  );
}
