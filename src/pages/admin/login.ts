import api from "@/utils/axiosConfig";

export const handleLogin = async (credentials: any) => {
	try {
		const response = await api.post("/admin/login", credentials);
		const { token } = response.data;
		localStorage.setItem("adminToken", token);
		// Redirect to admin dashboard
	} catch (error) {
		console.error("Login failed:", error);
	}
};

// 👇 Add a dummy React component to satisfy Next.js build
export default function EmptyLoginPage() {
	return null; // or <></>
}
