import React, { Suspense } from "react";
import Register from "./Register";

export default function Page() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<Register />
		</Suspense>
	);
}
