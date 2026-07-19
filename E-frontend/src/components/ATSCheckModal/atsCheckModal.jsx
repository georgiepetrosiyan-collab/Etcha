import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const getScoreColor = (score) => {
    if (score >= 70) return { text: 'text-green-700', bg: 'bg-green-100', ring: 'ring-green-200' };
    if (score >= 40) return { text: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-200' };
    return { text: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-200' };
};

const ATSCheckModal = ({ cv, job, candidateName, applicantId, referralId, onClose, onRejected }) => {
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [autoRejected, setAutoRejected] = useState(false);

    const stop = (e) => e.stopPropagation();

    useEffect(() => {
        runCheck();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runCheck = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                'http://localhost:4000/api/job/ats-check',
                {
                    cv,
                    job: { title: job?.title, description: job?.description, fullDescription: job?.fullDescription },
                    applicantId,
                    jobId: job?._id,
                    referralId
                },
                { withCredentials: true }
            );
            setAnalysis(res.data.analysis);
            if (res.data.autoRejected) {
                setAutoRejected(true);
                onRejected?.();
            }
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to run ATS check");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const colors = analysis ? getScoreColor(analysis.score) : null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2400 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
                onClick={stop}
            >
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FactCheckIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                            ATS Check
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {candidateName ? `${candidateName} · ` : ''}{job?.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 cursor-pointer transition-colors -mt-1 -mr-1"
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                {autoRejected && !loading && (
                    <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-2 shrink-0">
                        <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 18 }} className="shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                            This score is below the pass bar — a message has been sent to {candidateName || 'the candidate'} from your account letting them know this application won't be moving forward.
                        </p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Running ATS keyword check...</p>
                        </div>
                    )}

                    {!loading && analysis && (
                        <div className="flex flex-col gap-5">
                            <div className={`rounded-xl p-4 flex items-center gap-4 ${colors.bg}`}>
                                <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center ring-4 ${colors.ring} shrink-0`}>
                                    <span className={`text-lg font-bold ${colors.text}`}>{analysis.score}%</span>
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${colors.text}`}>
                                        {analysis.score >= 70 ? "Strong ATS match" : analysis.score >= 40 ? "Moderate ATS match" : "Weak ATS match"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {analysis.matchedKeywords.length} of {analysis.totalKeywords} job keywords found in this résumé's skills, education & experience
                                    </p>
                                </div>
                            </div>

                            {analysis.matchedKeywords.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                                        <CheckCircleIcon sx={{ fontSize: 14, color: "#16a34a" }} />
                                        Matched keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.matchedKeywords.map((kw, i) => (
                                            <span key={i} className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.missingKeywords.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                                        <CancelIcon sx={{ fontSize: 14, color: "#dc2626" }} />
                                        Missing from résumé
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.missingKeywords.map((kw, i) => (
                                            <span key={i} className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.totalKeywords === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    This job has no full description to check keywords against yet.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ATSCheckModal