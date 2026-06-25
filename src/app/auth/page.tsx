"use client";

import React, { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { SaaSUser } from "../../types";

export default function AuthPage() {
  const auth = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginSuccess = async (user: SaaSUser) => {
    auth.setCurrentUser(user);
    // Setelah login berhasil, arahkan ke dashboard
    router.push("/dashboard");
  };

  // Jika sudah login, langsung lempar ke dashboard
  useEffect(() => {
    if (mounted && auth.currentUser && auth.currentUser.paymentStatus === "success") {
      router.push("/dashboard");
    }
  }, [mounted, auth.currentUser, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background w-full">
      <AuthGate onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
