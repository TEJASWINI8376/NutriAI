import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { BottomNav, NavTab } from "./components/BottomNav";
import { ReportCard } from "./components/ReportCard";
import { ReportDetailModal } from "./components/ReportDetailModal";
import { ReviewDataModal } from "./components/ReviewDataModal";
import { UploadReportModal } from "./components/UploadReportModal";
import { AuthModal } from "./components/AuthModal";
import { HomeScreen } from "./components/HomeScreen";
import { PrescriptionsScreen } from "./components/PrescriptionsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { MedicalReport, UserProfile, HealthVital, Prescription } from "./types";
import {
  Search,
  FolderArchive,
  PlusCircle,
  X,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("reports");
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vitals, setVitals] = useState<HealthVital[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modals state
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [reviewingReport, setReviewingReport] = useState<MedicalReport | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from persistent backend
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [reportsRes, userRes, vitalsRes, rxRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/auth/me"),
        fetch("/api/vitals"),
        fetch("/api/prescriptions"),
      ]);

      const reportsData = await reportsRes.json();
      const userData = await userRes.json();
      const vitalsData = await vitalsRes.json();
      const rxData = await rxRes.json();

      if (reportsData.reports) setReports(reportsData.reports);
      if (userData.user) setUser(userData.user);
      if (vitalsData.vitals) setVitals(vitalsData.vitals);
      if (rxData.prescriptions) setPrescriptions(rxData.prescriptions);
    } catch (err) {
      console.error("Failed to load data from server:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    let list = reports;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.facility.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.summary && r.summary.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "All") {
      list = list.filter(
        (r) => r.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    return list;
  }, [reports, searchQuery, statusFilter]);

  // Counts for status chips
  const counts = useMemo(() => {
    return {
      all: reports.length,
      verified: reports.filter((r) => r.status === "Verified").length,
      needsReview: reports.filter((r) => r.status === "Needs Review").length,
      processing: reports.filter((r) => r.status === "Processing").length,
    };
  }, [reports]);

  // Handlers for report mutations
  const handleReportUpdated = (updated: MedicalReport) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setReviewingReport(null);
  };

  const handleReportUploaded = (newReport: MedicalReport) => {
    setReports((prev) => [newReport, ...prev]);
    setIsUploadOpen(false);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#006194]/20">
      {/* Sticky App Header */}
      <Header
        user={user}
        onOpenProfile={() => setIsAuthOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container constrained to mobile phone/tablet width matching mockup */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-28">
        {/* TAB 1: REPORTS (Direct replication of Image 1) */}
        {activeTab === "reports" && (
          <div className="space-y-4 animate-fade-in">
            {/* Title Row with Folder Icon */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div>
                <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight leading-none font-['Plus_Jakarta_Sans']">
                  Medical Reports
                </h1>
                <p className="text-[13px] text-[#64748b] mt-1.5 font-medium">
                  Secure, verified diagnostic records
                </p>
              </div>

              {/* Top-Right Folder Action Button from Image 1 */}
              <button
                onClick={() => setStatusFilter("All")}
                className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#006194] hover:bg-[#dbeafe] flex items-center justify-center transition-colors shadow-xs"
                title="View All Records Archive"
              >
                <FolderArchive className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input from Image 1 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#64748b]">
                <Search className="w-4 h-4 stroke-[2.2px]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports, labs, clinics..."
                className="w-full pl-10 pr-10 py-3 text-[14px] bg-white border border-[#e2e8f0] rounded-2xl placeholder:text-[#8e9aa8] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] shadow-[0_2px_6px_-2px_rgba(15,23,42,0.03)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Horizontal Filter Chips Row from Image 1 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-[13px] font-semibold">
              {/* All */}
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-3.5 py-1.5 rounded-full shrink-0 transition-all ${
                  statusFilter === "All"
                    ? "bg-[#006194] text-white shadow-xs font-bold"
                    : "bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                All <span className="ml-1 opacity-90">{counts.all}</span>
              </button>

              {/* Verified */}
              <button
                onClick={() => setStatusFilter("Verified")}
                className={`px-3.5 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all ${
                  statusFilter === "Verified"
                    ? "bg-[#006194] text-white shadow-xs font-bold"
                    : "bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>Verified ({counts.verified})</span>
              </button>

              {/* Needs Review */}
              <button
                onClick={() => setStatusFilter("Needs Review")}
                className={`px-3.5 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all ${
                  statusFilter === "Needs Review"
                    ? "bg-[#006194] text-white shadow-xs font-bold"
                    : "bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span>Needs Review ({counts.needsReview})</span>
              </button>

              {/* Processing */}
              <button
                onClick={() => setStatusFilter("Processing")}
                className={`px-3.5 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all ${
                  statusFilter === "Processing"
                    ? "bg-[#006194] text-white shadow-xs font-bold"
                    : "bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                <span>Processing ({counts.processing})</span>
              </button>
            </div>

            {/* Reports List */}
            <div className="space-y-3.5 pt-1">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#006194]" />
                  <span className="text-xs font-medium mt-2">Loading secure diagnostic records...</span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-[#e2e8f0]">
                  <p className="text-sm font-semibold text-[#0b1c30]">No medical reports found</p>
                  <p className="text-xs text-[#64748b] mt-1">Try adjusting search or status filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("All");
                    }}
                    className="mt-3 text-xs font-bold text-[#006194] hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={(r) => setSelectedReport(r)}
                    onReview={(r) => setReviewingReport(r)}
                  />
                ))
              )}
            </div>

            {/* Floating / Bottom Button: "+ Upload Medical Report" matching Image 1 */}
            <div className="pt-2 sticky bottom-20 z-20 flex justify-center">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full py-3.5 px-6 rounded-full bg-[#006194] hover:bg-[#004e77] text-white text-[15px] font-bold shadow-lg shadow-sky-900/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-98"
              >
                <PlusCircle className="w-5 h-5 text-white stroke-[2.4px]" />
                <span>Upload Medical Report</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HOME SCREEN */}
        {activeTab === "home" && (
          <HomeScreen
            user={user}
            reports={reports}
            vitals={vitals}
            onOpenUpload={() => setIsUploadOpen(true)}
            onGoToReports={() => setActiveTab("reports")}
            onReviewReport={(r) => setReviewingReport(r)}
          />
        )}

        {/* TAB 3: PRESCRIPTIONS SCREEN */}
        {activeTab === "prescriptions" && (
          <PrescriptionsScreen prescriptions={prescriptions} />
        )}

        {/* TAB 4: PROFILE SCREEN */}
        {activeTab === "profile" && (
          <ProfileScreen
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        reportsCount={counts.all}
      />

      {/* MODAL 1: Full Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onDelete={handleDeleteReport}
        onReview={(r) => {
          setSelectedReport(null);
          setReviewingReport(r);
        }}
      />

      {/* MODAL 2: Review Handwritten Notes & Confirm Data Modal */}
      <ReviewDataModal
        report={reviewingReport}
        onClose={() => setReviewingReport(null)}
        onConfirmed={handleReportUpdated}
      />

      {/* MODAL 3: Upload Medical Report Modal */}
      <UploadReportModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onReportUploaded={handleReportUploaded}
      />

      {/* MODAL 4: NutriAI User Authentication & Persistent Vault Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onUserChange={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}
