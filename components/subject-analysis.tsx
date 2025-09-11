"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"
import { User, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { useData } from "../contexts/data-context"

const subjectGroups = {
  "Toán - Khoa học cơ bản": ["Toán cao cấp", "Xác suất thống kê", "Toán rời rạc", "Đại số tuyến tính"],
  "Lập trình": ["Lập trình C++", "Java", "Python", "JavaScript", "Cấu trúc dữ liệu"],
  "Hệ thống": ["Hệ điều hành", "Mạng máy tính", "Kiến trúc máy tính", "Bảo mật"],
  "Phần mềm": ["Kỹ thuật phần mềm", "Cơ sở dữ liệu", "Phân tích thiết kế", "Kiểm thử"],
  "Chuyên ngành": ["Trí tuệ nhân tạo", "Machine Learning", "Web Development", "Mobile App"],
}

const getScoreColor = (score: number) => {
  if (score >= 8.5) return "hsl(var(--chart-1))" // Green - Strong
  if (score >= 7.0) return "hsl(var(--chart-2))" // Orange - Medium
  return "hsl(var(--chart-3))" // Red - Weak
}

const getScoreStatus = (score: number) => {
  if (score >= 8.5) return { label: "Mạnh", variant: "default" as const, icon: TrendingUp }
  if (score >= 7.0) return { label: "Trung bình", variant: "secondary" as const, icon: Minus }
  return { label: "Yếu", variant: "destructive" as const, icon: TrendingDown }
}

export function SubjectAnalysis() {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const { studentData, careerData } = useData()

  const students = studentData.map((student, index) => ({
    id: `student-${index}`,
    name: student["Họ và tên"] || student["Họ tên"] || student["Tên sinh viên"] || `Sinh viên ${index + 1}`,
    data: student,
  }))

  const currentStudent = selectedStudent ? students.find((s) => s.id === selectedStudent) : null

  const getActualSubjects = () => {
    if (studentData.length === 0) return []

    const firstStudent = studentData[0]
    return Object.keys(firstStudent).filter(
      (key) =>
        key !== "Mã SV" &&
        key !== "Họ và tên" &&
        key !== "Họ tên" &&
        key !== "Tên sinh viên" &&
        key !== "MSSV" &&
        key !== "Xếp \r\noại" &&
        key !== "TBCHT H10" &&
        !key.includes("Xếp") &&
        typeof firstStudent[key] !== "undefined",
    )
  }

  const actualSubjects = getActualSubjects()

  const createDynamicGroups = () => {
    const subjects = getActualSubjects()
    const groups: { [key: string]: string[] } = {}

    subjects.forEach((subject) => {
      let groupName = "Khác"

      if (subject.includes("Triết học") || subject.includes("Kinh tế chính trị")) {
        groupName = "Lý luận chính trị"
      } else if (subject.includes("lập trình") || subject.includes("Back-End") || subject.includes("Front-End")) {
        groupName = "Lập trình"
      } else if (subject.includes("hệ thống") || subject.includes("an toàn") || subject.includes("bảo mật")) {
        groupName = "Hệ thống & Bảo mật"
      } else if (subject.includes("kỹ năng") || subject.includes("mềm")) {
        groupName = "Kỹ năng mềm"
      } else if (subject.includes("phân tích") || subject.includes("thiết kế")) {
        groupName = "Phân tích & Thiết kế"
      }

      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(subject)
    })

    return groups
  }

  const dynamicSubjectGroups = createDynamicGroups()

  const getGroupAverages = () => {
    if (!currentStudent) return []

    return Object.entries(dynamicSubjectGroups)
      .map(([groupName, subjects]) => {
        const scores = subjects
          .map((subject) => {
            const score = currentStudent.data[subject]
            return typeof score === "number" ? score : Number.parseFloat(score) || 0
          })
          .filter((score) => score > 0)

        if (scores.length === 0) return { group: groupName, score: 0, fullMark: 10 }

        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
        return {
          group: groupName,
          score: Number(average.toFixed(1)),
          fullMark: 10,
        }
      })
      .filter((group) => group.score > 0)
  }

  const getDetailedScores = () => {
    if (!currentStudent) return []

    return actualSubjects
      .map((subject) => {
        const score = currentStudent.data[subject]
        const numScore = typeof score === "number" ? score : Number.parseFloat(score) || 0

        // Find which group this subject belongs to
        let groupName = "Khác"
        for (const [group, subjects] of Object.entries(dynamicSubjectGroups)) {
          if (subjects.includes(subject)) {
            groupName = group
            break
          }
        }

        return {
          subject,
          group: groupName,
          score: numScore,
        }
      })
      .filter((item) => item.score > 0)
  }

  const getOverallAverage = () => {
    if (!currentStudent) return 0

    const allScores = actualSubjects
      .map((subject) => {
        const score = currentStudent.data[subject]
        return typeof score === "number" ? score : Number.parseFloat(score) || 0
      })
      .filter((score) => score > 0)

    if (allScores.length === 0) return 0
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length
  }

  const getStrongestSubject = () => {
    if (!currentStudent) return { subject: "", score: 0 }

    let maxScore = 0
    let maxSubject = ""

    actualSubjects.forEach((subject) => {
      const score = currentStudent.data[subject]
      const numScore = typeof score === "number" ? score : Number.parseFloat(score) || 0
      if (numScore > maxScore) {
        maxScore = numScore
        maxSubject = subject
      }
    })

    return { subject: maxSubject, score: maxScore }
  }

  const getWeakestSubject = () => {
    if (!currentStudent) return { subject: "", score: 0 }

    let minScore = 10
    let minSubject = ""

    actualSubjects.forEach((subject) => {
      const score = currentStudent.data[subject]
      const numScore = typeof score === "number" ? score : Number.parseFloat(score) || 0
      if (numScore > 0 && numScore < minScore) {
        minScore = numScore
        minSubject = subject
      }
    })

    return { subject: minSubject, score: minScore }
  }

  const groupAverages = getGroupAverages()
  const detailedScores = getDetailedScores()
  const overallAverage = getOverallAverage()
  const strongestSubject = getStrongestSubject()
  const weakestSubject = getWeakestSubject()

  if (studentData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold">Phân tích học phần</h1>
          <p className="text-muted-foreground">Phân tích điểm mạnh và điểm yếu của sinh viên theo từng nhóm học phần</p>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Vui lòng tải lên dữ liệu sinh viên để xem phân tích</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Phân tích học phần</h1>
        <p className="text-muted-foreground">Phân tích điểm mạnh và điểm yếu của sinh viên theo từng nhóm học phần</p>
      </div>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Chọn sinh viên</span>
          </CardTitle>
          <CardDescription>Chọn sinh viên để xem phân tích chi tiết điểm số</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Chọn sinh viên để phân tích" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {currentStudent && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Điểm trung bình chung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{overallAverage.toFixed(1)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Học phần mạnh nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-chart-1">{strongestSubject.subject}</div>
                <div className="text-sm text-muted-foreground">Điểm: {strongestSubject.score.toFixed(1)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cần cải thiện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-chart-3">{weakestSubject.subject}</div>
                <div className="text-sm text-muted-foreground">Điểm: {weakestSubject.score.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Biểu đồ radar - Điểm theo nhóm học phần</CardTitle>
                <CardDescription>Tổng quan điểm mạnh và yếu theo từng lĩnh vực</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={groupAverages}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="group" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Điểm số"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Biểu đồ cột - Điểm trung bình theo nhóm</CardTitle>
                <CardDescription>So sánh điểm số giữa các nhóm học phần</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={groupAverages} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="group" angle={-45} textAnchor="end" height={80} fontSize={11} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {groupAverages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Scores Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Chi tiết điểm số theo học phần</CardTitle>
              <CardDescription>Danh sách đầy đủ điểm số các học phần với đánh giá</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhóm học phần</TableHead>
                      <TableHead>Học phần</TableHead>
                      <TableHead className="text-center">Điểm số</TableHead>
                      <TableHead className="text-center">Đánh giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedScores.map((item, index) => {
                      const status = getScoreStatus(item.score)
                      const StatusIcon = status.icon
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.group}</TableCell>
                          <TableCell>{item.subject}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold" style={{ color: getScoreColor(item.score) }}>
                              {item.score.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={status.variant} className="flex items-center space-x-1 w-fit mx-auto">
                              <StatusIcon className="h-3 w-3" />
                              <span>{status.label}</span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedStudent && studentData.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Vui lòng chọn sinh viên để xem phân tích chi tiết</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
