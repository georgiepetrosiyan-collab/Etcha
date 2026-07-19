//E/E-frontend/components/ExpModal/expModal.jsx
import React, { useState } from 'react'

const ExpModal = ({ handleEditFunc, selfData, updateExp, setUpdateExp }) => {

    const [data, setData] = useState({
        designation: updateExp?.clicked ? updateExp?.data?.designation : "",
        company_name: updateExp?.clicked ? updateExp?.data?.company_name : "",
        startDate: updateExp?.clicked ? updateExp?.data?.startDate : "",
        endDate: updateExp?.clicked ? updateExp?.data?.endDate : "",
        location: updateExp?.clicked ? updateExp?.data?.location : "",
        description: updateExp?.clicked ? updateExp?.data?.description : ""
    })

    const onChangeHandle = (event, key) => {
        setData({ ...data, [key]: event.target.value })
    }

    const updateExpSave = () => {
        let newFilteredData = selfData?.experience.filter((item) => item._id != updateExp?.data?._id);
        let newArr = [...newFilteredData, data];
        let newData = { ...selfData, experience: newArr };
        handleEditFunc(newData)
    }

    const handleOnSave = () => {
        if (updateExp?.clicked) return updateExpSave();

        let expArr = [...selfData?.experience, data];
        let newData = { ...selfData, experience: expArr };
        handleEditFunc(newData)
    }

    const handleOnDelete = () => {
        let newFilteredData = selfData?.experience.filter((item) => item._id != updateExp?.data?._id);
        let newData = { ...selfData, experience: newFilteredData };
        handleEditFunc(newData)
    }


    return (
        <div className='mt-8 w-full h-88 overflow-auto'>
            <div className='w-full mb-4'>
                <label>Role*</label>
                <br />
                <input type='text' value={data.designation} onChange={(e) => onChangeHandle(e, 'designation')} className='p-2 mt-1 w-full border rounded-md' placeholder='Enter Role' />
            </div>
            <div className='w-full mb-4'>
                <label>Company*</label>
                <br />
                <input type='text' value={data.company_name} onChange={(e) => onChangeHandle(e, 'company_name')} className='p-2 mt-1 w-full border rounded-md' placeholder='Enter Company Name' />
            </div>
            <div className='flex gap-3 w-full mb-4'>
                <div className='flex-1'>
                    <label>Start Date*</label>
                    <br />
                    <input type='text' value={data.startDate} onChange={(e) => onChangeHandle(e, 'startDate')} className='p-2 mt-1 w-full border rounded-md' placeholder='e.g. Jan 2022' />
                </div>
                <div className='flex-1'>
                    <label>End Date</label>
                    <br />
                    <input type='text' value={data.endDate} onChange={(e) => onChangeHandle(e, 'endDate')} className='p-2 mt-1 w-full border rounded-md' placeholder='e.g. Present' />
                </div>
            </div>
            <div className='w-full mb-4'>
                <label>Place*</label>
                <br />
                <input type='text' value={data.location} onChange={(e) => onChangeHandle(e, 'location')} className='p-2 mt-1 w-full border rounded-md' placeholder='Enter Location' />
            </div>
            <div className='w-full mb-4'>
                <label>Description <span className='text-gray-400 text-sm'>(optional)</span></label>
                <br />
                <textarea value={data.description} onChange={(e) => onChangeHandle(e, 'description')} className='p-2 mt-1 w-full border rounded-md' rows={3} placeholder="What did you actually do in this role? Leave blank and we'll infer reasonable achievements for the CV." />
            </div>

            <div className='flex justify-between'>
                <div className="bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl" onClick={handleOnSave}>Save</div>
                {
                    updateExp?.clicked && <div className="bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl" onClick={handleOnDelete}>Delete</div>
                }
            </div>
        </div>
    )
}

export default ExpModal