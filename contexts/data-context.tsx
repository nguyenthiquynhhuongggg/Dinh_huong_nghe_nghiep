"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface StudentRecord {
  ID: string
  "Họ tên": string
  [subject: string]: string | number
}

export interface CareerRecord {
  "Nghề nghiệp": string
  "Kỹ năng": string
  "Học phần liên quan": string
  "Mức lương"?: string
  [key: string]: string | undefined
}

export interface AICareerSuggestion {
  career: string
  matchPercentage: number
  reason: string
  relatedSubjects: string[]
  improvementSuggestions: string
}

export interface AIStudentAnalysis {
  studentId: string
  studentName: string
  strengths: string[]
  weaknesses: string[]
  careerSuggestions: AICareerSuggestion[]
}

export interface AIAnalysisResult {
  analysis: AIStudentAnalysis[]
  overallInsights: string
  rawText?: string
}

interface DataContextType {
  studentData: StudentRecord[]
  careerData: CareerRecord[]
  setStudentData: (data: StudentRecord[]) => void
  setCareerData: (data: CareerRecord[]) => void
  isDataLoaded: boolean
  aiAnalysis: AIAnalysisResult | null
  setAiAnalysis: (analysis: AIAnalysisResult | null) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  analysisError: string | null
  setAnalysisError: (error: string | null) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [studentData, setStudentData] = useState<StudentRecord[]>([])
  const [careerData, setCareerData] = useState<CareerRecord[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const isDataLoaded = studentData.length > 0

  return (
    <DataContext.Provider
      value={{
        studentData,
        careerData,
        setStudentData,
        setCareerData,
        isDataLoaded,
        aiAnalysis,
        setAiAnalysis,
        isAnalyzing,
        setIsAnalyzing,
        analysisError,
        setAnalysisError,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
