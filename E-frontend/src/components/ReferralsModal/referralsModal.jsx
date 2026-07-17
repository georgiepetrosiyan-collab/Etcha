import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import DescriptionIcon from '@mui/icons-material/Description'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckIcon from '@mui/icons-material/Check'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import MatchBadge from '../MatchBadge/matchBadge'
import A4ResumePreview from '../A4ResumePreview/a4ResumePreview'
import ConfirmModal from '../ConfirmModal/confirmModal'
import ATSCheckModal from '../ATSCheckModal/atsCheckModal'

const STATUS_STYLES = {
    pending: { label: "Pending review", cls: "bg-gray-100 text-gray-600" },
    interviewing: { label: "Interviewing", cls: "bg-amber-100 text-amber-700" },
    hired: { label: "Hired", cls: "bg-green-100 text-green-700" },
};

const ReferralsModal = ({ job, onClose }) => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [atsTarget, setAtsTarget] = useState(null);

    const stop = (e) => e.stopPropagation();

    useEffect(() => {
        fetchReferrals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job?._id]);

    const handleOpenATS = (e, r) => {
        e.stopPropagation();
        if (!r?.cv) {
            toast.error("This referral has no résumé to check yet");
            return;
        }
        setAtsTarget(r);
    };

    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:4000/api/job/${job._id}/referrals`, { withCredentials: true });
            setReferrals(res.data.referrals || []);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to load referrals");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (e, referral) => {
        e.stopPropagation();
        setActionLoadingId(referral._id);
        try {
            await axios.put(`http://localhost:4000/api/referral/${referral._id}/accept`, {}, { withCredentials: true });
            toast.success("Candidate notified for interview");
            setReferrals(prev => prev.map(r => r._id === referral._id ? { ...r, status: 'interviewing' } : r));
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleHire = async (e, referral) => {
        e.stopPropagation();
        setActionLoadingId(referral._id);
        try {
            await axios.put(`http://localhost:4000/api/referral/${referral._id}/hire`, {}, { withCredentials: true });
            toast.success("Marked as hired — referrer notified");
            setReferrals(prev => prev.map(r => r._id === referral._id ? { ...r, status: 'hired' } : r));
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoadingId(deleteTarget._id);
        try {
            await axios.delete(`http://localhost:4000/api/referral/${deleteTarget._id}`, { withCredentials: true });
            toast.success("Referral deleted");
            setReferrals(prev => prev.filter(r => r._id !== deleteTarget._id));
            if (selected?._id === deleteTarget._id) setSelected(null);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoadingId(null);
            setDeleteTarget(null);
        }
    };

    const handleRegenerateCV = async (e, referral) => {
        e.stopPropagation();
        setActionLoadingId(referral._id);
        try {
            const res = await axios.post(`http://localhost:4000/api/referral/${referral._id}/regenerate-cv`, {}, { withCredentials: true });
            toast.success("CV generated");
            setReferrals(prev => prev.map(r => r._id === referral._id ? { ...r, cv: res.data.referral.cv, matchPercentage: res.data.referral.matchPercentage } : r));
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to generate CV");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2100 px-4 py-6"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={stop}
            >
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div>
                        {selected ? (
                            <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 cursor-pointer mb-1">
                                <ArrowBackIcon sx={{ fontSize: 16 }} />
                                Back to referrals
                            </button>
                        ) : null}
                        <h2 className="text-lg font-semibold text-gray-900">{selected ? "Referred Candidate's CV" : "Referrals"}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{job?.title} · {job?.company}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 cursor-pointer transition-colors -mt-1 -mr-1">
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-2">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-400">Loading referrals...</p>
                        </div>
                    )}

                    {!loading && referrals.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <PersonIcon sx={{ color: "#9ca3af" }} />
                            </div>
                            <p className="text-sm font-medium text-gray-700">No referrals yet</p>
                            <p className="text-xs text-gray-400 max-w-240px">
                                When someone refers a connection to this job, they'll show up here with an auto-generated CV.
                            </p>
                        </div>
                    )}

                    {!loading && !selected && referrals.length > 0 && (
                        <div className="flex flex-col divide-y divide-gray-100">
                            {referrals.map((r) => {
                                const isBusy = actionLoadingId === r._id;
                                const statusInfo = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                                return (
                                    <div key={r._id} className="flex items-center gap-3 px-6 py-4">
                                        <div onClick={() => r.cv && setSelected(r)} className={`flex items-center gap-3 flex-1 min-w-0 ${r.cv ? 'cursor-pointer' : ''}`}>
                                            {r.referredUser?.profilePic ? (
                                                <img className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200" src={r.referredUser.profilePic} alt={r.referredUser?.f_name} />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                    <PersonIcon sx={{ color: "#9ca3af", fontSize: 22 }} />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{r.referredUser?.f_name || "Unknown"}</p>
                                                    <MatchBadge percentage={r.matchPercentage} size="sm" />
                                                    <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${statusInfo.cls}`}>{statusInfo.label}</span>
                                                </div>
                                                {r.referredUser?.headline && <p className="text-xs text-gray-500 truncate">{r.referredUser.headline}</p>}
                                                <p className="text-[11px] text-gray-400 mt-0.5">Referred by {r.referrer?.f_name || "someone"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {r.cv && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenATS(e, r)}
                                                    title="Check with ATS"
                                                    className="flex items-center justify-center border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 text-gray-500 p-1.5 rounded-md cursor-pointer transition-colors"
                                                >
                                                    <FactCheckIcon sx={{ fontSize: 16 }} />
                                                </button>
                                            )}

                                            {r.cv ? (
                                                <div className="flex items-center gap-1 text-blue-600 text-xs font-medium cursor-pointer" onClick={() => setSelected(r)}>
                                                    <DescriptionIcon sx={{ fontSize: 15 }} />
                                                    View CV
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRegenerateCV(e, r)}
                                                    disabled={isBusy}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer disabled:opacity-50"
                                                >
                                                    <RefreshIcon sx={{ fontSize: 15 }} />
                                                    {isBusy ? "Generating..." : "Generate CV"}
                                                </button>
                                            )}

                                            {r.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleAccept(e, r)}
                                                    disabled={isBusy}
                                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
                                                >
                                                    <CheckIcon sx={{ fontSize: 15 }} />
                                                    Accept
                                                </button>
                                            )}

                                            {r.status === 'interviewing' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleHire(e, r)}
                                                    disabled={isBusy}
                                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
                                                >
                                                    <EmojiEventsIcon sx={{ fontSize: 15 }} />
                                                    Mark as Hired
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
                                                disabled={isBusy}
                                                title="Delete referral"
                                                className="flex items-center justify-center border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 p-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && selected && selected.cv && (
                        <div className="py-8 px-4 bg-gray-100 flex justify-center">
                            <div className="w-full overflow-x-auto flex justify-center">
                                <A4ResumePreview cv={selected.cv} scale={0.82} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {deleteTarget && (
                <ConfirmModal
                    title="Delete this referral?"
                    message={`This removes ${deleteTarget.referredUser?.f_name || 'this referral'} from the list${deleteTarget.status !== 'pending' ? ' permanently, including their progress' : ''}. This can't be undone.`}
                    confirmLabel="Delete"
                    danger
                    loading={actionLoadingId === deleteTarget._id}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {atsTarget && (
                <ATSCheckModal
                    cv={atsTarget.cv}
                    job={job}
                    candidateName={atsTarget.referredUser?.f_name}
                    onClose={() => setAtsTarget(null)}
                />
            )}
        </div>
    )
}

export default ReferralsModal