'use client';

import { Card, CardTitle, CardHeader, CardContent, Button } from "@/app/components";
import { FileX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BoardError({
    statusCode,
    error,
}: {
    statusCode: number;
    error: Error & { digest?: string }
}) {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    }

    return (
        <div className="relative bg-[#F4F6F8] min-h-[calc(100vh-405px)]">
            <div className="lg:max-w-6xl mx-auto px-4 pt-24 pb-8 md:pt-34 md:pb-18">
                <Card className="p-6">
                    <CardHeader className="flex items-center gap-2 justify-center text-center">
                        <CardTitle className="text-center">
                            <FileX className="w-10 h-10" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-500">{error.message}</p>
                        {statusCode === 401 && (
                            <Button variant="outline" className="mt-4" onClick={() => router.push('/auth/sign-in')}>
                                로그인
                            </Button>
                        )}
                        {statusCode === 403 && (
                            <Button variant="outline" className="mt-4" onClick={handleBack}>
                                이전으로 돌아가기
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}