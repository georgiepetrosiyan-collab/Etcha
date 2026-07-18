//E/E-frontend/components/AboutModal/aboutModal.jsx
import React, { useState } from 'react'
import axios from 'axios';


const AboutModal = ({ handleEditFunc, selfData }) => {

    const [data, setData] = useState({ about: selfData?.about, skillInp: selfData?.skills?.join(',') });
    const [loading, setLoading] = useState(false)

    const onChangeHandle = (event, key) => {
        setData({ ...data, [key]: event.target.value })
    }

    const handleOnSave = async () => {
        let arr = data?.skillInp?.split(',');

        let newData = { ...selfData, about: data.about, skills: arr, resume: undefined };
        handleEditFunc(newData);
    }

    return (
        <div className='my-8'>
            <div className='w-full mb-4'>
                <label>About*</label>
                <br />
                <textarea value={data.about} onChange={(e)=>onChangeHandle(e,"about")} className="p-2 mt-1 w-full border rounded-md" cols={10} rows={3}></textarea>
            </div>

            <div className='w-full mb-4'>
                <label>Skills*(Add by seperating comma)</label>
                <br />
                <textarea value={data.skillInp} onChange={(e)=>onChangeHandle(e,"skillInp")} className="p-2 mt-1 w-full border rounded-md" cols={10} rows={3}></textarea>
            </div>

            <div className="bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl" onClick={handleOnSave}>Save</div>

        </div>
    )
}

export default AboutModal
