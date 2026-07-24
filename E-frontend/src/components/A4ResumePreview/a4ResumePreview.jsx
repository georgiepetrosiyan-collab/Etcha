import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'

export const A4_WIDTH_PX = 794
export const A4_HEIGHT_PX = 1123
const PAGE_PADDING_X = 48
const PAGE_PADDING_Y = 56
const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_PADDING_X * 2
const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PAGE_PADDING_Y * 2
const BLOCK_GAP_PX = 24

function SectionTitle({ children }) {
    return <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">{children}</h2>
}

function ExperienceItem({ exp, first }) {
    return (
        <div>
            {first && <SectionTitle>Experience</SectionTitle>}
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
    )
}

function ProjectItem({ p, first }) {
    return (
        <div>
            {first && <SectionTitle>Projects</SectionTitle>}
            <p className="text-sm font-semibold text-gray-900">
                {p.title}
                {p.link && <span className="font-normal text-blue-600 text-xs ml-2">{p.link}</span>}
            </p>
            {p.description && <p className="text-sm text-gray-700 leading-relaxed mt-0.5">{p.description}</p>}
        </div>
    )
}

function EducationItem({ edu, first }) {
    return (
        <div>
            {first && <SectionTitle>Education</SectionTitle>}
            <div className="flex justify-between items-baseline flex-wrap gap-x-3">
                <p className="text-sm font-semibold text-gray-900">
                    {edu.school} {edu.degree && <span className="font-normal text-gray-500">· {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</span>}
                </p>
                {edu.duration && <p className="text-xs text-gray-500 whitespace-nowrap">{edu.duration}</p>}
            </div>
        </div>
    )
}

function CertificationItem({ c, first }) {
    return (
        <div>
            {first && <SectionTitle>Certifications</SectionTitle>}
            <div className="flex justify-between items-baseline flex-wrap gap-x-3">
                <p className="text-sm font-semibold text-gray-900">
                    {c.name} <span className="font-normal text-gray-500">· {c.issuer}</span>
                </p>
                {c.date && <p className="text-xs text-gray-500 whitespace-nowrap">{c.date}</p>}
            </div>
        </div>
    )
}

// Builds a flat list of atomic, never-split-across-pages "blocks".
// A section title always travels with the first item of that section,
// so a header can never end up alone at the bottom of a page.
function buildBlocks(cv) {
    const blocks = []

    blocks.push({
        key: 'header',
        node: (
            <div className="border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{cv.fullName}</h1>
                <p className="text-lg text-blue-700 font-medium mt-1">{cv.targetJobTitle}</p>
                {cv.location && <p className="text-sm text-gray-500 mt-1">{cv.location}</p>}
            </div>
        )
    })

    if (cv.professionalSummary) {
        blocks.push({
            key: 'summary',
            node: (
                <div>
                    <SectionTitle>Professional Summary</SectionTitle>
                    <p className="text-sm text-gray-700 leading-relaxed">{cv.professionalSummary}</p>
                </div>
            )
        })
    }

    if (cv.coreSkills?.length > 0) {
        blocks.push({
            key: 'skills',
            node: (
                <div>
                    <SectionTitle>Core Skills</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                        {cv.coreSkills.map((skill, i) => (
                            <span key={i} className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{skill}</span>
                        ))}
                    </div>
                </div>
            )
        })
    }

    ;(cv.experience || []).forEach((exp, i) => {
        blocks.push({ key: `exp-${i}`, node: <ExperienceItem exp={exp} first={i === 0} /> })
    })

    ;(cv.projects || []).forEach((p, i) => {
        blocks.push({ key: `proj-${i}`, node: <ProjectItem p={p} first={i === 0} /> })
    })

    ;(cv.education || []).forEach((edu, i) => {
        blocks.push({ key: `edu-${i}`, node: <EducationItem edu={edu} first={i === 0} /> })
    })

    ;(cv.certifications || []).forEach((c, i) => {
        blocks.push({ key: `cert-${i}`, node: <CertificationItem c={c} first={i === 0} /> })
    })

    return blocks
}

// Greedily packs measured block heights into pages of `pageHeight`,
// never splitting a block, accounting for the gap between blocks.
function paginateBlocks(heights, gap, pageHeight) {
    const pages = []
    let current = []
    let currentHeight = 0

    heights.forEach((h, idx) => {
        const wouldBe = current.length === 0 ? h : currentHeight + gap + h
        if (current.length > 0 && wouldBe > pageHeight) {
            pages.push(current)
            current = [idx]
            currentHeight = h
        } else {
            current.push(idx)
            currentHeight = wouldBe
        }
    })

    if (current.length > 0) pages.push(current)
    return pages
}

const PageShell = ({ children }) => (
    <div
        className="resume-page bg-white shadow-xl shrink-0"
        style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${A4_HEIGHT_PX}px`,
            padding: `${PAGE_PADDING_Y}px ${PAGE_PADDING_X}px`,
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}
    >
        <div className="flex flex-col" style={{ gap: `${BLOCK_GAP_PX}px` }}>
            {children}
        </div>
    </div>
)

/**
 * Paginated A4 résumé preview. Automatically flows content onto page 2, 3, ...
 * whenever the current page is full, instead of clipping or growing forever.
 * `innerRef` is attached to the outer wrapper (sized to the SCALED footprint,
 * so it never forces scrollbars on its container). Each page carries a
 * `.resume-page` class so callers (e.g. PDF export) can grab them individually.
 */
const A4ResumePreview = ({ cv, innerRef, scale, pageGap = 24 }) => {
    const blocks = useMemo(() => (cv ? buildBlocks(cv) : []), [cv])
    const measureRefs = useRef([])
    const [pages, setPages] = useState(null)

    useLayoutEffect(() => {
        if (!cv || blocks.length === 0) {
            setPages(null)
            return
        }
        const heights = blocks.map((_, i) => measureRefs.current[i]?.getBoundingClientRect().height || 0)
        setPages(paginateBlocks(heights, BLOCK_GAP_PX, CONTENT_HEIGHT_PX))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cv])

    if (!cv) return null

    const resolvedPages = pages || [blocks.map((_, i) => i)]
    const pageCount = resolvedPages.length
    const totalContentHeight = pageCount * A4_HEIGHT_PX + Math.max(0, pageCount - 1) * pageGap
    const scaledWidth = scale ? A4_WIDTH_PX * scale : A4_WIDTH_PX
    const scaledHeight = scale ? totalContentHeight * scale : totalContentHeight

    return (
        <div ref={innerRef} style={{ width: scaledWidth, height: scaledHeight }}>
            {/* Hidden measuring pass — same width as a page's content box */}
            <div
                aria-hidden="true"
                style={{ position: 'fixed', top: 0, left: '-9999px', width: `${CONTENT_WIDTH_PX}px`, visibility: 'hidden', pointerEvents: 'none' }}
            >
                {blocks.map((b, i) => (
                    <div key={b.key} ref={(el) => (measureRefs.current[i] = el)}>{b.node}</div>
                ))}
            </div>

            {/* Real paginated pages, stacked and scaled from the top-left corner */}
            <div style={scale ? { transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}>
                <div className="flex flex-col" style={{ gap: `${pageGap}px`, width: `${A4_WIDTH_PX}px` }}>
                    {resolvedPages.map((group, pageIdx) => (
                        <PageShell key={pageIdx}>
                            {group.map((blockIdx) => (
                                <div key={blocks[blockIdx].key}>{blocks[blockIdx].node}</div>
                            ))}
                        </PageShell>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default A4ResumePreview