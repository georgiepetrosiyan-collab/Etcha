// E-frontend/src/components/CreateCVModal/createCVModal.jsx

import React, { useEffect, useRef, useState } from 'react'
// If you use standard axios:
import axios from "axios";

// OR if you intended to use a custom configured instance from your project:
// import axiosInstance from "../../api/axios"; // (or wherever your actual axiosInstance file lives)
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckIcon from '@mui/icons-material/Check'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import A4ResumePreview from '../A4ResumePreview/a4ResumePreview'

const MATCH_THRESHOLD = 50;
const A4_WIDTH_PX = 794;
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

const LOADING_MESSAGES = [
    "Reading the job description...",
    "Matching your experience to key requirements...",
    "Prioritizing your most relevant skills...",
    "Writing ATS-optimized summary...",
    "Polishing the final resume...",
];

const DEFAULT_ERROR_MESSAGE = "Try again a couple minutes later";

const CreateCVModal = ({ job, onClose }) => {
    const cvRef = useRef(null);

    const matchPercentage = job?.matchPercentage;
    const isLowMatch = matchPercentage !== undefined && matchPercentage !== null && matchPercentage < MATCH_THRESHOLD;
    const [showLowMatchBanner, setShowLowMatchBanner] = useState(isLowMatch);

    const [cv, setCv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const stop = (e) => e.stopPropagation();

    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 1800);
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        generateCV();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job?._id]);

    const generateCV = async () => {
        setLoading(true);
        setError(false);
        setApplied(false);
        try {
            const cvRes = await axios.post(
                'http://localhost:4000/api/cv/generate',
                { jobId: job._id },
                { withCredentials: true }
            );
            setCv(cvRes.data.cv);
        } catch (err) {
            console.log(err);
            setError(true);
            toast.error(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!cvRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cvRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: A4_WIDTH_PX,
                windowWidth: A4_WIDTH_PX
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

            const imgWidth = A4_WIDTH_PT;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= A4_HEIGHT_PT;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= A4_HEIGHT_PT;
            }

            const fileName = `${(cv?.fullName || 'Resume').replace(/\s+/g, '_')}_${(job?.company || 'Resume').replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
            toast.success("CV downloaded as PDF (A4)");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate PDF");
        } finally {
            setDownloading(false);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            const res = await axios.post(
                `http://localhost:4000/api/job/${job._id}/apply`,
                { cv, matchPercentage },
                { withCredentials: true }
            );
            setApplied(true);
            if (res.data?.autoRejected) {
                toast.error(`Applied, but this résumé only matched ${res.data.atsScore}% of the job's keywords — the application was automatically declined.`);
            } else {
                toast.success("Applied successfully!");
            }
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setApplying(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2000 px-4 py-6"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={stop}
            >
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <AutoAwesomeIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                            AI-tailored CV
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{job?.title} · {job?.company}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 cursor-pointer transition-colors -mt-1 -mr-1"
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                {showLowMatchBanner && !loading && !error && (
                    <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-3 shrink-0">
                        <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 20 }} className="shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 flex-1">
                            This is a <span className="font-semibold">{matchPercentage}% match</span> — lower than most roles you'd typically get traction on. You can still apply, but it may be worth reviewing whether this role fits your background first.
                        </p>
                        <button
                            onClick={() => setShowLowMatchBanner(false)}
                            className="text-red-400 hover:text-red-700 cursor-pointer shrink-0"
                        >
                            <CloseIcon sx={{ fontSize: 18 }} />
                        </button>
                    </div>
                )}

                {!loading && !error && cv && (
                    <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-gray-100 shrink-0 flex-wrap">
                        <button
                            onClick={generateCV}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium cursor-pointer transition-colors px-2"
                        >
                            <RefreshIcon sx={{ fontSize: 18 }} />
                            Regenerate
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors"
                        >
                            {downloading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={applying || applied}
                            className={`flex items-center gap-1 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                                applied ? "bg-green-600 cursor-default" : "bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-60"
                            }`}
                        >
                            {applied ? (
                                <>
                                    <CheckIcon sx={{ fontSize: 18 }} />
                                    Applied
                                </>
                            ) : applying ? "Applying..." : "Looks good, Apply"}
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto py-8 px-4 bg-gray-100 flex justify-center">
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-24">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">{LOADING_MESSAGES[loadingStep]}</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center max-w-sm">
                            <p className="text-base font-semibold text-gray-800">Couldn't generate your CV</p>
                            <p className="text-sm text-gray-500">{DEFAULT_ERROR_MESSAGE}</p>
                            <button
                                onClick={generateCV}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && cv && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="w-full overflow-x-auto flex justify-center">
                                <A4ResumePreview cv={cv} innerRef={cvRef} scale={0.82} />
                            </div>

                            {cv.keywordsMatched?.length > 0 && (
                                <div className="w-full max-w-163 bg-white rounded-lg border border-dashed border-gray-200 px-6 py-4">
                                    <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                                        ATS keywords woven into this resume
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {cv.keywordsMatched.map((kw, i) => (
                                            <span key={i} className="text-xs text-blue-700 bg-blue-50 rounded-full px-2.5 py-1">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 text-center max-w-125">
                                Not the right fit? Click <span className="font-medium text-gray-600">Regenerate</span> above for a new version, or download and apply once you're happy with it.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateCVModal
