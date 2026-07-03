//E/E-frontend/pages/Messages/messages.jsx 

import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card/card';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Conversation from '../../components/Conversation/conversation.jsx';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ImageIcon from '@mui/icons-material/Image';
import Advertisement from '../../components/Advertisement/advertisement';
import axios from 'axios';
import socket from '../../../socket';

const API_BASE_URL = 'http://localhost:4000/api';
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dmkqcilgq/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'etchacloud';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [ownData, setOwnData] = useState(null);
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
        if (activeConvId) {
            fetchMessages();
        }
    }, [activeConvId]);

    useEffect(() => {
        const handleReceiveMessage = (response) => {
            setMessages((prevMessages) => [...prevMessages, response]);
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
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
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
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
                
                const ownId = currentUser?._id;
                const otherMember = firstConv.members?.find((it) => it._id !== ownId);
                setSelectedConvDetails(otherMember || null);
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
            alert("Something went wrong while fetching conversations.");
        }
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
        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Failed to upload image.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() && !imageLink) return;

        try {
            const payload = { 
                conversation: activeConvId, 
                message: messageText, 
                picture: imageLink 
            };
            
            const res = await axios.post(`${API_BASE_URL}/message`, payload, { withCredentials: true });
            
            // Emit only the data object representing the populated message
            socket.emit("sendMessage", activeConvId, res.data.data);
            
            setMessageText("");
            setImageLink(null);
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Something went wrong while sending the message.");
        }
    };

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100">
            <div className="w-full justify-between flex pt-5">
                <div className="w-full md:w-[70%]">
                    <Card padding={0}>
                        <div className="border-b border-gray-300 px-5 py-2 font-semibold text-lg">
                            Messaging
                        </div>

                        <div className="border-b border-gray-300 px-5 py-2">
                            <div className="py-1 px-3 cursor-pointer hover:bg-green-900 bg-green-800 font-semibold flex gap-2 w-fit rounded-2xl text-white">
                                Focused <ArrowDropDownIcon />
                            </div>
                        </div>

                        <div className="w-full md:flex">
                            <div className="h-148 overflow-auto w-full md:w-[40%] border-r border-gray-400">
                                {conversations.map((item) => (
                                    <Conversation 
                                        key={item._id} 
                                        activeConvId={activeConvId} 
                                        handleSelectedConv={handleSelectedConv} 
                                        item={item} 
                                        ownData={ownData} 
                                    />
                                ))}
                            </div>

                            <div className="w-full md:w-[60%] border-gray-400 flex flex-col justify-between">
                                <div className="border-gray-300 py-2 px-4 border-b-2 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-semibold">{selectedConvDetails?.f_name || "Select a conversation"}</p>
                                        <p className="text-sm text-gray-400">{selectedConvDetails?.headline}</p>
                                    </div>
                                    <MoreHorizIcon className="text-gray-500 cursor-pointer" />
                                </div>

                                <div className="h-90 w-full overflow-auto border-b border-gray-300">
                                    {selectedConvDetails && (
                                        <div className="w-full border-b border-gray-300 gap-3 p-4 flex flex-col items-center">
                                            <img 
                                                className="rounded-full cursor-pointer w-16 h-16 object-cover" 
                                                src={selectedConvDetails?.profilePic || 'https://via.placeholder.com/150'} 
                                                alt="Profile" 
                                            />
                                            <div className="my-2 text-center">
                                                <div className="text-md font-semibold">{selectedConvDetails?.f_name}</div>
                                                <div className="text-sm text-gray-500">{selectedConvDetails?.headline}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="w-full pb-4">
                                        {messages.map((item, index) => (
                                            <div key={item._id || index} className="flex w-full border-gray-300 gap-3 p-4">
                                                <div className="shrink-0">
                                                    <img 
                                                        className="w-8 h-8 rounded-full object-cover" 
                                                        src={item?.sender?.profilePic || 'https://via.placeholder.com/150'} 
                                                        alt="Sender" 
                                                    />
                                                </div>

                                                <div className="mb-2 w-full">
                                                    <div className="text-md font-semibold">{item?.sender?.f_name}</div>
                                                    {item?.message && (
                                                        <div className="text-sm mt-1 p-2 rounded-md bg-white border border-gray-200 w-fit">
                                                            {item?.message}
                                                        </div>
                                                    )}
                                                    {item?.picture && (
                                                        <div className="my-2">
                                                            <img className="w-60 h-45 rounded-md object-cover" src={item?.picture} alt="Attachment" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {imageLink && (
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Image attached</span>
                                        <img src={imageLink} alt="Preview" className="h-10 w-10 object-cover rounded" />
                                        <button onClick={() => setImageLink(null)} className="text-red-500 text-xs ml-2">Remove</button>
                                    </div>
                                )}
                                {loading && (
                                    <div className="px-4 py-1 text-xs text-blue-500 italic">Uploading image...</div>
                                )}

                                <div className="p-2 w-full border-b border-gray-200">
                                    <textarea 
                                        value={messageText} 
                                        onChange={(e) => setMessageText(e.target.value)} 
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        rows={2} 
                                        className="bg-gray-200 outline-none rounded-xl text-sm w-full p-3 resize-none" 
                                        placeholder="Write a message..." 
                                    />
                                </div>

                                <div className="p-3 flex justify-between items-center">
                                    <div>
                                        <label htmlFor="messageImage" className="cursor-pointer text-gray-500 hover:text-blue-500 transition">
                                            <ImageIcon />
                                        </label>
                                        <input id="messageImage" type="file" onChange={handleInputImage} className="hidden" accept="image/*" />
                                    </div>
                                    <button 
                                        onClick={handleSendMessage} 
                                        disabled={loading || (!messageText.trim() && !imageLink)}
                                        className={`px-4 py-1 cursor-pointer rounded-2xl border text-white transition ${
                                            loading || (!messageText.trim() && !imageLink) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-950 hover:bg-blue-800'
                                        }`}
                                    >
                                        {loading ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="hidden md:flex md:w-[25%]">
                    <div className="sticky top-19 w-full">
                        <Advertisement />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;