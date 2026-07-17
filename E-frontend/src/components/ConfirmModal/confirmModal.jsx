import React from 'react'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const ConfirmModal = ({ title, message, confirmLabel = "Confirm", danger = false, loading = false, onConfirm, onCancel }) => {
    const stop = (e) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2200 px-4"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-3"
                onClick={stop}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <WarningAmberIcon sx={{ fontSize: 24, color: danger ? "#dc2626" : "#2563eb" }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{message}</p>

                <div className="flex gap-3 w-full mt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-full cursor-pointer transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 text-white text-sm font-medium py-2.5 rounded-full cursor-pointer transition-colors disabled:opacity-60 ${
                            danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal