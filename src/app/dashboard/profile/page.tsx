import { redirect } from 'next/navigation';

/** Profil kini menjadi bagian dari workspace dashboard. */
export default function ProfileRedirect() {
  redirect('/dashboard?tab=profile');
}
