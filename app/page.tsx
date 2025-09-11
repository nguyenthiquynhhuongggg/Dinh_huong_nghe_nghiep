"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DataInput } from "@/components/data-input"
import { SubjectAnalysis } from "@/components/subject-analysis"
import { CareerSuggestions } from "@/components/career-suggestions"
import { CareerLookup } from "@/components/career-lookup"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "data-input":
        return <DataInput />
      case "analysis":
        return <SubjectAnalysis />
      case "career-suggestions":
        return <CareerSuggestions />
      case "career-lookup":
        return <CareerLookup />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-6">{renderContent()}</main>
    </div>
  )
}
