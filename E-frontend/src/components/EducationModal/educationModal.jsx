import React, { useState } from 'react'
import Button from '../Button/button'

const EducationModal = ({ handleEditFunc, selfData, updateEdu, setUpdateEdu }) => {

    const [data, setData] = useState({
        school: updateEdu?.clicked ? updateEdu?.data?.school : "",
        degree: updateEdu?.clicked ? updateEdu?.data?.degree : "",
        fieldOfStudy: updateEdu?.clicked ? updateEdu?.data?.fieldOfStudy : "",
        duration: updateEdu?.clicked ? updateEdu?.data?.duration : ""
    })

    const onChangeHandle = (event, key) => {
        setData({ ...data, [key]: event.target.value })
    }

    const updateEduSave = () => {
        let newFilteredData = selfData?.education.filter((item) => item._id != updateEdu?.data?._id);
        let newArr = [...newFilteredData, data];
        let newData = { ...selfData, education: newArr };
        handleEditFunc(newData)
    }

    const handleOnSave = () => {
        if (updateEdu?.clicked) return updateEduSave();

        let eduArr = [...(selfData?.education || []), data];
        let newData = { ...selfData, education: eduArr };
        handleEditFunc(newData)
    }

    const handleOnDelete = () => {
        let newFilteredData = selfData?.education.filter((item) => item._id != updateEdu?.data?._id);
        let newData = { ...selfData, education: newFilteredData };
        handleEditFunc(newData)
    }

    return (
        <div className='mt-8 w-full h-88 overflow-auto'>
            <div className='w-full mb-4'>
                <label>School*</label>
                <br />
                <input type='text' value={data.school} onChange={(e) => onChangeHandle(e, 'school')} className='p-2 mt-1 w-full border rounded-md' placeholder='Enter School / University' />
            </div>
            <div className='w-full mb-4'>
                <label>Degree*</label>
                <br />
                <input type='text' value={data.degree} onChange={(e) => onChangeHandle(e, 'degree')} className='p-2 mt-1 w-full border rounded-md' placeholder='e.g. Bachelor of Science' />
            </div>
            <div className='w-full mb-4'>
                <label>Field of Study</label>
                <br />
                <input type='text' value={data.fieldOfStudy} onChange={(e) => onChangeHandle(e, 'fieldOfStudy')} className='p-2 mt-1 w-full border rounded-md' placeholder='e.g. Computer Science' />
            </div>
            <div className='w-full mb-4'>
                <label>Duration</label>
                <br />
                <input type='text' value={data.duration} onChange={(e) => onChangeHandle(e, 'duration')} className='p-2 mt-1 w-full border rounded-md' placeholder='e.g. 2018 - 2022' />
            </div>

            <div className='flex justify-between'>
                <Button onClick={handleOnSave}>Save</Button>
                {
                    updateEdu?.clicked && <Button onClick={handleOnDelete}>Delete</Button>
                }
            </div>
        </div>
    )
}

export default EducationModal