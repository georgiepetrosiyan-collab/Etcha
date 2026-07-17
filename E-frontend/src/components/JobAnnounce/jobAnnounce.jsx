import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import JobDescriptionModal from '../JobDescriptionModal/jobDescriptionModal';
import ReferModal from '../ReferModal/referModal';
import CreateCVModal from '../CreateCVModal/createCVModal';
import ApplicantsModal from '../ApplicantsModal/applicantsModal';
import ReferralsModal from '../ReferralsModal/referralsModal';
import ConfirmModal from '../ConfirmModal/confirmModal';
import MatchBadge from '../MatchBadge/matchBadge';

const JobAnnounce = ({ job, ownId, onStatusChanged, onDeleted }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReferOpen, setIsReferOpen] = useState(false);
    const [isCVOpen, setIsCVOpen] = useState(false);
    const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
    const [isReferralsOpen, setIsReferralsOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const {
        _id, title = "Job Title", company = "Company Name", companyLogo = "",
        location = "Location", type = "Full-time", salary = "", description = "",
        postedAt = "", matchPercentage, applicantCount, status = "open", postedBy,
        onApply = () => {},
    } = job || {};

    const isOwner = ownId && postedBy && (postedBy?._id || postedBy)?.toString() === ownId.toString();
    const isClosed = status === 'closed';

    const stop = (e) => e.stopPropagation();

    const handleToggleStatus = async () => {
        setActionLoading(true);
        const newStatus = isClosed ? 'open' : 'closed';
        try {
            await axios.put(`http://localhost:4000/api/job/${_id}/status`, { status: newStatus }, { withCredentials: true });
            toast.success(newStatus === 'closed' ? "Vacancy closed" : "Vacancy reopened");
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
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="w-full bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {companyLogo ? <img className="w-full h-full object-cover" src={companyLogo} alt={company} /> : <BusinessIcon sx={{ color: "gray" }} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
                                {isClosed && <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">Closed</span>}
                            </div>
                            {!isOwner && <MatchBadge percentage={matchPercentage} />}
                        </div>
                        <p className="text-sm text-gray-600">{company}</p>

                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><LocationOnIcon sx={{ fontSize: 16 }} />{location}</span>
                            <span className="flex items-center gap-1"><WorkIcon sx={{ fontSize: 16 }} />{type}</span>
                            {postedAt && <span className="flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 16 }} />{postedAt}</span>}
                        </div>

                        {description && <p className="text-sm text-gray-700 mt-3 line-clamp-2">{description}</p>}

                        <div className="flex items-center gap-2 mt-4 flex-wrap" onClick={stop}>
                            {salary && <span className="text-sm font-medium text-gray-800 mr-auto">{salary}</span>}

                            {isOwner ? (
                                <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                                    <button type="button" onClick={() => setConfirmAction('delete')} title="Delete job"
                                        className="flex items-center justify-center border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 p-2 rounded-md cursor-pointer transition-colors">
                                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                    </button>
                                    <button type="button" onClick={() => setConfirmAction(isClosed ? 'reopen' : 'close')}
                                        className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-2 rounded-md cursor-pointer transition-colors">
                                        {isClosed ? <LockOpenIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 16 }} />}
                                        {isClosed ? "Reopen" : "Close"}
                                    </button>
                                    <button type="button" onClick={() => setIsReferralsOpen(true)}
                                        className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-2 rounded-md cursor-pointer transition-colors">
                                        <GroupsIcon sx={{ fontSize: 16 }} />
                                        Referrals
                                    </button>
                                    <button type="button" onClick={() => setIsApplicantsOpen(true)}
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                                        <PeopleAltIcon sx={{ fontSize: 16 }} />
                                        View Applicants
                                        {typeof applicantCount === 'number' && <span className="bg-white/20 text-xs rounded-full px-1.5">{applicantCount}</span>}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setIsReferOpen(true)}
                                        className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-2 rounded-md cursor-pointer transition-colors">
                                        <PersonAddIcon sx={{ fontSize: 16 }} />
                                        Refer
                                    </button>
                                    <button type="button" onClick={() => setIsCVOpen(true)}
                                        className="flex items-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2 rounded-md cursor-pointer transition-colors">
                                        <DescriptionIcon sx={{ fontSize: 16 }} />
                                        Create CV
                                    </button>
                                    <button type="button" onClick={onApply} disabled={isClosed}
                                        className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${isClosed ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"}`}>
                                        {isClosed ? "Closed" : "Apply"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <JobDescriptionModal job={job} ownId={ownId} onClose={() => setIsOpen(false)} onStatusChanged={onStatusChanged} onDeleted={onDeleted} />
            )}
            {isReferOpen && <ReferModal job={job} onClose={() => setIsReferOpen(false)} />}
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
        </>
    )
}

export default JobAnnounce