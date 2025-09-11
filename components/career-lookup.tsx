"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, DollarSign } from "lucide-react"

// Mock career database
const careerDatabase = [
  {
    id: 1,
    title: "Lập trình viên Full-stack",
    category: "Công nghệ thông tin",
    skills: ["JavaScript", "React", "Node.js", "Database", "Git", "HTML/CSS", "API Design"],
    subjects: ["Lập trình Web", "Cơ sở dữ liệu", "Kỹ thuật phần mềm", "Lập trình hướng đối tượng"],
    salaryRange: "15-30 triệu VNĐ",
    experience: "0-2 năm",
    education: "Đại học CNTT",
    description: "Phát triển ứng dụng web từ giao diện đến backend",
  },
  {
    id: 2,
    title: "Chuyên viên Phân tích dữ liệu",
    category: "Khoa học dữ liệu",
    skills: ["Python", "SQL", "Statistics", "Machine Learning", "Tableau", "Excel", "R"],
    subjects: ["Xác suất thống kê", "Cơ sở dữ liệu", "Trí tuệ nhân tạo", "Toán cao cấp"],
    salaryRange: "12-25 triệu VNĐ",
    experience: "1-3 năm",
    education: "Đại học Toán/CNTT",
    description: "Phân tích dữ liệu để đưa ra insights kinh doanh",
  },
  {
    id: 3,
    title: "Kỹ sư DevOps",
    category: "Hạ tầng IT",
    skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Monitoring"],
    subjects: ["Hệ điều hành", "Mạng máy tính", "Bảo mật", "Kiến trúc máy tính"],
    salaryRange: "18-35 triệu VNĐ",
    experience: "2-5 năm",
    education: "Đại học CNTT",
    description: "Quản lý hạ tầng và tự động hóa deployment",
  },
  {
    id: 4,
    title: "Chuyên viên Bảo mật",
    category: "An ninh mạng",
    skills: ["Network Security", "Penetration Testing", "Risk Assessment", "Firewall", "SIEM"],
    subjects: ["Bảo mật", "Mạng máy tính", "Hệ điều hành", "Mật mã học"],
    salaryRange: "15-28 triệu VNĐ",
    experience: "1-4 năm",
    education: "Đại học CNTT/An toàn",
    description: "Bảo vệ hệ thống khỏi các mối đe dọa",
  },
  {
    id: 5,
    title: "Mobile App Developer",
    category: "Phát triển ứng dụng",
    skills: ["React Native", "Flutter", "iOS", "Android", "API Integration", "UI/UX"],
    subjects: ["Lập trình di động", "Thiết kế giao diện", "Cơ sở dữ liệu", "Lập trình hướng đối tượng"],
    salaryRange: "12-22 triệu VNĐ",
    experience: "0-3 năm",
    education: "Đại học CNTT",
    description: "Phát triển ứng dụng cho thiết bị di động",
  },
  {
    id: 6,
    title: "Product Manager",
    category: "Quản lý sản phẩm",
    skills: ["Product Strategy", "User Research", "Analytics", "Communication", "Leadership", "Agile"],
    subjects: ["Quản lý dự án", "Phân tích thiết kế", "Kỹ thuật phần mềm", "Marketing"],
    salaryRange: "20-40 triệu VNĐ",
    experience: "3-7 năm",
    education: "Đại học (đa ngành)",
    description: "Quản lý phát triển sản phẩm từ ý tưởng đến thị trường",
  },
  {
    id: 7,
    title: "UI/UX Designer",
    category: "Thiết kế",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems", "HTML/CSS"],
    subjects: ["Thiết kế giao diện", "Tâm lý học", "Marketing", "Nghệ thuật"],
    salaryRange: "10-20 triệu VNĐ",
    experience: "0-4 năm",
    education: "Đại học Thiết kế/CNTT",
    description: "Thiết kế trải nghiệm người dùng cho sản phẩm số",
  },
  {
    id: 8,
    title: "Database Administrator",
    category: "Quản trị dữ liệu",
    skills: ["SQL", "Oracle", "MySQL", "PostgreSQL", "Backup & Recovery", "Performance Tuning"],
    subjects: ["Cơ sở dữ liệu", "Hệ điều hành", "Mạng máy tính", "Bảo mật"],
    salaryRange: "14-26 triệu VNĐ",
    experience: "1-5 năm",
    education: "Đại học CNTT",
    description: "Quản lý và tối ưu hóa hệ thống cơ sở dữ liệu",
  },
  {
    id: 9,
    title: "Quality Assurance Engineer",
    category: "Kiểm thử phần mềm",
    skills: ["Manual Testing", "Automation Testing", "Selenium", "Test Planning", "Bug Tracking"],
    subjects: ["Kiểm thử phần mềm", "Kỹ thuật phần mềm", "Lập trình", "Quản lý chất lượng"],
    salaryRange: "10-18 triệu VNĐ",
    experience: "0-3 năm",
    education: "Đại học CNTT",
    description: "Đảm bảo chất lượng phần mềm thông qua kiểm thử",
  },
  {
    id: 10,
    title: "System Administrator",
    category: "Quản trị hệ thống",
    skills: ["Linux", "Windows Server", "Network Management", "Virtualization", "Scripting"],
    subjects: ["Hệ điều hành", "Mạng máy tính", "Kiến trúc máy tính", "Bảo mật"],
    salaryRange: "12-22 triệu VNĐ",
    experience: "1-4 năm",
    education: "Đại học CNTT",
    description: "Quản lý và duy trì hệ thống máy chủ",
  },
]

