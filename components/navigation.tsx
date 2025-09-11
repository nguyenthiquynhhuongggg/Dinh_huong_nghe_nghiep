"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Upload, TrendingUp, Lightbulb, Search, Menu, X } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "data-input", label: "Nhập dữ liệu", icon: Upload },
  { id: "analysis", label: "Phân tích học phần", icon: TrendingUp },
  { id: "career-suggestions", label: "Gợi ý nghề nghiệp", icon: Lightbulb },
  { id: "career-lookup", label: "Tra cứu nghề", icon: Search },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-card border-b border-border px-6 py-4">
        <div className="flex items-center space-x-1 w-full">
          <div className="flex items-center space-x-2 mr-8">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="font-heading text-xl font-bold text-foreground">Định hướng Nghề nghiệp</h1>
          </div>

          <div className="flex space-x-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className="flex items-center space-x-2 px-4 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-lg font-bold text-foreground">Định hướng Nghề nghiệp</h1>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border bg-card">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
