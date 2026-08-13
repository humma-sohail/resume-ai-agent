import { useState, useRef } from "react";
import api from "../../services/api";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import "../../styles/resume.css";

function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setMessage("");
    setIsError(false);

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setIsError(true);
      setMessage("Please upload a PDF file only.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleUpload = async () => {
    console.log("Upload button clicked", { file, loading });

    if (!file) {
      console.log("No file selected, aborting upload");
      setIsError(true);
      setMessage("Please select a resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      console.log("Sending /api/resume/upload POST");
      const response = await api.post("/api/resume/upload", formData);

      console.log("Upload response received", response?.data);
      setMessage(response.data.message || "Resume uploaded successfully!");
      setIsError(false);

      if (onUploadSuccess) {
        console.debug("ResumeUpload response.data:", response.data);

        const payload = {
          ...response.data,
          resumeData: response.data.resumeData || response.data.parsed || response.data.parsedText || null,
        };

        console.debug("ResumeUpload normalized payload:", payload);
        try {
          onUploadSuccess(payload);
        } catch (e) {
          console.warn("onUploadSuccess threw when called with normalized payload:", e);
        }
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setIsError(true);
      setMessage(error.response?.data?.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMessage("");
    setIsError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!file ? (
        <div
          className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#7C5CFC]/15 text-[#A78BFA] border border-[#7C5CFC]/30 flex items-center justify-center mx-auto mb-4">
            <UploadCloud size={28} />
          </div>

          <h3 className="text-base font-semibold text-white">
            Upload your Resume PDF
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Drag & drop your PDF here, or <span className="text-[#A78BFA] underline">browse file</span>
          </p>

          <span className="text-[11px] text-gray-500 block">
            Supports PDF up to 5MB (Parsed into ChromaDB Vector Store)
          </span>
        </div>
      ) : (
        <div className="bg-[#1A1F35] border border-white/10 rounded-2xl p-5 relative">
          {!loading && (
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 text-[#A78BFA] border border-[#7C5CFC]/30 flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>

            <div className="flex-1 pr-6">
              <h4 className="text-sm font-medium text-white truncate max-w-[250px]">
                {file.name}
              </h4>
              <span className="text-xs text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Action Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#A78BFA] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Extracting Embeddings...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Upload & Process Resume</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Message Output */}
      {message && (
        <div
          className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            isError
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;