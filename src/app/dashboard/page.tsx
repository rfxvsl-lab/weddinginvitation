'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '../../components/states/PageStates';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  // Ditampilkan selagi bundel dashboard diunduh (dulu layar kosong).
  loading: () => <DashboardSkeleton />,
});

export default function DashboardPage() {
  return <App />;
}
