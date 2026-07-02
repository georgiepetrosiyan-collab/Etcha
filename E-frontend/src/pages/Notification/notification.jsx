import React, { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Advertisement from '../../components/Advertisement/advertisement';
import Card from '../../components/Card/card';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:4000/api';

const Notification = () => {
    const navigate = useNavigate();
    const [ownData, setOwnData] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const fetchNotificationData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/notification`, { withCredentials: true });
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            alert("Something went wrong while fetching notifications");
        }
    };

    const handleOnClickNotification = async (item) => {
        try {
            await axios.put(`${API_BASE_URL}/notification/isRead`, { notificationId: item._id }, { withCredentials: true });
            
            // Optimistically update the UI to show it's read
            setNotifications(prev => 
                prev.map(notif => notif._id === item._id ? { ...notif, isRead: true } : notif)
            );

            if (item.type === "comment" && item.postId) {
                navigate(`/profile/${ownData?._id}/activities/${item.postId}`);
            } else {
                navigate("/myNetwork");
            }
        } catch (err) {
            console.error("Error updating notification:", err);
            alert("Something went wrong while marking the notification as read");
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        setOwnData(userData ? JSON.parse(userData) : null);
        fetchNotificationData();
    }, []);

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen">
            {/* left side */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-fit">
                    <ProfileCard data={ownData} />
                </div>
            </div>

            {/* middle side */}
            <div className="w-full py-5 sm:w-[50%]">
                <Card padding={0}>
                    <div className="w-full">
                        {notifications.length === 0 ? (
                            <div className="p-5 text-center text-gray-500">No new notifications</div>
                        ) : (
                            notifications.map((item) => (
                                <div 
                                    key={item._id} 
                                    onClick={() => handleOnClickNotification(item)} 
                                    className={`flex border-b cursor-pointer gap-4 items-center border-gray-300 p-4 transition hover:bg-gray-200 ${item?.isRead ? "bg-white" : "bg-blue-50"}`}
                                >
                                    <img 
                                        src={item?.sender?.profilePic || 'https://via.placeholder.com/150'} 
                                        alt="Profile"
                                        className="rounded-full cursor-pointer w-12 h-12 object-cover shrink-0" 
                                    />
                                    <div className="text-sm md:text-base text-gray-800">
                                        <span className="font-semibold mr-1">{item?.sender?.f_name}</span>
                                        {item?.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* right side */}
            <div className="w-[26%] py-5 hidden md:block">
                <div className="my-5 sticky top-19">
                    <Advertisement />
                </div>
            </div>
        </div>
    );
};

export default Notification;