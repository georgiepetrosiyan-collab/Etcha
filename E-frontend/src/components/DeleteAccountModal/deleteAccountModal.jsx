import React, { useState } from 'react'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const DeleteAccountModal = ({ onConfirm, onCancel, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const stop = (e) => e.stopPropagation();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2300 px-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-3" onClick={stop}>
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <WarningAmberIcon sx={{ fontSize: 24, color: "#dc2626" }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Delete your account?</h3>
                <p className="text-sm text-gray-500">
                    This permanently deletes your profile, posts, and connections. This action cannot be undone.
                </p>
                <p className="text-xs text-gray-400 w-full text-left mt-1">Type <span className="font-semibold">DELETE</span> to confirm</p>
                <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="DELETE"
                />
                <div className="flex gap-3 w-full mt-2">
                    <button type="button" onClick={onCancel} className="flex-1 text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-full cursor-pointer transition-colors">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirmText !== 'DELETE' || loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-full cursor-pointer transition-colors"
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteAccountModal