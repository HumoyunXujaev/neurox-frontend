"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AmoCrmSuccessPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Интеграция успешна
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Ваш amoCRM-аккаунт успешно подключён! Теперь вы можете использовать все возможности интеграции.
          </p>
          <Link href="/integrations">
            <Button className="w-full">Перейти к интеграциям</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
