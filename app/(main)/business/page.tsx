import Business from '@/src/features/home/ui/Business';
import { getBusinessInfo, getBusinessCategories, getBusinessAchievementsUsingAnonymous } from '@/src/features/management-business/api/business-actions';

export default async function BusinessPage() {
    const [businessInfo, categories, achievements] = await Promise.all([
        getBusinessInfo(),
        getBusinessCategories(),
        getBusinessAchievementsUsingAnonymous(),
    ]);

    return (
        <div className="relative bg-[#F4F6F8] min-h-screen">
            <div className="pt-20 md:pt-24">
                <Business
                    businessInfo={businessInfo}
                    categories={categories}
                    achievements={achievements}
                />
            </div>
        </div>
    );
}

