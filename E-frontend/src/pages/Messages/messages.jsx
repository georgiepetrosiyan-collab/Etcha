import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card/card';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Conversation from '../../components/Conversation/conversation.jsx';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import socket from '../../../socket';

// Importing your components
import ProfileCard from '../../components/ProfileCard/profileCard';
import Navbar_3 from '../../components/Navbar_3/navbar_3';
import Advertisement from '../../components/Advertisement/advertisement';

const API_BASE_URL = 'http://localhost:4000/api';
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dmkqcilgq/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'etchacloud';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [ownData, setOwnData] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [activeConvId, setActiveConvId] = useState(null);
    const [selectedConvDetails, setSelectedConvDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageLink, setImageLink] = useState(null);
    const [messageText, setMessageText] = useState("");

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        const parsedUserData = userData ? JSON.parse(userData) : null;
        setOwnData(parsedUserData);
        fetchConversationOnLoad(parsedUserData);
    }, []);

    useEffect(() => {
        if (activeConvId) fetchMessages();
    }, [activeConvId]);

    useEffect(() => {
        const handleReceiveMessage = (response) => {
            setMessages((prevMessages) => [...prevMessages, response]);
        };
        socket.on("receiveMessage", handleReceiveMessage);
        return () => socket.off("receiveMessage", handleReceiveMessage);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, imageLink]);

    const handleSelectedConv = (id, userData) => {
        setActiveConvId(id);
        socket.emit("joinConversation", id);
        setSelectedConvDetails(userData);
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/message/${activeConvId}`, { withCredentials: true });
            setMessages(res.data.messages || []);
        } catch (err) { console.error("Error fetching messages:", err); }
    };

    const fetchConversationOnLoad = async (currentUser) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/conversation/get-conversation`, { withCredentials: true });
            const fetchedConversations = res.data.conversations || [];
            setConversations(fetchedConversations);
            if (fetchedConversations.length > 0) {
                const firstConv = fetchedConversations[0];
                setActiveConvId(firstConv._id);
                socket.emit("joinConversation", firstConv._id);
                const otherMember = firstConv.members?.find((it) => it._id !== currentUser?._id);
                setSelectedConvDetails(otherMember || null);
            }
        } catch (err) { console.error("Error fetching conversations:", err); }
    };

    const handleInputImage = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        setLoading(true);
        try {
            const response = await axios.post(CLOUDINARY_UPLOAD_URL, data);
            setImageLink(response.data.url);
        } catch (err) { alert("Failed to upload image."); } finally { setLoading(false); }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() && !imageLink) return;
        try {
            const payload = { conversation: activeConvId, message: messageText, picture: imageLink };
            const res = await axios.post(`${API_BASE_URL}/message`, payload, { withCredentials: true });
            socket.emit("sendMessage", activeConvId, res.data.data);
            setMessageText("");
            setImageLink(null);
        } catch (err) { alert("Something went wrong while sending."); }
    };

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen pt-20">
            {/* Left Side Bar */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-left">
                    <ProfileCard data={ownData} />
                </div>
                <Navbar_3 userData={ownData} notificationCount={notificationCount} />
            </div>

            {/* Middle: Messaging Area */}
            <div className="w-full py-5 sm:w-[50%]">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Messaging</h1>
                <Card padding={0} className="shadow-md overflow-hidden min-h-[70vh]">
                    <div className="border-b border-gray-200 p-4 bg-white flex justify-between items-center">
                         <div className="py-1 px-4 bg-accent font-semibold flex gap-2 w-fit rounded-full text-white cursor-pointer hover:bg-[#006d68]">
                            Focused <ArrowDropDownIcon />
                        </div>
                    </div>

                    <div className="flex h-[60vh] md:h-[70vh]">
                        {/* Conversations Sidebar */}
                        <div className="w-[30%] border-r border-gray-200 bg-white overflow-y-auto">
                            {conversations.map((item) => (
                                <div key={item._id} className={`cursor-pointer ${activeConvId === item._id ? 'bg-teal-50 border-l-4 border-accent' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}>
                                    <Conversation 
                                        activeConvId={activeConvId} 
                                        handleSelectedConv={handleSelectedConv} 
                                        item={item} 
                                        ownData={ownData} 
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Chat Window */}
                        <div className="w-[70%] flex flex-col bg-white">
                            <div className="border-b border-gray-200 py-3 px-6 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">{selectedConvDetails?.f_name || "Select a conversation"}</p>
                                    <p className="text-xs text-gray-500">{selectedConvDetails?.headline || ""}</p>
                                </div>
                                <MoreHorizIcon className="text-gray-500 cursor-pointer" />
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                                {messages.map((item, index) => {
                                    const isOwn = item.sender?._id === ownData?._id;
                                    return (
                                        <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl ${isOwn ? 'bg-accent text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                                {item.message && <p className="text-sm">{item.message}</p>}
                                                {item.picture && <img src={item.picture} className="mt-2 rounded-lg max-w-50" alt="attachment" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-white">
                                {imageLink && (
                                    <div className="mb-2 flex items-center gap-2 bg-gray-100 p-2 rounded w-fit">
                                        <img src={imageLink} alt="Preview" className="h-10 w-10 object-cover rounded" />
                                        <button onClick={() => setImageLink(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                                    </div>
                                )}
                                <textarea 
                                    value={messageText} 
                                    onChange={(e) => setMessageText(e.target.value)} 
                                    className="w-full bg-gray-100 p-3 rounded-lg outline-none focus:ring-1 focus:ring-accent resize-none"
                                    placeholder="Write a message..."
                                    rows={2}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <label className="cursor-pointer text-gray-500 hover:text-accent transition">
                                        <ImageIcon />
                                        <input type="file" className="hidden" onChange={handleInputImage} />
                                    </label>
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={loading || (!messageText.trim() && !imageLink)}
                                        className="px-6 py-2 bg-accent text-white rounded-full font-semibold hover:bg-[#006d68] transition disabled:bg-gray-400"
                                    >
                                        {loading ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Sidebar: Ad */}
            <div className="w-[26%] py-5 hidden md:block">
                <div className="my-5 sticky top-19">
                    <Advertisement />
                </div>
            </div>
        </div>
    );
};

export default Messages;