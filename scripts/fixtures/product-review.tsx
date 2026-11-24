/* Review fixture only: real UI components, in-memory sample data, no backend access. */
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import DashboardOverview from "../../src/components/DashboardOverview";
import DashboardSidebar from "../../src/components/DashboardSidebar";
import EditorPanel from "../../src/components/EditorPanel";
import GuestManager from "../../src/components/GuestManager";
import AnalyticsDashboard from "../../src/components/AnalyticsDashboard";
import PublishModal from "../../src/components/PublishModal";
import ProfilePanel from "../../src/components/ProfilePanel";
import UpgradePanel from "../../src/components/UpgradePanel";
import ThemeSelector from "../../src/components/ThemeSelector";
import LandingPage from "../../src/app/(marketing)/page";
import SignInView from "../../src/components/auth/SignInView";
import { AlertModalProvider } from "../../src/hooks/useAlertModal";
import { DEFAULT_WEDDING_DATA } from "../../src/data/defaultData";

const user = {
  id: "review-only",
  fullName: "Rian Aditama",
  email: "contoh@example.com",
  packageId: "free",
  activeSlug: "rian-salsa",
  coupleGroom: "Rian",
  coupleBride: "Salsa",
} as any;
const analytics = {
  viewsCount: 124,
  totalGuestsAttending: 4,
  dailyTraffic: [
    { date: "2026-11-23", views: 40 },
    { date: "2026-11-24", views: 84 },
  ],
  deviceStats: { mobile: 100, desktop: 24 },
} as any;
const invitation = {
  id: "sample",
  slug: "rian-salsa",
  title: "Rian & Salsa",
  themeId: "sage-garden",
  isPublished: false,
};

