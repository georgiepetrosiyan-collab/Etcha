//E/E-frontend/components/Post/post.jsx 

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // Ensure this package is installed
import Card from '../Card/card';
import MovieIcon from '@mui/icons-material/Movie';
import PhotoIcon from '@mui/icons-material/Photo';
import FeedIcon from "@mui/icons-material/Feed";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

const Post = ({ profile, item, personalData }) => {
    const [seeMore, setSeeMore] = useState(false);
    const [comment, setComment] = useState(false);
    const [comments, setComments] = useState([]);
    const [liked, setLiked] = useState(false);
    const [noOfLikes, setNoOfLike] = useState(item?.likes?.length || 0);
    const [commentText, setCommenttext] = useState("");

    useEffect(() => {
        const selfId = personalData?._id;
        if (selfId && item?.likes) {
            const isLikedByUser = item.likes.some(likeId => likeId.toString() === selfId.toString());
            setLiked(isLikedByUser);
        }
    }, [item?.likes, personalData?._id]);

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (commentText.trim().length === 0) return toast.error("Please enter comment");
        
        try {
            const res = await axios.post("http://localhost:4000/api/comment", { 
                postId: item?._id, 
                comment: commentText 
            }, { withCredentials: true });
            
            setComments([res.data.comment, ...comments]);
            setCommenttext(""); // Clear input on success
        } catch (err) {
            console.error(err);
            toast.error('Something Went Wrong');
        }
    };

    const handleLikeFunc = async () => {
        try {
            await axios.post('http://localhost:4000/api/post/likeDislike', { postId: item?._id }, { withCredentials: true });
            if (liked) {
                setNoOfLike((prev) => prev - 1);
                setLiked(false);
            } else {
                setLiked(true);
                setNoOfLike((prev) => prev + 1);
            }
        } catch (err) {
            console.error(err);
            toast.error('Something Went Wrong');
        }
    };

    const handleCommentBoxOpenClose = async () => {
        setComment(!comment);
        if (!comment) { // Only fetch if we are opening it
            try {
                const resp = await axios.get(`http://localhost:4000/api/comment/${item?._id}`);
                setComments(resp.data.comments);
            } catch (err) {
                console.error(err);
                toast.error('Something Went Wrong');
            }
        }
    };

    const copyToClipboard = async () => {
        try {
            let string = `${window.location.origin}/profile/${item?.user?._id}/activities/${item?._id}`;
            await navigator.clipboard.writeText(string);
            toast.success("Copied to clipboard");
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    const desc = item?.desc || "";

    return (
        <Card padding={0}>
            {/* User Profile Header */}
            <div className='flex gap-3 p-4 pb-2 items-center'>
                <Link to={`/profile/${item?.user?._id}`} className='w-12 h-12 rounded-4xl'>
                    <img className='rounded-4xl w-12 h-12 border-2 border-white cursor-pointer' src={item?.user?.profilePic} alt="user avatar" />
                </Link>
                <div>
                    <div className="text-lg font-semibold">{item?.user?.f_name}</div>
                    {item?.user?.headline != "" && (
                        <div className="text-xs text-gray-500">{item?.user?.headline}</div>
                    )}
                </div>
            </div>

            {/* Post Description Text Block */}
            <div className='text-md px-4 py-2 whitespace-pre-line grow'>
                {seeMore ? desc : desc?.length > 50 ? `${desc.slice(0, 50)}...` : `${desc.slice(0, 50)}`}
                {desc?.length > 50 && (
                    <span onClick={() => setSeeMore(prev => !prev)} className="cursor-pointer text-gray-500 font-medium">
                        {seeMore ? " See Less" : " See More"}
                    </span>
                )}
            </div>

            {/* Post Image Container */}
            {item?.imageLink && (
                <div className='w-full h-75'>
                    <img className='w-full h-full object-cover' src={item?.imageLink} alt="Post content" />
                </div>
            )}

            {/* Engagement Row Status Bar */}
            <div className='px-4 py-2 flex justify-between items-center'>
                {!profile && (
                    <div className='flex gap-1 items-center'>
                        <ThumbUpIcon sx={{ fontSize: 14 }} className="text-gray-600" />
                        <div className='text-sm text-gray-600'>{noOfLikes} Likes</div>
                    </div>
                )}

                {/* Right side: Comments Counter */}
                <div className='flex gap-1 items-center'>
                    <div className='text-sm text-gray-600'>{item?.comments || item?.comment?.length || 0} Comments</div>
                </div>
            </div>

            {/* Action Buttons */}
            {!profile && (
                <div className="flex p-1">
                    <div onClick={handleLikeFunc} className="w-[33%] justify-center flex gap-2 items-center border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-100">
                        {liked ? <ThumbUpIcon sx={{ fontSize: 22, color: "#00827D" }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 22 }} />}
                        <span>{liked ? 'Liked' : "Like"}</span>
                    </div>

                    <div onClick={handleCommentBoxOpenClose} className="w-[33%] justify-center flex gap-2 items-center border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-100">
                        <CommentIcon sx={{ fontSize: 22 }} />
                        <span>Comment</span>
                    </div>

                    <div onClick={copyToClipboard} className="w-[33%] justify-center flex gap-2 items-center border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-100">
                        <SendIcon sx={{ fontSize: 22 }} />
                        <span>Share</span>
                    </div>
                </div>
            )}

            {/* Comment Section Block */}
            {comment && (
                <div className='p-4 w-full'>
                    <div className='flex gap-2 items-center'>
                        <img src={personalData?.profilePic} className="rounded-full w-12 h-12 border-2 border-white cursor-pointer" alt="avatar" />
                        <form className="w-full flex gap-2" onSubmit={handleSendComment}>
                            <input 
                                value={commentText} 
                                onChange={(event) => setCommenttext(event.target.value)}
                                placeholder="Add a comment..." 
                                className="w-full border py-5 rounded-3xl hover:bg-gray-100 px-4" 
                            />
                            <button type="submit" className='cursor-pointer bg-blue-800 text-white rounded-3xl py-1 px-3'>
                                Send
                            </button>
                        </form>
                    </div>

                    {comments.map((commentItem, index) => (
                        <div className="w-full p-4" key={commentItem._id || index}>
                            <div className="py-4">
                                <Link to={`/profile/${commentItem?.user?._id}`} className='flex gap-3'>
                                    <img src={commentItem?.user?.profilePic} className="rounded-full w-10 h-10 border-2 border-white cursor-pointer" alt="user avatar" />
                                    <div className="cursor-pointer">
                                        <div className="text-md font-semibold">{commentItem?.user?.f_name}</div>
                                        <div className="text-sm text-gray-500">{commentItem?.user?.headline}</div>
                                    </div>
                                </Link>
                                <div className="px-11 my-2">
                                    {commentItem?.comment}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

export default Post;