/* //E/E-frontend/components/NavBar_2/navbar_2.jsx */

import React, { useState, useEffect } from 'react'
import "./navbar2.css"
import axios from 'axios'
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import ForumIcon from '@mui/icons-material/Forum';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useLocation, Link } from 'react-router-dom';

const Navbar_2 = () => {
    const location = useLocation();

    const [userData, setUserData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [searchUser, setSearchUser] = useState([]);
    const [notificationCount, setNotificationCount] = useState("")

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedTerm) {
            searchAPICall()
        }
    }, [debouncedTerm]);

    const searchAPICall = async () => {
        await axios.get(`http://localhost:4000/api/auth/findUser?query=${debouncedTerm}`, { withCredentials: true }).then(res => {
            console.log(res)
            setSearchUser(res.data.users)
        }).catch(err => {
            console.log(err)
            alert(err?.response?.data?.error)
        })
    }

    const fetchNotification = async () => {
        await axios.get('http://localhost:4000/api/notification/activeNotification', { withCredentials: true }).then(res => {
            var count = res.data.count;
            setNotificationCount(count)
        }).catch(err => {
            console.log(err)
            alert(err?.response?.data?.error)
        })
    }

    useEffect(() => {
        let userData = localStorage.getItem('userInfo')
        setUserData(userData ? JSON.parse(userData) : null)
        fetchNotification()
    }, [])

    return (
        <div className="bg-white h-13 flex justify-between py-1 px-5 xl:px-50 fixed top-0 w-full z-1000">
            <div className="flex gap-2 items-center">

                <Link to="/feeds" className="cursor-pointer flex items-center transition-transform active:scale-95">
                    <img className="w-8 h-8" src={"/logo_theone.svg"} alt="logo" />
                </Link>

                <div className="relative">
                    <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value) }} className="searchInput w-70 bg-gray-100 rounded-sm h-10 px-4" placeholder="Search" />

                    {searchUser.length > 0 && debouncedTerm.length !== 0 &&
                        <div className="absolute w-88 left-0 bg-gray-200">
                            {searchUser.map((item, index) => {
                                return (
                                    <Link to={`/profile/${item?._id}`} key={index} className='flex gap-2 mb-1 items-center cursor-pointer' onClick={() => setSearchTerm("")}>
                                        <div><img className="w-10 h-10 rounded-full" src={item?.profilePic} alt="profile" /></div>
                                        <div>{item?.f_name}</div>
                                    </Link>
                                )
                            })}
                        </div>
                    }
                </div>

                <div className="hidden gap-10 md:flex">

                    <Link to="/feeds" className="flex flex-col items-center cursor-pointer">
                        <HomeIcon sx={{ color: location.pathname === "/feeds" ? "black" : "gray" }} />
                        <div className={`text-sm text-gray-500 ${location.pathname === "/feeds" ? "border-b-3" : ""}`}>
                            Home
                        </div>
                    </Link>

                    <Link to="/myNetwork" className="flex flex-col items-center cursor-pointer">
                        <PeopleAltIcon sx={{ color: location.pathname === "/myNetwork" ? "black" : "gray" }} />
                        <div className={`text-sm text-gray-500 ${location.pathname === "/myNetwork" ? "border-b-3 " : ""}`}>
                            My Network
                        </div>
                    </Link>

                    <Link to="/job" className="flex flex-col items-center cursor-pointer">
                        <WorkIcon sx={{ color: location.pathname === "/job" ? "black" : "gray" }} />
                        <div className={`text-sm text-gray-500 ${location.pathname === "/job" ? "border-b-3 " : ""}`}>
                            Job
                        </div>
                    </Link>

                    <Link to="/messages" className="flex flex-col items-center cursor-pointer">
                        <ForumIcon sx={{ color: location.pathname === "/messages" ? "black" : "gray" }} />
                        <div className={`text-sm text-gray-500 ${location.pathname === "/messages" ? "border-b-3 " : ""}`}>
                            Message
                        </div>
                    </Link>

                    <Link to={"/notification"} className="flex flex-col items-center cursor-pointer">
                        <div><NotificationsIcon sx={{ color: location.pathname === "/notification" ? "black" : "gray" }} /> {notificationCount>0 && <span className="p-1 rounded-full text-sm bg-red-700 text-white">{notificationCount}</span>}</div>
                        <div className={`text-sm text-gray-500 ${location.pathname === "/notification" ? "border-b-3 " : ""}`}>
                            Notification
                        </div>
                    </Link>

                    <Link to={`/profile/${userData?._id}`} className="flex flex-col items-center cursor-pointer">
                        <img className="w-8 h-8 rounded-full" src={userData?.profilePic} alt="profile" />
                        <div className="text-sm text-gray-500">Me</div>
                    </Link>

                </div>

            </div>
        </div>
    )
}

export default Navbar_2