import { redirect } from 'next/navigation';

export default async function ManagementSystemBoardsPage() {
  redirect('/admin/system/boards/list');
}

