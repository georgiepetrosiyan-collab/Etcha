//E/E-frontend/pages/Profile/profile.jsx 

import React, { useState, useEffect } from 'react';
import Advertisement from '../../components/Advertisement/advertisement';
import Card from '../../components/Card/card';
import Post from '../../components/Post/post';
import Modal from '../../components/Modal/modal';
import ImageModal from '../../components/ImageModal/imageModal';
import EditinfoModal from '../../components/EditInfoModal/editInfoModal';
import AboutModal from '../../components/AboutModal/aboutModal';
import ExpModal from '../../components/ExpModal/expModal';
import MessageModal from '../../components/MessageModal/messageModal';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CreateIcon from '@mui/icons-material/Create';
import EditIcon from '@mui/icons-material/Edit';

import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [imageSetModal, setImageModal] = useState(false);
    const [circularImage, setCircularImage] = useState(true);

    const [infoModal, setInfoModal] = useState(false);
    const [aboutModal, setAboutModal] = useState(false);
    const [expModal, setExpModal] = useState(false);
    const [messageModal, setMessageModal] = useState(false);

    const [userData, setUserData] = useState(null);
    const [postData, setPostData] = useState([]);
    const [ownData, setOwnData] = useState(null);

    const [updateExp, setUpdateExp] = useState({ clicked: "", id: "", datas: {} });

    const updateExpEdit = (id, data) => {
        setUpdateExp({
            ...updateExp,
            clicked: true, id: id, data: data
        });
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

    const handleMessageModal = () => {
        setMessageModal(prev => !prev);
    }

    const handleExpModal = () => {
        if (expModal) {
            setUpdateExp({ clicked: "", id: "", datas: {} });
        }
        setExpModal(prev => !prev);
    }

    const handleAboutModal = () => {
        setAboutModal(prev => !prev);
    }

    const handleInfoModal = () => {
        setInfoModal(prev => !prev);
    }

    const handleImageModalOpenClose = () => {
        setImageModal(prev => !prev);
    }

    const handleOnEditCover = () => {
        setImageModal(true);
        setCircularImage(false);
    }

    const handleCircularimageOpen = () => {
        setImageModal(true);
        setCircularImage(true);
    }

    const handleEditFunc = async (data) => {
        await axios.put(`http://localhost:4000/api/auth/update`, { user: data }, { withCredentials: true }).then(res => {
            window.location.reload();
        }).catch(err => {
            console.log(err);
            toast.error("Something Went Wrong");
        });
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
        if (amIfriend()) {
            return "Disconnect";
        } else if (isInSelfPendingList()) {
            return "Approve Request"
        } else if (isInPendingList()) {
            return "Request Sent"
        } else {
            return "Connect"
        }
    }

    const handleSendFriendRequest = async () => {
        if (checkFriendStatus() === "Request Sent") return;

        if (checkFriendStatus() === "Connect") {
            await axios.post('http://localhost:4000/api/auth/sendFriendReq', { reciever: userData?._id }, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error);
            });
        } else if (checkFriendStatus() === "Approve Request") {
            await axios.post('http://localhost:4000/api/auth/acceptFriendRequest', { friendId: userData?._id }, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error);
            });
        } else {
            await axios.delete(`http://localhost:4000/api/auth/removeFromFriendList/${userData?._id}`, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

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
            let string = `http://localhost:5173/profile/${id}`
            await navigator.clipboard.writeText(string);
            toast.success("Copied to clipboard");
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <div className='px-5 xl:px-50 py-5 mt-5 flex flex-col gap-5 w-full pt-12 bg-gray-100'>
            <div className='flex justify-between'>

                {/* Left Side Main Section */}
                <div className='w-full md:w-[70%]'>
                    <div>
                        <Card padding={0}>
                            <div className='w-full h-fit '>
                                <div className='relative w-full h-50'>
                                    {
                                        userData?._id == ownData?._id &&
                                        <div className="absolute cursor-pointer top-3 right-3 z-20 w-9 flex justify-center items-center h-9 rounded-full p-3 bg-white"
                                            onClick={handleOnEditCover} >
                                            <EditIcon />
                                        </div>
                                    }
                                    <img src={userData?.cover_pic} className="w-full h-50 rounded-tr-lg rounded-tl-lg" alt="cover" />
                                    <div onClick={handleCircularimageOpen} className="absolute object-cover top-24 left-6 z-10">
                                        <img className="rounded-full border-2 border-white cursor-pointer w-35 h-35" src={userData?.profilePic} />
                                    </div>
                                </div>

                                <div className='mt-10 relative px-8 py-2'>
                                    {userData?._id === ownData?._id && (
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
                                                <div className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">Open to</div>
                                                <div className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold" onClick ={copyToClipboard}>Share</div>
                                                {
                                                    userData?._id === ownData?._id && <div onClick={handleLogout} className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">Logout</div>
                                                }
                                            </div>

                                            <div className="my-5 flex gap-5">
                                                {amIfriend() ? <div onClick={handleMessageModal} className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">Message</div> : null}
                                                {userData?._id === ownData?._id ? null : <div onClick={handleSendFriendRequest} className="cursor-pointer p-2 border rounded-lg bg-blue-800 text-white font-semibold">{checkFriendStatus()}</div>}
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
                                {userData?._id === ownData?._id && <div onClick={handleAboutModal} className='cursor-pointer'><EditIcon /></div>}
                            </div>
                            <div className='text-gray-700 text-md w-[80%]'>{userData?.about}</div>
                        </Card>
                    </div>

                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-xl'>Skills</div>
                            </div>
                            <div className='text-gray-700 text-md my-2 w-full flex gap-4 flex-wrap'>
                                {
                                    userData?.skills?.map((item, index) => {
                                        return (
                                            <div key={index} className='py-2 px-3 cursor-pointer bg-blue-800 text-white rounded-lg'>{item}</div>
                                        )
                                    })
                                }
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
                                {
                                    postData.map((item, ind) => {
                                        return (
                                            <div
                                                key={item?._id || ind}
                                                onClick={() => navigate(`/profile/${id}/activities/${item?._id}`)}
                                                className="cursor-pointer shrink-0 w-88 h-140"
                                            >
                                                <Post profile={1} item={item} personalData={ownData} />
                                            </div>
                                        )
                                    })
                                }
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
                                {
                                    userData?._id == ownData?._id && <div onClick={handleExpModal} className="cursor-pointer">
                                        <AddIcon />
                                    </div>
                                }
                            </div>
                            <div className='mt-5'>
                                {userData?.experience?.map((item, index) => {
                                    return (
                                        <div key={index} className='p-2 border-t border-gray-300 flex justify-between'>
                                            <div>
                                                <div className="text-lg">{item.designation || "Job Title"}</div>
                                                <div className="text-sm">{item.company_name || "Company"}</div>
                                                <div className="text-sm text-gray-500">{item.duration || "Start Date"} - {item.endDate || "Present"}</div>
                                                <div className="text-sm text-gray-500">{item.location || "Location"}</div>
                                            </div>

                                            <div>
                                                {userData?._id === ownData?._id && (
                                                    <div onClick={() => { updateExpEdit(item._id, item) }} className='cursor-pointer'>
                                                        <EditIcon />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right Side Add */}
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

            <ToastContainer />
        </div>
    );
}

export default Profile;