const categories = ["Tất cả", ...Array.from(new Set(careerDatabase.map((career) => career.category)))]

export function CareerLookup() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [sortBy, setSortBy] = useState("name")

  const filteredCareers = useMemo(() => {
    let filtered = careerDatabase

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (career) =>
          career.title.toLowerCase().includes(term) ||
          career.skills.some((skill) => skill.toLowerCase().includes(term)) ||
          career.subjects.some((subject) => subject.toLowerCase().includes(term)) ||
          career.description.toLowerCase().includes(term),
      )
    }

    // Filter by category
    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter((career) => career.category === selectedCategory)
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "salary":
          return b.salaryRange.localeCompare(a.salaryRange)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Tất cả")
    setSortBy("name")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Tra cứu nghề nghiệp</h1>
        <p className="text-muted-foreground">
          Tìm kiếm thông tin chi tiết về các nghề nghiệp, kỹ năng yêu cầu và học phần liên quan
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Tìm kiếm và lọc</span>
          </CardTitle>
          <CardDescription>Nhập tên nghề, kỹ năng hoặc học phần để tìm kiếm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nghề nghiệp, kỹ năng, học phần..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                  <SelectItem value="name">Tên nghề</SelectItem>
                  <SelectItem value="salary">Mức lương</SelectItem>
                  <SelectItem value="category">Lĩnh vực</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>

          {/* Search Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Tìm thấy <strong>{filteredCareers.length}</strong> kết quả
              {searchTerm && (
                <>
                  {" "}
                  cho "<strong>{searchTerm}</strong>"
                </>
              )}
            </span>
            {(searchTerm || selectedCategory !== "Tất cả") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa tất cả
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Kết quả tìm kiếm</CardTitle>
          <CardDescription>Thông tin chi tiết về các nghề nghiệp phù hợp</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCareers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Nghề nghiệp</TableHead>
                    <TableHead className="min-w-[150px]">Lĩnh vực</TableHead>
                    <TableHead className="min-w-[250px]">Kỹ năng yêu cầu</TableHead>
                    <TableHead className="min-w-[200px]">Học phần liên quan</TableHead>
                    <TableHead className="min-w-[120px]">Mức lương</TableHead>
                    <TableHead className="min-w-[100px]">Kinh nghiệm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCareers.map((career) => (
                    <TableRow key={career.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{career.title}</div>
                          <div className="text-sm text-muted-foreground">{career.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{career.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {career.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {career.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{career.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {career.subjects.slice(0, 2).map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {career.subjects.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{career.subjects.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                          {career.salaryRange}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{career.experience}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy nghề nghiệp phù hợp
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {filteredCareers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{filteredCareers.length}</div>
                <div className="text-sm text-muted-foreground">Nghề nghiệp</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">
                  {new Set(filteredCareers.map((c) => c.category)).size}
                </div>
                <div className="text-sm text-muted-foreground">Lĩnh vực</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">
                  {new Set(filteredCareers.flatMap((c) => c.skills)).size}
                </div>
                <div className="text-sm text-muted-foreground">Kỹ năng</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-4">
                  {new Set(filteredCareers.flatMap((c) => c.subjects)).size}
                </div>
                <div className="text-sm text-muted-foreground">Học phần</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
