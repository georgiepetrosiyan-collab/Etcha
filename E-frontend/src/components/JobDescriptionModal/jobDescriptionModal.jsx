import React from 'react'
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const JobDescriptionModal = ({ job, onClose }) => {
    if (!job) return null;

    const {
        title = "Job Title",
        company = "Company Name",
        companyLogo = "",
        location = "Location",
        type = "Full-time",
        salary = "",
        description = "",
        fullDescription = "",
        postedAt = "",
        onApply = () => {},
        onCreateCV = () => {},
    } = job;

    const stop = (e) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative"
                onClick={stop}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    <CloseIcon />
                </button>

                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {companyLogo ? (
                            <img className="w-full h-full object-cover" src={companyLogo} alt={company} />
                        ) : (
                            <BusinessIcon sx={{ color: "gray" }} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-600">{company}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <LocationOnIcon sx={{ fontSize: 16 }} />
                        {location}
                    </span>
                    <span className="flex items-center gap-1">
                        <WorkIcon sx={{ fontSize: 16 }} />
                        {type}
                    </span>
                    {postedAt && (
                        <span className="flex items-center gap-1">
                            <AccessTimeIcon sx={{ fontSize: 16 }} />
                            {postedAt}
                        </span>
                    )}
                    {salary && <span className="font-medium text-gray-800">{salary}</span>}
                </div>

                <div className="mt-5 text-sm text-gray-700 whitespace-pre-line">
                    {fullDescription || description || "No description provided."}
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onCreateCV}
                        className="flex items-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors"
                    >
                        <DescriptionIcon sx={{ fontSize: 16 }} />
                        Create CV
                    </button>
                    <button
                        onClick={onApply}
                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JobDescriptionModal