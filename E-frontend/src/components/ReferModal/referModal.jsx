import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import MatchBadge from '../MatchBadge/matchBadge';

const ReferModal = ({ job, onClose }) => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const stop = (e) => e.stopPropagation();

    useEffect(() => {
        fetchConnectionMatches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConnectionMatches = async () => {
        setLoading(true);
        await axios.get(`http://localhost:4000/api/job/${job?._id}/friend-matches`, { withCredentials: true })
            .then(res => {
                // Backend already returns best matches first
                setConnections(res.data.friends || []);
            })
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setLoading(false));
    };

    const handleRefer = async () => {
        if (!selectedId) return;
        setSubmitting(true);
        await axios.post('http://localhost:4000/api/job/refer', {
            jobId: job?._id,
            connectionId: selectedId,
        }, { withCredentials: true })
            .then(() => {
                setSent(true);
                setTimeout(() => {
                    onClose();
                }, 1400);
            })
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setSubmitting(false));
    };

    const filteredConnections = connections.filter(c =>
        (c?.f_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedConnection = connections.find(c => c._id === selectedId);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2000 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
                onClick={stop}
            >
                {sent ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircleIcon sx={{ fontSize: 40, color: "#16a34a" }} />
                        </div>
                        <p className="text-base font-semibold text-gray-900">Referral sent</p>
                        <p className="text-sm text-gray-500 text-center">
                            {selectedConnection?.f_name} will be notified about {job?.title}.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Refer a connection</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{job?.title} · {job?.company}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 cursor-pointer transition-colors -mt-1 -mr-1"
                            >
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-6 pt-4">
                            <div className="relative">
                                <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search connections"
                                    className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-full h-10 pl-9 pr-4 text-sm outline-none transition-all border border-transparent"
                                />
                            </div>
                        </div>

                        {!loading && connections.length > 0 && (
                            <p className="px-6 pt-3 text-xs text-gray-400">Sorted by best match for this role</p>
                        )}

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-6 py-3 mt-1 min-h-55">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-14 gap-2">
                                    <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-gray-400">Loading connections...</p>
                                </div>
                            )}

                            {!loading && filteredConnections.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <PersonIcon sx={{ color: "#9ca3af" }} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">No connections found</p>
                                    <p className="text-xs text-gray-400 max-w-55">
                                        Connect with people first, then you'll be able to refer them here.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                {!loading && filteredConnections.map((conn) => {
                                    const isSelected = selectedId === conn._id;
                                    return (
                                        <div
                                            key={conn._id}
                                            onClick={() => setSelectedId(conn._id)}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                                                isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            {conn?.profilePic ? (
                                                <img
                                                    className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200"
                                                    src={conn.profilePic}
                                                    alt={conn?.f_name}
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                    <PersonIcon sx={{ color: "#9ca3af", fontSize: 22 }} />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {conn?.f_name}
                                                    </p>
                                                    <MatchBadge percentage={conn?.matchPercentage} size="sm" />
                                                </div>
                                                {conn?.headline && (
                                                    <p className="text-xs text-gray-500 truncate">{conn.headline}</p>
                                                )}
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={handleRefer}
                                disabled={!selectedId || submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2.5 rounded-full cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    selectedConnection ? `Refer ${selectedConnection.f_name}` : "Select a connection"
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ReferModal