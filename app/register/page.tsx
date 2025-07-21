"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Loader2, User, Mail, Phone, Lock, ArrowLeft, Check, X } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  })

  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.startsWith("7") || numbers.startsWith("8")) {
      return "+7" + numbers.slice(1).slice(0, 10)
    } else if (numbers.length > 0) {
      return "+7" + numbers.slice(0, 10)
    }
    return ""
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    Object.values(checks).forEach((check) => {
      if (check) strength += 20
    })

    return { strength, checks }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.password_confirmation) {
      toast.error("Заполните все поля")
      return false
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Пароли не совпадают")
      return false
    }

    if (passwordStrength.strength < 80) {
      toast.error("Пароль должен быть более надежным")
      return false
    }

    if (!agreedToTerms) {
      toast.error("Необходимо принять условия использования")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await register(formData)
    } catch (error: any) {
      toast.error(error.message || "Ошибка регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500"
    if (strength < 60) return "bg-yellow-500"
    if (strength < 80) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength < 40) return "Слабый"
    if (strength < 60) return "Средний"
    if (strength < 80) return "Хороший"
    return "Отличный"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
            NEUROX
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="w-full max-w-lg relative z-10">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Создать аккаунт</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Присоединяйтесь к NEUROX и начните создавать AI-агентов
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Полное имя
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email адрес
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Номер телефона
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Пароль
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Создайте надежный пароль"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Надежность пароля:</span>
                        <span
                          className={`font-medium ${passwordStrength.strength >= 80 ? "text-green-600" : passwordStrength.strength >= 60 ? "text-blue-600" : passwordStrength.strength >= 40 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {getStrengthText(passwordStrength.strength)}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.strength}
                        className={`h-2 ${getStrengthColor(passwordStrength.strength)}`}
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries({
                          "Минимум 8 символов": passwordStrength.checks.length,
                          "Заглавные буквы": passwordStrength.checks.uppercase,
                          "Строчные буквы": passwordStrength.checks.lowercase,
                          Цифры: passwordStrength.checks.numbers,
                        }).map(([label, check]) => (
                          <div key={label} className="flex items-center gap-1">
                            {check ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-red-500" />
                            )}
                            <span className={check ? "text-green-600" : "text-red-600"}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                    Подтвердите пароль
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Повторите пароль"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className="pl-10 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Пароли не совпадают
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    Я согласен с{" "}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium" target="_blank">
                      условиями использования
                    </Link>{" "}
                    и{" "}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium" target="_blank">
                      политикой конфиденциальности
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || !agreedToTerms || passwordStrength.strength < 80}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Создание аккаунта...
                    </>
                  ) : (
                    "Создать аккаунт"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">или</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-gray-600">Уже есть аккаунт? </span>
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Войти
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              Регистрируясь, вы получаете доступ к мощным инструментам для создания AI-агентов
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
