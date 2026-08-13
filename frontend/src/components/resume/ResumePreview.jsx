import React, { useMemo } from "react";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";

function ResumePreview({ resumeData = null }) {
  if (!resumeData) {
    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Sparkles size={14} /> Resume Preview
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center min-h-[350px]">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-3">
            <FileText size={24} className="opacity-60 text-[#A78BFA]" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Resume Uploaded</h3>
          <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
            Upload a PDF resume above to extract embeddings into ChromaDB and preview document details.
          </p>
        </div>
      </div>
    );
  }

  console.debug("ResumePreview received resumeData prop:", resumeData);

  const payload = resumeData?.resumeData || resumeData;

  const parsedText = useMemo(() => {
    if (typeof resumeData === "string") return resumeData;
    return (
      resumeData?.parsedText || resumeData?.text || resumeData?.parsed ||
      payload?.parsedText || payload?.text || payload?.parsed ||
      null
    );
  }, [resumeData, payload]);

  const parsedSummary = useMemo(() => {
    return (
      resumeData?.parsedSummary || resumeData?.summary ||
      payload?.summary || payload?.parsedSummary ||
      null
    );
  }, [resumeData, payload]);

  const rawText = parsedText || payload?.parsedText || payload?.text || payload?.parsed || "";
  const fileName = payload?.file?.originalname || payload?.filename || payload?.name || "Uploaded Resume";
  const displayName = payload?.name || payload?.fullName || payload?.contact?.name || fileName;
  const totalChunks = resumeData?.totalChunks || payload?.totalChunks || payload?.chunks?.length || 0;
  const summary = parsedSummary || payload?.summary || null;
  const contactEmail = payload?.contact?.email || payload?.email || null;
  const contactPhone = payload?.contact?.phone || payload?.phone || null;
  const location = payload?.contact?.location || payload?.contact?.address || null;

  return (
    
    <div className="relative space-y-4 w-full max-w-full">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <span className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1.5">
          <Sparkles size={14} /> Parsed Document View
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={12} /> {totalChunks} Vector Chunks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="space-y-6 w-full md:col-span-1">
          <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 shadow-lg shadow-black/10 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight">{displayName}</h1>
                <div className="flex items-center gap-3 flex-wrap mt-2">
                  <p className="text-xs text-[#A78BFA] font-medium">{payload?.title || payload?.headline || fileName}</p>
                  {contactEmail && <a className="text-xs text-gray-300 hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>}
                  {contactPhone && <span className="text-xs text-gray-300">{contactPhone}</span>}
                  {payload?.github && <a className="text-xs text-gray-300 hover:underline" href={payload.github} target="_blank" rel="noreferrer">GitHub</a>}
                  {payload?.linkedin && <a className="text-xs text-gray-300 hover:underline" href={payload.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                  {payload?.portfolio && <a className="text-xs text-gray-300 hover:underline" href={payload.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase text-gray-500 mb-2">Resume File</p>
                <p className="text-sm text-white break-words whitespace-pre-wrap">{fileName}</p>
              </div>
            </div>

            {location && (
              <div className="mt-4">
                <div className="text-gray-400 text-[11px] uppercase mb-1">Location</div>
                <div className="text-sm text-white">{location}</div>
              </div>
            )}
          </div>

          {payload?.skills && Array.isArray(payload.skills) && payload.skills.length > 0 && (
            <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 w-full">
              <h2 className="text-sm font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {payload.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 break-words whitespace-pre-wrap">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {payload?.experience && (
            <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 w-full">
              <h2 className="text-sm font-semibold text-white mb-4">Experience</h2>
              <div className="space-y-4">
                {Array.isArray(payload.experience) ? (
                  payload.experience.map((exp, idx) => (
                    <div key={idx} className="rounded-2xl bg-[#111827] border border-white/5 p-4 w-full">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-white break-words whitespace-pre-wrap">{exp.title || exp.role || exp.position}</div>
                        <div className="text-xs text-gray-400 break-words whitespace-pre-wrap">{exp.company || exp.employer}</div>
                        <div className="text-[11px] text-gray-500 break-words whitespace-pre-wrap">{exp.dates || exp.duration}</div>
                      </div>
                      {exp.description && <p className="mt-3 text-xs text-gray-300 leading-relaxed break-words whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-300 break-words whitespace-pre-wrap">{payload.experience}</p>
                )}
              </div>
            </div>
          )}

          {payload?.education && (
            <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 w-full">
              <h2 className="text-sm font-semibold text-white mb-4">Education</h2>
              <div className="space-y-4">
                {Array.isArray(payload.education) ? (
                  payload.education.map((edu, idx) => (
                    <div key={idx} className="rounded-2xl bg-[#111827] border border-white/5 p-4 w-full">
                      <div className="text-sm font-semibold text-white break-words whitespace-pre-wrap">{edu.degree || edu.degreeName || edu.program}</div>
                      <div className="text-xs text-gray-400 break-words whitespace-pre-wrap">{edu.school || edu.institution}</div>
                      {edu.dates && <div className="text-[11px] text-gray-500 mt-1 break-words whitespace-pre-wrap">{edu.dates}</div>}
                      {edu.description && <p className="mt-3 text-xs text-gray-300 leading-relaxed break-words whitespace-pre-wrap">{edu.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-300 break-words whitespace-pre-wrap">{payload.education}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 w-full md:col-span-2 px-6 md:px-10" style={{ padding: '24px', margin: '16px' }}>
          <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 w-full">
            <h2 className="text-sm font-semibold text-white mb-3">Parsed Summary</h2>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 px-6 md:px-8 py-5 md:py-6 space-y-4">
              <div className="pl-8 md:pl-10 pr-6 text-left space-y-4">
                {/** Render formatted summary with automatic heading detection */}
                {useMemo(() => {
                  if (!summary) {
                    return (
                      <p className="text-sm leading-relaxed text-gray-300 break-words whitespace-pre-wrap">
                        No parsed summary available.
                      </p>
                    );
                  }

                  const lines = String(summary).split(/\r?\n/).map((l) => l.replace(/\t/g, ' ').trim());
                  const nodes = [];

                  const headingKeywords = ["PROFESSIONAL SUMMARY","WORK EXPERIENCE","EDUCATION","TECHNICAL SKILLS","CERTIFICATIONS","PROJECTS","EXPERIENCE","SKILLS","SUMMARY","WORK EXPERIENCE","PROJECTS","PERSONAL PROJECTS"];

                  const bulletRegex = /^\s*[\u2022\-\*]\s+(.*)$/;

                  for (let i = 0; i < lines.length; i++) {
                    const raw = lines[i];
                    if (!raw) continue;

                    const normalized = raw.replace(/:$/, "").toUpperCase();
                    const isHeading = headingKeywords.includes(normalized) || /^[A-Z0-9\s]{3,}$/.test(raw) && raw === raw.toUpperCase();

                    if (isHeading) {
                      // render as distinct divider heading
                      nodes.push(
                        <div
                          key={`h-${i}`}
                          className="mt-10 mb-6 pt-4 border-t-4 border-blue-500 text-blue-400 font-black text-xl md:text-2xl uppercase tracking-widest pl-6 md:pl-8 block w-full"
                        >
                          {raw.replace(/:$/, "")}
                        </div>
                      );
                      continue;
                    }

                    // collect bullet lists
                    if (bulletRegex.test(raw)) {
                      const items = [];
                      let j = i;
                      while (j < lines.length && bulletRegex.test(lines[j])) {
                        const m = lines[j].match(bulletRegex);
                        if (m) items.push(m[1].trim());
                        j++;
                      }
                      i = j - 1;
                      nodes.push(
                        <ul key={`ul-${i}`} className="pl-5 list-disc text-slate-300 text-sm leading-relaxed mb-4">
                          {items.map((it, k) => (
                            <li key={k} className="mb-1 break-words whitespace-pre-wrap">{it}</li>
                          ))}
                        </ul>
                      );
                      continue;
                    }

                    // default paragraph
                    nodes.push(
                      <p key={`p-${i}`} className="text-sm leading-relaxed text-gray-300 mb-2 break-words whitespace-pre-wrap">
                        {raw}
                      </p>
                    );
                  }

                  return nodes;
                }, [summary])}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 w-full">
            <h2 className="text-sm font-semibold text-white mb-3">Extracted Content</h2>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 md:p-6 pl-6 md:pl-8 space-y-4 max-h-[520px] overflow-y-auto">
              <div className="p-6 pl-10 md:pl-12 text-left space-y-3">
                <pre className="whitespace-pre-wrap break-words pl-6 md:pl-8 pr-4 text-sm leading-relaxed overflow-x-hidden font-sans text-gray-300">
                  {rawText || "No extracted text available yet."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumePreview;
