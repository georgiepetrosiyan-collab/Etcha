import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import MatchBadge from '../MatchBadge/matchBadge';
import CreateCVModal from '../CreateCVModal/createCVModal';
import ApplicantsModal from '../ApplicantsModal/applicantsModal';
import ReferralsModal from '../ReferralsModal/referralsModal';
import ConfirmModal from '../ConfirmModal/confirmModal';

const JobDescriptionModal = ({ job, ownId, onClose, onStatusChanged, onDeleted }) => {
    const [isCVOpen, setIsCVOpen] = useState(false);
    const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
    const [isReferralsOpen, setIsReferralsOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState(job?.status || 'open');

    if (!job) return null;

    const {
        _id, title = "Job Title", company = "Company Name", companyLogo = "",
        location = "Location", type = "Full-time", salary = "", description = "",
        fullDescription = "", postedAt = "", matchPercentage, postedBy, onApply = () => { },
    } = job;

    const isOwner = ownId && postedBy && (postedBy?._id || postedBy)?.toString() === ownId.toString();
    const isClosed = localStatus === 'closed';

    const stop = (e) => e.stopPropagation();

    const handleToggleStatus = async () => {
        setActionLoading(true);
        const newStatus = isClosed ? 'open' : 'closed';
        try {
            await axios.put(`http://localhost:4000/api/job/${_id}/status`, { status: newStatus }, { withCredentials: true });
            toast.success(newStatus === 'closed' ? "Vacancy closed" : "Vacancy reopened");
            setLocalStatus(newStatus);
            onStatusChanged?.(_id, newStatus);
            setConfirmAction(null);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await axios.delete(`http://localhost:4000/api/job/${_id}`, { withCredentials: true });
            toast.success("Job deleted");
            onDeleted?.(_id);
            setConfirmAction(null);
            onClose();
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-2000 px-4" onClick={onClose}>
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative" onClick={stop}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer">
                    <CloseIcon />
                </button>

                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {companyLogo ? <img className="w-full h-full object-cover" src={companyLogo} alt={company} /> : <BusinessIcon sx={{ color: "gray" }} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                                {isClosed && <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">Closed</span>}
                            </div>
                            {!isOwner && <MatchBadge percentage={matchPercentage} />}
                        </div>
                        <p className="text-sm text-gray-600">{company}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><LocationOnIcon sx={{ fontSize: 16 }} />{location}</span>
                    <span className="flex items-center gap-1"><WorkIcon sx={{ fontSize: 16 }} />{type}</span>
                    {postedAt && <span className="flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 16 }} />{postedAt}</span>}
                    {salary && <span className="font-medium text-gray-800">{salary}</span>}
                </div>

                <div className="mt-5 text-sm text-gray-700 whitespace-pre-line">{fullDescription || description || "No description provided."}</div>

                <div className="flex gap-2 mt-6 flex-wrap">
                    {isOwner ? (
                        <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                            <button type="button" onClick={() => setConfirmAction('delete')} title="Delete job"
                                className="flex items-center justify-center border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 p-2 rounded-md cursor-pointer transition-colors">
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </button>
                            <button type="button" onClick={() => setConfirmAction(isClosed ? 'reopen' : 'close')}
                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                {isClosed ? <LockOpenIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 16 }} />}
                                {isClosed ? "Reopen" : "Close vacancy"}
                            </button>
                            <button type="button" onClick={() => setIsReferralsOpen(true)}
                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                <GroupsIcon sx={{ fontSize: 16 }} />
                                Referrals
                            </button>
                            <button type="button" onClick={() => setIsApplicantsOpen(true)}
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                <PeopleAltIcon sx={{ fontSize: 16 }} />
                                View Applicants
                            </button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setIsCVOpen(true)} disabled={isClosed}
                            className={`ml-auto flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md transition-colors ${isClosed ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"}`}>
                            <DescriptionIcon sx={{ fontSize: 16 }} />
                            {isClosed ? "Closed" : "Apply with AI Résumé"}
                        </button>
                    )}
                </div>
            </div>

            {isCVOpen && <CreateCVModal job={job} onClose={() => setIsCVOpen(false)} />}
            {isApplicantsOpen && <ApplicantsModal job={job} onClose={() => setIsApplicantsOpen(false)} />}
            {isReferralsOpen && <ReferralsModal job={job} onClose={() => setIsReferralsOpen(false)} />}

            {confirmAction === 'delete' && (
                <ConfirmModal title="Delete this job posting?" message="This will permanently remove the vacancy and all applications to it. This can't be undone."
                    confirmLabel="Delete" danger loading={actionLoading} onConfirm={handleDelete} onCancel={() => setConfirmAction(null)} />
            )}
            {(confirmAction === 'close' || confirmAction === 'reopen') && (
                <ConfirmModal
                    title={confirmAction === 'close' ? "Close this vacancy?" : "Reopen this vacancy?"}
                    message={confirmAction === 'close' ? "People will no longer be able to apply or create a CV for this job." : "This job will appear in other people's feeds again and accept applications."}
                    confirmLabel={confirmAction === 'close' ? "Close vacancy" : "Reopen"}
                    danger={confirmAction === 'close'} loading={actionLoading} onConfirm={handleToggleStatus} onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    )
}

export default JobDescriptionModal