import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI("AIzaSyDJ_0i1__3JK9fm2g_DFI_bTlyRXe818Nw")
 
export async function POST(request: NextRequest) {
  try {
    const { studentData, careerData } = await request.json()

    console.log("[v0] Received data for analysis:", {
      studentCount: studentData?.length,
      careerCount: careerData?.length,
    })

    if (!studentData || studentData.length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu sinh viên để phân tích" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Bạn là chuyên gia tư vấn nghề nghiệp. Hãy phân tích dữ liệu điểm số của sinh viên và đưa ra gợi ý nghề nghiệp phù hợp.

DỮ LIỆU SINH VIÊN (${studentData.length} sinh viên):
${JSON.stringify(studentData.slice(0, 5), null, 2)}
${studentData.length > 5 ? `... và ${studentData.length - 5} sinh viên khác` : ""}

DỮ LIỆU NGHỀ NGHIỆP:
${
  careerData && careerData.length > 0
    ? JSON.stringify(careerData, null, 2)
    : `
Các nghề nghiệp phổ biến trong lĩnh vực CNTT:
- Lập trình viên Full-stack
- Chuyên viên Phân tích Hệ thống  
- Chuyên viên An toàn Thông tin
- Chuyên viên Phát triển Backend
- Kỹ sư Phần mềm
`
}

HƯỚNG DẪN PHÂN TÍCH:
1. Dựa vào điểm số các môn học để xác định điểm mạnh/yếu
2. Môn điểm cao (>7.0) = điểm mạnh, môn điểm thấp (<6.0) = cần cải thiện
3. Liên kết điểm số với yêu cầu nghề nghiệp cụ thể
4. Đưa ra gợi ý thực tế và khả thi

YÊU CẦU TRẢ LỜI (JSON format):
{
  "analysis": [
    {
      "studentId": "mã sinh viên",
      "studentName": "tên sinh viên",
      "averageScore": "điểm trung bình",
      "strengths": ["môn học điểm cao và ý nghĩa"],
      "weaknesses": ["môn học cần cải thiện"],
      "careerSuggestions": [
        {
          "career": "tên nghề nghiệp cụ thể",
          "matchPercentage": 85,
          "reason": "lý do dựa trên điểm số thực tế",
          "relatedSubjects": ["môn học liên quan"],
          "salary": "mức lương ước tính",
          "improvementTips": "lời khuyên cải thiện"
        }
      ]
    }
  ],
  "classOverview": {
    "totalStudents": ${studentData.length},
    "averagePerformance": "nhận xét chung",
    "topPerformers": ["sinh viên xuất sắc"],
    "commonStrengths": ["điểm mạnh chung của lớp"],
    "areasForImprovement": ["lĩnh vực cần cải thiện"]
  }
}

Chỉ trả lời JSON, không thêm text khác. Phân tích dựa trên dữ liệu thực tế.
`

    console.log("[v0] Sending request to Gemini API...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("[v0] AI response length:", text.length)
    console.log("[v0] AI response preview:", text.substring(0, 300))

    try {
      let analysisResult

      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: create structured response from text
        analysisResult = {
          analysis: studentData.slice(0, 10).map((student: any, index: number) => ({
            studentId: student["Mã SV"] || `Student_${index + 1}`,
            studentName: student["Họ và tên"] || `Sinh viên ${index + 1}`,
            averageScore: student["TBCHT H10"] || "N/A",
            strengths: ["Cần phân tích thêm"],
            weaknesses: ["Cần phân tích thêm"],
            careerSuggestions: [
              {
                career: "Lập trình viên",
                matchPercentage: 70,
                reason: "Dựa trên điểm số tổng hợp",
                relatedSubjects: ["Thiết kế, lập trình Back-End"],
                salary: "15-25 triệu VND",
                improvementTips: "Cải thiện kỹ năng lập trình",
              },
            ],
          })),
          classOverview: {
            totalStudents: studentData.length,
            averagePerformance: "Cần phân tích chi tiết hơn",
            topPerformers: [],
            commonStrengths: [],
            areasForImprovement: [],
          },
          rawResponse: text,
        }
      }

      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        timestamp: new Date().toISOString(),
      })
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json({
        success: true,
        analysis: {
          analysis: [],
          classOverview: {
            totalStudents: studentData.length,
            averagePerformance: "Phân tích thành công nhưng cần xử lý thêm",
            rawResponse: text,
          },
          error: "Không thể parse JSON response",
          rawText: text,
        },
      })
    }
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      {
        error: "Lỗi khi gọi Gemini API",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
