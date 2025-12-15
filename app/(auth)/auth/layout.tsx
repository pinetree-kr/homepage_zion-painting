// import { getCurrentUserProfile } from '@/src/entities/user/model/getCurrentUser';
import Header from '@/src/features/auth/ui/Header';
import Image from 'next/image';
// import { redirect } from 'next/navigation';

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const user = await getCurrentUserProfile();
    // if (user) {
    //     if (user.role === 'admin') {
    //         redirect('/admin');
    //     } else {
    //         redirect('/');
    //     }
    // }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Image/Gradient */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] relative overflow-hidden">
                {/* <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==")`,
                    }}
                /> */}

                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
                    <div className="text-center max-w-md">
                        <div className="mb-8 flex justify-center">
                            <div className="bg-white rounded-xl border-2 border-white/30 p-4 shadow-lg backdrop-blur-sm">
                                <Image
                                    src="/logo-192.png"
                                    alt="시온"
                                    width={80}
                                    height={80}
                                    className="h-20 w-auto"
                                />
                            </div>
                        </div>
                        <h1 className="text-white text-4xl mb-4">환영합니다</h1>
                        <p className="text-white/90 text-lg mb-8">
                            시온 도장설비에 오신 것을 환영합니다
                        </p>
                        <div className="space-y-4 text-left">
                            {[
                                { icon: '🛡️', text: '보안 인증' },
                                { icon: '⚡', text: '빠르고 신뢰할 수 있는' },
                                { icon: '🏆', text: '프리미엄 경험' },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <span className="text-lg">{item.icon}</span>
                                    </div>
                                    <span className="text-white/90">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Header />
            {/* <div className="min-h-screen bg-white flex items-center justify-center p-8 w-full lg:max-w-1/2"></div> */}
            {/* <div className="min-h-screen bg-white flex items-center justify-center pt-24 md:pt-8 p-6 md:p-8 w-full relative"> */}
            <div className="min-h-screen bg-white flex items-center justify-center p-6 md:p-8 w-full relative">
                {/* Right Side - Form */}
                {children}
            </div>
        </div>
    );
}