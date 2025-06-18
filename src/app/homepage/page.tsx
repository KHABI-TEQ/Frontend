/** @format */

"use client";
import React, { Fragment, Suspense, useEffect } from "react";
import Loading from "@/components/loading-component/loading";
import Section2 from "@/components/homepage/home_section2";
import SeeWhatOthers from "@/components/homepage/section2";
import Section3 from "@/components/homepage/section3";
import FAQs from "@/components/homepage/FAQs";
import Feedback from "@/components/homepage/feedback";
import HelpButton from "@/components/homepage/home_helpbutton";
import { useLoading } from "@/hooks/useLoading";
import HeroSection from "@/components/homepage/homepage_hero";
import Section1 from "@/components/homepage/home_section1";
import EmailVerification from "@/components/EmailVerification";
import AgentMarket from "@/components/homepage/agent_marketplace";
import { useRouter, useSearchParams } from "next/navigation";
import { URLS } from "@/utils/URLS";
import { GET_REQUEST } from "@/utils/requests";
import Cookies from "js-cookie";
import { useUserContext } from "@/context/user-context";
import HowItWorksSection from "@/components/homepage/how-it-works-section";
import ConnectBuyersSection from "@/components/homepage/connect-buyers-section";
import ClientTestimonials from "@/components/homepage/client-testimonials";
import Link from "next/link";
import { motion } from "framer-motion";
import Countdown from "../coming-soon-modal/page";
import Agent from "../agent/page";

/**
 * @Homepage - A function that returns the web homepage
 * @param - no parameters
 *
 * @returns - Homepage contents
 */
const Homepage = ({ isComingSoon }: { isComingSoon?: boolean }) => {
	//Simulating the loading page
	const isLoading = useLoading();

	const searchParams = useSearchParams();

	/**
	 * using the useRouter from the next/navigation to simulate between pages
	 */
	const router = useRouter();

	/**
	 * UserContextAPI to store users information that could be accessed
	 * globally in all the pages
	 */
	const { setUser } = useUserContext();

	useEffect(() => {
		if (searchParams && searchParams?.get("access_token")) {
			const url =
				URLS.BASE +
				URLS.user +
				URLS.verifyEmail +
				`?access_token=${searchParams?.get("access_token")}`;

			(async () => {
				await GET_REQUEST(url).then((response) => {
					if ((response as unknown as { id: string; token: string }).id) {
						Cookies.set("token", (response as unknown as { token: string }).token);

						const user = response as unknown as {
							id: string;
							email: string;
							password: string;
							lastName: string;
							firstName: string;
							phoneNumber: string;
							accountApproved: boolean;
							userType: string;
						};

						setUser(user);
						if (user.userType === "Landowners") {
							router.push("/auth/login");
						}
						if (user.userType === "Agent") {
							router.push("/agent/onboard");
						}
					}
				});
			})();
		}
	}, [router, searchParams, setUser]);

	/**
	 * if else statement to simulate the loading page for 3 secs then return the actual homepage
	 */
	if (isLoading) return <Loading />;

	return (
		<Fragment>
			<section className={`w-full filter ${isComingSoon && "blur-sm"}`}>
				<main className="w-full bg-[#EEF1F1]">
					{/**
					 * Hero Section Component ~ Takes no props
					 */}
					<HeroSection />
					{/**Details About website Componet ~ Takes no props */}
					<Section1 />
					{/**
					 * Why Khabi-Teq Is Your Trusted Real Estate Partner Component
					 * Takes no props
					 */}
					<Section2 />
					<div className="flex justify-center items-center">
						<div className="container min-h-[135px] flex md:flex-row flex-col gap-[10px] items-start py-[20px] md:items-center justify-between bg-[#093B6D] px-[20px] md:px-[30px]">
							<div className="flex flex-col gap-[10px]">
								<motion.h2
									initial={{ y: 10, opacity: 0 }}
									whileInView={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.2 }}
									viewport={{ once: true }}
									className="text-2xl md:text-3xl text-[#FFFFFF] font-bold">
									Find Your Ideal Property, Effortlessly
								</motion.h2>
								<motion.h3
									initial={{ y: 10, opacity: 0 }}
									whileInView={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.3 }}
									viewport={{ once: true }}
									className="text-lg md:text-xl font-bold text-[#FFFFFF]">
									Tell us what you need — we&apos;ll show you matching properties.
								</motion.h3>
							</div>
							<Link href={"/preference"}>
								<motion.button
									initial={{ y: 10, opacity: 0 }}
									whileInView={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.2 }}
									viewport={{ once: true }}
									type="button"
									className="h-[50px] lg:w-[275px] px-[12px] md:px-0 bg-[#8DDB90] text-base font-bold text-white">
									Submit Your Preference
								</motion.button>
							</Link>
						</div>
					</div>
					{/* <NewSection /> */}
					<HowItWorksSection />
					<SeeWhatOthers />
					<ConnectBuyersSection />
					<Section3
						isHomepage={true}
						isAgentPage={false}
						heading="Highlight of our real estate expertise"
						headingColor="#09391C"
					/>
					<FAQs isHomePage={true} />
					<ClientTestimonials />
					{/* <Feedback /> */}
					<HelpButton />
				</main>
			</section>
			<Suspense fallback={<Loading />}>
				<EmailVerification />
			</Suspense>
			{/* {viewImage && <ViewImage />} */}
		</Fragment>
	);
};

const HomepageWrapper = ({ isComingSoon }: { isComingSoon?: boolean }) => (
	<Suspense fallback={<Loading />}>
		<Homepage isComingSoon={isComingSoon} />
	</Suspense>
);

export default HomepageWrapper;
