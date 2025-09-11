"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lightbulb, TrendingUp, BookOpen, DollarSign, MapPin, Clock, Users, AlertCircle } from "lucide-react"
import { useData } from "../contexts/data-context"

const getMatchColor = (percentage: number) => {
  if (percentage >= 80) return "hsl(var(--chart-1))" // Green
  if (percentage >= 60) return "hsl(var(--chart-2))" // Orange
  return "hsl(var(--chart-3))" // Red
}

const getMatchLabel = (percentage: number) => {
  if (percentage >= 80) return "Rất phù hợp"
  if (percentage >= 60) return "Phù hợp"
  return "Ít phù hợp"
}

const predefinedCareers = [
  {
    id: 1,
    title: "Lập trình viên Full-stack",
    description: "Phát triển ứng dụng web từ frontend đến backend",
    requiredSkills: ["JavaScript", "React", "Node.js", "Database", "Git"],
    relatedSubjects: ["Thiết kế, lập trình", "Nhập môn kế toán", "Phân tích, môn thể chất"],
    salaryRange: "15-30 triệu VNĐ",
    workEnvironment: "Văn phòng, remote work",
    careerPath: "Junior → Senior → Tech Lead → Engineering Manager",
    jobDemand: "Rất cao",
    workingHours: "8-9 giờ/ngày",
    teamSize: "5-10 người",
    advantages: ["Mức lương cao", "Cơ hội phát triển tốt", "Làm việc linh hoạt", "Học hỏi công nghệ mới"],
    challenges: ["Áp lực deadline", "Cần cập nhật kiến thức liên tục", "Debugging phức tạp"],
  },
  {
    id: 2,
    title: "Chuyên viên Kế toán",
    description: "Quản lý tài chính và kế toán cho doanh nghiệp",
    requiredSkills: ["Excel", "Kế toán", "Thuế", "Phân tích tài chính", "ERP"],
    relatedSubjects: ["Nhập môn kế toán", "Kinh tế chính trị Mác-Lênin", "Phân tích, môn thể chất"],
    salaryRange: "8-18 triệu VNĐ",
    workEnvironment: "Văn phòng, công ty",
    careerPath: "Kế toán viên → Kế toán trưởng → CFO",
    jobDemand: "Cao",
    workingHours: "8 giờ/ngày",
    teamSize: "3-8 người",
    advantages: ["Công việc ổn định", "Cần thiết cho mọi doanh nghiệp", "Cơ hội thăng tiến rõ ràng"],
    challenges: ["Áp lực cuối tháng/năm", "Cần chính xác cao", "Thay đổi quy định thuế"],
  },
  {
    id: 3,
    title: "Chuyên viên Phân tích Dữ liệu",
    description: "Phân tích và xử lý dữ liệu để hỗ trợ quyết định kinh doanh",
    requiredSkills: ["Python", "SQL", "Excel", "Power BI", "Statistics"],
    relatedSubjects: ["Thiết kế, lập trình", "Nhập môn kế toán", "Phân tích, môn thể chất"],
    salaryRange: "12-25 triệu VNĐ",
    workEnvironment: "Văn phòng, startup, tập đoàn",
    careerPath: "Data Analyst → Senior Analyst → Data Scientist → Head of Data",
    jobDemand: "Rất cao",
    workingHours: "8 giờ/ngày",
    teamSize: "3-6 người",
    advantages: ["Lĩnh vực hot", "Mức lương tốt", "Học hỏi nhiều ngành nghề"],
    challenges: ["Dữ liệu phức tạp", "Cần tư duy logic cao", "Công cụ thay đổi nhanh"],
  },
  {
    id: 4,
    title: "Giảng viên Đại học",
    description: "Giảng dạy và nghiên cứu tại các trường đại học",
    requiredSkills: ["Giảng dạy", "Nghiên cứu", "Presentation", "Tiếng Anh", "Viết báo khoa học"],
    relatedSubjects: ["Triết học Mác-Lênin", "Kinh tế chính trị Mác-Lênin", "Phân tích, môn thể chất"],
    salaryRange: "10-20 triệu VNĐ",
    workEnvironment: "Trường đại học, viện nghiên cứu",
    careerPath: "Giảng viên → Tiến sĩ → Phó Giáo sư → Giáo sư",
    jobDemand: "Trung bình",
    workingHours: "Linh hoạt",
    teamSize: "Độc lập hoặc nhóm nhỏ",
    advantages: ["Môi trường học thuật", "Thời gian linh hoạt", "Ảnh hưởng tích cực"],
    challenges: ["Áp lực nghiên cứu", "Thu nhập không cao", "Cạnh tranh học thuật"],
  },
  {
    id: 5,
    title: "Chuyên viên Marketing Digital",
    description: "Quản lý và thực hiện các chiến dịch marketing trực tuyến",
    requiredSkills: ["Social Media", "Google Ads", "Content Marketing", "Analytics", "SEO"],
    relatedSubjects: ["Thiết kế, lập trình", "Kinh tế chính trị Mác-Lênin", "Phân tích, môn thể chất"],
    salaryRange: "8-20 triệu VNĐ",
    workEnvironment: "Agency, startup, doanh nghiệp",
    careerPath: "Marketing Executive → Marketing Manager → Marketing Director",
    jobDemand: "Cao",
    workingHours: "8-9 giờ/ngày",
    teamSize: "3-8 người",
    advantages: ["Sáng tạo", "Tiếp cận xu hướng mới", "Kết quả đo lường được"],
    challenges: ["Thay đổi thuật toán", "Áp lực KPI", "Cạnh tranh cao"],
  },
  {
    id: 6,
    title: "Chuyên viên Nhân sự",
    description: "Quản lý và phát triển nguồn nhân lực cho tổ chức",
    requiredSkills: ["Tuyển dụng", "Đào tạo", "Luật lao động", "Communication", "Excel"],
    relatedSubjects: ["Kinh tế chính trị Mác-Lênin", "Triết học Mác-Lênin", "Phân tích, môn thể chất"],
    salaryRange: "8-18 triệu VNĐ",
    workEnvironment: "Mọi loại doanh nghiệp",
    careerPath: "HR Executive → HR Manager → HR Director",
    jobDemand: "Cao",
    workingHours: "8 giờ/ngày",
    teamSize: "2-10 người",
    advantages: ["Tiếp xúc nhiều người", "Ảnh hưởng văn hóa công ty", "Kỹ năng mềm tốt"],
    challenges: ["Xử lý conflict", "Áp lực tuyển dụng", "Thay đổi chính sách"],
  },
]

