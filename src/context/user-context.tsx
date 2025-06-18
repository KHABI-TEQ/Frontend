/** @format */

"use client";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

export interface User {
	accountApproved: boolean;
	_id?: string;
	id?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	selectedRegion?: string[];
	userType?: string;
	accountId?: string;
	address?: {
		localGovtArea: string;
		city: string;
		state: string;
		street: string;
	};
	agentType?: string;
	doc?: string;
	individualAgent?: {
		idNumber: string;
		typeOfId: string;
	};
	agentData?: {
		accountApproved: boolean;
		agentType: string;
	};
	companyAgent?: {
		companyName: string;
		companyRegNumber: string;
	};
}

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	logout: (callback?: () => void) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	const pathName = usePathname();
	const router = useRouter();

	const getAgent = async () => {
		const url = URLS.BASE + URLS.user + URLS.userProfile;
		const token =
			pathName && pathName?.includes("/admin")
				? Cookies.get("adminToken")
				: Cookies.get("token");

		if (!token) {
			if (pathName && pathName.includes("/admin")) {
				router.push("/admin/auth/login");
			} else if (pathName && !pathName.includes("/auth")) {
				router.push("/auth/login");
			}
			return;
		}

		await GET_REQUEST(url, token)
			.then((response) => {
				if (response?._id) {
					//console.log('User data:', response);
					setUser(response);
				} else {
					if (
						typeof response?.message === "string" &&
						(response.message.toLowerCase().includes("unauthorized") ||
							response.message.toLowerCase().includes("jwt") ||
							response.message.toLowerCase().includes("expired") ||
							response.message.toLowerCase().includes("malformed"))
					) {
						if (pathName && pathName.includes("/admin")) {
							Cookies.remove("adminToken");
							toast.error("Admin session expired, please login again");
							router.push("/admin/auth/login");
						} else {
							Cookies.remove("token");
							toast.error("Session expired, please login again");
							router.push("/auth/login");
						}
					}
				}
			})
			.catch((error) => {
				console.log("Error", error);
				if (pathName && pathName.includes("/admin")) {
					router.push("/admin/auth/login");
				} else {
					router.push("/auth/login");
				}
			});
	};

	const logout = async (callback?: () => void) => {
		try {
			console.log("Starting logout process...");

			if (!router) {
				console.error("Router is not initialized");
				throw new Error("Router is not initialized");
			}

			// Clear cookies
			console.log("Clearing cookies...");
			Cookies.remove("token");
			Cookies.remove("adminToken");

			// Clear session storage
			console.log("Clearing session storage...");
			sessionStorage.removeItem("user");

			// Clear local storage
			console.log("Clearing local storage...");
			localStorage.removeItem("email");
			localStorage.removeItem("fullname");
			localStorage.removeItem("phoneNumber");
			localStorage.removeItem("token");

			// Clear user context
			console.log("Clearing user context...");
			setUser(null);

			console.log("Showing success toast...");
			toast.success("Logged out successfully");

			console.log("Redirecting to login page...");
			if (pathName && pathName.includes("/admin")) {
				await router.push("/admin/auth/login");
			} else {
				await router.push("/auth/login");
			}

			if (callback) {
				console.log("Executing callback...");
				await callback();
			}

			console.log("Logout process completed");
		} catch (error) {
			console.error("Error during logout:", error);
			toast.error("Error during logout");
			throw error;
		}
	};

	useEffect(() => {
		const token =
			pathName && pathName.includes("/admin")
				? Cookies.get("adminToken")
				: Cookies.get("token");
		if (token) {
			getAgent();
		} else {
			if (pathName && pathName.includes("/admin")) {
				if (pathName && !pathName.includes("/auth"))
					router.push("/admin/auth/login");
			} else if (pathName && !pathName.includes("/auth")) {
				router.push("/auth/login");
			}
		}
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser, logout }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUserContext must be used within a UserProvider");
	}
	return context;
};
