//E/E-frontend/pages/Feeds/feeds.jsx 

import React, { useState, useEffect } from 'react';
import ProfileCard from '../../components/ProfileCard/profileCard'
import Card from '../../components/Card/card'
import MovieIcon from '@mui/icons-material/Movie';
import PhotoIcon from '@mui/icons-material/Photo';
import FeedIcon from '@mui/icons-material/Feed';
import Advertisement from '../../components/Advertisement/advertisement'
import Post from '../../components/Post/post';
import AddModal from '../../components/AddModal/addModal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from '../../components/Modal/modal';

const Feeds = () => {

    const [personalData, setPersonalData] = useState(null);
    const [post, setPost] = useState([])

    const [addPostModal, setAddPostModal] = useState(false);

    const fetchData = async () => {
        // Fetch logged-in user's data independently
        try {
            const userData = await axios.get('http://localhost:4000/api/auth/self', { withCredentials: true });
            setPersonalData(userData.data.user);
            localStorage.setItem("userInfo", JSON.stringify(userData.data.user));
        } catch (err) {
            console.log(err);
            // User likely not logged in — don't block the rest of the page for this
        }

        // Fetch posts independently, so it still works even if the user fetch fails
        try {
            const postData = await axios.get('http://localhost:4000/api/post/getAllPost');
            // FIX: backend returns key "post" (singular), not "posts"
            setPost(postData.data.post || []);
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.error || "Failed to load posts");
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenPostModal = () => {
        setAddPostModal(prev => !prev)
    }
    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100">
            {/*left side*/}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-left">
                    <ProfileCard data={personalData} />
                </div>

                <div className="w-full my-5">
                    <Card padding={1}>
                        <div className="w-full flex justify-between">
                            <div>Profile views:</div>
                            <div className="text-blue-900">0</div>
                        </div>

                        <div className="w-full flex justify-between">
                            <div>Post Impressions:</div>
                            <div className="text-blue-900">0</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/*middle side*/}
            <div className="w-full py-5 sm:w-[50%]">
                <div>
                    <Card padding={1}>
                        <div className='flex gap-2 items-center'>
                            <img src={personalData?.profilePic || ''} className="rounded-4xl w-13 border-2 border-white cursor-pointer" alt="profile" />
                            <div onClick= {()=>setAddPostModal(true)} className="w-full border py-3 rounded-3xl cursor-pointer hover:bg-gray-100 text-center">Start a post</div>
                        </div>

                        <div className="w-full flex mt-3">

                            <div onClick= {()=>setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                <MovieIcon sx={{ color: '#005e5a' }} />Video
                            </div>

                            <div onClick= {()=>setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                <PhotoIcon sx={{ color: '#00827D' }} />Photo
                            </div>

                            <div onClick= {()=>setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                <FeedIcon sx={{ color: '#00a69f' }} />Article
                            </div>

                        </div>
                    </Card> 
                </div>

                <div className="border-b border-gray-400 w-full my-5">

                </div>

                <div className="w-full flex flex-col gap-5">
                {
                    post.map((item,index)=>{
                        return <Post item ={item} key={item._id || index} personalData={personalData} />
                    })
                }
                </div>

            </div>

            {/*right side*/}
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
            {
                addPostModal && <Modal closeModal={handleOpenPostModal} title={""}>
                    <AddModal personalData={personalData} />
                </Modal>
            }

            <ToastContainer />
        </div>
    )
}

export default Feeds