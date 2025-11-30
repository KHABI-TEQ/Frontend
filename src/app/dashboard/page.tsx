"use client";

import { useUserContext } from "@/context/user-context";
import Agent from "./agent";
import Landlord from "./landlord";
import FieldAgent from "./field-agent";

export default function Dashboard() {
  const { user } = useUserContext();

  if (!user) return null;

  return (
    <>
      {user.userType === "Agent" && <Agent />}
      {user.userType === "Landowners" && <Landlord />}
      {user.userType === "FieldAgent" && <FieldAgent />}
    </>
  );
}
