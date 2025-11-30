/** @format */

"use client";
import React, { Fragment, useEffect } from "react";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";

const Agent = () => {
  //Simulating the loading page
  const isLoading = useLoading();
  const router = useRouter();

  const { user } = useUserContext();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (isLoading) return <Loading />;

  return (
    <Fragment>
      
    </Fragment>
  );
};

export default Agent;
