"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

const EditModal = ({ type, onClose, updateBookingDetails, guests, checkIn, checkOut }) => {
    const [newDate, setNewDate] = useState({ checkIn: checkIn, checkOut: checkOut });
    const [newGuests, setNewGuests] = useState(guests || 0);

    const handleSave = () => {
        if (type === 'dates') {
            updateBookingDetails({ checkIn: newDate.checkIn, checkOut: newDate.checkOut });
        } else if (type === 'guests') {
            updateBookingDetails({ guests: newGuests });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
            <div className="bg-surface border border-hairline shadow-luxe w-full max-w-md rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-serif text-lg text-ink">
                        Edit {type === 'dates' ? 'Dates' : 'Guests'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-ink transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {type === 'dates' && (
                    <div className="space-y-4">
                        <input
                            type="date"
                            className="border border-hairline rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-brass"
                            value={newDate.checkIn}
                            onChange={(e) => setNewDate({ ...newDate, checkIn: e.target.value })}
                        />
                        <input
                            type="date"
                            className="border border-hairline rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-brass"
                            value={newDate.checkOut}
                            onChange={(e) => setNewDate({ ...newDate, checkOut: e.target.value })}
                        />
                    </div>
                )}
                {type === 'guests' && (
                    <div className="space-y-4">
                        <input
                            type="number"
                            className="border border-hairline rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-brass"
                            value={newGuests}
                            onChange={(e) => setNewGuests(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="text-muted hover:text-ink transition-colors text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-brass-dark text-cream px-4 py-2 rounded-lg hover:bg-brass transition-colors text-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
