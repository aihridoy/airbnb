"use client";

import React, { useEffect, useState } from 'react';
import { addHotel, getHotelById, session, updateHotelById } from '../../action';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HotelForm = () => {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [hotelId, setHotelId] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [hostName, setHostName] = useState(null);
    const [isInputVisible, setIsInputVisible] = useState({
        propertyName: false,
        propertyLocation: false,
        propertyPrice: false,
        availableRoom: false,
        guestCapacity: false,
        bedroomCapacity: false,
        bedCapacity: false,
        description: false,
        serviceFee: false,
        cleaningFee: false,
        serviceFee: false,
        cleaningFee: false
    });
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        rent: '',
        hostName: '',
        guestCapacity: '',
        bedroomCapacity: '',
        bedCapacity: '',
        description: '',
        amenities: [],
        images: [],
        serviceFee: '',
        cleaningFee: '',
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setHotelId(params.get('hotelId'));
        }
    }, []);

    useEffect(() => {
        if (hotelId) {
            const fetchHotel = async () => {
                try {
                    const hotelData = await getHotelById(hotelId);
                    setHotel(hotelData);
                } catch (error) {
                    console.error('Error fetching hotel:', error);
                }
            };
            fetchHotel();
        }
    }, [hotelId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await session();
                if (!userData) {
                    router.push('/login');
                    return;
                }
                setUserId(userData?.user?.id || null);
                setHostName(userData?.user?.name || null);
            } catch (error) {
                console.error('Failed to fetch user session:', error);
            }
        };

        fetchUser();
    }, [router]);

    useEffect(() => {
        if (userId && hostName) {
            setFormData((prev) => ({ ...prev, ownerId: userId, hostName: hostName }));
        }
    }, [userId, hostName]);

    const resetForm = () => {
        setFormData({
            title: '',
            location: '',
            rent: '',
            hostName: '',
            guestCapacity: '',
            bedroomCapacity: '',
            bedCapacity: '',
            description: '',
            amenities: [],
            images: [],
            serviceFee: '',
            cleaningFee: '',
            ownerId: userId,
            hostName: hostName,
        });;
    };

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                amenities: checked
                    ? [...(prev.amenities || []), value]
                    : (prev.amenities || []).filter((item) => item !== value),
            }));
        } else if (name.startsWith('image')) {
            const index = parseInt(name.replace('image', ''), 10);
            setFormData((prev) => {
                const updatedImages = [...prev.images];
                updatedImages[index] = value;
                return { ...prev, images: updatedImages };
            });
            debounceValidateUrl(index, value);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const debounceValidateUrl = debounce((index, value) => {
        setIsValidUrl(false);
        const urlPattern = /^(http|https):\/\//;
        if (!urlPattern.test(value)) {
            setIsValidUrl(true);
        }
    }, 500);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isValidUrl) {
            toast.error('Please Provide Valid URL!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }
        try {
            setLoading(true);
            const form = new FormData();
            for (const [key, value] of Object.entries(formData)) {
                if (key === 'amenities') {
                    form.append(key, JSON.stringify(value));
                } else if (key === 'images') {
                    if (hotelId) {
                        form.append(key, JSON.stringify(value));
                    }
                    else {
                        value.forEach((image) => {
                            form.append('images[]', image);
                        });
                    }
                } else {
                    form.append(key, value);
                }
            }
            if (hotelId) {
                await updateHotelById(hotelId, Object.fromEntries(form.entries()));
            } else {
                await addHotel(form);
            }
            resetForm();
            toast.success(hotelId ? 'Hotel Updated Successfully!' : 'Hotel Added Successfully!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error('Error adding hotel:', error);
            toast.error('Failed to add hotel. Please try again.', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleInputVisibility = (field) => {
        setIsInputVisible((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    function getIconClass(amenity) {
        switch (amenity) {
            case 'Beach access':
                return 'fa-umbrella-beach';
            case 'Private pool':
                return 'fa-person-swimming';
            case 'Free Wi-Fi':
                return 'fa-wifi';
            case 'Kitchen':
                return 'fa-sink';
            case 'Free Parking':
                return 'fa-square-parking';
            case 'Fitness Center':
                return 'fa-dumbbell';
            default:
                return '';
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="max-w-7xl mx-auto px-6 py-8 relative">
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded-lg absolute top-4 right-4 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:brightness-90'
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                            <i className="fas fa-save mr-2"></i>
                        )}
                        {loading ? 'Saving...' : hotelId ? 'Update' : 'Publish'}
                    </button>
                    <div className="mb-6">
                        <div className="flex items-center">
                            {isInputVisible.propertyName ? (
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Property Name"
                                    className="mt-2 p-2 border border-primary rounded-lg"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold mb-2 text-zinc-400 edit" id="propertyName">
                                    {hotelId && !formData.title && hotel?.title || formData.title || "Property Name"}
                                </h1>
                            )}
                            {isInputVisible.propertyName ? (
                                <button
                                    onClick={() => toggleInputVisibility("propertyName")}
                                    className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                >
                                    Save
                                </button>
                            ) : (
                                <i
                                    onClick={() => toggleInputVisibility("propertyName")}
                                    className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"
                                ></i>
                            )}
                        </div>
                        <div className="flex items-center text-gray-600">
                            {isInputVisible.propertyLocation ? (
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Property Location"
                                    className="mt-2 p-2 border border-primary rounded-lg"
                                />
                            ) : (
                                <span className="edit text-gray-600">
                                    {hotelId && !formData.location && hotel?.location || formData.location || "Property Location"}
                                </span>
                            )}
                            {isInputVisible.propertyLocation ? (
                                <button
                                    onClick={() => toggleInputVisibility("propertyLocation")}
                                    className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                >
                                    Save
                                </button>
                            ) : (
                                <i
                                    onClick={() => toggleInputVisibility("propertyLocation")}
                                    className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"
                                ></i>
                            )}
                        </div>
                    </div>

                    {/* images */}
                    <div className="grid grid-cols-4 grid-rows-2 gap-4 mb-8 h-[500px]">
                        <div className="col-span-2 row-span-2 relative">
                            <Image
                                width={600}
                                height={400}
                                src={hotelId && !formData.images[0] && hotel?.images[0] || formData.images[0] || "https://placehold.co/600x400"}
                                alt="Main Room"
                                className="w-full h-full object-cover rounded-lg"
                                unoptimized={true}
                            />
                            <input
                                type="text"
                                name="image0"
                                placeholder="https://placehold.co/600x400"
                                value={formData.images[0] || ""}
                                onChange={handleChange}
                                className="w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                            />
                        </div>
                        <div className="relative">
                            <Image
                                width={600}
                                height={400}
                                src={hotelId && !formData.images[1] && hotel?.images[1] || formData.images[1] || "https://placehold.co/600x400"}
                                alt="Room 1"
                                className="w-full h-full object-cover rounded-lg"
                                unoptimized={true}
                            />
                            <input
                                type="text"
                                name="image1"
                                placeholder="https://placehold.co/600x400"
                                value={formData.images[1] || ""}
                                onChange={handleChange}
                                className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                            />
                        </div>
                        <div className="relative">
                            <Image
                                width={600}
                                height={400}
                                src={hotelId && !formData.images[2] && hotel?.images[2] || formData.images[2] || "https://placehold.co/600x400"}
                                alt="Room 1"
                                className="w-full h-full object-cover rounded-lg"
                                unoptimized={true}
                            />
                            <input
                                type="text"
                                name="image2"
                                placeholder="https://placehold.co/600x400"
                                value={formData.images[2] || ""}
                                onChange={handleChange}
                                className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                            />
                        </div>
                        <div className="relative">
                            <Image
                                width={600}
                                height={400}
                                src={hotelId && !formData.images[3] && hotel?.images[3] || formData.images[3] || "https://placehold.co/600x400"}
                                alt="Room 1"
                                className="w-full h-full object-cover rounded-lg"
                                unoptimized={true}
                            />
                            <input
                                type="text"
                                name="image3"
                                placeholder="https://placehold.co/600x400"
                                value={formData.images[3] || ""}
                                onChange={handleChange}
                                className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                            />
                        </div>
                        <div className="relative">
                            <Image
                                width={600}
                                height={400}
                                src={hotelId && !formData.images[4] && hotel?.images[4] || formData.images[4] || "https://placehold.co/600x400"}
                                alt="Room 1"
                                className="w-full h-full object-cover rounded-lg"
                                unoptimized={true}
                            />
                            <input
                                type="text"
                                name="image4"
                                placeholder="https://placehold.co/600x400"
                                value={formData.images[4] || ""}
                                onChange={handleChange}
                                className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        {isInputVisible.propertyPrice ? (
                            <input
                                type="number"
                                id="rent"
                                name="rent"
                                value={formData.rent}
                                onChange={handleChange}
                                placeholder="Property Rent"
                                className="mt-2 p-2 border border-primary rounded-lg"
                            />
                        ) : (
                            <span className="text-xl font-bold edit">
                                {
                                    hotelId
                                        ? formData.rent
                                            ? `$${formData.rent}`
                                            : `$${hotel?.rent || "Price in USD"}`
                                        : formData.rent
                                            ? `$${formData.rent}`
                                            : "Price in USD"
                                }
                            </span>
                        )}
                        {isInputVisible.propertyPrice ? (
                            <button
                                onClick={() => toggleInputVisibility("propertyPrice")}
                                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                            >
                                Save
                            </button>
                        ) : (
                            <i
                                onClick={() => toggleInputVisibility("propertyPrice")}
                                className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"
                            ></i>
                        )}
                        <span className="text-gray-600 ml-1">per night</span>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2">
                            <div className="border-b pb-6 mb-6">
                                <div className="grid grid-cols-1 gap-4 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-person"></i>
                                        {isInputVisible.guestCapacity ? (
                                            <input
                                                type="number"
                                                id="guestCapacity"
                                                name="guestCapacity"
                                                value={formData.guestCapacity}
                                                onChange={handleChange}
                                                placeholder="Guest Capacity"
                                                className="mt-2 p-2 border border-primary rounded-lg"
                                            />
                                        ) : (
                                            <span className="edit">
                                                {hotelId && !formData.guestCapacity && hotel?.guestCapacity || formData.guestCapacity || "How many Guests can Stay?"}
                                            </span>
                                        )}
                                        {isInputVisible.guestCapacity ? (
                                            <button
                                                onClick={() => toggleInputVisibility("guestCapacity")}
                                                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <i
                                                onClick={() => toggleInputVisibility("guestCapacity")}
                                                className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"
                                            ></i>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-door-open"></i>
                                        {isInputVisible.bedroomCapacity ? (
                                            <input
                                                type="number"
                                                id="bedroomCapacity"
                                                name="bedroomCapacity"
                                                value={formData.bedroomCapacity}
                                                onChange={handleChange}
                                                placeholder="Bedroom Capacity"
                                                className="mt-2 p-2 border border-primary rounded-lg"
                                            />
                                        ) : (
                                            <span className="edit">
                                                {hotelId && !formData.bedroomCapacity && hotel?.bedroomCapacity || formData.bedroomCapacity || "How many Bedrooms?"}
                                            </span>
                                        )}
                                        {isInputVisible.bedroomCapacity ? (
                                            <button
                                                onClick={() => toggleInputVisibility("bedroomCapacity")}
                                                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <i
                                                onClick={() => toggleInputVisibility("bedroomCapacity")}
                                                className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"
                                            ></i>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-bed"></i>
                                        {isInputVisible.bedCapacity ? (
                                            <input
                                                type="number"
                                                id="bedCapacity"
                                                name="bedCapacity"
                                                value={formData.bedCapacity}
                                                onChange={handleChange}
                                                placeholder="Bed Capacity"
                                                className="mt-2 p-2 border border-primary rounded-lg"
                                            />
                                        ) : (
                                            <span className="edit">
                                                {hotelId && !formData.bedCapacity && hotel?.bedCapacity || formData.bedCapacity || "How many beds available?"}
                                            </span>
                                        )}
                                        {isInputVisible.bedCapacity ? (
                                            <button
                                                onClick={() => toggleInputVisibility("bedCapacity")}
                                                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <i
                                                onClick={() => toggleInputVisibility("bedCapacity")}
                                                className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"
                                            ></i>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-broom"></i>
                                        {isInputVisible.serviceFee ? (
                                            <input
                                                type="number"
                                                id="serviceFee"
                                                name="serviceFee"
                                                value={formData.serviceFee}
                                                onChange={handleChange}
                                                placeholder="Service Fee"
                                                className="mt-2 p-2 border border-primary rounded-lg"
                                            />
                                        ) : (
                                            <span className="edit">
                                                {hotelId && (!formData.serviceFee ? hotel?.serviceFee : formData.serviceFee)
                                                    ? `$${formData.serviceFee || hotel?.serviceFee}`
                                                    : "Service Fee"}
                                            </span>
                                        )}
                                        {isInputVisible.serviceFee ? (
                                            <button
                                                onClick={() => toggleInputVisibility("serviceFee")}
                                                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <i
                                                onClick={() => toggleInputVisibility("serviceFee")}
                                                className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"
                                            ></i>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-concierge-bell"></i>
                                        {isInputVisible.cleaningFee ? (
                                            <input
                                                type="number"
                                                id="cleaningFee"
                                                name="cleaningFee"
                                                value={formData.cleaningFee}
                                                onChange={handleChange}
                                                placeholder="Cleaning Fee"
                                                className="mt-2 p-2 border border-primary rounded-lg"
                                            />
                                        ) : (
                                            <span className="edit">
                                                {hotelId && (!formData.cleaningFee ? hotel?.cleaningFee : formData.cleaningFee)
                                                    ? `$${formData.cleaningFee || hotel?.cleaningFee}`
                                                    : "Cleaning Fee"}

                                            </span>
                                        )}
                                        {isInputVisible.cleaningFee ? (
                                            <button
                                                onClick={() => toggleInputVisibility("cleaningFee")}
                                                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <i
                                                onClick={() => toggleInputVisibility("cleaningFee")}
                                                className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"
                                            ></i>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-4">About this place</h3>
                                <div className="flex items-center">
                                    {isInputVisible.description ? (
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Write a short description about this place"
                                            className="mt-2 p-2 border border-primary rounded-lg"
                                            rows="8"
                                            cols="64"
                                        />
                                    ) : (
                                        <p className="text-gray-700 leading-relaxed edit">
                                            {hotelId && !formData.description && hotel?.description || formData.description || "Write a short description about this place"}
                                        </p>
                                    )}
                                    {isInputVisible.description ? (
                                        <button
                                            onClick={() => toggleInputVisibility("description")}
                                            className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <i
                                            onClick={() => toggleInputVisibility("description")}
                                            className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"
                                        ></i>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
                                <div className="grid grid-cols-2 gap-4" id="amenities">
                                    {['Beach access', 'Private pool', 'Free Wi-Fi', 'Kitchen', 'Free Parking', 'Fitness Center'].map(amenity => (
                                        <div key={amenity} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id={amenity}
                                                name="amenities"
                                                value={amenity}
                                                checked={
                                                    (hotelId && hotel?.amenities && hotel.amenities.includes(amenity)) || formData.amenities.includes(amenity)
                                                }
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <i className={`fa-solid ${getIconClass(amenity)}`}></i>
                                            <label htmlFor={amenity}>{amenity}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <ToastContainer />
        </>
    );
};

export default HotelForm;
