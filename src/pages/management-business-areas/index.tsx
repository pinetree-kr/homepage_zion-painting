"use server"

import BusinessAreas from '@/src/features/management-business/ui/BusinessAreas';
import { getBusinessAreas } from '@/src/features/management-business/api/business-actions';

export default async function ManagementBusinessAreasPage() {
  const businessAreas = await getBusinessAreas();
  return <BusinessAreas items={businessAreas} />;
}

