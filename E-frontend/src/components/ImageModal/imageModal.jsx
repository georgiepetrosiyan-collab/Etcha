import React, { useState } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ImageModal = ({ isCircular, selfData, handleEditFunc }) => {
    const [imgLink, setImageLink] = useState(isCircular ? selfData?.profilePic : selfData?.cover_pic);
    const [loading, setLoading] = useState(false);

    const handleInputImage = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'etchacloud');
        
        setLoading(true);
        try {
            const response = await axios.post("https://api.cloudinary.com/v1_1/dmkqcilgq/image/upload", data);
            const imageUrl = response.data.url;
            setImageLink(imageUrl);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitBtn = async () => {
        let { data } = { ...selfData };
        if (isCircular) {
            data = { ...data, ['profilePic']: imgLink };
        } else {
            data = { ...data, ['cover_pic']: imgLink };
        }
        handleEditFunc(data);
    };

    return (
        <div className='p-5 flex flex-col items-center w-full'>
            {/* Image Preview */}
            <div className='w-full flex justify-center mb-6'>
                {isCircular ? (
                    <img className='rounded-full w-38 h-38 object-cover' src={imgLink} alt="Profile" />
                ) : (
                    <img className='rounded-xl w-full h-48 object-cover' src={imgLink} alt="Cover" />
                )}
            </div>

            {/* Actions Bar Below Image */}
            <div className='flex justify-between items-center w-full mt-2'>
                <label 
                    htmlFor='btn-submit' 
                    className='px-5 py-2.5 bg-accent text-white rounded-full font-medium cursor-pointer hover:bg-[#006d68] transition'
                >
                    Upload
                </label>
                <input onChange={handleInputImage} type='file' className='hidden' id='btn-submit' />

                {loading ? (
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress size={28} style={{ color: '#00827D' }} />
                    </Box>
                ) : (
                    <button 
                        className='px-5 py-2.5 bg-accent text-white rounded-full font-medium hover:bg-[#006d68] transition' 
                        onClick={handleSubmitBtn}
                    >
                        Submit
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageModal;