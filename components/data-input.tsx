"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useData } from "../contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Brain, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileData {
  name: string
  data: any[]
  headers: string[]
}

export function DataInput() {
  const {
    setStudentData,
    setCareerData,
    setAiAnalysis,
    isAnalyzing,
    setIsAnalyzing,
    analysisError,
    setAnalysisError,
    aiAnalysis,
  } = useData()
  const [localStudentData, setLocalStudentData] = useState<FileData | null>(null)
  const [localCareerData, setLocalCareerData] = useState<FileData | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<{
    student: "idle" | "success" | "error"
    career: "idle" | "success" | "error"
  }>({
    student: "idle",
    career: "idle",
  })

  const parseStudentExcel = async (file: File): Promise<{ headers: string[]; data: any[] }> => {
    const XLSX = await import("xlsx")
    const reader = new FileReader()

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            raw: false, // Convert numbers to strings for consistent handling
          })

          console.log("[v0] Raw Excel data:", jsonData.slice(0, 3))

          if (jsonData.length < 2) return resolve({ headers: [], data: [] })

          let headerRowIndex = 0
          let headerRow: string[] = []

          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i] as any[]
            const nonEmptyCount = row.filter((cell) => cell && String(cell).trim()).length
            if (nonEmptyCount >= 4) {
              // At least 4 columns with data
              headerRow = row.map((h) => String(h || "").trim())
              headerRowIndex = i
              break
            }
          }

          console.log("[v0] Found header row at index:", headerRowIndex, headerRow)

          const cleanHeaders = headerRow.filter((h, index) => {
            const trimmed = h.trim()
            // Keep basic info columns and score columns
            return trimmed && (index < 4 || /\d/.test(trimmed) || trimmed.includes("điểm") || trimmed.includes("TBC"))
          })

          console.log("[v0] Clean headers:", cleanHeaders)

          const processedData = jsonData
            .slice(headerRowIndex + 1)
            .map((row: any[], rowIndex) => {
              const student: any = {}

              headerRow.forEach((header, index) => {
                const cellValue = String(row[index] || "").trim()
                const cleanHeader = header.trim()

                if (!cleanHeader) return

                if (index >= 4) {
                  // Score columns
                  const numericScore = Number.parseFloat(cellValue)
                  student[cleanHeader] = isNaN(numericScore) ? 0 : numericScore
                } else {
                  // Basic info columns
                  student[cleanHeader] = cellValue
                }
              })

              return student
            })
            .filter((student) => {
              const hasId = Object.values(student).some(
                (val) => String(val).match(/^\d{8,}/), // Student ID pattern
              )
              const hasName = Object.values(student).some(
                (val) => String(val).length > 2 && /[a-zA-ZÀ-ỹ]/.test(String(val)),
              )
              return hasId || hasName
            })

          console.log("[v0] Processed student data sample:", processedData.slice(0, 2))
          resolve({ headers: cleanHeaders, data: processedData })
        } catch (error) {
          console.error("[v0] Error parsing student Excel:", error)
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsArrayBuffer(file)
    })
  }

  const parseFile = async (file: File, type: "student" | "career"): Promise<{ headers: string[]; data: any[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = e.target?.result

          if (file.name.endsWith(".csv")) {
            // Parse CSV
            const text = data as string
            const lines = text.split("\n").filter((line) => line.trim())
            if (lines.length === 0) return resolve({ headers: [], data: [] })

            const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
            const parsedData = lines.slice(1).map((line) => {
              const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
              const row: any = {}
              headers.forEach((header, index) => {
                row[header] = values[index] || ""
              })
              return row
            })

            resolve({ headers, data: parsedData })
          } else {
            if (type === "student") {
              const result = await parseStudentExcel(file)
              resolve(result)
            } else {
              // Parse Excel using xlsx library for career data
              const XLSX = await import("xlsx")
              const workbook = XLSX.read(data, { type: "array" })
              const sheetName = workbook.SheetNames[0]
              const worksheet = workbook.Sheets[sheetName]
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
                raw: false,
              })

              console.log("[v0] Career Excel raw data:", jsonData.slice(0, 3))

              if (jsonData.length === 0) return resolve({ headers: [], data: [] })

              let headerRow: string[] = []
              let dataStartIndex = 1

              for (let i = 0; i < Math.min(3, jsonData.length); i++) {
                const row = jsonData[i] as any[]
                const hasCareerInfo = row.some(
                  (cell) =>
                    String(cell).toLowerCase().includes("nghề") ||
                    String(cell).toLowerCase().includes("job") ||
                    String(cell).toLowerCase().includes("career"),
                )
                if (hasCareerInfo) {
                  headerRow = row.map((h) => String(h || "").trim())
                  dataStartIndex = i + 1
                  break
                }
              }

              if (headerRow.length === 0) {
                headerRow = (jsonData[0] as any[]).map((h) => String(h || "").trim())
              }

              console.log("[v0] Career headers:", headerRow)

              const parsedData = jsonData
                .slice(dataStartIndex)
                .map((row: any) => {
                  const rowData: any = {}
                  headerRow.forEach((header, index) => {
                    if (header) {
                      rowData[header] = String(row[index] || "").trim()
                    }
                  })
                  return rowData
                })
                .filter((row) => Object.values(row).some((val) => val !== ""))

              console.log("[v0] Career data sample:", parsedData.slice(0, 2))
              resolve({ headers: headerRow.filter((h) => h), data: parsedData })
            }
          }
        } catch (error) {
          console.error("[v0] Error parsing file:", error)
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const analyzeWithAI = async (studentData: any[], careerData: any[]) => {
    if (studentData.length === 0) return

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      console.log("[v0] Starting AI analysis with data:", {
        studentCount: studentData.length,
        careerCount: careerData.length,
      })

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentData: studentData.slice(0, 20), // Limit to 20 students for API efficiency
          careerData,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] AI analysis result:", result)

      if (result.success && result.analysis) {
        setAiAnalysis(result.analysis)
      } else {
        throw new Error(result.error || "Không thể phân tích dữ liệu")
      }
    } catch (error) {
      console.error("[v0] AI analysis error:", error)
      setAnalysisError(error instanceof Error ? error.message : "Lỗi không xác định")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = useCallback(
    async (file: File, type: "student" | "career") => {
      try {
        const { headers, data } = await parseFile(file, type)

        const fileData: FileData = {
          name: file.name,
          data: data.slice(0, 100), // Limit preview to 100 rows
          headers,
        }

        if (type === "student") {
          setLocalStudentData(fileData)
          setStudentData(data)
          setUploadStatus((prev) => ({ ...prev, student: "success" }))

          if (data.length > 0) {
            const currentCareerData = localCareerData?.data || []
            await analyzeWithAI(data, currentCareerData)
          }
        } else {
          setLocalCareerData(fileData)
          setCareerData(data)
          setUploadStatus((prev) => ({ ...prev, career: "success" }))
        }
      } catch (error) {
        console.error("[v0] Error parsing file:", error)
        setUploadStatus((prev) => ({
          ...prev,
          [type]: "error",
        }))
      }
    },
    [setStudentData, setCareerData, localCareerData],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "student" | "career") => {
      e.preventDefault()
      setDragOver(null)

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]

      if (
        file &&
        (file.type === "text/csv" ||
          file.name.endsWith(".csv") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel")
      ) {
        handleFileUpload(file, type)
      }
    },
    [handleFileUpload],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "student" | "career") => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, type)
    }
  }

  const clearData = (type: "student" | "career") => {
    if (type === "student") {
      setLocalStudentData(null)
      setStudentData([])
      setUploadStatus((prev) => ({ ...prev, student: "idle" }))
    } else {
      setLocalCareerData(null)
      setCareerData([])
      setUploadStatus((prev) => ({ ...prev, career: "idle" }))
    }
  }

  const UploadArea = ({
    type,
    title,
    description,
  }: { type: "student" | "career"; title: string; description: string }) => {
    const data = type === "student" ? localStudentData : localCareerData
    const status = uploadStatus[type]

    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragOver === type ? "border-primary bg-primary/5" : "border-border",
                "hover:border-primary/50 hover:bg-primary/5",
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(type)
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, type)}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Kéo thả file Excel/CSV vào đây hoặc</p>
                <Label htmlFor={`file-${type}`}>
                  <Button variant="outline" className="cursor-pointer bg-transparent">
                    Chọn file
                  </Button>
                  <Input
                    id={`file-${type}`}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, type)}
                  />
                </Label>
                <p className="text-xs text-muted-foreground">Hỗ trợ file Excel (.xlsx, .xls) và CSV</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-chart-1" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-chart-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.data.length} dòng, {data.headers.length} cột
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => clearData(type)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {status === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    File đã được tải lên thành công và dữ liệu đã được lưu vào hệ thống.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const DataPreview = ({ data, title }: { data: FileData; title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-heading">{title}</CardTitle>
      <CardDescription>
        Hiển thị {data.data.length} dòng dữ liệu
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              {data.headers.map((header, index) => (
                <TableHead key={index} className="whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row, index) => (
              <TableRow key={index}>
                {data.headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex} className="whitespace-nowrap">
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Nhập dữ liệu</h1>
        <p className="text-muted-foreground">
          Tải lên dữ liệu điểm số sinh viên và thông tin nghề nghiệp (Excel/CSV) để bắt đầu phân tích với AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadArea
          type="student"
          title="Dữ liệu điểm số sinh viên"
          description="File Excel hoặc CSV chứa thông tin sinh viên và điểm số các học phần"
        />

        <UploadArea
          type="career"
          title="Dữ liệu nghề nghiệp"
          description="File Excel hoặc CSV chứa thông tin nghề nghiệp và kỹ năng liên quan"
        />
      </div>

      {/* AI Analysis Status */}
      {(isAnalyzing || aiAnalysis || analysisError) && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Phân tích AI</span>
            </CardTitle>
            <CardDescription>Sử dụng Google Gemini để phân tích dữ liệu và đưa ra gợi ý nghề nghiệp</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Đang phân tích dữ liệu với AI Gemini... Vui lòng đợi trong giây lát.
                </AlertDescription>
              </Alert>
            )}

            {analysisError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Lỗi phân tích AI: {analysisError}</AlertDescription>
              </Alert>
            )}

            {aiAnalysis && !isAnalyzing && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Phân tích AI hoàn thành! Đã phân tích {aiAnalysis.analysis?.length || 0} sinh viên. Xem kết quả chi
                  tiết trong phần "Gợi ý nghề nghiệp".
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Previews */}
      <div className="space-y-6">
        {localStudentData && <DataPreview data={localStudentData} title="Preview: Dữ liệu điểm số sinh viên" />}
        {localCareerData && <DataPreview data={localCareerData} title="Preview: Dữ liệu nghề nghiệp" />}
      </div>

      {/* Sample Data Format */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Định dạng file điểm số sinh viên</CardTitle>
            <CardDescription>Cấu trúc dữ liệu mẫu cho file Excel/CSV điểm số</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="space-y-1">
                <div>Mã SV | Họ và tên | Lớp | Ngày sinh | [Môn học] | ...</div>
                <div>Hệ thống tự động nhận diện cột "Số" cho điểm của từng môn</div>
                <div>Hỗ trợ cấu trúc Excel phức tạp với nhiều cột con</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Định dạng file nghề nghiệp</CardTitle>
            <CardDescription>Cấu trúc dữ liệu mẫu cho file Excel/CSV nghề nghiệp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="space-y-1">
                <div>Nghề nghiệp,Kỹ năng,Học phần liên quan,Mức lương</div>
                <div>Lập trình viên Full-stack,Java;Python;React,Lập trình;CSDL,15-25tr</div>
                <div>Chuyên viên phân tích dữ liệu,SQL;Python;R,Toán;Thống kê,12-20tr</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
