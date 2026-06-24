"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  IoSearch,
  IoClose,
  IoAlertCircle,
  IoArrowBack,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoChatbubblesOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  fileName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    chunks: number;
  };
}

interface ChatSession {
  id: string;
  sessionId: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    suggestedQuestions?: string[];
  }>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeDashboard() {
  const [activeTab, setActiveTab] = useState<"docs" | "logs">("docs");
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  
  // Upload Form state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const [docsRes, logsRes] = await Promise.all([
        fetch("/api/admin/knowledge"),
        fetch("/api/admin/conversations"),
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocs(docsData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setSessions(logsData);
      }
    } catch (err) {
      console.error("Error loading knowledge dashboard data:", err);
      setActionError("Failed to connect to administrative endpoints.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setDocs((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, isActive: !currentStatus } : doc
          )
        );
      } else {
        const errData = await res.json();
        setActionError(errData.error || "Failed to update document status.");
      }
    } catch (err) {
      setActionError("Failed to update document status.");
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? This will remove all vector search chunks instantly.")) {
      return;
    }
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocs((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        const errData = await res.json();
        setActionError(errData.error || "Failed to delete document.");
      }
    } catch (err) {
      setActionError("Failed to delete document.");
    }
  };

  // Upload handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert("Please specify a document title.");
      return;
    }
    if (!uploadFile && !uploadText.trim()) {
      alert("Please upload a file or write document text.");
      return;
    }

    setIsUploading(true);
    setActionError(null);

    const formData = new FormData();
    formData.append("title", uploadTitle);
    if (uploadFile) {
      formData.append("file", uploadFile);
    } else {
      formData.append("text", uploadText);
    }

    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setUploadTitle("");
        setUploadText("");
        setUploadFile(null);
        // Refresh document list
        await fetchData();
      } else {
        const errData = await res.json();
        setActionError(errData.error || "Failed to index document.");
      }
    } catch (err) {
      setActionError("Failed to process document indexing.");
    } finally {
      setIsUploading(false);
    }
  };

  // Filter docs based on search
  const filteredDocs = docs.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.fileName && doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter sessions based on search
  const filteredSessions = sessions.filter((s) =>
    s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.ipAddress && s.ipAddress.includes(searchQuery))
  );

  const getSourceBadgeColor = (type: string) => {
    switch (type) {
      case "SYSTEM":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "UPLOAD_PDF":
        return "bg-red-50 text-red-700 border-red-200";
      case "UPLOAD_DOCX":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "UPLOAD_MD":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getSourceLabel = (type: string) => {
    switch (type) {
      case "SYSTEM":
        return "Built-in System Context";
      case "UPLOAD_PDF":
        return "PDF Upload";
      case "UPLOAD_DOCX":
        return "Word Document";
      case "UPLOAD_MD":
        return "Markdown File";
      default:
        return "Plain Text Input";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-800">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <IoArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Admin Portal
            </p>
            <h1 className="text-xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
              Chatbot & Knowledge Base
            </h1>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          <button
            onClick={() => {
              setActiveTab("docs");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "docs"
                ? "bg-white text-[#252e3d] shadow-2xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <IoDocumentTextOutline className="w-4 h-4" />
            <span>Knowledge base ({docs.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "logs"
                ? "bg-white text-[#252e3d] shadow-2xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <IoChatbubblesOutline className="w-4 h-4" />
            <span>Chat Session Logs ({sessions.length})</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-700">
            <IoAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Action Failed:</span> {actionError}
            </div>
          </div>
        )}

        {/* Action Header Card */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#252e3d]">
              {activeTab === "docs"
                ? "Manage your AI Knowledge Documents"
                : "Review user conversation history"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "docs"
                ? "Upload services documentation, custom text descriptions, or guidelines. These documents are parsed, chunked, and stored in vector database to contextually instruct the chatbot."
                : "Anonymously trace actual chatbot answers, user queries, and check the follow-up recommendations to keep improving your visitor engagement."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={activeTab === "docs" ? "Search documents..." : "Search sessions / IPs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-52 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-700 outline-none rounded-xl border border-slate-200 transition focus:border-[#5a58ab]"
              />
            </div>

            {activeTab === "docs" && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 bg-[#5a58ab] hover:bg-[#4a489b] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <IoCloudUploadOutline className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Box */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#5a58ab]"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Fetching database logs...</p>
          </div>
        ) : activeTab === "docs" ? (
          /* KNOWLEDGE BASE MANAGEMENT LIST */
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <IoDocumentTextOutline className="w-12 h-12 mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No knowledge documents found.</p>
                <p className="text-xs text-slate-400 mt-1">Upload a document to seed the chatbot's custom knowledge base.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-4 px-6">Document Title</th>
                      <th className="py-4 px-6">Source Format</th>
                      <th className="py-4 px-6">Vector Chunks</th>
                      <th className="py-4 px-6">Indexing Date</th>
                      <th className="py-4 px-6">Chatbot State</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-800 block truncate max-w-[250px]" title={doc.title}>
                            {doc.title}
                          </span>
                          {doc.fileName && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {doc.fileName}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${getSourceBadgeColor(doc.sourceType)}`}>
                            {getSourceLabel(doc.sourceType)}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600 font-mono">
                          {doc._count.chunks}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleToggleActive(doc.id, doc.isActive)}
                              disabled={doc.sourceType === "SYSTEM"}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5a58ab] focus:ring-offset-2 ${
                                doc.isActive ? "bg-[#5a58ab]" : "bg-slate-200"
                              } ${doc.sourceType === "SYSTEM" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  doc.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="ml-2 text-xs font-medium text-slate-500">
                              {doc.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right flex items-center justify-end gap-3 mt-1.5">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer text-xs"
                            title="Preview file contents"
                          >
                            <IoEyeOutline className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                          
                          {doc.sourceType !== "SYSTEM" && (
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold cursor-pointer text-xs"
                              title="Delete document and chunks"
                            >
                              <IoTrashOutline className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* CONVERSATION HISTORY LOGS LIST */
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <IoChatbubblesOutline className="w-12 h-12 mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No chat sessions found.</p>
                <p className="text-xs text-slate-400 mt-1">Chat logs will appear here once visitors start interacting with the chatbot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-4 px-6">Session Identifier</th>
                      <th className="py-4 px-6">Client IP</th>
                      <th className="py-4 px-6">Total Dialogues</th>
                      <th className="py-4 px-6">Latest Message</th>
                      <th className="py-4 px-6">Last Active</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredSessions.map((session) => {
                      const userMsgs = session.messages.filter((m) => m.role === "user");
                      const latestMsg = userMsgs[userMsgs.length - 1]?.content || "No user messages yet.";
                      
                      return (
                        <tr key={session.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-800 font-mono text-xs">
                              {session.sessionId.substring(0, 15)}...
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                            {session.ipAddress || "127.0.0.1"}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-600 font-mono">
                            {session.messages.length}
                          </td>
                          <td className="py-4 px-6 text-slate-500 max-w-[200px] truncate" title={latestMsg}>
                            {latestMsg}
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {new Date(session.updatedAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setActiveSession(session)}
                              className="text-xs font-bold text-[#5a58ab] hover:underline cursor-pointer flex items-center gap-1 justify-end ml-auto"
                            >
                              <IoChatbubblesOutline className="w-3.5 h-3.5" />
                              <span>View Chat Log</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODAL: DOCUMENT PREVIEW ────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252e3d]/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition"
            >
              <IoClose className="w-5 h-5" />
            </button>

            <header className="mb-4 pb-3 border-b border-slate-100 pr-10">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#5a58ab]">
                Document Content Preview
              </p>
              <h3 className="text-lg font-bold text-[#252e3d] mt-0.5">
                {previewDoc.title}
              </h3>
            </header>

            <div className="flex-grow overflow-y-auto bg-slate-50 rounded-2xl border border-slate-200/60 p-5 text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
              {previewDoc.content}
            </div>

            <footer className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Preview
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ── MODAL: DOCUMENT UPLOAD ─────────────────────────────────────────── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252e3d]/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition"
            >
              <IoClose className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#252e3d] border-b border-slate-100 pb-3" style={{ fontFamily: "Crimson Text, serif" }}>
              Upload Custom Knowledge
            </h3>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Resume Writing Guidelines 2026"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-sm text-slate-700 outline-none rounded-xl border border-slate-200 transition focus:border-[#5a58ab]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">Upload File (.pdf, .docx, .txt, .md)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#5a58ab] hover:file:bg-purple-100 transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Max file size: 5MB. Word, PDF, Plain text, and Markdown files are supported.</span>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-150"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">OR Paste Text</span>
                <div className="flex-grow border-t border-slate-150"></div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">Raw Text Content</label>
                <textarea
                  placeholder="Paste details about custom services, FAQs, or background timeline info here..."
                  rows={6}
                  value={uploadText}
                  disabled={!!uploadFile}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-sm text-slate-700 outline-none rounded-xl border border-slate-200 transition focus:border-[#5a58ab] disabled:opacity-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-[#5a58ab] hover:bg-[#4a489b] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Indexing document...</span>
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="w-4.5 h-4.5" />
                      <span>Build Vectors</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SESSION LOG DETAIL ──────────────────────────────────────── */}
      {activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252e3d]/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#f4f6fb] rounded-3xl border border-slate-200 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActiveSession(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-white shadow-sm border border-slate-100 transition"
            >
              <IoClose className="w-5 h-5" />
            </button>

            <header className="mb-4 pb-3 border-b border-slate-200 pr-10">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#5a58ab]">
                Visitor Conversation Trace
              </p>
              <h3 className="text-lg font-bold text-[#252e3d] mt-0.5">
                Session: {activeSession.sessionId.substring(0, 20)}...
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                IP: <span className="font-mono">{activeSession.ipAddress || "127.0.0.1"}</span> | User Agent: {activeSession.userAgent || "Unknown"}
              </p>
            </header>

            {/* Conversation Messages Box */}
            <div className="flex-grow overflow-y-auto space-y-4 p-4 rounded-2xl bg-white border border-slate-200 scrollbar-thin-styled">
              {activeSession.messages.map((msg, idx) => {
                if (msg.role === "system") return null;

                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-2xs border ${
                      isUser
                        ? "bg-[#252e3d] text-white border-slate-800"
                        : "bg-slate-50 text-slate-700 border-slate-200/60"
                    }`}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1 opacity-60">
                        {isUser ? "Visitor" : "Llama-3 (Groq)"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed leading-normal">{msg.content}</p>
                      
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200/50">
                          <p className="text-[9px] font-extrabold uppercase text-[#5a58ab] tracking-wider mb-1">Recommended Follow-Ups:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.suggestedQuestions.map((q, qidx) => (
                              <span key={qidx} className="bg-[#5a58ab]/10 text-[#5a58ab] text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[#5a58ab]/20">
                                {q}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveSession(null)}
                className="bg-slate-200 hover:bg-slate-350 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Chat Log
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
