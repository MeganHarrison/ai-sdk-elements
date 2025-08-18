// import Calendar from "@/components/calendar/Calendar";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Calendar" /> */}
      {/* <Calendar /> */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">Calendar Page</h1>
        <p>Calendar component is not yet implemented.</p>
      </div>
    </div>
  );
}