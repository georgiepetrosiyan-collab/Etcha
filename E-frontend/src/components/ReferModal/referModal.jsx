import React, { useEffect, useState } from 'react'
import axios from 'axios'
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const ReferModal = ({ job, onClose }) => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const stop = (e) => e.stopPropagation();

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        setLoading(true);
        await axios.get('http://localhost:4000/api/auth/friendsList', { withCredentials: true })
            .then(res => {
                setConnections(res.data.friends || []);
            })
            .catch(err => {
                console.log(err);
                alert(err?.response?.data?.error || "Something Went Wrong");
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
                alert("Referral sent!");
                onClose();
            })
            .catch(err => {
                console.log(err);
                alert(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setSubmitting(false));
    };

    const filteredConnections = connections.filter(c =>
        (c?.f_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col p-5 relative"
                onClick={stop}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    <CloseIcon />
                </button>

                <h2 className="text-lg font-semibold text-gray-900 mb-1">Refer a connection</h2>
                <p className="text-sm text-gray-500 mb-4">{job?.title} at {job?.company}</p>

                <div className="relative mb-3">
                    <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search connections"
                        className="w-full bg-gray-100 rounded-md h-10 pl-9 pr-3 text-sm outline-none"
                    />
                </div>

                <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    {loading && (
                        <p className="text-sm text-gray-500 py-6 text-center">Loading connections...</p>
                    )}

                    {!loading && filteredConnections.length === 0 && (
                        <p className="text-sm text-gray-500 py-6 text-center">No connections found.</p>
                    )}

                    {!loading && filteredConnections.map((conn) => (
                        <div
                            key={conn._id}
                            onClick={() => setSelectedId(conn._id)}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                                selectedId === conn._id ? "bg-blue-50 border border-blue-500" : "hover:bg-gray-50 border border-transparent"
                            }`}
                        >
                            <img
                                className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-200"
                                src={conn?.profilePic || undefined}
                                alt={conn?.f_name}
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {conn?.f_name}
                                </p>
                                {conn?.headline && (
                                    <p className="text-xs text-gray-500 truncate">{conn.headline}</p>
                                )}
                            </div>
                            <div className="ml-auto shrink-0">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                    selectedId === conn._id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                                }`} />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleRefer}
                    disabled={!selectedId || submitting}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md cursor-pointer transition-colors"
                >
                    {submitting ? "Sending..." : "Send referral"}
                </button>
            </div>
        </div>
    )
}

export default ReferModal