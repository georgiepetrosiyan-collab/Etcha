import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Advertisement from '../../components/Advertisement/advertisement';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import JobAnnounce from '../../components/JobAnnounce/jobAnnounce';
import JobDescriptionModal from '../../components/JobDescriptionModal/jobDescriptionModal';
import PostJobModal from '../../components/PostJobModal/postJobModal';
import MyReferralsList from '../../components/MyReferralsList/myReferralsList';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupsIcon from '@mui/icons-material/Groups';

// FIX 1: Added missing import for Navbar_3
import Navbar_3 from '../../components/NavBar_3/navbar_3';

const Job = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [ownData, setOwnData] = useState(null);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0); // FIX 2: Added notification state
    const [activeTab, setActiveTab] = useState('available'); // 'available' | 'mine' | 'referrals'
    const [loading, setLoading] = useState(true);
    const [isPostOpen, setIsPostOpen] = useState(false);
    const [directJob, setDirectJob] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        setOwnData(userData ? JSON.parse(userData) : null);
        fetchJobs();
        fetchNotification(); // FIX 2: Fetch notifications on load
    }, []);

    useEffect(() => {
        if (!jobId) { setDirectJob(null); return; }
        axios.get(`http://localhost:4000/api/job/${jobId}`, { withCredentials: true })
            .then(res => setDirectJob(res.data.job))
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Job not found");
                navigate('/job');
            });
    }, [jobId]);

    const fetchJobs = async () => {
        setLoading(true);
        await axios.get('http://localhost:4000/api/job', { withCredentials: true })
            .then(res => {
                setAvailableJobs(res.data.availableJobs || []);
                setMyJobs(res.data.myJobs || []);
            })
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setLoading(false));
    };

    // FIX 2: Added missing API helper to update notification badges inside navbar
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
        setActiveTab('mine');
    };

    const handleApply = async (jId) => {
        await axios.post(`http://localhost:4000/api/job/${jId}/apply`, {}, { withCredentials: true })
            .then(() => toast.success("Applied successfully!"))
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Something Went Wrong");
            });
    };

    const handleStatusChanged = (jId, newStatus) => {
        setMyJobs(prev => prev.map(j => j._id === jId ? { ...j, status: newStatus } : j));
        setAvailableJobs(prev => prev.filter(j => !(j._id === jId && newStatus === 'closed')));
    };

    const handleDeleted = (jId) => {
        setMyJobs(prev => prev.filter(j => j._id !== jId));
        setAvailableJobs(prev => prev.filter(j => j._id !== jId));
    };

    const currentJobs = activeTab === 'available' ? availableJobs : myJobs;

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen">
            {/* Left Side Bar */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-left">
                    {/* FIX 3: Replaced personalData with ownData */}
                    <ProfileCard data={ownData} />
                </div>
                {/* FIX 3: Replaced personalData with ownData */}
                <Navbar_3 userData={ownData} notificationCount={notificationCount} />
            </div>

            <div className="w-full py-5 sm:w-[50%] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold text-gray-900">Jobs</div>
                    <button onClick={() => setIsPostOpen(true)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors">
                        <AddIcon sx={{ fontSize: 16 }} />
                        Post a job
                    </button>
                </div>

                <div className="flex bg-white rounded-lg border border-gray-200 p-1 w-fit flex-wrap">
                    <button type="button" onClick={() => setActiveTab('available')}
                        className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors ${activeTab === 'available' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <WorkIcon sx={{ fontSize: 16 }} />
                        Jobs for you
                        {availableJobs.length > 0 && <span className={`text-xs rounded-full px-1.5 ${activeTab === 'available' ? 'bg-white/20' : 'bg-gray-100'}`}>{availableJobs.length}</span>}
                    </button>
                    <button type="button" onClick={() => setActiveTab('mine')}
                        className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors ${activeTab === 'mine' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <PeopleAltIcon sx={{ fontSize: 16 }} />
                        Jobs you posted
                        {myJobs.length > 0 && <span className={`text-xs rounded-full px-1.5 ${activeTab === 'mine' ? 'bg-white/20' : 'bg-gray-100'}`}>{myJobs.length}</span>}
                    </button>
                    <button type="button" onClick={() => setActiveTab('referrals')}
                        className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors ${activeTab === 'referrals' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <GroupsIcon sx={{ fontSize: 16 }} />
                        My Referrals
                    </button>
                </div>

                {activeTab === 'referrals' ? (
                    <MyReferralsList />
                ) : (
                    <>
                        {loading && <p className="text-sm text-gray-500 text-center py-6">Loading jobs...</p>}

                        {!loading && currentJobs.length === 0 && activeTab === 'available' && (
                            <p className="text-sm text-gray-500 text-center py-6">No jobs available right now.</p>
                        )}

                        {!loading && currentJobs.length === 0 && activeTab === 'mine' && (
                            <div className="text-center py-10 flex flex-col items-center gap-2">
                                <p className="text-sm text-gray-500">You haven't posted any jobs yet.</p>
                                <button onClick={() => setIsPostOpen(true)} className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                                    Post your first job
                                </button>
                            </div>
                        )}

                        {!loading && currentJobs.map((job) => (
                            <JobAnnounce
                                key={job._id}
                                ownId={ownData?._id}
                                onStatusChanged={handleStatusChanged}
                                onDeleted={handleDeleted}
                                job={{
                                    ...job,
                                    postedAt: job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : "",
                                    onApply: () => handleApply(job._id),
                                }}
                            />
                        ))}
                    </>
                )}
            </div>

            <div className="w-[26%] py-5 hidden md:block">
                <div className="my-5 sticky top-19"><Advertisement /></div>
            </div>

            {isPostOpen && <PostJobModal onClose={() => setIsPostOpen(false)} onJobCreated={handleJobCreated} />}

            {directJob && (
                <JobDescriptionModal
                    job={{ ...directJob, postedAt: directJob?.createdAt ? new Date(directJob.createdAt).toLocaleDateString() : "", onApply: () => handleApply(directJob._id) }}
                    ownId={ownData?._id}
                    onStatusChanged={handleStatusChanged}
                    onDeleted={(jId) => { handleDeleted(jId); navigate('/job'); }}
                    onClose={() => { setDirectJob(null); navigate('/job'); }}
                />
            )}

            <ToastContainer />
        </div>
    );
};

export default Job;