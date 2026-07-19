import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import ForumIcon from '@mui/icons-material/Forum';
import NotificationsIcon from '@mui/icons-material/Notifications';

// IMPORTANT: Make sure this path points correctly to your Card component!
import Card from '../Card/card'; 

const Navbar_3 = ({ userData, notificationCount = 0 }) => {
    const location = useLocation();

    return (
        <div className="w-full my-5">
            <Card padding={1}>
                <div className="w-full flex flex-col gap-4 p-2">
                    
                    {/* Home Link */}
                    <Link to="/feeds" className="w-full flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <HomeIcon sx={{ color: location.pathname === "/feeds" ? "black" : "gray" }} />
                            <div className={`text-sm text-gray-500 ${location.pathname === "/feeds" ? "font-semibold text-black" : ""}`}>
                                Home
                            </div>
                        </div>
                        {location.pathname === "/feeds" && <div className="w-1 h-5 bg-black rounded-l" />}
                    </Link>

                    {/* My Network Link */}
                    <Link to="/myNetwork" className="w-full flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <PeopleAltIcon sx={{ color: location.pathname === "/myNetwork" ? "black" : "gray" }} />
                            <div className={`text-sm text-gray-500 ${location.pathname === "/myNetwork" ? "font-semibold text-black" : ""}`}>
                                My Network
                            </div>
                        </div>
                        {location.pathname === "/myNetwork" && <div className="w-1 h-5 bg-black rounded-l" />}
                    </Link>

                    {/* Job Link */}
                    <Link to="/job" className="w-full flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <WorkIcon sx={{ color: location.pathname === "/job" ? "black" : "gray" }} />
                            <div className={`text-sm text-gray-500 ${location.pathname === "/job" ? "font-semibold text-black" : ""}`}>
                                Job
                            </div>
                        </div>
                        {location.pathname === "/job" && <div className="w-1 h-5 bg-black rounded-l" />}
                    </Link>

                    {/* Message Link */}
                    <Link to="/messages" className="w-full flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <ForumIcon sx={{ color: location.pathname === "/messages" ? "black" : "gray" }} />
                            <div className={`text-sm text-gray-500 ${location.pathname === "/messages" ? "font-semibold text-black" : ""}`}>
                                Message
                            </div>
                        </div>
                        {location.pathname === "/messages" && <div className="w-1 h-5 bg-black rounded-l" />}
                    </Link>

                    {/* Notification Link */}
                    <Link to="/notification" className="w-full flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <NotificationsIcon sx={{ color: location.pathname === "/notification" ? "black" : "gray" }} />
                            </div>
                            <div className={`text-sm text-gray-500 ${location.pathname === "/notification" ? "font-semibold text-black" : ""}`}>
                                Notification
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {notificationCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-700 text-white font-bold">
                                    {notificationCount}
                                </span>
                            )}
                            {location.pathname === "/notification" && <div className="w-1 h-5 bg-black rounded-l" />}
                        </div>
                    </Link>

                    {/* Divider line before profile */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Profile Link (Me) */}
                    <Link to={`/profile/${userData?._id}`} className="w-full flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <img className="w-7 h-7 rounded-full object-cover border border-gray-200" src={userData?.profilePic} alt="profile" />
                            <div className="text-sm text-gray-500 font-medium">Me</div>
                        </div>
                        {location.pathname.startsWith("/profile") && <div className="w-1 h-5 bg-black rounded-l" />}
                    </Link>

                </div>
            </Card>
        </div>
    );
};

export default Navbar_3;