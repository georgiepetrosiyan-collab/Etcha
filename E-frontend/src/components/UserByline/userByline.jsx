//E/E-frontend/components/UserByline/userByline.jsx

import { Link } from 'react-router-dom';

const UserByline = ({ user }) => {
    return (
        <Link
          to={`/profile/${user?._id}`}
          onClick={(e) => e.stopPropagation()}
          className='flex gap-3 items-center'
        >
            <img src={user?.profilePic || null} className="rounded-full w-10 h-10 border-2 border-white cursor-pointer" alt="user avatar" />
            <div>
                <div className="text-md font-semibold">{user?.f_name}</div>
                {user?.headline != "" && (
                    <div className="text-sm text-gray-500">{user?.headline}</div>
                )}
            </div>
        </Link>
    )
}

export default UserByline;