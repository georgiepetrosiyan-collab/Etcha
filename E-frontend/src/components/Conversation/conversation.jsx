//E/E-frontend/components/Conversation/conversation.jsx

import React, { useEffect, useState } from 'react';

const Conversation = ({ item, ownData, handleSelectedConv, activeConvId }) => {
    const [memberData, setMemberData] = useState(null);

    useEffect(() => {
        const ownId = ownData?._id;
        if (item?.members && ownId) {
            const arr = item.members.filter((it) => it._id !== ownId);
            if (arr.length > 0) {
                setMemberData(arr[0]);
            }
        }
    }, [item, ownData]);

    const handleClickFunc = () => {
        handleSelectedConv(item?._id, memberData);
    };

    return (
        <div onClick={handleClickFunc} className={`flex items-center w-full cursor-pointer border-b border-gray-300 gap-3 p-4 hover:bg-gray-200 ${activeConvId === item?._id ? 'bg-gray-200' : ''}`}>
            <div className='shrink-0'>
                <img className='w-12 h-12 rounded-full cursor-pointer object-cover' src={memberData?.profilePic || 'https://via.placeholder.com/150'} alt="Profile" />
            </div>
            <div>
                <div className="text-md font-semibold">{memberData?.f_name}</div>
                <div className="text-sm text-gray-500">{memberData?.headline}</div>
            </div>
        </div>
    );
};

export default Conversation;