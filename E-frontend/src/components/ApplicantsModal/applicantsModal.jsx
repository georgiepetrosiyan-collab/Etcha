// E-frontend/src/components/ApplicantsModal/applicantsModal.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import DescriptionIcon from '@mui/icons-material/Description'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import MatchBadge from '../MatchBadge/matchBadge'
import MessageModal from '../MessageModal/messageModal'
import ATSCheckModal from '../ATSCheckModal/atsCheckModal'

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const ApplicantsModal = ({ job, onClose }) => {
    const [atsTarget, setAtsTarget] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [messageTarget, setMessageTarget] = useState(null);
    const [ownData, setOwnData] = useState(null);

    const stop = (e) => e.stopPropagation();

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        setOwnData(userData ? JSON.parse(userData) : null);
        fetchApplicants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job?._id]);

    const handleOpenATS = (e, app) => {
        e.stopPropagation();
        if (!app?.cv) {
            toast.error("This applicant has no résumé to check");
            return;
        }
        setAtsTarget(app);
    };

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `http://localhost:4000/api/job/${job._id}/applicants`,
                { withCredentials: true }
            );
            setApplications(res.data.applications || []);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to load applicants");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMessage = (e, applicant) => {
        e.stopPropagation();
        if (!applicant?._id) {
            toast.error("Couldn't load this applicant's profile");
            return;
        }
        setMessageTarget(applicant);
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
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div>
                        {selectedApp ? (
                            <button
                                type="button"
                                onClick={() => setSelectedApp(null)}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 cursor-pointer mb-1"
                            >
                                <ArrowBackIcon sx={{ fontSize: 16 }} />
                                Back to applicants
                            </button>
                        ) : null}
                        <h2 className="text-lg font-semibold text-gray-900">
                            {selectedApp ? "Submitted CV" : "Applicants"}
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    ={loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-2">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-400">Loading applicants...</p>
                        </div>
                    )}

                    {!loading && applications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <PersonIcon sx={{ color: "#9ca3af" }} />
                            </div>
                            <p className="text-sm font-medium text-gray-700">No applicants yet</p>
                            <p className="text-xs text-gray-400 max-w-60">
                                People who apply to this job will show up here, along with the CV they submitted.
                            </p>
                        </div>
                    )}

                    {!loading && !selectedApp && applications.length > 0 && (
                        <div className="flex flex-col divide-y divide-gray-100">
                            {applications.map((app) => (
                                <div
                                    key={app._id}
                                    onClick={() => app.cv && setSelectedApp(app)}
                                    className={`flex items-center gap-3 px-6 py-4 ${app.cv ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                >
                                    {app.applicant?.profilePic ? (
                                        <img
                                            className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200"
                                            src={app.applicant.profilePic}
                                            alt={app.applicant?.f_name}
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                            <PersonIcon sx={{ color: "#9ca3af", fontSize: 22 }} />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {app.applicant?.f_name || "Unknown"}
                                            </p>
                                            <MatchBadge percentage={app.matchPercentage} size="sm" />
                                            {app.status === 'rejected' && (
                                                <span className="text-[11px] font-semibold text-red-700 bg-red-50 rounded-full px-2 py-0.5 whitespace-nowrap">
                                                    Auto-rejected{typeof app.atsScore === 'number' ? ` · ${app.atsScore}% ATS` : ''}
                                                </span>
                                            )}
                                        </div>
                                        {app.applicant?.headline && (
                                            <p className="text-xs text-gray-500 truncate">{app.applicant.headline}</p>
                                        )}
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}
                                        </p>
                                    </div>

                                    {/* Action Buttons Block */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenMessage(e, app.applicant)}
                                            title="Message"
                                            className="flex items-center justify-center border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 p-2 rounded-md cursor-pointer transition-colors shrink-0"
                                        >
                                            <ChatBubbleOutlineIcon sx={{ fontSize: 17 }} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenATS(e, app)}
                                            title="Check with ATS"
                                            className="flex items-center justify-center border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 text-gray-500 p-2 rounded-md cursor-pointer transition-colors shrink-0"
                                        >
                                            <FactCheckIcon sx={{ fontSize: 17 }} />
                                        </button>

                                        {app.cv ? (
                                            <div className="flex items-center gap-1 text-blue-600 text-xs font-medium shrink-0 ml-1.5">
                                                <DescriptionIcon sx={{ fontSize: 15 }} />
                                                View CV
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-gray-400 shrink-0 ml-1.5">No CV</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && selectedApp && selectedApp.cv && (
                        <div className="py-8 px-4 bg-gray-100 flex justify-center">
                            <div className="w-full overflow-x-auto flex justify-center">
                                <div
                                    style={{
                                        width: `${A4_WIDTH_PX}px`,
                                        minHeight: `${A4_HEIGHT_PX}px`,
                                        padding: '56px 48px',
                                        transform: 'scale(0.82)',
                                        transformOrigin: 'top center'
                                    }}
                                    className="bg-white shadow-xl shrink-0"
                                >
                                    <div className="border-b-2 border-gray-800 pb-4 mb-6">
                                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedApp.cv.fullName}</h1>
                                        <p className="text-lg text-blue-700 font-medium mt-1">{selectedApp.cv.targetJobTitle}</p>
                                        {selectedApp.cv.location && (
                                            <p className="text-sm text-gray-500 mt-1">{selectedApp.cv.location}</p>
                                        )}
                                    </div>

                                    {selectedApp.cv.professionalSummary && (
                                        <div className="mb-7">
                                            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Professional Summary</h2>
                                            <p className="text-sm text-gray-700 leading-relaxed">{selectedApp.cv.professionalSummary}</p>
                                        </div>
                                    )}

                                    {selectedApp.cv.coreSkills?.length > 0 && (
                                        <div className="mb-7">
                                            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Core Skills</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApp.cv.coreSkills.map((skill, i) => (
                                                    <span key={i} className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedApp.cv.experience?.length > 0 && (
                                        <div>
                                            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Experience</h2>
                                            <div className="flex flex-col gap-5">
                                                {selectedApp.cv.experience.map((exp, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between items-baseline flex-wrap gap-x-3">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {exp.title} <span className="font-normal text-gray-500">· {exp.company}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500 whitespace-nowrap">
                                                                {exp.duration}{exp.location ? ` · ${exp.location}` : ''}
                                                            </p>
                                                        </div>
                                                        {exp.bullets?.length > 0 && (
                                                            <ul className="list-disc list-outside ml-4 mt-1.5 flex flex-col gap-1">
                                                                {exp.bullets.map((b, j) => (
                                                                    <li key={j} className="text-sm text-gray-700 leading-relaxed">{b}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Self-contained message overlay — must sit ABOVE this modal's own z-[2100] */}
            {messageTarget && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-2300 px-4"
                    onClick={() => setMessageTarget(null)}
                >
                    <div
                        className="w-full md:w-[50%] h-125 bg-white rounded-xl p-10 flex flex-col"
                        onClick={stop}
                    >
                        <div className="flex justify-between mb-2">
                            <div className="text-2xl">Message {messageTarget?.f_name}</div>
                            <div onClick={() => setMessageTarget(null)} className="cursor-pointer">
                                <CloseIcon />
                            </div>
                        </div>
                        <MessageModal selfData={ownData} userData={messageTarget} />
                    </div>
                </div>
            )}

            {/* ATS Check Overlay */}
            {atsTarget && (
                <ATSCheckModal
                    cv={atsTarget.cv}
                    job={job}
                    candidateName={atsTarget.applicant?.f_name}
                    onClose={() => setAtsTarget(null)}
                />
            )}
        </div>
    )
}

export default ApplicantsModal