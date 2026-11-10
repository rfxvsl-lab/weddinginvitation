import { redirect } from 'next/navigation';
import { getSessionUser } from '../../server/session';
import AdminPage from '../../components/AdminPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Panel Admin — ruanghadir.net',
  robots: { index: false, follow: false },
};

export default async function Page() {
  // Peran dibaca ulang dari database, bukan dari isi cookie.
  const user = await getSessionUser();
  if (!user) redirect('/auth?redirect=/admin&reason=auth_required');
  if (user.role !== 'admin') redirect('/dashboard');
  return <AdminPage />;
}
