import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import CloseIcon from '@mui/icons-material/Close';

const PostJobModal = ({ onClose, onJobCreated }) => {
    const [form, setForm] = useState({
        title: "",
        company: "",
        companyLogo: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        fullDescription: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const stop = (e) => e.stopPropagation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.company) {
            toast.error("Title and company are required");
            return;
        }

        setSubmitting(true);
        await axios.post('http://localhost:4000/api/job/create', form, { withCredentials: true })
            .then(res => {
                onJobCreated(res.data.job);
                onClose();
            })
            .catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error || "Something Went Wrong");
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2000 px-4"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={stop}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 relative flex flex-col gap-4"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 cursor-pointer transition-colors"
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </button>

                <h2 className="text-lg font-semibold text-gray-900">Post a job</h2>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Job title *</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Frontend Developer"
                        className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md h-10 px-3 text-sm outline-none transition-all border border-transparent"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Company *</label>
                    <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="e.g. Etcha Inc."
                        className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md h-10 px-3 text-sm outline-none transition-all border border-transparent"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Company logo URL</label>
                    <input
                        name="companyLogo"
                        value={form.companyLogo}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md h-10 px-3 text-sm outline-none transition-all border border-transparent"
                    />
                </div>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-sm text-gray-600 mb-1 block">Location</label>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Yerevan, Armenia"
                            className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md h-10 px-3 text-sm outline-none transition-all border border-transparent"
                        />
                    </div>
                    <div className="w-36">
                        <label className="text-sm text-gray-600 mb-1 block">Type</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md h-10 px-3 text-sm outline-none transition-all border border-transparent"
                        >
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                            <option>Remote</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Salary</label>
                    <input
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        placeholder="e.g. $1,500 - $2,000/mo"
                        className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md h-10 px-3 text-sm outline-none transition-all border border-transparent"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Short description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={2}
                        placeholder="One or two lines shown on the job card"
                        className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 text-sm outline-none resize-none transition-all border border-transparent"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Full description</label>
                    <textarea
                        name="fullDescription"
                        value={form.fullDescription}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Responsibilities, requirements, benefits..."
                        className="w-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 text-sm outline-none resize-none transition-all border border-transparent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-full cursor-pointer transition-colors"
                >
                    {submitting ? "Posting..." : "Post job"}
                </button>
            </form>
        </div>
    )
}

export default PostJobModal