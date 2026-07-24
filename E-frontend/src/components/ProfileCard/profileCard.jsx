//E/E-frontend/components/ProfileCard/profileCard.jsx 

import React from 'react'
import Card from "../Card/card"
import { Link } from 'react-router-dom'

const ProfileCard = (props) => {
  return (
    <Card padding={0}>
        <Link to={`/profile/${props?.data?._id}`} className="relative h-25">
            <div className="relative w-full h-22 rounded-md">
                <img src={props?.data?.cover_pic || null} className='rounded-t-md h-full w-full' alt="cover" />
            </div>

            <div className ="absolute top-14 left-6 z-10">
                <img src={props?.data?.profilePic || null} className='rounded-full border-2 h-16 w-16 border-white cursor-pointer' alt="profile" />
            </div>
        </Link>
        
        <div className ="p-5 mt-4">
            <div className ="text-xl font-semibold">{props?.data?.f_name}</div>
            <div className ="text-sm my-1 text-gray-600">{props?.data?.headline}</div>
            <div className ="text-sm my-1 text-gray-500">{props?.data?.curr_location}</div>
            <div className ="text-sm my-1 text-gray-500">{props?.data?.curr_company}</div>
        </div>
    </Card>
  )
}

export default ProfileCard