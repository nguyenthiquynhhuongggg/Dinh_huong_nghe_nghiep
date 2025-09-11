"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, Target, TrendingUp, BookOpen, AlertCircle } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

const subjectScores = [
  { subject: "Toán học", score: 8.5 },
  { subject: "Lập trình", score: 9.2 },
  { subject: "Cơ sở dữ liệu", score: 7.8 },
  { subject: "Mạng máy tính", score: 8.1 },
  { subject: "Kỹ thuật phần mềm", score: 8.7 },
  { subject: "Trí tuệ nhân tạo", score: 7.5 },
]

function getLevel(score: number) {
  if (score >= 8.0) return { label: "Mạnh", color: "bg-green-500" }
  if (score >= 6.5) return { label: "Trung bình", color: "bg-yellow-500" }
  return { label: "Yếu", color: "bg-red-500" }
}

const trendData = [
  { month: "T1", avgScore: 7.2 },
  { month: "T2", avgScore: 7.5 },
  { month: "T3", avgScore: 7.8 },
  { month: "T4", avgScore: 8.1 },
  { month: "T5", avgScore: 8.3 },
  { month: "T6", avgScore: 8.5 },
]

export function DashboardOverview() {
  const { studentData, careerData, isDataLoaded } = useData()
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)

  const totalStudents = studentData.length
  const totalCareers = careerData.length

  const calculateAverageScore = () => {
    if (studentData.length === 0) return 0
    // Lấy tất cả các cột điểm (loại bỏ cột không phải điểm)
    const subjects = Object.keys(studentData[0]).filter(
      (key) =>
        key !== "ID" &&
        key !== "Mã SV" &&
        key !== "Họ tên" &&
        key !== "Tên" &&
        key !== "Họ và tên" &&
        !isNaN(Number(studentData[0][key]))
    )
    let totalScore = 0
    let totalCount = 0
    studentData.forEach((student) => {
      subjects.forEach((subject) => {
        const score = Number(student[subject])
        if (!isNaN(score)) {
          totalScore += score
          totalCount++
        }
      })
    })
    return totalCount > 0 ? (totalScore / totalCount).toFixed(2) : 0
  }

  const generateSubjectScores = () => {
    if (studentData.length === 0) return subjectScores
    // Lấy các cột điểm (loại bỏ cột không phải điểm)
    const subjects = Object.keys(studentData[0]).filter(
      (key) =>
        key !== "ID" &&
        key !== "Mã SV" &&
        key !== "Họ tên" &&
        key !== "Tên" &&
        key !== "Họ và tên" &&
        !isNaN(Number(studentData[0][key]))
    )
    return subjects.map((subject) => {
      const scores = studentData.map((student) => Number(student[subject])).filter((score) => !isNaN(score))
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      return {
        subject: subject.length > 15 ? subject.substring(0, 15) + "..." : subject,
        score: Number(avgScore.toFixed(2)),
      }
    })

  }  
  const realSubjectScores = generateSubjectScores()
  const averageScore = calculateAverageScore()

  if (!isDataLoaded) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Chưa có dữ liệu để hiển thị. Vui lòng tải lên dữ liệu điểm số sinh viên và nghề nghiệp trong mục "Nhập dữ liệu".
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng sinh viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
            </CardContent>
          </Card>
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nghề được gợi ý</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
            </CardContent>
          </Card>
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm TB chung</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
            </CardContent>
          </Card>
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Học phần</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards with real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sinh viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Từ dữ liệu đã tải lên</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nghề được gợi ý</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalCareers}</div>
            <p className="text-xs text-muted-foreground">Nghề nghiệp có sẵn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm TB chung</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{averageScore}</div>
            <p className="text-xs text-muted-foreground">Trung bình tất cả học phần</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học phần</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{realSubjectScores.length}</div>
            <p className="text-xs text-muted-foreground">Đã được phân tích</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts with real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Điểm trung bình theo học phần</CardTitle>
            <CardDescription>Tổng quan điểm số các học phần từ dữ liệu thực</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={realSubjectScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Xu hướng điểm số</CardTitle>
            <CardDescription>Biến động điểm trung bình theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[6, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bảng dữ liệu điểm số sinh viên với nút phân tích AI từng dòng */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Dữ liệu điểm số sinh viên</CardTitle>
          <CardDescription>
            Hiển thị {studentData.length} dòng dữ liệu sinh viên đã tải lên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  {studentData[0] &&
                    Object.keys(studentData[0]).map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  <th className="border px-2 py-1 text-left">Phân tích AI</th>
                </tr>
              </thead>
              <tbody>
                {studentData.map((student, idx) => (
                  <tr key={idx}>
                    {Object.keys(student).map((key) => (
                      <td key={key} className="border px-2 py-1">{student[key]}</td>
                    ))}
                    <td className="border px-2 py-1">
                      {analysisResults[idx] ? (
                        <div>
                          <div>
                            <b>Thế mạnh:</b> {analysisResults[idx].strengths?.join(", ") || "Không có"}
                          </div>
                          <div>
                            <b>Điểm yếu:</b> {analysisResults[idx].weaknesses?.join(", ") || "Không có"}
                          </div>
                          <div>
                            <b>Gợi ý nghề:</b>
                            <ul className="list-disc ml-4">
                              {analysisResults[idx].careerSuggestions?.map((sug: any, i: number) => (
                                <li key={i}>
                                  <b>{sug.career}</b> ({sug.matchPercentage}%)
                                  <br />
                                  <i>Lý do:</i> {sug.reason}
                                  <br />
                                  <i>Lời khuyên:</i> {sug.improvementTips}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded"
                          disabled={loadingIdx === idx}
                          onClick={async () => {
                            setLoadingIdx(idx)
                            const res = await fetch("/api/analyze", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                studentData: [student],
                                careerData,
                              }),
                            })
                            const data = await res.json()
                            setAnalysisResults((prev: any[]) => {
                              const newResults = [...prev]
                              newResults[idx] = data.analysis?.analysis?.[0] || null
                              return newResults
                            })
                            setLoadingIdx(null)
                          }}
                        >
                          {loadingIdx === idx ? "Đang phân tích..." : "Phân tích"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bảng dữ liệu nghề nghiệp */}-
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Dữ liệu nghề nghiệp</CardTitle>
          <CardDescription>
            Hiển thị {careerData.length} dòng dữ liệu nghề nghiệp đã tải lên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  {careerData[0] &&
                    Object.keys(careerData[0]).map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {careerData.map((career, idx) => (
                  <tr key={idx}>
                    {Object.keys(career).map((key) => (
                      <td key={key} className="border px-2 py-1">{career[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Hoạt động gần đây</CardTitle>
          <CardDescription>Các phân tích và gợi ý mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Đã tải lên dữ liệu {totalStudents} sinh viên</p>
                <p className="text-xs text-muted-foreground">Vừa xong</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Cập nhật {totalCareers} nghề nghiệp trong hệ thống</p>
                <p className="text-xs text-muted-foreground">Vừa xong</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Hệ thống sẵn sàng cho phân tích và gợi ý</p>
                <p className="text-xs text-muted-foreground">Vừa xong</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}