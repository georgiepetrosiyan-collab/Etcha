import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Navbar_3 from '../../components/Navbar_3/navbar_3';
import Advertisement from '../../components/Advertisement/advertisement';
import Card from '../../components/Card/card';
import Modal from '../../components/Modal/modal';
import MessageModal from '../../components/MessageModal/messageModal';

const MyNetwork = () => {
    const [text, setText] = useState("Catch Up with Friends");
    const [data, setData] = useState([]);
    const [ownData, setOwnData] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [messageTarget, setMessageTarget] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        if (userData) setOwnData(JSON.parse(userData));
    }, []);

    const fetchFriendList = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/auth/friendsList', { withCredentials: true });
            setData(res.data.friends || []);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchPendingRequest = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/auth/pendingFriendsList', { withCredentials: true });
            setData(res.data.pendingFriendsList || []);
        } catch (err) {
            console.log(err);
        }
    };

    const handleAccept = async (friendId) => {
        try {
            await axios.post('http://localhost:4000/api/auth/acceptFriendRequest', { friendId }, { withCredentials: true });
            setData(prev => prev.filter(item => item._id !== friendId));
        } catch (err) {
            console.log(err);
        }
    };

    const handleIgnore = async (friendId) => {
        try {
            await axios.post('http://localhost:4000/api/auth/ignoreFriendRequest', { friendId }, { withCredentials: true });
            setData(prev => prev.filter(item => item._id !== friendId));
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (text === "Catch Up with Friends") {
            fetchFriendList();
        } else {
            fetchPendingRequest();
        }
    }, [text]);

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen">
            {/* Left Side Bar */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div>
                    <ProfileCard data={ownData} />
                </div>
                <Navbar_3 userData={ownData} notificationCount={notificationCount} />
            </div>

            {/* Middle Content */}
            <div className="w-full py-5 sm:w-[50%]">
                <Card padding={2}>
                    {/* Tab Switcher */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
                        <button 
                            onClick={() => setText("Catch Up with Friends")}
                            className={`px-6 py-2 rounded-full font-semibold transition ${text === "Catch Up with Friends" ? 'bg-accent text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            Friends
                        </button>
                        <button 
                            onClick={() => setText("Pending Request")}
                            className={`px-6 py-2 rounded-full font-semibold transition ${text === "Pending Request" ? 'bg-accent text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            Pending Requests
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="flex flex-col gap-4">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <img src={item.profilePic} className="w-12 h-12 rounded-full object-cover" alt="Profile" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">{item.f_name}</h4>
                                            <p className="text-sm text-gray-500">{item.headline || 'Member'}</p>
                                        </div>
                                    </div>
                                    
                                    {text === "Pending Request" ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleIgnore(item._id)} className="px-4 py-1 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition">Ignore</button>
                                            <button onClick={() => handleAccept(item._id)} className="px-4 py-1 bg-accent text-white rounded-full hover:bg-[#006d68] transition">Accept</button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setMessageTarget(item)}
                                            className="text-accent font-medium text-sm hover:underline">
                                            Message
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                {text === "Catch Up with Friends" ? "No friends yet." : "No pending requests."}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Right Sidebar */}
            <div className="w-[26%] py-5 hidden md:block">
                <div className="sticky top-19"><Advertisement /></div>
            </div>

            {/* Message Modal */}
            {messageTarget && (
                <Modal title={`Message ${messageTarget.f_name}`} closeModal={() => setMessageTarget(null)}>
                    <MessageModal selfData={ownData} userData={messageTarget} />
                </Modal>
            )}
        </div>
    );
};

export default MyNetwork;