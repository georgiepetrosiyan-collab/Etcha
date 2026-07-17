import React from 'react'

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const A4ResumePreview = ({ cv, innerRef, scale }) => {
    if (!cv) return null;
    return (
        <div
            ref={innerRef}
            style={{
                width: `${A4_WIDTH_PX}px`,
                minHeight: `${A4_HEIGHT_PX}px`,
                padding: '56px 48px',
                ...(scale ? { transform: `scale(${scale})`, transformOrigin: 'top center' } : {})
            }}
            className="bg-white shadow-xl shrink-0"
        >
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{cv.fullName}</h1>
                <p className="text-lg text-blue-700 font-medium mt-1">{cv.targetJobTitle}</p>
                {cv.location && <p className="text-sm text-gray-500 mt-1">{cv.location}</p>}
            </div>

            {cv.professionalSummary && (
                <div className="mb-7">
                    <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Professional Summary</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{cv.professionalSummary}</p>
                </div>
            )}

            {cv.coreSkills?.length > 0 && (
                <div className="mb-7">
                    <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Core Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {cv.coreSkills.map((skill, i) => (
                            <span key={i} className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{skill}</span>
                        ))}
                    </div>
                </div>
            )}

            {cv.experience?.length > 0 && (
                <div className="mb-7">
                    <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Experience</h2>
                    <div className="flex flex-col gap-5">
                        {cv.experience.map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline flex-wrap gap-x-3">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {exp.title} <span className="font-normal text-gray-500">· {exp.company}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">
                                        {exp.duration}{exp.location ? ` · ${exp.location}` : ''}
                                    </p>
                                </div>
                                {exp.bullets?.length > 0 && (
                                    <ul className="list-disc list-outside ml-4 mt-1.5 flex flex-col gap-1">
                                        {exp.bullets.map((b, j) => (
                                            <li key={j} className="text-sm text-gray-700 leading-relaxed">{b}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {cv.projects?.length > 0 && (
                <div className="mb-7">
                    <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Projects</h2>
                    <div className="flex flex-col gap-3">
                        {cv.projects.map((p, i) => (
                            <div key={i}>
                                <p className="text-sm font-semibold text-gray-900">
                                    {p.title}
                                    {p.link && <span className="font-normal text-blue-600 text-xs ml-2">{p.link}</span>}
                                </p>
                                {p.description && <p className="text-sm text-gray-700 leading-relaxed mt-0.5">{p.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {cv.certifications?.length > 0 && (
                <div>
                    <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Certifications</h2>
                    <div className="flex flex-col gap-1.5">
                        {cv.certifications.map((c, i) => (
                            <div key={i} className="flex justify-between items-baseline flex-wrap gap-x-3">
                                <p className="text-sm font-semibold text-gray-900">
                                    {c.name} <span className="font-normal text-gray-500">· {c.issuer}</span>
                                </p>
                                {c.date && <p className="text-xs text-gray-500 whitespace-nowrap">{c.date}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default A4ResumePreview