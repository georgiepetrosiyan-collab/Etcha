import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import A4ResumePreview from '../A4ResumePreview/a4ResumePreview'
import ConfirmModal from '../ConfirmModal/confirmModal'

const STATUS_STYLES = {
    pending: { label: "Pending review", cls: "bg-gray-100 text-gray-600" },
    interviewing: { label: "Interviewing", cls: "bg-amber-100 text-amber-700" },
    hired: { label: "Hired 🎉", cls: "bg-green-100 text-green-700" },
};

const MyReferralsList = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchMyReferrals();
    }, []);

    const fetchMyReferrals = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/api/referral/mine', { withCredentials: true });
            setReferrals(res.data.referrals || []);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to load your referrals");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async (e, referral) => {
        e.stopPropagation();
        setBusyId(referral._id);
        try {
            const res = await axios.post(`http://localhost:4000/api/referral/${referral._id}/regenerate-cv`, {}, { withCredentials: true });
            toast.success("CV generated");
            setReferrals(prev => prev.map(r => r._id === referral._id ? { ...r, cv: res.data.referral.cv, matchPercentage: res.data.referral.matchPercentage } : r));
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to generate CV");
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setBusyId(deleteTarget._id);
        try {
            await axios.delete(`http://localhost:4000/api/referral/${deleteTarget._id}`, { withCredentials: true });
            toast.success("Referral deleted");
            setReferrals(prev => prev.filter(r => r._id !== deleteTarget._id));
            if (selected?._id === deleteTarget._id) setSelected(null);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setBusyId(null);
            setDeleteTarget(null);
        }
    };

    if (selected) {
        return (
            <div className="flex flex-col gap-3">
                <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 cursor-pointer w-fit">
                    <ArrowBackIcon sx={{ fontSize: 16 }} />
                    Back to my referrals
                </button>
                <div className="py-4 flex justify-center overflow-x-auto">
                    <A4ResumePreview cv={selected.cv} scale={0.82} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {loading && (
                <p className="text-sm text-gray-500 text-center py-6">Loading your referrals...</p>
            )}

            {!loading && referrals.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-sm text-gray-500">You haven't referred anyone yet.</p>
                </div>
            )}

            {!loading && referrals.map((r) => {
                const statusInfo = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                const isBusy = busyId === r._id;
                return (
                    <div key={r._id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                        {r.referredUser?.profilePic ? (
                            <img className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200" src={r.referredUser.profilePic} alt={r.referredUser?.f_name} />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                <PersonIcon sx={{ color: "#9ca3af", fontSize: 22 }} />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-gray-900">{r.referredUser?.f_name || "Unknown"}</p>
                                <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${statusInfo.cls}`}>{statusInfo.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{r.job?.title} · {r.job?.company}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {r.cv ? (
                                <button type="button" onClick={() => setSelected(r)} className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                                    View CV
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => handleRegenerate(e, r)}
                                    disabled={isBusy}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer disabled:opacity-50"
                                >
                                    <RefreshIcon sx={{ fontSize: 14 }} />
                                    {isBusy ? "Generating..." : "Generate CV"}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(r)}
                                disabled={isBusy}
                                title="Delete referral"
                                className="flex items-center justify-center border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 p-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
                            >
                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                            </button>
                        </div>
                    </div>
                );
            })}

            {deleteTarget && (
                <ConfirmModal
                    title="Delete this referral?"
                    message={`This removes your referral of ${deleteTarget.referredUser?.f_name || 'this person'} for ${deleteTarget.job?.title || 'this job'}. This can't be undone.`}
                    confirmLabel="Delete"
                    danger
                    loading={busyId === deleteTarget._id}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}

export default MyReferralsList