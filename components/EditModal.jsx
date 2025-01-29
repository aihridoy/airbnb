"use client";

import { useState } from 'react';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-lg font-bold mb-4">Edit {type === 'dates' ? 'Dates' : 'Guests'}</h2>
                {type === 'dates' && (
                    <div className="space-y-4">
                        <input
                            type="date"
                            className="border p-2 w-full"
                            value={newDate.checkIn}
                            onChange={(e) => setNewDate({ ...newDate, checkIn: e.target.value })}
                        />
                        <input
                            type="date"
                            className="border p-2 w-full"
                            value={newDate.checkOut}
                            onChange={(e) => setNewDate({ ...newDate, checkOut: e.target.value })}
                        />
                    </div>
                )}
                {type === 'guests' && (
                    <div className="space-y-4">
                        <input
                            type="number"
                            className="border p-2 w-full"
                            value={newGuests}
                            onChange={(e) => setNewGuests(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="mr-4">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
