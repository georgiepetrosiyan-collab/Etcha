import React, { useState } from 'react'
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import JobDescriptionModal from '../JobDescriptionModal/jobDescriptionModal';
import ReferModal from '../ReferModal/referModal';

const JobAnnounce = ({ job }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReferOpen, setIsReferOpen] = useState(false);

    const {
        title = "Job Title",
        company = "Company Name",
        companyLogo = "",
        location = "Location",
        type = "Full-time",
        salary = "",
        description = "",
        postedAt = "",
        onApply = () => {},
        onCreateCV = () => {},
    } = job || {};

    const stop = (e) => e.stopPropagation();

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="w-full bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {companyLogo ? (
                            <img className="w-full h-full object-cover" src={companyLogo} alt={company} />
                        ) : (
                            <BusinessIcon sx={{ color: "gray" }} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
                        <p className="text-sm text-gray-600">{company}</p>

                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
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
                        </div>

                        {description && (
                            <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                                {description}
                            </p>
                        )}

                        <div className="flex items-center gap-2 mt-4" onClick={stop}>
                            {salary && (
                                <span className="text-sm font-medium text-gray-800 mr-auto">{salary}</span>
                            )}
                            <button
                                onClick={() => setIsReferOpen(true)}
                                className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-2 rounded-md cursor-pointer transition-colors"
                            >
                                <PersonAddIcon sx={{ fontSize: 16 }} />
                                Refer
                            </button>
                            <button
                                onClick={onCreateCV}
                                className="flex items-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2 rounded-md cursor-pointer transition-colors"
                            >
                                <DescriptionIcon sx={{ fontSize: 16 }} />
                                Create CV
                            </button>
                            <button
                                onClick={onApply}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <JobDescriptionModal job={job} onClose={() => setIsOpen(false)} />
            )}

            {isReferOpen && (
                <ReferModal job={job} onClose={() => setIsReferOpen(false)} />
            )}
        </>
    )
}

export default JobAnnounce