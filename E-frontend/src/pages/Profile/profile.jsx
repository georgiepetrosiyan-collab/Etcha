//E/E-frontend/pages/Profile/profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import Advertisement from '../../components/Advertisement/advertisement';
import Card from '../../components/Card/card';
import Post from '../../components/Post/post';
import Modal from '../../components/Modal/modal';
import EducationModal from '../../components/EducationModal/educationModal';
import ImageModal from '../../components/ImageModal/imageModal';
import EditinfoModal from '../../components/EditInfoModal/editInfoModal';
import AboutModal from '../../components/AboutModal/aboutModal';
import ExpModal from '../../components/ExpModal/expModal';
import MessageModal from '../../components/MessageModal/messageModal';
import PayoutInfoModal from '../../components/PayoutInfoModal/payoutInfoModal';
import ProjectsCertsModal from '../../components/ProjectsCertsModal/projectsCertsModal';
import DeleteAccountModal from '../../components/DeleteAccountModal/deleteAccountModal';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [imageSetModal, setImageModal] = useState(false);
    const [circularImage, setCircularImage] = useState(true);

    const [infoModal, setInfoModal] = useState(false);
    const [aboutModal, setAboutModal] = useState(false);
    const [expModal, setExpModal] = useState(false);
    const [messageModal, setMessageModal] = useState(false);
    const [payoutModal, setPayoutModal] = useState(false);
    const [projectsCertsModal, setProjectsCertsModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [userData, setUserData] = useState(null);
    const [postData, setPostData] = useState([]);
    const [ownData, setOwnData] = useState(null);

    const [updateExp, setUpdateExp] = useState({ clicked: "", id: "", datas: {} });
    const [eduModal, setEduModal] = useState(false);
    const [updateEdu, setUpdateEdu] = useState({ clicked: "", id: "", datas: {} });

    const updateEduEdit = (id, data) => {
        setUpdateEdu({ ...updateEdu, clicked: true, id: id, data: data });
        setEduModal(prev => !prev);
    }

    const handleEduModal = () => {
        if (eduModal) setUpdateEdu({ clicked: "", id: "", datas: {} });
        setEduModal(prev => !prev);
    }
    const updateExpEdit = (id, data) => {
        setUpdateExp({ ...updateExp, clicked: true, id: id, data: data });
        setExpModal(prev => !prev);
    }

    useEffect(() => {
        if (id && id !== "undefined") {
            fetchDataOnLoad();
        }
    }, [id]);

    const fetchDataOnLoad = async () => {
        try {
            const [userDatas, postDatas, ownDatas] = await Promise.all([
                axios.get(`http://localhost:4000/api/auth/user/${id}`),
                axios.get(`http://localhost:4000/api/post/getTop5Post/${id}`),
                axios.get('http://localhost:4000/api/auth/self', { withCredentials: true })
            ]);

            setUserData(userDatas?.data?.user);
            setPostData(postDatas?.data?.post || []);
            setOwnData(ownDatas?.data?.user);

            localStorage.setItem('userInfo', JSON.stringify(ownDatas.data.user));
        } catch (err) {
            console.log(err);
            toast.error("Something Went Wrong");
        }
    }

    const handleMessageModal = () => setMessageModal(prev => !prev);

    const handleExpModal = () => {
        if (expModal) setUpdateExp({ clicked: "", id: "", datas: {} });
        setExpModal(prev => !prev);
    }

    const handleAboutModal = () => setAboutModal(prev => !prev);
    const handleInfoModal = () => setInfoModal(prev => !prev);
    const handlePayoutModal = () => setPayoutModal(prev => !prev);
    const handleProjectsCertsModal = () => setProjectsCertsModal(prev => !prev);
    const handleImageModalOpenClose = () => setImageModal(prev => !prev);

    const handleOnEditCover = () => { setImageModal(true); setCircularImage(false); }
    const handleCircularimageOpen = () => { setImageModal(true); setCircularImage(true); }

    const handleEditFunc = async (data) => {
        await axios.put(`http://localhost:4000/api/auth/update`, { user: data }, { withCredentials: true }).then(res => {
            window.location.reload();
        }).catch(err => {
            console.log(err);
            toast.error("Something Went Wrong");
        });
    }

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await axios.delete('http://localhost:4000/api/auth/delete-account', { withCredentials: true });
            localStorage.clear();
            toast.success("Account deleted");
            navigate('/');
            window.location.reload();
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Something Went Wrong");
        } finally {
            setDeleting(false);
        }
    }

    const amIfriend = () => {
        let arr = userData?.friends?.filter((item) => item?.toString() === ownData?._id?.toString());
        return arr?.length;
    }

    const isInPendingList = () => {
        let arr = userData?.pending_friends?.filter((item) => item?.toString() === ownData?._id?.toString())
        return arr?.length;
    }

    const isInSelfPendingList = () => {
        let arr = ownData?.pending_friends?.filter((item) => item?.toString() === userData?._id?.toString())
        return arr?.length;
    }

    const checkFriendStatus = () => {
        if (amIfriend()) return "Disconnect";
        else if (isInSelfPendingList()) return "Approve Request"
        else if (isInPendingList()) return "Request Sent"
        else return "Connect"
    }

    const handleSendFriendRequest = async () => {
        if (checkFriendStatus() === "Request Sent") return;

        if (checkFriendStatus() === "Connect") {
            await axios.post('http://localhost:4000/api/auth/sendFriendReq', { reciever: userData?._id }, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => window.location.reload(), 2000)
            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error);
            });
        } else if (checkFriendStatus() === "Approve Request") {
            await axios.post('http://localhost:4000/api/auth/acceptFriendRequest', { friendId: userData?._id }, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => window.location.reload(), 2000)
            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error);
            });
        } else {
            await axios.delete(`http://localhost:4000/api/auth/removeFromFriendList/${userData?._id}`, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => window.location.reload(), 2000)
            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error);
            });
        }
    }

    const handleLogout = async () => {
        await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true }).then(res => {
            localStorage.clear();
            window.location.reload();
        }).catch(err => {
            console.log(err);
            toast.error(err?.response?.data?.error);
        });
    }

    const copyToClipboard = async () => {
        try {
            let string = `${window.location.origin}/profile/${id}`
            await navigator.clipboard.writeText(string);
            toast.success("Copied to clipboard");
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    const isOwnProfile = userData?._id === ownData?._id;

    return (
        <div className='px-5 xl:px-50 py-5 mt-5 flex flex-col gap-5 w-full pt-12 bg-gray-100'>
            <div className='flex justify-between'>

                <div className='w-full md:w-[70%]'>
                    <div>
                        <Card padding={0}>
                            <div className='w-full h-fit '>
                                <div className='relative w-full h-50'>
                                    {isOwnProfile && (
                                        <div className="absolute cursor-pointer top-3 right-3 z-20 w-9 flex justify-center items-center h-9 rounded-full p-3 bg-white"
                                            onClick={handleOnEditCover} >
                                            <EditIcon />
                                        </div>
                                    )}
                                    <img src={userData?.cover_pic} className="w-full h-50 rounded-tr-lg rounded-tl-lg" alt="cover" />
                                    <div onClick={handleCircularimageOpen} className="absolute object-cover top-24 left-6 z-10">
                                        <img className="rounded-full border-2 border-white cursor-pointer w-35 h-35" src={userData?.profilePic} />
                                    </div>
                                </div>

                                <div className='mt-10 relative px-8 py-2'>
                                    {isOwnProfile && (
                                        <div className="absolute cursor-pointer top-0 right-3 z-20 w-9 flex justify-center items-center h-9 rounded-full p-3 bg-white" onClick={handleInfoModal} >
                                            <EditIcon />
                                        </div>
                                    )}
                                    <div className='w-full'>
                                        <div className="text-2xl">{userData?.f_name}</div>
                                        <div className="text-gray-700">{userData?.headline}</div>
                                        <div className="text-sm text-gray-500">{userData?.curr_location}</div>
                                        <div className="text-md text-blue-800 w-fit cursor-pointer hover:underline">{userData?.friends?.length} Connections</div>

                                        <div className='md:flex w-full justify-between'>
                                            <div className="my-5 flex gap-5">
                                                <div className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold" onClick={copyToClipboard}>Copy link</div>
                                                {isOwnProfile && <div onClick={handleLogout} className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">Sign out</div>}
                                            </div>

                                            <div className="my-5 flex gap-5">
                                                {amIfriend() ? <div onClick={handleMessageModal} className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">Message</div> : null}
                                                {isOwnProfile ? null : <div onClick={handleSendFriendRequest} className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">{checkFriendStatus()}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-xl'>About</div>
                                {isOwnProfile && <div onClick={handleAboutModal} className='cursor-pointer'><EditIcon /></div>}
                            </div>
                            <div className='text-gray-700 text-md w-[80%]'>{userData?.about}</div>
                        </Card>
                    </div>

                    {isOwnProfile && (
                        <div className='mt-5'>
                            <Card padding={1}>
                                <div className='flex justify-between items-center'>
                                    <div className='text-xl'>Referral Payout Info</div>
                                    <div onClick={handlePayoutModal} className='cursor-pointer'><EditIcon /></div>
                                </div>
                                <p className='text-sm text-gray-500 mb-2'>Used to pay you when someone you referred gets hired.</p>
                                <div className='text-sm text-gray-700 flex flex-col gap-1'>
                                    <div><span className='text-gray-500'>Phone:</span> {userData?.phone || "Not set"}</div>
                                    <div><span className='text-gray-500'>Payout Email:</span> {userData?.payoutEmail || "Not set"}</div>
                                    <div><span className='text-gray-500'>Card:</span> {userData?.payoutCardLast4 ? `•••• ${userData.payoutCardLast4}` : "Not set"}</div>
                                </div>
                            </Card>
                        </div>
                    )}
                    {userData?.experience?.map((item, index) => (
                        <div key={index} className='p-2 border-t border-gray-300 flex justify-between'>
                            <div>
                                <div className="text-lg">{item.designation || "Job Title"}</div>
                                <div className="text-sm">{item.company_name || "Company"}</div>
                                <div className="text-sm text-gray-500">{item.startDate || "Start Date"} - {item.endDate || "Present"}</div>
                                <div className="text-sm text-gray-500">{item.location || "Location"}</div>
                                {item.description && <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">{item.description}</div>}
                            </div>
                            <div>
                                {isOwnProfile && (
                                    <div onClick={() => { updateExpEdit(item._id, item) }} className='cursor-pointer'>
                                        <EditIcon />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-xl'>Skills</div>
                            </div>
                            <div className='text-gray-700 text-md my-2 w-full flex gap-2 flex-wrap'>
                                {userData?.skills?.map((item, index) => (
                                    <div key={index} className='py-1 px-2 border cursor-default border-accent text-accent rounded-lg text-sm'>{item}</div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-xl'>Activities</div>
                            </div>

                            <div className='cursor-pointer px-3 py-1 w-fit border rounded-4xl bg-green-800 text-white font-semibold mt-2'>Posts</div>

                            <div className="overflow-x-auto my-2 flex gap-1 overflow-y-hidden w-full items-start">
                                {postData.map((item, ind) => (
                                    <div
                                        key={item?._id || ind}
                                        onClick={() => navigate(`/profile/${id}/activities/${item?._id}`)}
                                        className="cursor-pointer shrink-0 w-88 h-140"
                                    >
                                        <Post profile={1} item={item} personalData={ownData} />
                                    </div>
                                ))}
                            </div>

                            {postData.length > 5 && (
                                <div className='w-full flex justify-center items-center'>
                                    <Link to={`/profile/${id}/activities`} className='p-2 rounded-xl cursor-pointer hover:bg-gray-300'>Show All Posts <ArrowRightAltIcon /></Link>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className="flex justify-between items-center">
                                <div className="text-xl">Experience</div>
                                {isOwnProfile && <div onClick={handleExpModal} className="cursor-pointer"><AddIcon /></div>}
                            </div>
                            <div className='mt-5'>
                                {userData?.experience?.map((item, index) => (
                                    <div key={index} className='p-2 border-t border-gray-300 flex justify-between'>
                                        <div>
                                            <div className="text-lg">{item.designation || "Job Title"}</div>
                                            <div className="text-sm">{item.company_name || "Company"}</div>
                                            <div className="text-sm text-gray-500">{item.duration || "Start Date"} - {item.endDate || "Present"}</div>
                                            <div className="text-sm text-gray-500">{item.location || "Location"}</div>
                                        </div>
                                        <div>
                                            {isOwnProfile && (
                                                <div onClick={() => { updateExpEdit(item._id, item) }} className='cursor-pointer'>
                                                    <EditIcon />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!userData?.experience || userData.experience.length === 0) && (
                                    <div className='text-sm text-gray-400 py-2'>No experience added yet.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className="flex justify-between items-center">
                                <div className="text-xl">Education</div>
                                {isOwnProfile && <div onClick={handleEduModal} className="cursor-pointer"><AddIcon /></div>}
                            </div>
                            <div className='mt-5'>
                                {userData?.education?.map((item, index) => (
                                    <div key={index} className='p-2 border-t border-gray-300 flex justify-between'>
                                        <div>
                                            <div className="text-lg">{item.school || "School"}</div>
                                            <div className="text-sm">{item.degree}{item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ""}</div>
                                            <div className="text-sm text-gray-500">{item.duration}</div>
                                        </div>
                                        <div>
                                            {isOwnProfile && (
                                                <div onClick={() => { updateEduEdit(item._id, item) }} className='cursor-pointer'>
                                                    <EditIcon />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!userData?.education || userData.education.length === 0) && (
                                    <div className='text-sm text-gray-400 py-2'>No education added yet.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className="flex justify-between items-center">
                                <div className="text-xl">Projects & Certifications</div>
                                {isOwnProfile && <div onClick={handleProjectsCertsModal} className="cursor-pointer"><EditIcon /></div>}
                            </div>

                            <div className='mt-4'>
                                <div className='text-sm font-semibold text-gray-600 mb-1'>Projects</div>
                                {userData?.projects?.length > 0 ? userData.projects.map((p, i) => (
                                    <div key={i} className='p-2 border-t border-gray-200'>
                                        <div className='text-md font-medium'>{p.title}{p.link && <span className='text-blue-700 text-xs ml-2'>{p.link}</span>}</div>
                                        <div className='text-sm text-gray-600'>{p.description}</div>
                                    </div>
                                )) : <div className='text-sm text-gray-400 py-1'>No projects added yet.</div>}
                            </div>

                            <div className='mt-4'>
                                <div className='text-sm font-semibold text-gray-600 mb-1'>Certifications</div>
                                {userData?.certifications?.length > 0 ? userData.certifications.map((c, i) => (
                                    <div key={i} className='p-2 border-t border-gray-200 flex justify-between'>
                                        <div>
                                            <div className='text-md font-medium'>{c.name}</div>
                                            <div className='text-sm text-gray-600'>{c.issuer}</div>
                                        </div>
                                        <div className='text-sm text-gray-500'>{c.date}</div>
                                    </div>
                                )) : <div className='text-sm text-gray-400 py-1'>No certifications added yet.</div>}
                            </div>
                        </Card>
                    </div>

                    {isOwnProfile && (
                        <div className='mt-5'>
                            <Card padding={1}>
                                <div className='text-xl text-red-700 mb-1'>Danger Zone</div>
                                <p className='text-sm text-gray-500 mb-3'>Permanently delete your account and all associated data.</p>
                                <div
                                    onClick={() => setDeleteModal(true)}
                                    className='cursor-pointer p-2 border border-red-300 rounded-lg text-red-700 font-semibold w-fit hover:bg-red-50 transition-colors'
                                >
                                    Delete Account
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                <div className='hidden md:flex md:w-[28%]'>
                    <div className='sticky top-19'>
                        <Advertisement />
                    </div>
                </div>

            </div>

            {imageSetModal && (
                <Modal title='Upload Image' closeModal={handleImageModalOpenClose}>
                    <ImageModal handleEditFunc={handleEditFunc} selfData={ownData} isCircular={circularImage} />
                </Modal>
            )}

            {infoModal && (
                <Modal title="Edit Info" closeModal={handleInfoModal}>
                    <EditinfoModal handleEditFunc={handleEditFunc} selfData={ownData} />
                </Modal>
            )}

            {aboutModal && (
                <Modal title="Edit About" closeModal={handleAboutModal}>
                    <AboutModal handleEditFunc={handleEditFunc} selfData={ownData} />
                </Modal>
            )}

            {payoutModal && (
                <Modal title="Referral Payout Info" closeModal={handlePayoutModal}>
                    <PayoutInfoModal handleEditFunc={handleEditFunc} selfData={ownData} />
                </Modal>
            )}

            {projectsCertsModal && (
                <Modal title="Projects & Certifications" closeModal={handleProjectsCertsModal}>
                    <ProjectsCertsModal handleEditFunc={handleEditFunc} selfData={ownData} />
                </Modal>
            )}
            {eduModal && (
                <Modal title="Education" closeModal={handleEduModal}>
                    <EducationModal handleEditFunc={handleEditFunc} selfData={ownData} updateEdu={updateEdu} setUpdateEdu={updateEduEdit} />
                </Modal>
            )}

            {expModal && (
                <Modal title="Experience" closeModal={handleExpModal}>
                    <ExpModal handleEditFunc={handleEditFunc} selfData={ownData} updateExp={updateExp} setUpdateExp={updateExpEdit} />
                </Modal>
            )}

            {messageModal && (
                <Modal title="Send Message" closeModal={handleMessageModal}>
                    <MessageModal selfData={ownData} userData={userData} />
                </Modal>
            )}

            {deleteModal && (
                <DeleteAccountModal
                    loading={deleting}
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setDeleteModal(false)}
                />
            )}

            <ToastContainer />
        </div>
    );
}

export default Profile;
