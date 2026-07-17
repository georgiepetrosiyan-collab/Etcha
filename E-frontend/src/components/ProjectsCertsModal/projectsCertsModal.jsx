import React, { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'

const emptyProject = { title: "", description: "", link: "" };
const emptyCert = { name: "", issuer: "", date: "" };

const ProjectsCertsModal = ({ handleEditFunc, selfData }) => {
    const [projects, setProjects] = useState(selfData?.projects?.length ? [...selfData.projects] : []);
    const [certifications, setCertifications] = useState(selfData?.certifications?.length ? [...selfData.certifications] : []);

    const updateProject = (i, key, value) => {
        setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: value } : p));
    };
    const addProject = () => setProjects(prev => [...prev, { ...emptyProject }]);
    const removeProject = (i) => setProjects(prev => prev.filter((_, idx) => idx !== i));

    const updateCert = (i, key, value) => {
        setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: value } : c));
    };
    const addCert = () => setCertifications(prev => [...prev, { ...emptyCert }]);
    const removeCert = (i) => setCertifications(prev => prev.filter((_, idx) => idx !== i));

    const handleSave = () => {
        const cleanProjects = projects.filter(p => p.title?.trim());
        const cleanCerts = certifications.filter(c => c.name?.trim());
        const newData = { ...selfData, projects: cleanProjects, certifications: cleanCerts };
        handleEditFunc(newData);
    };

    return (
        <div className='mt-8 w-full h-88 overflow-auto'>
            <div className='flex justify-between items-center mb-2'>
                <div className='font-semibold'>Projects</div>
                <div onClick={addProject} className='cursor-pointer text-blue-800'><AddIcon /></div>
            </div>
            {projects.map((p, i) => (
                <div key={i} className='border rounded-md p-3 mb-3'>
                    <div className='flex justify-between items-start gap-2'>
                        <div className='flex-1'>
                            <input value={p.title} onChange={(e) => updateProject(i, 'title', e.target.value)} className='p-2 mb-2 w-full border rounded-md' placeholder='Project title' />
                            <textarea value={p.description} onChange={(e) => updateProject(i, 'description', e.target.value)} className='p-2 mb-2 w-full border rounded-md' rows={2} placeholder='Short description' />
                            <input value={p.link} onChange={(e) => updateProject(i, 'link', e.target.value)} className='p-2 w-full border rounded-md' placeholder='Link (optional)' />
                        </div>
                        <div onClick={() => removeProject(i)} className='cursor-pointer text-red-500 mt-1'><DeleteOutlineIcon /></div>
                    </div>
                </div>
            ))}

            <div className='flex justify-between items-center mb-2 mt-6'>
                <div className='font-semibold'>Certifications</div>
                <div onClick={addCert} className='cursor-pointer text-blue-800'><AddIcon /></div>
            </div>
            {certifications.map((c, i) => (
                <div key={i} className='border rounded-md p-3 mb-3'>
                    <div className='flex justify-between items-start gap-2'>
                        <div className='flex-1'>
                            <input value={c.name} onChange={(e) => updateCert(i, 'name', e.target.value)} className='p-2 mb-2 w-full border rounded-md' placeholder='Certification name' />
                            <input value={c.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} className='p-2 mb-2 w-full border rounded-md' placeholder='Issued by' />
                            <input value={c.date} onChange={(e) => updateCert(i, 'date', e.target.value)} className='p-2 w-full border rounded-md' placeholder='Date (e.g. 2024)' />
                        </div>
                        <div onClick={() => removeCert(i)} className='cursor-pointer text-red-500 mt-1'><DeleteOutlineIcon /></div>
                    </div>
                </div>
            ))}

            <div className="bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl mt-4" onClick={handleSave}>Save</div>
        </div>
    )
}

export default ProjectsCertsModal