export function CareerSuggestions() {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("match")
  const [selectedCareer, setSelectedCareer] = useState<any>(null)

  const { studentData } = useData()

  const students = studentData.map((student, index) => {
    const headers = Object.keys(student)
    const nameField = headers.find((h) => h.includes("tên") || h.includes("Tên")) || headers[1]
    const idField = headers[0]

    return {
      id: `student-${index}`,
      name: student[nameField] || student[idField] || `Sinh viên ${index + 1}`,
      data: student,
    }
  })

  const currentStudent = selectedStudent ? students.find((s) => s.id === selectedStudent) : null

  const calculateCareerMatch = (student: any, career: any) => {
    if (!student || !career) return 0

    const studentHeaders = Object.keys(student)
    const subjectHeaders = studentHeaders.filter((header) => {
      // Lọc ra các cột điểm (bỏ qua thông tin cá nhân)
      const lowerHeader = header.toLowerCase()
      return (
        !lowerHeader.includes("mã") &&
        !lowerHeader.includes("tên") &&
        !lowerHeader.includes("lớp") &&
        !lowerHeader.includes("ngày") &&
        !lowerHeader.includes("xếp") &&
        !lowerHeader.includes("tbc")
      )
    })

    let totalScore = 0
    let subjectCount = 0
    let bonusScore = 0

    // Tính điểm trung bình các môn học
    subjectHeaders.forEach((subject) => {
      const score = student[subject]
      if (score && typeof score === "number" && score > 0) {
        totalScore += score
        subjectCount++

        // Bonus cho môn liên quan
        const subjectLower = subject.toLowerCase()
        const relatedSubjects = career.relatedSubjects.map((s: string) => s.toLowerCase())

        if (
          relatedSubjects.some(
            (related: string) =>
              subjectLower.includes(related.split(" ")[0]) || related.includes(subjectLower.split(" ")[0]),
          )
        ) {
          bonusScore += score * 0.2 // 20% bonus cho môn liên quan
        }
      }
    })

    if (subjectCount === 0) return 50 // Default nếu không có dữ liệu

    const averageScore = totalScore / subjectCount
    const finalScore = Math.min(averageScore + bonusScore / subjectCount, 10)

    // Convert score (0-10) to percentage (0-100)
    return Math.min(Math.round((finalScore / 10) * 100), 100)
  }

  const getCareerSuggestions = () => {
    if (!currentStudent) return []

    return predefinedCareers.map((career) => ({
      ...career,
      matchPercentage: calculateCareerMatch(currentStudent.data, career),
    }))
  }

  const careerSuggestions = getCareerSuggestions()

  const sortedCareers = [...careerSuggestions].sort((a, b) => {
    if (sortBy === "match") return b.matchPercentage - a.matchPercentage
    if (sortBy === "salary") return b.salaryRange.localeCompare(a.salaryRange)
    return a.title.localeCompare(b.title)
  })

  if (studentData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold">Gợi ý nghề nghiệp</h1>
          <p className="text-muted-foreground">
            Danh sách các nghề nghiệp phù hợp dựa trên điểm số và năng lực của sinh viên
          </p>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Vui lòng tải lên dữ liệu sinh viên để xem gợi ý nghề nghiệp</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Gợi ý nghề nghiệp</h1>
        <p className="text-muted-foreground">
          Danh sách các nghề nghiệp phù hợp dựa trên điểm số và năng lực của sinh viên
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn sinh viên" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Mức độ phù hợp</SelectItem>
              <SelectItem value="salary">Mức lương</SelectItem>
              <SelectItem value="name">Tên nghề</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentStudent && (
        <>
          {/* Career Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedCareers.map((career) => (
              <Card key={career.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-heading text-lg">{career.title}</CardTitle>
                      <CardDescription className="text-sm">{career.description}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-2"
                      style={{
                        borderColor: getMatchColor(career.matchPercentage),
                        color: getMatchColor(career.matchPercentage),
                      }}
                    >
                      {career.matchPercentage}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Match Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Mức độ phù hợp</span>
                      <span className="text-muted-foreground">{getMatchLabel(career.matchPercentage)}</span>
                    </div>
                    <Progress value={career.matchPercentage} className="h-2" />
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Kỹ năng yêu cầu
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {career.requiredSkills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {career.requiredSkills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{career.requiredSkills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Related Subjects */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Học phần liên quan
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {career.relatedSubjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{career.salaryRange}</span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedCareer(career)}>
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-heading">{career.title}</DialogTitle>
                          <DialogDescription>{career.description}</DialogDescription>
                        </DialogHeader>

                        {/* Match and Salary */}
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-center">
                                <div
                                  className="text-2xl font-bold"
                                  style={{ color: getMatchColor(career.matchPercentage) }}
                                >
                                  {career.matchPercentage}%
                                </div>
                                <div className="text-sm text-muted-foreground">Mức độ phù hợp</div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-primary">{career.salaryRange}</div>
                                <div className="text-sm text-muted-foreground">Mức lương</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Career Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              Môi trường làm việc
                            </h4>
                            <p className="text-sm text-muted-foreground">{career.workEnvironment}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Thời gian làm việc
                            </h4>
                            <p className="text-sm text-muted-foreground">{career.workingHours}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Quy mô team
                            </h4>
                            <p className="text-sm text-muted-foreground">{career.teamSize}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Nhu cầu tuyển dụng
                            </h4>
                            <p className="text-sm text-muted-foreground">{career.jobDemand}</p>
                          </div>
                        </div>

                        {/* Career Path */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Lộ trình phát triển</h4>
                          <p className="text-sm text-muted-foreground">{career.careerPath}</p>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Kỹ năng yêu cầu</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.requiredSkills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Advantages & Challenges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-chart-1">Ưu điểm</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {career.advantages.map((advantage, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-chart-1 mr-2">•</span>
                                  {advantage}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-chart-3">Thách thức</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {career.challenges.map((challenge, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-chart-3 mr-2">•</span>
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Tóm tắt gợi ý</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-1">
                    {sortedCareers.filter((c) => c.matchPercentage >= 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Nghề rất phù hợp</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-2">
                    {sortedCareers.filter((c) => c.matchPercentage >= 60 && c.matchPercentage < 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Nghề phù hợp</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {sortedCareers.length > 0
                      ? Math.round(sortedCareers.reduce((sum, c) => sum + c.matchPercentage, 0) / sortedCareers.length)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">Mức độ phù hợp trung bình</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedStudent && students.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Vui lòng chọn sinh viên để xem gợi ý nghề nghiệp</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
