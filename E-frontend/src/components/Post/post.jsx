//E/E-frontend/components/Post/post.jsx 

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
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
import UserByline from '../UserByline/userByline';

// TODO update if adding a localization library, which should have proper plural support
function formatLikes(noOfLikes) {
    if (noOfLikes == 1) return `${noOfLikes} like`
    return `${noOfLikes} likes`
}
function formatComments(noOfComments) {
    if (noOfComments == 1) return `${noOfComments} comment`
    return `${noOfComments} comments`
}

const Post = ({ profile, item, personalData, expandComments }) => {
    const [seeMore, setSeeMore] = useState(false);
    const [comment, setComment] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
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

    // automatically load comments if expandComments is true
    useEffect(() => {
        let cancelled = false;
        console.log("post:",item);

        if (expandComments && item?._id) {
            async function fetchData() {
                setCommentLoading(true);
                try {
                    const res = await axios.get(`http://localhost:4000/api/comment/${item?._id}`);
                    console.log(res)
                    if (res.status != 200) throw new Error('Request failed');
                    if (!cancelled) setComments(res.data.comments);
                    setCommentLoading(false);
                } catch (err) {
                    if (!cancelled) {
                        console.error(err);
                        toast.error('Something Went Wrong');
                    }
                }
            }

            fetchData();
        }

        return () => {
            cancelled = true;
        };
    }, [expandComments, item?._id]);

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (commentText.trim().length === 0) return toast.error("Please enter comment");
        
        try {
            const res = await axios.post("http://localhost:4000/api/comment", { 
                postId: item?._id, 
                comment: commentText 
            }, { withCredentials: true });
            
            setComments([res.data.comment, ...comments]);
            setCommenttext("");
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
        if (!comment) {
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
                <Link
                    to={`/profile/${item?.user?._id}`}
                    className='w-12 h-12 rounded-4xl'
                    onClick={(e) => e.stopPropagation()}
                >
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
                {seeMore ? desc : desc?.length > 100 ? `${desc.slice(0, 100)}...` : `${desc.slice(0, 100)}`}
                {desc?.length > 100 && (
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
                        <div className='text-sm text-gray-600'>{formatLikes(noOfLikes)}</div>
                    </div>
                )}

                {/* Right side: Comments Counter */}
                <div className='flex gap-1 items-center'>
                    <div className='text-sm text-gray-600'>{formatComments(item?.comments || item?.comment?.length || 0)}</div>
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
            {(comment || expandComments === true) && (
                <div className='p-4 w-full'>
                    <form className="w-full flex gap-2 pb-4" onSubmit={handleSendComment}>
                        <img src={personalData?.profilePic} className="rounded-full w-12 h-12 border-2 border-white cursor-pointer" alt="avatar" />
                        <input 
                            value={commentText} 
                            onChange={(event) => setCommenttext(event.target.value)}
                            placeholder="Add a comment..." 
                            className="w-full border border-gray-500 p-2 rounded-3xl hover:bg-gray-100 px-4" 
                        />
                        <button type="submit" className='cursor-pointer bg-[#00827D] text-white rounded-2xl py-1 px-3'>
                            Send
                        </button>
                    </form>

                    {comments.map((commentItem, index) => (
                        <div className="w-full p-2" key={commentItem._id || index}>
                            <UserByline user={commentItem?.user}/>
                            <div className="px-11 my-2">
                                {commentItem?.comment}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Comment Loading Block */}
            {commentLoading && (
                <div className='p-4 w-full'>
                    <p>Loading comments...</p>
                </div>
            )}
        </Card>
    );
}

export default Post;