"use strict";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { URLS } from "@/utils/URLS";
import { GET_REQUEST } from "@/utils/requests";
import Cookies from "js-cookie";
import { useUserContext } from "@/context/user-context";
import toast from "react-hot-toast";

const EmailVerification = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { setUser } = useUserContext();

	useEffect(() => {
		if (searchParams?.get("access_token")) {
			const url =
				URLS.BASE +
				`?access_token=${searchParams?.get("access_token")}`;

			(async () => {
				try {
					const response = await GET_REQUEST(url);
					console.log("response from email verification", response);

					const data = response?.data as any;
					if (response && data?.token) {
						Cookies.set("token", data.token);
						setUser(data);

						// Redirect based on user type
						if (data?.userType === "Landowners") {
							toast.success(
								"Email verified successfully! Redirecting to your dashboard..."
							);
							router.push("/dashboard");
						} else if (data?.userType === "Agent") {
							toast.success(
								"Email verified successfully! Please complete your profile."
							);
							router.push("/agent-onboard");
						} else {
							router.push("/auth/login");
						}
					} else {
						throw new Error("Invalid verification response");
					}
				} catch (error) {
					console.error("Verification error:", error);
					toast.error("Email verification failed. Please try again.");
					router.push("/auth/login");
				}
			})();
		}
	}, [router, searchParams, setUser]);

	return null;
};

export default EmailVerification;
