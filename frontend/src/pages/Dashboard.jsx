import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import ResumeUpload from "../components/resume/ResumeUpload";
import ResumePreview from "../components/resume/ResumePreview";
import ChatInput from "../components/chat/ChatInput";
import Message from "../components/chat/Message";
import { askAI } from "../services/api";
import { FileText, Bot, Sparkles, CheckCircle2, Download } from "lucide-react";
import "../styles/chat.css";

// Circular Gauge for ATS Score
function ATSGauge({ score }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const radius = 44;
  const stroke = 9;
  const normalizedRadius = radius - stroke / 2;
  const circ = 2 * Math.PI * normalizedRadius;
  const pctValue = Math.max(0.01, pct);
  const progress = circ * ((100 - pctValue) / 100);

  let color = "#f472b6";
  let shadow = "";
  let badgeText = "Low ATS Match";
  let badgeColor = "bg-rose-600/80 text-rose-200 border-rose-400/30";
  if (pct >= 75) {
    color = "#22d3a3";
    shadow = "0 0 18px 0 #70FFBA, 0 0 80px #22d3a3";
    badgeText = "High ATS Match";
    badgeColor = "bg-emerald-600/80 text-emerald-100 border-emerald-400/40";
  } else if (pct >= 50) {
    color = "#facc15";
    shadow = "0 0 12px 0 #facc15AA";
    badgeText = "Moderate ATS Match";
    badgeColor = "bg-yellow-700/80 text-yellow-200 border-yellow-400/30";
  }

  return (
    <div
      className="flex items-center gap-6 py-4 px-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d1730] via-[#221f39] to-[#181E35] shadow-xl"
      style={{
        background: "linear-gradient(135deg, #1d1730 0%, #221f39 60%, #181E35 100%)"
      }}
    >
      <div className="relative w-[110px] h-[110px] shrink-0 flex items-center justify-center">
        <svg
          width={radius * 2}
          height={radius * 2}
          className="block"
          style={{ filter: shadow ? `drop-shadow(${shadow})` : undefined }}
        >
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke="#232440"
            fill="none"
            strokeWidth={stroke}
            style={{ opacity: 0.6 }}
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={progress}
            strokeLinecap="round"
            style={{
              transition:
                "stroke-dashoffset 0.85s cubic-bezier(0.56,0.21,0,1),stroke 0.5s",
              filter: shadow ? `drop-shadow(${shadow})` : undefined
            }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-3xl font-bold select-none"
          style={{
            color: color,
            textShadow:
              pct >= 75
                ? "0 0 8px #32e7a6aa, 0 0 32px #22d3a3"
                : pct >= 50
                ? "0 0 8px #facc15bb"
                : "0 0 4px #f472b6bb"
          }}
        >
          {pct}%
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-100 tracking-tight">
            ATS Score
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${badgeColor} shadow`}
            style={{
              letterSpacing: 0.1,
              marginLeft: 2,
              transition: "all 0.3s cubic-bezier(.76,0,.24,1)"
            }}
          >
            {badgeText}
          </span>
        </div>
        <div className="text-sm text-gray-400 mt-0.5">
          {badgeText === "High ATS Match"
            ? "Your resume scores excellently for this job. Great fit!"
            : badgeText === "Moderate ATS Match"
            ? "Decent match—consider optimizing your resume's keywords."
            : "Low match. Tailoring your resume will help improve fit."}
        </div>
      </div>
    </div>
  );
}

// Utility wrapper for animated slide-up appearance
function CardTransition({ children, delay = 0 }) {
  // Delay can be adjusted per card if needed
  return (
    <div
      className="transition-all duration-500 ease-[cubic-bezier(0.39,0.58,0.57,1)] transform opacity-100 translate-y-0 will-change-transform"
      style={{
        animation: `ats-slide-up 0.6s cubic-bezier(0.39,0.58,0.57,1) ${delay}ms both`
      }}
    >
      {children}
      <style>
        {`
          @keyframes ats-slide-up {
            0% { opacity: 0; transform: translateY(32px);}
            100% { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}

function Dashboard() {
  const mainRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Active RAG Chat State
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! Upload your resume PDF on the left. Once stored in the vector database, ask me any question about your resume content or experience.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Active Resume State & Upload Confirmation
  const [uploadDetails, setUploadDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Job Description ATS State
  const [jobDescription, setJobDescription] = useState("");
  const [analyzingATS, setAnalyzingATS] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);

  // --- AI Auto-Tailor Feature State ---
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredBullets, setTailoredBullets] = useState(null);
  const [tailorError, setTailorError] = useState(null);

  // Dynamically load html2pdf.js
  const ensureHtml2Pdf = async () => {
    if (!window.html2pdf) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }
    return Promise.resolve();
  };

  const handleAutoTailor = async () => {
    setTailoredBullets(null);
    setTailorError(null);
    if (
      !uploadDetails?.parsedText ||
      !atsResult?.missingKeywords ||
      !Array.isArray(atsResult.missingKeywords) ||
      atsResult.missingKeywords.length === 0
    ) {
      setTailorError("Cannot auto-tailor: Resume and missing keywords required.");
      return;
    }
    setIsTailoring(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/tailor-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText: uploadDetails.parsedText,
          missingKeywords: atsResult.missingKeywords
        })
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(
          typeof err === "string" && err ? err : "Failed to tailor resume."
        );
      }
      const data = await response.json();
      if (data && data.data && data.data.tailoredBullets) {
        setTailoredBullets({
          tailoredBullets: data.data.tailoredBullets,
          summaryNote: data.data.summaryNote || ""
        });
      } else {
        throw new Error("Unexpected AI response. Please try again.");
      }
    } catch (err) {
      setTailorError(
        typeof err === "string"
          ? err
          : err.message || "Failed to tailor resume."
      );
    } finally {
      setIsTailoring(false);
    }
  };

  const handleDownloadPDF = async () => {
    await ensureHtml2Pdf();
    const element = document.getElementById("tailored-resume-pdf");
    if (!element) return;
    window.html2pdf()
      .from(element)
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: "resume-tailored-bullets.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all"] }
      })
      .save();
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const appendMessage = (message) => {
    const normalizedMessage = {
      ...message,
      id:
        message.id ??
        `${message.sender}-${message.text}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      createdAt: message.createdAt ?? Date.now()
    };

    setMessages((prev) => {
      const exists = prev.some((existing) => {
        if (existing.id && existing.id === normalizedMessage.id) return true;
        if (
          existing.createdAt &&
          existing.createdAt === normalizedMessage.createdAt
        )
          return true;
        if (
          existing.sender === normalizedMessage.sender &&
          existing.text === normalizedMessage.text
        ) {
          return (
            existing.time === normalizedMessage.time ||
            existing.createdAt === normalizedMessage.createdAt
          );
        }
        return false;
      });

      return exists ? prev : [...prev, normalizedMessage];
    });
  };

  const handleSendMessage = async (queryText) => {
    const trimmedQuery = queryText.trim();
    if (!trimmedQuery || isSubmittingRef.current || chatLoading) return;

    isSubmittingRef.current = true;

    const userMsg = {
      sender: "User",
      text: trimmedQuery,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const data = await askAI(trimmedQuery);
      const aiReply = {
        sender: "AI",
        text:
          data.answer ||
          data.reply ||
          "Processed question using RAG vector context.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      appendMessage(aiReply);
    } catch (err) {
      appendMessage({
        sender: "AI",
        text:
          "Unable to reach AI Service. Ensure Gateway (5000), Resume Service (5001), and AI Service (5002) are running.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    } finally {
      setChatLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleUploadSuccess = (data) => {
    const normalized = {
      ...data,
      parsedText:
        data.parsedText ??
        (data.resumeData && (data.resumeData.text || data.resumeData.parsedText)) ??
        null,
      parsedSummary:
        data.parsedSummary ?? (data.resumeData && data.resumeData.summary) ?? null,
      totalChunks:
        data.totalChunks ??
        (data.resumeData && data.resumeData.chunks && data.resumeData.chunks.length) ??
        data.totalChunks
    };

    setUploadDetails(normalized);

    appendMessage({
      sender: "AI",
      text: `Resume processed and vectorized successfully! Total ${
        normalized.totalChunks || 1
      } text chunks stored in ChromaDB. You can now ask questions about your resume.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    setAtsResult(null);
    setJobDescription("");
    setAtsError(null);
    setTailoredBullets(null);
    setTailorError(null);
  };

  const handleATSAnalyze = async () => {
    setAtsError(null);
    setAtsResult(null);
    setTailoredBullets(null);
    setTailorError(null);
    if (!uploadDetails?.parsedText || !jobDescription.trim()) {
      setAtsError("Both parsed resume and job description are required.");
      return;
    }
    setAnalyzingATS(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/analyze-ats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText: uploadDetails.parsedText,
          jobDescription
        })
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "ATS analysis failed");
      }
      const data = await response.json();

      // Normalize score so it's always between 0 and 100
      let normalizedScore = data.score || 0;
      if (normalizedScore > 100) {
        normalizedScore = Math.round(normalizedScore / 100);
      } else if (normalizedScore > 0 && normalizedScore <= 1) {
        normalizedScore = Math.round(normalizedScore * 100);
      }

      setAtsResult({
        ...data,
        score: normalizedScore
      });
    } catch (err) {
      setAtsError(
        typeof err === "string" ? err : err.message || "ATS analysis failed."
      );
    } finally {
      setAnalyzingATS(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full max-w-full bg-[#0b0f19] text-white">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main
        id="main-content"
        ref={mainRef}
        className="flex flex-1 min-w-0 flex-col h-screen overflow-y-auto transition-all duration-300"
      >
        <Navbar
          title={
            activeTab === "dashboard"
              ? "Dashboard Workspace"
              : activeTab === "parser"
              ? "Resume Parser"
              : "RAG AI Chat"
          }
        />
        <div className="flex-1 min-h-0">
          <div className="w-full max-w-full mx-auto p-6 md:p-8 space-y-8">
            {/* Status Header Banner */}
            <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
                  {activeTab === "dashboard" && "Resume AI Dashboard"}
                  {activeTab === "parser" && "Resume Parser"}
                  {activeTab === "chat" && "RAG AI Chat"}
                  <Sparkles size={22} className="text-[#A78BFA]" />
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {activeTab === "dashboard" &&
                    "Monitor resume uploads, view quick actions, and keep your AI workspace ready."}
                  {activeTab === "parser" &&
                    "Upload a resume and preview parsed text with clean typography and layout."}
                  {activeTab === "chat" &&
                    "Ask your RAG AI assistant questions about your resume content."}
                </p>
              </div>
              {uploadDetails && activeTab !== "chat" && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
                  <CheckCircle2 size={16} />
                  <span>
                    Resume Chunked ({uploadDetails.totalChunks} vectors)
                  </span>
                </div>
              )}
            </div>
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-7 space-y-6">
                  <div className="bg-[#1A1F35] border border-white/10 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-4 border-b border-white/10 pb-3">
                      <FileText size={18} className="text-[#A78BFA]" />
                      <h2 className="text-base font-semibold text-white">
                        Overview
                      </h2>
                    </div>
                    <div className="space-y-4 text-sm text-gray-300 leading-7">
                      <p>
                        Welcome to the Resume AI workspace. Use the Parser tab to
                        upload and inspect resumes or the Chat tab to query parsed
                        resume content.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("parser")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C5CFC] text-white text-sm font-semibold hover:opacity-95 transition"
                      >
                        Open Resume Parser
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3">
                        Active Services
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl bg-[#1A1F35] p-5 border border-white/10">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
                            Gateway
                          </p>
                          <p className="text-xl font-semibold text-white">5000</p>
                        </div>
                        <div className="rounded-3xl bg-[#1A1F35] p-5 border border-white/10">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
                            Resume Service
                          </p>
                          <p className="text-xl font-semibold text-white">5001</p>
                        </div>
                        <div className="rounded-3xl bg-[#1A1F35] p-5 border border-white/10">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
                            AI Service
                          </p>
                          <p className="text-xl font-semibold text-white">5002</p>
                        </div>
                        <div className="rounded-3xl bg-[#1A1F35] p-5 border border-white/10">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
                            Resume Uploads
                          </p>
                          <p className="text-xl font-semibold text-white">
                            {uploadDetails ? uploadDetails.totalChunks : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "parser" && (
              <div className="space-y-6">
                <div className="bg-[#1A1F35] border border-white/10 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2.5 mb-4 border-b border-white/10 pb-3">
                    <FileText size={18} className="text-[#A78BFA]" />
                    <h2 className="text-base font-semibold text-white">
                      Upload & Preview Resume
                    </h2>
                  </div>
                  <ResumeUpload onUploadSuccess={handleUploadSuccess} />
                </div>
                <div className="bg-[#1A1F35] border border-white/10 rounded-3xl p-6 shadow-xl leading-relaxed">
                  <ResumePreview resumeData={uploadDetails} />
                </div>
                {/* JD ATS Section: Only show if resume was parsed */}
                {uploadDetails && uploadDetails.parsedText && (
                  <div className="bg-[#181E35] border border-violet-500/10 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      ATS Match Analyzer
                      <span className="ml-2 px-2 bg-[#7C5CFC]/10 text-[#A78BFA] text-xs rounded-md">
                        Beta
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Paste the target Job Description below and analyze your
                      resume's ATS match.
                    </p>
                    <textarea
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      rows={6}
                      placeholder="Paste job description here to analyze ATS match..."
                      className="w-full text-sm p-3 rounded-xl border border-[#7C5CFC]/30 bg-[#10142B] text-white resize-vertical outline-none focus:ring-2 focus:ring-[#7C5CFC] mb-3 transition"
                    />
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={handleATSAnalyze}
                        disabled={analyzingATS || !jobDescription.trim()}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#7C5CFC] hover:opacity-90 transition
                          ${analyzingATS || !jobDescription.trim() ? "opacity-70 cursor-not-allowed" : ""}
                        `}
                      >
                        {analyzingATS && (
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                        )}
                        Analyze ATS Match
                      </button>
                      {atsError && (
                        <span className="text-sm text-rose-400">{atsError}</span>
                      )}
                    </div>
                    {/* ATS Result Enhanced Card Section */}
                    {atsResult && (
                      <CardTransition>
                        <div className="space-y-5 mt-1">
                          {atsResult.score !== undefined && (
                            <CardTransition delay={75}>
                              <div className="bg-[#23273c] rounded-3xl shadow-xl border border-violet-500/30 p-2 sm:p-4 mb-1 transition-all">
                                <ATSGauge score={atsResult.score} />
                              </div>
                            </CardTransition>
                          )}
                          {atsResult.matchingKeywords?.length > 0 && (
                            <CardTransition delay={120}>
                              <div className="rounded-2xl px-5 py-4 bg-[#262E4C]/70 border border-green-500/20 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                  <h4 className="text-base font-semibold text-emerald-400">
                                    Matching Keywords
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {atsResult.matchingKeywords.map((kw, idx) => (
                                    <span
                                      key={kw + idx}
                                      className="inline-block px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs hover:scale-105 transition-all duration-200 cursor-pointer border border-emerald-300/20 hover:border-emerald-400/80 shadow"
                                      style={{
                                        boxShadow:
                                          "0 0 0 0 #22d3a350, 0 1px 4px #22d3a343"
                                      }}
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </CardTransition>
                          )}
                          {atsResult.missingKeywords?.length > 0 && (
                            <CardTransition delay={180}>
                              <div className="rounded-2xl px-5 py-4 bg-[#3F222D]/70 border border-rose-500/15 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                                  <h4 className="text-base font-semibold text-rose-400">
                                    Missing Keywords
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {atsResult.missingKeywords.map((kw, idx) => (
                                    <span
                                      key={kw + idx}
                                      className="inline-block px-3 py-1 rounded-full bg-rose-600/20 text-rose-200 text-xs border border-rose-500/30 hover:scale-105 transition-all duration-200 cursor-pointer hover:border-rose-300/80 shadow"
                                      style={{
                                        boxShadow:
                                          "0 0 0 0 #f43f5e70, 0 1px 4px #f472b6a8"
                                      }}
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                                {/* AI Auto-Tailor Button Under Missing Keywords */}
                                <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
                                  <button
                                    type="button"
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-[#7C5CFC] hover:opacity-95 transition border border-[#a78bfa22] shadow
                                      ${isTailoring ? "opacity-65 cursor-not-allowed" : ""}
                                    `}
                                    disabled={
                                      isTailoring ||
                                      !atsResult ||
                                      !atsResult.missingKeywords ||
                                      atsResult.missingKeywords.length === 0
                                    }
                                    onClick={handleAutoTailor}
                                  >
                                    {isTailoring && (
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                      </svg>
                                    )}
                                    Auto-Tailor Bullet Points with AI
                                  </button>
                                  {tailorError && (
                                    <span className="text-sm text-rose-400">{tailorError}</span>
                                  )}
                                </div>
                                {/* Tailored Bullets Output Section */}
                                {tailoredBullets && tailoredBullets.tailoredBullets && tailoredBullets.tailoredBullets.length > 0 && (
                                  <CardTransition delay={100}>
                                    <div id="tailored-resume-pdf"
                                      className="mt-6 mb-2 rounded-2xl border border-emerald-500/20 bg-[#192429] px-6 py-6 shadow-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={18} className="text-[#A78BFA]" />
                                        <h5 className="text-base font-semibold text-emerald-200">
                                          Tailored Resume Bullet Points
                                        </h5>
                                      </div>
                                      {tailoredBullets.summaryNote && (
                                        <div className="mb-2 text-xs text-emerald-300 font-medium">
                                          {tailoredBullets.summaryNote}
                                        </div>
                                      )}
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-left mt-2 table-auto border-neutral-800">
                                          <thead>
                                            <tr>
                                              <th className="pb-1 pr-3 font-medium text-gray-400">Original</th>
                                              <th className="pb-1 pr-3 font-medium text-gray-300">Tailored (with keyword)</th>
                                              <th className="pb-1 font-medium text-sky-300">Keyword Added</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {tailoredBullets.tailoredBullets.map((row, idx) => (
                                              <tr key={idx} className="align-top border-b border-[#26483d22]">
                                                <td className="py-2 pr-3 text-gray-400">{row.original}</td>
                                                <td className="py-2 pr-3 text-emerald-100 font-semibold">{row.tailored}</td>
                                                <td className="py-2 text-xs">
                                                  <span className="inline-block px-2 py-1 rounded-md bg-emerald-700/30 text-emerald-300">
                                                    {row.keywordAdded}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                          onClick={handleDownloadPDF}
                                          type="button"
                                          className="px-4 py-2 rounded-xl bg-[#7C5CFC] text-white font-semibold flex items-center gap-2 border border-[#a78bfa22] shadow hover:opacity-95 transition text-sm"
                                        >
                                          <Download size={16} /> Download PDF
                                        </button>
                                      </div>
                                    </div>
                                  </CardTransition>
                                )}
                              </div>
                            </CardTransition>
                          )}
                          {atsResult.suggestions && (
                            <CardTransition delay={250}>
                              <div className="rounded-2xl px-5 py-4 bg-[#263348]/60 border border-yellow-400/15 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                                  <h4 className="text-base font-semibold text-yellow-300">
                                    Improvement Suggestions
                                  </h4>
                                </div>
                                <ul className="list-disc text-sm text-yellow-100 ml-5 space-y-1">
                                  {Array.isArray(atsResult.suggestions) ? (
                                    atsResult.suggestions.map((s, idx) => (
                                      <li key={idx}>{s}</li>
                                    ))
                                  ) : (
                                    <li>{atsResult.suggestions}</li>
                                  )}
                                </ul>
                              </div>
                            </CardTransition>
                          )}
                        </div>
                      </CardTransition>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "chat" && (
              <div className="flex flex-col h-[calc(100vh-120px)] min-h-0 w-full overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl p-4">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1F35]/70 p-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFC]/20 text-[#A78BFA] border border-[#7C5CFC]/30 flex items-center justify-center">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm text-white">
                        RAG AI Chat Assistant
                      </h2>
                      <p className="text-[11px] text-gray-400">
                        Connected to AI Service & Vector Store
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">
                      Online
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-2 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 my-12">
                      <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/20 text-[#A78BFA] border border-[#7C5CFC]/30 flex items-center justify-center mb-3">
                        <Bot size={24} />
                      </div>
                      <p className="text-sm font-medium text-white">
                        Ask anything about your resume
                      </p>
                      <p className="text-xs text-gray-500 max-w-xs mt-1">
                        The AI RAG Assistant will search through your uploaded vector
                        documents to answer.
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <Message
                        key={
                          message.id ?? `${message.sender}-${message.time}-${index}`
                        }
                        sender={message.sender}
                        text={message.text}
                        time={message.time}
                        retrievedFrom={message.retrievedFrom}
                      />
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center text-white shrink-0">
                        <Bot size={18} />
                      </div>
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  loading={chatLoading}
                  className="shrink-0"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
