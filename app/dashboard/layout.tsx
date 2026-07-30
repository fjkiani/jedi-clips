import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { syncCurrentUser } from '@/app/actions/user';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Sync user to our database on every dashboard visit
  await syncCurrentUser();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
