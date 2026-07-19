//E/E-frontend/pages/Feeds/feeds.jsx

import React, { useState, useEffect } from 'react';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Card from '../../components/Card/card';
import MovieIcon from '@mui/icons-material/Movie';
import PhotoIcon from '@mui/icons-material/Photo';
import FeedIcon from '@mui/icons-material/Feed';
import Advertisement from '../../components/Advertisement/advertisement';
import Post from '../../components/Post/post';
import AddModal from '../../components/AddModal/addModal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from '../../components/Modal/modal';
import Navbar_3 from '../../components/Navbar_3/navbar_3';

const Feeds = () => {
    const [personalData, setPersonalData] = useState(null);
    const [post, setPost] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0); // Fixed: Added missing state
    const [addPostModal, setAddPostModal] = useState(false);

    const fetchData = async () => {
        // Fetch logged-in user's data independently
        try {
            const userData = await axios.get('http://localhost:4000/api/auth/self', { withCredentials: true });
            setPersonalData(userData.data.user);
            localStorage.setItem("userInfo", JSON.stringify(userData.data.user));
        } catch (err) {
            console.log(err);
        }

        // Fetch posts independently
        try {
            const postData = await axios.get('http://localhost:4000/api/post/getAllPost');
            setPost(postData.data.post || []);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to load posts");
        }
    };

    // Fixed: Added missing notification fetching mechanism
    const fetchNotification = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/notification/activeNotification', { withCredentials: true });
            setNotificationCount(res.data.count || 0);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchNotification();
    }, []);

    const handleOpenPostModal = () => {
        setAddPostModal(prev => !prev);
    };

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100">
            
            {/* Left Side Bar */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-left">
                    <ProfileCard data={personalData} />
                </div>
                {/* Cleanly placed Navbar_3 menu underneath the profile card */}
                <Navbar_3 userData={personalData} notificationCount={notificationCount} />
            </div>

            {/* Middle Content Stream */}
            <div className="w-full py-5 sm:w-[50%]">
                <div>
                    <Card padding={1}>
                        <div className='flex gap-2 items-center'>
                            <img src={personalData?.profilePic || ''} className="rounded-4xl w-13 border-2 border-white cursor-pointer" alt="profile" />
                            <div onClick={() => setAddPostModal(true)} className="w-full border border-gray-400 text-gray-400 py-3 rounded-3xl cursor-pointer hover:bg-gray-100 text-center">Start a post</div>
                        </div>

                        <div className="w-full flex mt-3">
                            <div onClick={() => setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                <MovieIcon sx={{ color: '#00827D' }} />Video
                            </div>

                            <div onClick={() => setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                <PhotoIcon sx={{ color: '#00827D' }} />Photo
                            </div>

                            <div onClick={() => setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                <FeedIcon sx={{ color: '#00827D' }} />Article
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="border-b border-gray-400 w-full my-5"></div>

                <div className="w-full flex flex-col gap-5">
                    {post.map((item, index) => (
                        <Post item={item} key={item._id || index} personalData={personalData} />
                    ))}
                </div>
            </div>

            {/* Right Side Bar */}
            <div className="w-[26%] py-5 hidden md:block">
                <div>
                    <Card padding={1}>
                        <div className="text-xl">Etcha News</div>
                        <div className="text-gray-600">Top Stories</div>

                        <div className="my-1">
                            <div className="text-md"> Something</div>
                            <div className="text-xs text-gray-400">some time ago</div>
                        </div>
                    </Card>
                </div>

                <div className="my-5 sticky top-19">
                    <Advertisement />
                </div>
            </div>

            {/* Overlay Modals & Alerts */}
            {addPostModal && (
                <Modal closeModal={handleOpenPostModal} title={""}>
                    <AddModal personalData={personalData} />
                </Modal>
            )}

            <ToastContainer />
        </div>
    );
};

export default Feeds;