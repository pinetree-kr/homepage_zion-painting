import { getPrologueManagementData } from '@/src/features/prologue/api/prologue-management-actions';
import PrologueManagement from '@/src/features/prologue/ui/PrologueManagement';

export default async function ManagementProloguePage() {
  const initialData = await getPrologueManagementData();

  return <PrologueManagement data={initialData} />;
}
