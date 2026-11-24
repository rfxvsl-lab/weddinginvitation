"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth, type GoogleSignupInfo } from "../hooks/useAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SaaSUser, UserPackageId } from "../types";
import { useToast } from "../hooks/useToast";
import { ErrorBoundary } from "./ErrorBoundary";
import SignInView from "./auth/SignInView";
import SignUpView from "./auth/SignUpView";
import EnterpriseSignInView from "./auth/EnterpriseSignInView";
import AdminPanelView from "./auth/AdminPanelView";
import ApplicationStatusView from "./auth/ApplicationStatusView";

interface AuthGateProps {
  onLoginSuccess: (user: SaaSUser) => void;
  onAdminOverride?: () => void;
}

function AuthGateInner({ onLoginSuccess }: AuthGateProps) {
  const toast = useToast();
  const [mode, setMode] = useState<
    "signin" | "signup" | "enterprise" | "admin" | "pending"
  >("signin");

  // Route automatically to Admin Panel if /admin or #admin or ?admin=true
  useEffect(() => {
    const handleCheckRoute = () => {
      const pName = window.location.pathname.toLowerCase();
      const hashVal = window.location.hash.toLowerCase();
      const hasAdminQuery = window.location.search
        .toLowerCase()
        .includes("admin=true");

      if (
        pName === "/admin" ||
        pName.endsWith("/admin") ||
        hashVal === "#admin" ||
        hashVal === "#/admin" ||
        hasAdminQuery
      ) {
        setMode("admin");
      } else {
        setMode((prev) => (prev === "admin" ? "signin" : prev));
      }
    };

    handleCheckRoute();
    window.addEventListener("popstate", handleCheckRoute);
    window.addEventListener("hashchange", handleCheckRoute);
    return () => {
      window.removeEventListener("popstate", handleCheckRoute);
      window.removeEventListener("hashchange", handleCheckRoute);
    };
  }, []);

  // Honor landing page query params: /auth?mode=register|enterprise&slug=...&email=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = (params.get("mode") || "").toLowerCase();
    const prefillEmail = params.get("email");
    const prefillSlug = params.get("slug");

    if (intent === "pending") {
      setMode("pending");
    } else if (
      intent === "enterprise" ||
      intent === "corporate" ||
      intent === "company"
    ) {
      setMode("enterprise");
    } else if (
      intent === "register" ||
      intent === "signup" ||
      intent === "daftar"
    ) {
      setMode("signup");
      setStep(1);
    }

    if (prefillEmail) {
      setEmail(prefillEmail);
      setLoginEmail(prefillEmail);
    }
    if (prefillSlug) {
      const clean = prefillSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (clean) setSlug(clean);
    }
  }, []);

  const auth = useAuth();
  const usersList = auth.allUsers;
  const transactions = auth.allTransactions;
  const activeUser = auth.currentUser;

  // Sign up Form step wizard states
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Registration Inputs
  const [fullName, setFullName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [noWa, setNoWa] = useState("");
  const [sosmed, setSosmed] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [city, setCity] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [packageId, setPackageId] = useState<UserPackageId>("free");
  const [googleUser, setGoogleUser] = useState<GoogleSignupInfo | null>(null);

  // Login Inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Active Slug Checking for uniqueness
  const [slugError, setSlugError] = useState("");

  // A receipt is shown only after an authenticated API response, never from a query alone.
  useEffect(() => {
    if (!auth.application) return;
    setPassword("");
    setLoginPassword("");
    setMode("pending");
    const url = new URL(window.location.href);
    url.search = "?mode=pending";
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [auth.application]);

  // Load admin data when entering admin mode
  useEffect(() => {
    if (mode === "admin") {
      auth.fetchAdminData();
    }
  }, [mode]);

  // Only verified approved users are exposed by the auth hook.
  useEffect(() => {
    if (activeUser && auth.isReady && mode !== "admin") {
      onLoginSuccess(activeUser);
    }
  }, [activeUser, auth.isReady, mode]);

  // Autogenerate slug from Groom/Bride names if user hasn't manually set a prefill slug
  useEffect(() => {
    if (groomName || brideName) {
      const cleanGroom = groomName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanBride = brideName.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanGroom && cleanBride) {
        setSlug(`${cleanGroom}-${cleanBride}`);
      } else if (cleanGroom) {
        setSlug(cleanGroom);
      } else if (cleanBride) {
        setSlug(cleanBride);
      }
    }
  }, [groomName, brideName]);

  // Validate Slug in Realtime (async via Turso)
  useEffect(() => {
    if (!slug) {
      setSlugError("");
      return;
    }
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (slug !== cleanSlug) {
      setSlug(cleanSlug);
    }

    const timer = setTimeout(async () => {
      const available = await auth.checkSlugAvailable(cleanSlug);
      if (!available) {
        setSlugError(
          "Tautan ini sudah digunakan. Silakan tambahkan angka atau variasi lain.",
        );
      } else {
        setSlugError("");
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [slug]);

  // Login handler — with password via Turso
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const user = await auth.login(loginEmail, loginPassword);
    if (!user && auth.error) {
      toast.error("Login gagal", auth.error);
      auth.clearError();
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    try {
      const result = await auth.loginWithGoogle(credentialResponse.credential);
      if (result) {
        if ("unverifiedEmail" in result) {
          setGoogleUser(result);
          setEmail(result.unverifiedEmail);
          setFullName(result.name);
          setMode("signup");
          setStep(1);
        } else {
          onLoginSuccess(result);
        }
      }
    } catch (err) {
      console.error("Failed to decode Google JWT", err);
    }
  };

  // Step 1 Click Handler (Groom, Bride, FullName)
  const handleNextStep1 = () => {
    if (
      !fullName.trim() ||
      !groomName.trim() ||
      !brideName.trim() ||
      !city.trim()
    ) {
      toast.warning(
        "Form tidak lengkap",
        "Lengkapi nama, nama pasangan, dan kota acara.",
      );
      return;
    }
    setStep(2);
  };

  // Step 2 Click Handler (Email, Password, Wa, Sosmed verification)
  const handleNextStep2 = async () => {
    if (!noWa.trim() || !referralSource) {
      toast.warning(
        "Form tidak lengkap",
        "Lengkapi nomor WhatsApp dan sumber informasi RuangHadir.",
      );
      return;
    }
    if (!googleUser) {
      if (!email.trim() || !password) {
        toast.warning(
          "Form tidak lengkap",
          "Harap lengkapi email dan password akun Anda.",
        );
        return;
      }
      if (password.length < 8) {
        toast.warning(
          "Password terlalu pendek",
          "Password minimal 8 karakter.",
        );
        return;
      }

      const emailAvailable = await auth.checkEmailAvailable(email);
      if (!emailAvailable) {
        toast.error(
          "Email sudah terdaftar",
          "Email ini sudah memiliki akun. Silakan masuk melalui menu Sign In.",
        );
        return;
      }
    }
    setStep(3);
  };

  // Send an Early Access application. The server owns approval and session issuance.
  const handleSignUpComplete = async () => {
    const finalSlug =
      slug.trim() ||
      `${groomName.toLowerCase().replace(/[^a-z0-9]/g, "") || "undangan"}-${
        brideName.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        Math.random().toString(36).slice(2, 6)
      }`;

    if (slugError) {
      toast.error(
        "Slug sudah digunakan",
        "Silakan ubah sedikit tautan undangan Anda agar unik.",
      );
      return;
    }

    await auth.register({
      fullName:
        fullName.trim() || googleUser?.name || `${groomName} & ${brideName}`,
      coupleGroom: groomName.trim(),
      coupleBride: brideName.trim(),
      activeSlug: finalSlug,
      email: email.trim().toLowerCase(),
      password: googleUser ? undefined : password,
      googleSignupToken: googleUser?.signupToken,
      noWa: noWa.trim(),
      sosmed: sosmed.trim(),
      eventDate,
      city: city.trim(),
      referralSource,
      packageId: "free",
      isCustomByRfx: false,
      paymentStatus: "success",
      authProvider: googleUser ? "google" : "local",
      avatarUrl: googleUser?.avatarUrl,
    });
  };

  // Admin Override Actions — via Turso
  const handleApproveTransaction = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    await auth.approveTransaction(txId, tx.userId);
  };

  const handleRejectTransaction = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    await auth.rejectTransaction(txId, tx.userId);
  };

  return (
    <div className="saas-scope rh-product rh-auth min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* ==================== SIGN IN VIEW ==================== */}
        {mode === "signin" && (
          <ErrorBoundary name="SignIn">
            <SignInView
              loginEmail={loginEmail}
              loginPassword={loginPassword}
              isLoading={auth.isLoading}
              error={auth.error}
              onEmailChange={setLoginEmail}
              onPasswordChange={setLoginPassword}
              onSubmit={handleLogin}
              onGoogleSuccess={handleGoogleSuccess}
              onGotoSignUp={() => {
                setMode("signup");
                setStep(1);
              }}
              onGotoEnterprise={() => setMode("enterprise")}
            />
          </ErrorBoundary>
        )}

        {/* ==================== ENTERPRISE SIGN IN VIEW ==================== */}
        {mode === "enterprise" && (
          <ErrorBoundary name="EnterpriseSignIn">
            <EnterpriseSignInView
              onSuccess={(user) => {
                auth.setCurrentUser(user);
                onLoginSuccess(user);
              }}
              onBackToPersonal={() => setMode("signin")}
            />
          </ErrorBoundary>
        )}

        {/* ==================== SIGN UP VIEW (3-STEP FREE WIZARD) ==================== */}
        {mode === "signup" && (
          <ErrorBoundary name="SignUp">
            <SignUpView
              step={step}
              fullName={fullName}
              groomName={groomName}
              brideName={brideName}
              email={email}
              password={password}
              noWa={noWa}
              sosmed={sosmed}
              eventDate={eventDate}
              city={city}
              referralSource={referralSource}
              slug={slug}
              packageId={packageId}
              slugError={slugError}
              error={auth.error}
              isLoading={auth.isLoading}
              googleUser={googleUser}
              onFullNameChange={setFullName}
              onGroomChange={setGroomName}
              onBrideChange={setBrideName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onNoWaChange={setNoWa}
              onSosmedChange={setSosmed}
              onEventDateChange={setEventDate}
              onCityChange={setCity}
              onReferralSourceChange={setReferralSource}
              onSlugChange={setSlug}
              onPackageChange={setPackageId}
              onGotoEnterprise={() => setMode("enterprise")}
              onBack={() => {
                if (step === 1) setMode("signin");
                else setStep((prev) => (prev - 1) as 1 | 2 | 3);
              }}
              onNext1={handleNextStep1}
              onNext2={handleNextStep2}
              onComplete={handleSignUpComplete}
            />
          </ErrorBoundary>
        )}

        {mode === "pending" && (
          <ApplicationStatusView
            application={auth.application}
            onCheckAgain={() => {
              setLoginEmail(
                auth.application?.application?.email || email || loginEmail,
              );
              auth.clearApplication();
              auth.clearError();
              setMode("signin");
              window.history.replaceState(null, "", "/auth");
            }}
          />
        )}

        {/* ==================== PORTAL ADMIN VIEW ==================== */}
        {mode === "admin" && (
          <ErrorBoundary name="AdminPanel">
            <AdminPanelView
              usersList={usersList}
              transactions={transactions}
              onApprove={handleApproveTransaction}
              onReject={handleRejectTransaction}
              onDeleteUser={async (userId) => {
                await auth.deleteUser(userId);
                if (activeUser?.id === userId) setMode("signin");
              }}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* Panel visual (desktop): tiga tampilan undangan asli, latar datar (tanpa gradasi) */}
      <aside
        className="relative hidden flex-col justify-center gap-12 overflow-hidden bg-[#1F1F1F] px-12 py-16 lg:flex"
        aria-hidden
      >
        <div className="flex items-end justify-center gap-4">
          {["royal-arabian", "sage-garden", "cremy-rose"].map((id, i) => (
            <div
              key={id}
              className={`relative aspect-[9/19.5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${i === 1 ? "w-[200px] -translate-y-6" : "w-[160px] opacity-80"}`}
            >
              <Image
                src={`/assets/themes/shots/${id}.webp`}
                alt=""
                fill
                sizes="200px"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[460px] text-center text-[#F6EFE6]">
          <p className="rh-display text-3xl font-semibold">
            Satu tautan untuk seluruh tamu, lengkap dengan nama mereka.
          </p>
          <p className="mt-4 text-base text-[#C9C2BC]">
            Tema, RSVP, amplop digital, dan check in QR. Tersedia melalui Akses
            Awal setelah pendaftaran disetujui.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function AuthGate(props: AuthGateProps) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id";
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthGateInner {...props} />
    </GoogleOAuthProvider>
  );
}
