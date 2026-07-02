import React, { useState, useEffect } from 'react'
import ProfileCard from '../../components/ProfileCard/profileCard'
import axios from 'axios'
const MyNetwork = () => {

    const [text, setText] = useState("Catch Up with Friends");
    const [data, setData] = useState([]);

    const handleFirends = async () => {
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
            setData(res.data.friends)
        }).catch(err => {
            console.log(err)
            alert("Something Went Wrong")
        })
    }

    useEffect(() => {
        if(text=="Catch Up With Frends"){
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
                    <button onClick={handleFirends} className={`p-1 cursor-pointer border rounded-lg border-gray-300 ${text === "Catch Up with Friends" ? 'bg-blue-800 text-white' : ''}`}>Friends</button>
                    <button onClick={handlePending} className={`p-1 cursor-pointer border rounded-lg border-gray-300  ${text === "Pending Request" ? 'bg-blue-800 text-white' : ''}`}>Pending Request</button>

                </div>
            </div>

            <div className='flex h-[80vh] w-full gap-7 flex-wrap items-start justify-center'>

                {
                    data.map((item, index) => {
                        return (
                            <div className='md:w-[23%] h-68 sm:w-full'>
                                <ProfileCard data={item} />
                            </div>
                        );
                    })
                }


                {
                    data.length===0 ? text ==="Catch Up with Friends"? <div>No any Friends Yet</div>:<div>No any Pending Friends Yet</div>:null
                }


            </div>
        </div>
    )
}

export default MyNetwork