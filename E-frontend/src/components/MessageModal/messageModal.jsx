//E/E-frontend/components/MessageModal/messageModal.jsx
import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const MessageModal = ({ selfData, userData }) => {
    const [message, setMessage] = useState('')

    const handleSendMessage = async () => {
        await axios.post("http://localhost:4000/api/conversation/add-conversation",{recieverId:userData?._id,message}, { withCredentials: true }).then(res => {
            window.location.reload();
        }).catch(err => {
                    console.log(err);
                    toast.error(err?.response?.data?.error);
                });
    }

    return (
        <div className='my-5 flex flex-col gap-4'>
            
            {/* Textarea for the actual message */}
            <div className='w-full'>
                <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    className='p-2 mt-1 w-full border rounded-md' 
                    placeholder='Enter Message' 
                    cols={10} 
                    rows={6} 
                />
            </div>

            {/* Send Button */}
            <div 
                onClick={handleSendMessage} 
                className="bg-blue-950 text-white w-fit py-1 px-4 cursor-pointer rounded-2xl hover:bg-blue-900 transition-colors"
            >
                Send
            </div>
            
        </div>
    )
}

export default MessageModal