// E-frontend/src/pages/Job/job.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import ProfileCard from '../../components/ProfileCard/profileCard';
import Navbar_3 from '../../components/Navbar_3/navbar_3';
import PostJobModal from '../../components/PostJobModal/postJobModal';
import CreateCVModal from '../../components/CreateCVModal/createCVModal';
import ApplicantsModal from '../../components/ApplicantsModal/applicantsModal';
import ReferralsModal from '../../components/ReferralsModal/referralsModal';
import ReferModal from '../../components/ReferModal/referModal';
import ConfirmModal from '../../components/ConfirmModal/confirmModal';
import MatchBadge from '../../components/MatchBadge/matchBadge';
import A4ResumePreview from '../../components/A4ResumePreview/a4ResumePreview';

import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';

const VIEW_ORDER = ['available', 'mine', 'referrals'];
const VIEW_LABELS = {
    available: 'Top job picks for you',
    mine: 'Job you posted',
    referrals: 'My Referrals',
};

const Job = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [ownData, setOwnData] = useState(null);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [referralsLoading, setReferralsLoading] = useState(true);

    const [viewMode, setViewMode] = useState('available');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);

    const [isPostOpen, setIsPostOpen] = useState(false);
    const [cvJob, setCvJob] = useState(null);
    const [referJob, setReferJob] = useState(null);
    const [applicantsJob, setApplicantsJob] = useState(null);
    const [referralsJob, setReferralsJob] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'close'|'reopen'|'delete', job }
    const [actionLoading, setActionLoading] = useState(false);

    const [deleteReferralTarget, setDeleteReferralTarget] = useState(null);
    const [referralBusyId, setReferralBusyId] = useState(null);
    const [cvViewerReferral, setCvViewerReferral] = useState(null); // referral whose CV is open in a modal

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        setOwnData(userData ? JSON.parse(userData) : null);
        fetchJobs();
        fetchReferrals();
        fetchNotification();
    }, []);

    // Resolve a direct /job/:jobId link (e.g. from a notification) into the right view + selection
    useEffect(() => {
        if (!jobId || loading) return;
        const inAvail = availableJobs.find(j => j._id === jobId);
        const inMine = myJobs.find(j => j._id === jobId);
        if (inAvail) {
            setViewMode('available');
            setSelectedJobId(jobId);
        } else if (inMine) {
            setViewMode('mine');
            setSelectedJobId(jobId);
        }
    }, [jobId, loading, availableJobs, myJobs]);

    const fetchJobs = async () => {
        setLoading(true);
        await axios.get('http://localhost:4000/api/job', { withCredentials: true })
            .then(res => {
                const avail = res.data.availableJobs || [];
                const mine = res.data.myJobs || [];
                setAvailableJobs(avail);
                setMyJobs(mine);
            })
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setLoading(false));
    };

    const fetchReferrals = async () => {
        setReferralsLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/api/referral/mine', { withCredentials: true });
            setReferrals(res.data.referrals || []);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to load your referrals");
        } finally {
            setReferralsLoading(false);
        }
    };

    const fetchNotification = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/notification/activeNotification', { withCredentials: true });
            setNotificationCount(res.data.count || 0);
        } catch (err) {
            console.log(err);
        }
    };

    const handleJobCreated = (newJob) => {
        setMyJobs(prev => [{ ...newJob, applicantCount: 0, status: 'open' }, ...prev]);
        toast.success("Job posted successfully");
        setViewMode('mine');
        setSelectedJobId(newJob._id);
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        setActionLoading(true);
        try {
            if (confirmAction.type === 'delete') {
                await axios.delete(`http://localhost:4000/api/job/${confirmAction.job._id}`, { withCredentials: true });
                toast.success("Job deleted");
                setMyJobs(prev => prev.filter(j => j._id !== confirmAction.job._id));
                setAvailableJobs(prev => prev.filter(j => j._id !== confirmAction.job._id));
                if (selectedJobId === confirmAction.job._id) setSelectedJobId(null);
            } else {
                const newStatus = confirmAction.type === 'close' ? 'closed' : 'open';
                await axios.put(`http://localhost:4000/api/job/${confirmAction.job._id}/status`, { status: newStatus }, { withCredentials: true });
                toast.success(newStatus === 'closed' ? "Vacancy closed" : "Vacancy reopened");
                setMyJobs(prev => prev.map(j => j._id === confirmAction.job._id ? { ...j, status: newStatus } : j));
                if (newStatus === 'closed') {
                    setAvailableJobs(prev => prev.filter(j => j._id !== confirmAction.job._id));
                }
            }
            setConfirmAction(null);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRegenerateReferralCV = async (r) => {
        setReferralBusyId(r._id);
        try {
            const res = await axios.post(`http://localhost:4000/api/referral/${r._id}/regenerate-cv`, {}, { withCredentials: true });
            toast.success("CV generated");
            setReferrals(prev => prev.map(x => x._id === r._id ? { ...x, cv: res.data.referral.cv, matchPercentage: res.data.referral.matchPercentage } : x));
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to generate CV");
        } finally {
            setReferralBusyId(null);
        }
    };

    const handleDeleteReferral = async () => {
        if (!deleteReferralTarget) return;
        setReferralBusyId(deleteReferralTarget._id);
        try {
            await axios.delete(`http://localhost:4000/api/referral/${deleteReferralTarget._id}`, { withCredentials: true });
            toast.success("Referral deleted");
            setReferrals(prev => prev.filter(r => r._id !== deleteReferralTarget._id));
            if (cvViewerReferral?._id === deleteReferralTarget._id) setCvViewerReferral(null);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setReferralBusyId(null);
            setDeleteReferralTarget(null);
        }
    };

    const switchView = (v) => {
        setViewMode(v);
        setDropdownOpen(false);
    };

    const handleReferralClick = (r) => {
        if (r.cv) {
            setCvViewerReferral(r);
        }
    };

    const selectedJob = viewMode === 'mine'
        ? myJobs.find(j => j._id === selectedJobId)
        : availableJobs.find(j => j._id === selectedJobId);

    const isOwner = !!(ownData?._id && selectedJob?.postedBy &&
        (selectedJob.postedBy._id || selectedJob.postedBy).toString() === ownData._id.toString());

    const currentCount =
        viewMode === 'available' ? availableJobs.length :
        viewMode === 'mine' ? myJobs.length :
        referrals.length;

    const showDetailPanel = viewMode !== 'referrals' && !!selectedJob;

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen">
            {/* Left Side Bar */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-left">
                    <ProfileCard data={ownData} />
                </div>
                <Navbar_3 userData={ownData} notificationCount={notificationCount} />
            </div>

            {/* Main content */}
            <div className="w-full py-5 sm:w-[77%] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold text-gray-900">Jobs</div>
                    <button onClick={() => setIsPostOpen(true)} className="flex items-center gap-1 bg-accent hover:bg-accent-darker text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                        <AddIcon sx={{ fontSize: 16 }} />
                        Post a job
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* LIST PANEL — relative + overflow-visible so the dropdown can float over the list without pushing it down */}
                    <div className={`w-full bg-white rounded-lg border border-gray-200 overflow-visible flex flex-col shrink-0 transition-all relative ${showDetailPanel ? 'md:w-[38%]' : 'md:w-full'}`}>

                        {/* Dropdown header */}
                        <div className="relative border-b border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(o => !o)}
                                className="w-full flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors bg-white rounded-t-lg"
                            >
                                <span className="text-accent font-semibold text-sm flex items-center gap-1.5 leading-tight">
                                    {dropdownOpen ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                                    {VIEW_LABELS[viewMode]}
                                </span>
                                {currentCount > 0 && <span className="text-xs text-gray-400">{currentCount}</span>}
                            </button>

                            {/* Floats OVER the list below — does not affect list height/scroll */}
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute z-20 left-0 right-0 top-full bg-white border border-gray-200 border-t-0 shadow-lg rounded-b-lg overflow-hidden">
                                        {VIEW_ORDER.filter(v => v !== viewMode).map(v => (
                                            <div
                                                key={v}
                                                onClick={() => switchView(v)}
                                                className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                                            >
                                                {VIEW_LABELS[v]}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Scrollable list — fixed height, independent of dropdown open/closed state */}
                        <div className="h-[65vh] overflow-y-auto divide-y divide-gray-100">
                            {/* AVAILABLE */}
                            {viewMode === 'available' && (
                                <>
                                    {loading && <p className="text-sm text-gray-400 text-center py-8">Loading jobs...</p>}
                                    {!loading && availableJobs.length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-8 px-4">No jobs available right now.</p>
                                    )}
                                    {!loading && availableJobs.map(job => {
                                        const isSel = selectedJobId === job._id;
                                        return (
                                            <div
                                                key={job._id}
                                                onClick={() => setSelectedJobId(job._id)}
                                                className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4 ${isSel ? 'bg-accent/5 border-accent' : 'hover:bg-gray-50 border-transparent'}`}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover" alt={job.company} /> : <BusinessIcon sx={{ color: "gray" }} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{job.company}</p>
                                                </div>
                                                {isSel ? (
                                                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        <span onClick={() => setCvJob(job)} className="text-accent text-xs font-semibold cursor-pointer hover:underline">Apply</span>
                                                        <span onClick={() => setReferJob(job)} className="text-gray-600 text-xs font-semibold cursor-pointer hover:underline">Refer</span>
                                                    </div>
                                                ) : (
                                                    <MatchBadge percentage={job.matchPercentage} size="sm" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* MINE */}
                            {viewMode === 'mine' && (
                                <>
                                    {loading && <p className="text-sm text-gray-400 text-center py-8">Loading jobs...</p>}
                                    {!loading && myJobs.length === 0 && (
                                        <div className="text-center py-10 flex flex-col items-center gap-2 px-4">
                                            <p className="text-sm text-gray-500">You haven't posted any jobs yet.</p>
                                            <button onClick={() => setIsPostOpen(true)} className="text-sm text-accent font-medium hover:underline cursor-pointer">
                                                Post your first job
                                            </button>
                                        </div>
                                    )}
                                    {!loading && myJobs.map(job => {
                                        const isSel = selectedJobId === job._id;
                                        const isClosed = job.status === 'closed';
                                        return (
                                            <div
                                                key={job._id}
                                                onClick={() => setSelectedJobId(job._id)}
                                                className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4 ${isSel ? 'bg-accent/5 border-accent' : 'hover:bg-gray-50 border-transparent'}`}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover" alt={job.company} /> : <BusinessIcon sx={{ color: "gray" }} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                                                        {isClosed && <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5 shrink-0">Closed</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{job.company}</p>
                                                </div>
                                                {isSel ? (
                                                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setConfirmAction({ type: isClosed ? 'reopen' : 'close', job })}
                                                            title={isClosed ? "Reopen" : "Close"}
                                                            className="flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-500 p-1.5 rounded-md cursor-pointer transition-colors"
                                                        >
                                                            {isClosed ? <LockOpenIcon sx={{ fontSize: 14 }} /> : <LockIcon sx={{ fontSize: 14 }} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setReferralsJob(job)}
                                                            title="Referrals"
                                                            className="flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-500 p-1.5 rounded-md cursor-pointer transition-colors"
                                                        >
                                                            <GroupsIcon sx={{ fontSize: 14 }} />
                                                        </button>
                                                        <button
                                                            onClick={() => setApplicantsJob(job)}
                                                            title="View Applicants"
                                                            className="flex items-center gap-1 bg-accent hover:bg-accent-darker text-white text-xs font-medium px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                                                        >
                                                            <PeopleAltIcon sx={{ fontSize: 14 }} />
                                                            {typeof job.applicantCount === 'number' && <span className="bg-white/20 text-[10px] rounded-full px-1.5">{job.applicantCount}</span>}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    typeof job.applicantCount === 'number' && <span className="text-xs text-gray-400 shrink-0">{job.applicantCount} applied</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* REFERRALS */}
                            {viewMode === 'referrals' && (
                                <>
                                    {referralsLoading && <p className="text-sm text-gray-400 text-center py-8">Loading referrals...</p>}
                                    {!referralsLoading && referrals.length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-8 px-4">You haven't referred anyone yet.</p>
                                    )}
                                    {!referralsLoading && referrals.map(r => {
                                        const busy = referralBusyId === r._id;
                                        return (
                                            <div
                                                key={r._id}
                                                onClick={() => handleReferralClick(r)}
                                                className={`relative flex items-center gap-3 px-4 py-3 transition-colors ${r.cv ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                            >
                                                {r.referredUser?.profilePic ? (
                                                    <img className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200" src={r.referredUser.profilePic} alt={r.referredUser?.f_name} />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                        <PersonIcon sx={{ color: "#9ca3af", fontSize: 22 }} />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{r.referredUser?.f_name || "Unknown"}</p>
                                                    <p className="text-xs text-gray-500 truncate">{r.job?.title} · {r.job?.company}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    {r.cv ? (
                                                        <span onClick={() => setCvViewerReferral(r)} className="text-accent text-xs font-semibold cursor-pointer hover:underline">View CV</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRegenerateReferralCV(r)}
                                                            disabled={busy}
                                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent cursor-pointer disabled:opacity-50"
                                                        >
                                                            <RefreshIcon sx={{ fontSize: 13 }} />
                                                            {busy ? "Generating..." : "Generate CV"}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteReferralTarget(r)}
                                                        disabled={busy}
                                                        title="Delete referral"
                                                        className="flex items-center justify-center border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 p-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-50"
                                                    >
                                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>

                    {/* DETAIL PANEL — only rendered once a job is selected */}
                    {showDetailPanel && (
                        <div className="w-full md:w-[62%] bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 flex flex-col gap-4 h-full overflow-y-auto max-h-[70vh]">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {selectedJob.companyLogo ? <img className="w-full h-full object-cover" src={selectedJob.companyLogo} alt={selectedJob.company} /> : <BusinessIcon sx={{ color: "gray" }} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h2>
                                                {selectedJob.status === 'closed' && <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">Closed</span>}
                                            </div>
                                            {!isOwner && <MatchBadge percentage={selectedJob.matchPercentage} />}
                                        </div>
                                        <p className="text-sm text-gray-600">{selectedJob.company}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><LocationOnIcon sx={{ fontSize: 16 }} />{selectedJob.location}</span>
                                    <span className="flex items-center gap-1"><WorkIcon sx={{ fontSize: 16 }} />{selectedJob.type}</span>
                                    {selectedJob.createdAt && <span className="flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 16 }} />{new Date(selectedJob.createdAt).toLocaleDateString()}</span>}
                                    {selectedJob.salary && <span className="font-medium text-accent">{selectedJob.salary}</span>}
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">About us</h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{selectedJob.description || "No description provided."}</p>
                                </div>

                                {selectedJob.fullDescription && (
                                    <div>
                                        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">About this position</h3>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{selectedJob.fullDescription}</p>
                                    </div>
                                )}

                                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 flex-wrap">
                                    {isOwner ? (
                                        <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                                            <button type="button" onClick={() => setConfirmAction({ type: 'delete', job: selectedJob })} title="Delete job"
                                                className="flex items-center justify-center border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 p-2 rounded-md cursor-pointer transition-colors">
                                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                            </button>
                                            <button type="button" onClick={() => setConfirmAction({ type: selectedJob.status === 'closed' ? 'reopen' : 'close', job: selectedJob })}
                                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                                {selectedJob.status === 'closed' ? <LockOpenIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 16 }} />}
                                                {selectedJob.status === 'closed' ? "Reopen" : "Close vacancy"}
                                            </button>
                                            <button type="button" onClick={() => setReferralsJob(selectedJob)}
                                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                                <GroupsIcon sx={{ fontSize: 16 }} />
                                                Referrals
                                            </button>
                                            <button type="button" onClick={() => setApplicantsJob(selectedJob)}
                                                className="flex items-center gap-1 bg-accent hover:bg-accent-darker text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                                <PeopleAltIcon sx={{ fontSize: 16 }} />
                                                View Applicants
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 ml-auto">
                                            <button type="button" onClick={() => setReferJob(selectedJob)}
                                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                                <PersonAddIcon sx={{ fontSize: 16 }} />
                                                Refer
                                            </button>
                                            <button type="button" onClick={() => setCvJob(selectedJob)} disabled={selectedJob.status === 'closed'}
                                                className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md transition-colors ${selectedJob.status === 'closed' ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-accent hover:bg-accent-darker text-white cursor-pointer"}`}>
                                                <DescriptionIcon sx={{ fontSize: 16 }} />
                                                {selectedJob.status === 'closed' ? "Closed" : "Apply with AI Résumé"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isPostOpen && <PostJobModal onClose={() => setIsPostOpen(false)} onJobCreated={handleJobCreated} />}
            {cvJob && <CreateCVModal job={cvJob} onClose={() => setCvJob(null)} />}
            {referJob && <ReferModal job={referJob} onClose={() => setReferJob(null)} />}
            {applicantsJob && <ApplicantsModal job={applicantsJob} onClose={() => setApplicantsJob(null)} />}
            {referralsJob && <ReferralsModal job={referralsJob} onClose={() => setReferralsJob(null)} />}

            {/* Referral CV viewer — full-size overlay, same as before */}
            {cvViewerReferral && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2100 px-4 py-6"
                    onClick={() => setCvViewerReferral(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Referred Candidate's CV</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{cvViewerReferral.job?.title} · {cvViewerReferral.job?.company}</p>
                            </div>
                            <button onClick={() => setCvViewerReferral(null)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 cursor-pointer transition-colors -mt-1 -mr-1">
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-8 px-4 bg-gray-100 flex justify-center">
                            <A4ResumePreview cv={cvViewerReferral.cv} scale={0.82} />
                        </div>
                    </div>
                </div>
            )}

            {confirmAction && (
                <ConfirmModal
                    title={
                        confirmAction.type === 'delete' ? "Delete this job posting?" :
                        confirmAction.type === 'close' ? "Close this vacancy?" : "Reopen this vacancy?"
                    }
                    message={
                        confirmAction.type === 'delete' ? "This will permanently remove the vacancy and all applications to it. This can't be undone." :
                        confirmAction.type === 'close' ? "People will no longer be able to apply or create a CV for this job." :
                        "This job will appear in other people's feeds again and accept applications."
                    }
                    confirmLabel={
                        confirmAction.type === 'delete' ? "Delete" :
                        confirmAction.type === 'close' ? "Close vacancy" : "Reopen"
                    }
                    danger={confirmAction.type === 'delete' || confirmAction.type === 'close'}
                    loading={actionLoading}
                    onConfirm={handleConfirmAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            {deleteReferralTarget && (
                <ConfirmModal
                    title="Delete this referral?"
                    message={`This removes your referral of ${deleteReferralTarget.referredUser?.f_name || 'this person'} for ${deleteReferralTarget.job?.title || 'this job'}. This can't be undone.`}
                    confirmLabel="Delete"
                    danger
                    loading={referralBusyId === deleteReferralTarget._id}
                    onConfirm={handleDeleteReferral}
                    onCancel={() => setDeleteReferralTarget(null)}
                />
            )}

            <ToastContainer />
        </div>
    );
};

export default Job;