import React, { useState, useEffect } from 'react';
import ProfileCard from '../../components/ProfileCard/profileCard'
import Card from '../../components/Card/card'
import MovieIcon from '@mui/icons-material/Movie';
import PhotoIcon from '@mui/icons-material/Photo';
import FeedIcon from '@mui/icons-material/Feed';
// Fixed: Changed name from Card to Advertisment to avoid name collision, and corrected spelling
import Advertisement from '../../components/Advertisement/advertisement'
import Post from '../../components/Post/post';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from '../../components/Modal/modal';

const Feeds = () => {

    const [personalData, setPersonalData] = useState(false);
    const [post, setPost] = useState([])

    const [addPostModal, setAddPostModal] = useState(false);

    // const fetchSelfData = async()=>{
    //   await axios.get('http://localhost:4000/api/auth/self',{withCredentials:true}).then(res=>{
    //     setPersonalData(res.data.user)
    //   }).catch(err=>{
    //     console.error('API error:', err);
    //     toast.error(err?.response?.data?.error)
    //   })
    // }

    const fetchData = async () => {
        try {
            const [userData, postData] = await Promise.all([
                await axios.get('http://localhost:4000/api/auth/self', { withCredentials: true }),
                await axios.get('http://localhost:4000/api/post/getAllPost')
            ]);
            setPersonalData(userData.data.user)
            localStorage.setItem("userInfo", JSON.stringify(userData.data.user));
            setPost(postData.data.posts)


        } catch (err) {
            console.log(err)
            toast.error(err?.response?.data?.error)
        }

    }

    useEffect(() => {
        // fetchSelfData()
        fetchData()
    }, [])

    const handleOpenPostModal = () => {
        setAddPostModal(prev => !prev)
    }
    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100">
            {/*left side*/}
            {/* Fixed: Changed sm:black to sm:block to correctly unhide the side panel */}
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
                        {/* Fixed: item-center corrected to items-center */}
                        <div className='flex gap-2 items-center'>
                            <img src={personalData?.profilePic} className="rounded-4xl w-13 border-2 border-white cursor-pointer" alt="profile" />
                            {/* Fixed: curpsr-pointer corrected to cursor-pointer */}
                            <div onClick= {()=>setAddPostModal(true)} className="w-full border py-3 rounded-3xl cursor-pointer hover:bg-gray-100 text-center">Start a post</div>
                        </div>

                        <div className="w-full flex mt-3">

                            <div onClick= {()=>setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                {/* Darker Teal */}
                                <MovieIcon sx={{ color: '#005e5a' }} />Video
                            </div>

                            <div onClick= {()=>setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                {/* Your Base Color #00827D */}
                                <PhotoIcon sx={{ color: '#00827D' }} />Photo
                            </div>

                            <div onClick= {()=>setAddPostModal(true)} className="flex gap-2 p-2 cursor-pointer justify-center rounded-lg w-[33%] hover:bg-gray-100 items-center">
                                {/* Lighter Teal */}
                                <FeedIcon sx={{ color: '#00a69f' }} />Article
                            </div>

                        </div>
                    </Card> {/* Fixed: Reorganized structural closing hierarchy below */}
                </div>

                {/* Fixed: Changed w-[100%} bracket to curly bracket w-full */}
                <div className="border-b border-gray-400 w-full my-5">

                </div>

                {/* Fixed: Corrected vlassName to className */}
                <div className="w-full flex flex-col gap-5">
                {
                    post.map((item,index)=>{
                        return <Post item ={item} key={index} personalData={personalData} />
                    })
                }
                </div>

            </div>

            {/*right side*/}
            {/* Fixed: Corrected clasName to className and balanced w-[26%] bracket */}
            <div className="w-[26%] py-5 hidden md:block">
                {/* Right side contents go here */}
                <div>
                    <Card padding={1}>
                        <div className="text-xl">Etcha News</div>
                        <div className="text-gray-600">Top Stories</div>

                        {/* Fixed: Corrected my1 to my-1 */}
                        <div className="my-1">
                            <div className="text-md"> Something</div>
                            {/* Fixed: Corrected tet-xs to text-xs */}
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