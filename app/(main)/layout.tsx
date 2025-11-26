import Header from '@/src/features/home/ui/Header';
import Footer from '@/src/features/home/ui/Footer';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header enableScrollAnimation={false} />
            {children}
            <Footer />
        </>
    );
}

