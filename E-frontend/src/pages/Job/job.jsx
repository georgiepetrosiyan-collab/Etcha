import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Advertisement from '../../components/Advertisement/advertisement';
import axios from 'axios';
import JobAnnounce from '../../components/JobAnnounce/jobAnnounce';
import JobDescriptionModal from '../../components/JobDescriptionModal/jobDescriptionModal';
import PostJobModal from '../../components/PostJobModal/postJobModal';
import AddIcon from '@mui/icons-material/Add';

const Job = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [ownData, setOwnData] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPostOpen, setIsPostOpen] = useState(false);
    const [directJob, setDirectJob] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        setOwnData(userData ? JSON.parse(userData) : null);
        fetchJobs();
    }, []);

    // If we arrived via a notification link (/job/:jobId), fetch that job directly
    useEffect(() => {
        if (!jobId) {
            setDirectJob(null);
            return;
        }
        axios.get(`http://localhost:4000/api/job/${jobId}`, { withCredentials: true })
            .then(res => {
                setDirectJob(res.data.job);
            })
            .catch(err => {
                console.log(err);
                alert(err?.response?.data?.error || "Job not found");
                navigate('/job');
            });
    }, [jobId]);

    const fetchJobs = async () => {
        setLoading(true);
        await axios.get('http://localhost:4000/api/job', { withCredentials: true })
            .then(res => {
                setJobs(res.data.jobs || []);
            })
            .catch(err => {
                console.log(err);
                alert(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setLoading(false));
    };

    const handleJobCreated = (newJob) => {
        setJobs(prev => [newJob, ...prev]);
    };

    const handleApply = async (jId) => {
        await axios.post(`http://localhost:4000/api/job/${jId}/apply`, {}, { withCredentials: true })
            .then(() => {
                alert("Applied successfully!");
            })
            .catch(err => {
                console.log(err);
                alert(err?.response?.data?.error || "Something Went Wrong");
            });
    };

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen">
            {/* left side */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-fit">
                    <ProfileCard data={ownData} />
                </div>
            </div>

            {/* middle side */}
            <div className="w-full py-5 sm:w-[50%] flex flex-col gap-4">

                <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold text-gray-900">Jobs for you</div>
                    <button
                        onClick={() => setIsPostOpen(true)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors"
                    >
                        <AddIcon sx={{ fontSize: 16 }} />
                        Post a job
                    </button>
                </div>

                {loading && (
                    <p className="text-sm text-gray-500 text-center py-6">Loading jobs...</p>
                )}

                {!loading && jobs.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-6">No jobs posted yet.</p>
                )}

                {!loading && jobs.map((job) => (
                    <JobAnnounce
                        key={job._id}
                        job={{
                            ...job,
                            postedAt: job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : "",
                            onApply: () => handleApply(job._id),
                        }}
                    />
                ))}
            </div>

            {/* right side */}
            <div className="w-[26%] py-5 hidden md:block">
                <div className="my-5 sticky top-19">
                    <Advertisement />
                </div>
            </div>

            {isPostOpen && (
                <PostJobModal
                    onClose={() => setIsPostOpen(false)}
                    onJobCreated={handleJobCreated}
                />
            )}

            {/* Auto-opened when reached via a job-referral notification */}
            {directJob && (
                <JobDescriptionModal
                    job={{
                        ...directJob,
                        postedAt: directJob?.createdAt ? new Date(directJob.createdAt).toLocaleDateString() : "",
                        onApply: () => handleApply(directJob._id),
                    }}
                    onClose={() => {
                        setDirectJob(null);
                        navigate('/job');
                    }}
                />
            )}
        </div>
    );
};

export default Job;