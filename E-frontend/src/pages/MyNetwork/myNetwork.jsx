//E/E-frontend/pages/MyNetwork/myNetwork.jsx 

import React, { useState, useEffect } from 'react'
import ProfileCard from '../../components/ProfileCard/profileCard'
import axios from 'axios'

const MyNetwork = () => {

    const [text, setText] = useState("Catch Up with Friends");
    const [data, setData] = useState([]);

    const handleFriends = async () => {
        setText("Catch Up with Friends")
    }

    const handlePending = async () => {
        setText("Pending Request")
    }

    const fetchFriendList = async () => {
        await axios.get('http://localhost:4000/api/auth/friendsList', { withCredentials: true }).then((res) => {
            setData(res.data.friends)
        }).catch(err => {
            console.log(err)
            alert("Something Went Wrong")
        })
    }

    const fetchPendingRequest = async () => {
        await axios.get('http://localhost:4000/api/auth/pendingFriendsList', { withCredentials: true }).then((res) => {
            setData(res.data.pendingFriendsList)
        }).catch(err => {
            console.log(err)
            alert("Something Went Wrong")
        })
    }

    const handleAccept = async (friendId) => {
        await axios.post('http://localhost:4000/api/auth/acceptFriendRequest', { friendId }, { withCredentials: true }).then((res) => {
            // Remove from local list immediately so the card disappears
            setData(prev => prev.filter(item => item._id !== friendId));
        }).catch(err => {
            console.log(err)
            alert(err?.response?.data?.error || "Something Went Wrong")
        })
    }

    const handleIgnore = async (friendId) => {
        await axios.post('http://localhost:4000/api/auth/ignoreFriendRequest', { friendId }, { withCredentials: true }).then((res) => {
            setData(prev => prev.filter(item => item._id !== friendId));
        }).catch(err => {
            console.log(err)
            alert(err?.response?.data?.error || "Something Went Wrong")
        })
    }

    useEffect(() => {
        if(text === "Catch Up with Friends"){
            fetchFriendList()
        }else{
            fetchPendingRequest()
        }
    }, [text])

    return (
        <div className='px-5 xl:px-50 py-9 flex flex-col gap-5 w-full mt-5 bg-gray-100'>
            <div className='py-4 px-10 border border-gray-400 w-full flex justify-between  my-5 text-xl bg-white rounded-xl'>
                <div>{text}</div>
                <div className='flex gap-3'>
                    <button onClick={handleFriends} className={`p-1 cursor-pointer border rounded-lg border-gray-300 ${text === "Catch Up with Friends" ? 'bg-blue-800 text-white' : ''}`}>Friends</button>
                    <button onClick={handlePending} className={`p-1 cursor-pointer border rounded-lg border-gray-300  ${text === "Pending Request" ? 'bg-blue-800 text-white' : ''}`}>Pending Request</button>

                </div>
            </div>

            <div className='flex h-[80vh] w-full gap-7 flex-wrap items-start justify-center'>

                {
                    data.map((item, index) => {
                        return (
                            <div key={item._id || index} className='md:w-[23%] h-fit sm:w-full flex flex-col gap-2'>
                                <ProfileCard data={item} />

                                {text === "Pending Request" && (
                                    <div className='flex gap-2 justify-center'>
                                        <button
                                            onClick={() => handleAccept(item._id)}
                                            className='flex-1 bg-blue-800 text-white py-1 rounded-lg cursor-pointer hover:bg-blue-900 transition-colors'
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleIgnore(item._id)}
                                            className='flex-1 border border-gray-400 text-gray-700 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors'
                                        >
                                            Ignore
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                }

                {data.length === 0 && (
                    <div className="mt-10 text-gray-500 text-lg">
                        {text === "Catch Up with Friends" ? "No Friends Yet" : "No Pending Friends Yet"}
                    </div>
                )}


            </div>
        </div>
    )
}

export default MyNetwork