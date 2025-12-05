import { redirect } from 'next/navigation';

export default async function ManagementSystemBoardsPage() {
  redirect('/admin/services/boards/list');
}