function Review() {
  const screen =
    document.documentElement.dataset.screen ||
    new URLSearchParams(location.search).get("screen") ||
    "overview";
  const [segment, setSegment] = useState(screen);
  const [data, setData] = useState({ ...DEFAULT_WEDDING_DATA, gallery: [] });
  const [guests, setGuests] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [notice, setNotice] = useState(
    "Data contoh. Perubahan hanya di halaman ini, tidak tersimpan ke akun.",
  );
  const [publishOpen, setPublishOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentAnalytics = {
    ...analytics,
    totalGuestsAttending: rsvps
      .filter((r) => r.status === "Hadir")
      .reduce((sum, r) => sum + r.paxCount, 0),
  };
  const navigate = (target: string) => {
    setSegment(target);
    setNotice(`Membuka bagian: ${target}`);
  };
  const sample = () => {
    setGuests([
      {
        id: "g1",
        invitationCode: "REVIEW01",
        name: "Budi dan Ani",
        group: "Keluarga",
        status: "Draft",
        phoneNumber: "",
        paxLimit: 2,
      },
    ]);
    setRsvps([
      {
        id: "r1",
        guestName: "Budi dan Ani",
        status: "Hadir",
        paxCount: 2,
        wishes:
          "Selamat menempuh hidup baru. Sampai bertemu di hari bahagia kalian.",
        createdAt: "2026-11-24T09:00:00Z",
      },
    ]);
    setNotice("Data contoh terisi.");
  };
  if (segment === "publish") return (
    <AlertModalProvider>
      <div className="saas-scope saas-dash rh-product fixed inset-0 h-[100dvh] overflow-hidden">
        <p className="p-4">Fixture modal publikasi · data contoh, publikasi dinonaktifkan.</p>
        <button type="button" className="rh-action m-4" onClick={() => setPublishOpen(true)}>Buka modal publikasi</button>
        <PublishModal
          show={publishOpen}
          onClose={() => setPublishOpen(false)}
          user={user}
          wedding={{
            weddingData: data,
            themeId: "sage-garden",
            invitation,
            allInvitations: [invitation],
            guests: [],
            publishInvitation: async () => { throw new Error("Publikasi dinonaktifkan di fixture review."); },
            updateGuestStatus: () => { throw new Error("API tamu dinonaktifkan di fixture review."); },
          }}
        />
      </div>
    </AlertModalProvider>
  );
  if (segment === "landing") return <LandingPage />;
  if (segment === "auth")
    return (
      <div className="saas-scope rh-product rh-auth min-h-screen flex items-center justify-center p-4">
        <SignInView
          loginEmail=""
          loginPassword=""
          isLoading={false}
          error={null}
          onEmailChange={() => {}}
          onPasswordChange={() => {}}
          onSubmit={(e) => e.preventDefault()}
          onGoogleSuccess={() => {}}
          onGotoSignUp={() => setNotice("Pratinjau pendaftaran")}
          onGotoEnterprise={() => setNotice("Pratinjau Enterprise")}
        />
      </div>
    );
  return (
    <AlertModalProvider>
      <div className="saas-scope saas-dash rh-product flex min-h-screen">
        <DashboardSidebar
          activeSegment={segment}
          setActiveSegment={navigate}
          user={user}
          onLogout={() => setNotice("Keluar hanya disimulasikan.")}
          onPublish={() => setNotice("Publikasi dinonaktifkan di review.")}
          isPublished={false}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          currentInvitationId="sample"
          allInvitations={[invitation]}
          onCreateInvitation={() =>
            setNotice("Pembuatan proyek dinonaktifkan di review.")
          }
          onSwitchInvitation={() => {}}
        />
        <div className="rh-workspace flex-1 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rh-action"
            >
              Menu
            </button>
            <span className="text-sm">Review UI · {segment}</span>
            <button type="button" className="rh-action" onClick={sample}>
              Isi data contoh
            </button>
          </header>
          <p role="status" className="px-5 py-3 text-xs bg-yellow-50">
            {notice}
          </p>
          {segment === "overview" && (
            <DashboardOverview
              user={user}
              weddingData={data}
              invitation={invitation}
              guests={guests}
              rsvps={rsvps}
              analytics={currentAnalytics}
              onNavigate={navigate as any}
              onPublish={() => setNotice("Publikasi dinonaktifkan di review.")}
            />
          )}
          <div className="mx-auto max-w-5xl p-4 sm:p-8">
            {segment === "design" && (
              <EditorPanel
                data={data}
                onChange={setData as any}
                packageId="free"
              />
            )}
            {segment === "settings" && (
              <ThemeSelector
                currentThemeId="sage-garden"
                onSelectTheme={(id) => setNotice(`Pilihan tema contoh: ${id}`)}
              />
            )}
            {segment === "guests" && (
              <GuestManager
                guests={guests}
                appUrl="https://example.com"
                slug="review-only"
                coupleNames="Rian & Salsa"
                onAddGuest={(guest) =>
                  setGuests([
                    ...guests,
                    {
                      ...guest,
                      id: String(guests.length),
                      invitationCode: `REVIEW${guests.length}`,
                    },
                  ])
                }
                onRemoveGuest={(id) =>
                  setGuests(guests.filter((g) => g.id !== id))
                }
                onUpdateGuestStatus={() => {}}
              />
            )}
            {segment === "analytics" && (
              <AnalyticsDashboard
                analytics={currentAnalytics}
                rsvps={rsvps}
                onDeleteRSVP={(id) =>
                  setRsvps(rsvps.filter((r) => r.id !== id))
                }
              />
            )}
            {segment === "profile" && <ProfilePanel />}
            {segment === "upgrade" && <UpgradePanel user={user} />}
            {segment === "video" && (
              <p>
                Video studio memerlukan pengujian integrasi tersendiri. Fixture
                ini fokus pada formulir dan navigasi.
              </p>
            )}
          </div>
        </div>
      </div>
    </AlertModalProvider>
  );
}

// Prevent fixture controls from contacting production APIs or upload providers.
window.fetch = async () => {
  throw new Error("Network disabled in UI review fixture");
};
createRoot(document.getElementById("root")!).render(<Review />);
