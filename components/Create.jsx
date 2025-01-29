import Image from 'next/image';
import React from 'react';
import Navbar from './Navbar';

const Create = () => {
    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8 relative">
                <button
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-90 absolute top-4 right-4"
                >
                    <i className="fas fa-save mr-2"></i>
                    Publish
                </button>
                <div className="mb-6">
                    <h1
                        className="text-3xl font-bold mb-2 text-zinc-400 edit"
                        id="propertyName"
                    >
                        Property Name
                        <i className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                    </h1>
                    <div className="flex items-center text-gray-600">
                        <span className="edit text-gray-600">Property location</span>
                        <i className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                    </div>
                </div>

                <div className="grid grid-cols-4 grid-rows-2 gap-4 mb-8 h-[500px]">
                    <div className="col-span-2 row-span-2 relative">
                        <Image
                            width={600} // Match this with your image's actual width
                            height={400} // Match this with your image's actual height
                            src="https://placehold.co/600x400"
                            alt="Main Room"
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized={true}
                        />
                        <input
                            type="text"
                            placeholder="https://placehold.co/600x400"
                            className="w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                        />
                    </div>
                    <div className="relative">
                        <Image
                            width={600}
                            height={400}
                            src="https://placehold.co/600x400"
                            alt="Room 1"
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized={true}
                        />
                        <input
                            type="text"
                            placeholder="https://placehold.co/600x400"
                            className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                        />
                    </div>
                    <div className="relative">
                        <Image
                            width={600}
                            height={400}
                            src="https://placehold.co/600x400"
                            alt="Room 1"
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized={true}
                        />
                        <input
                            type="text"
                            placeholder="https://placehold.co/600x400"
                            className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                        />
                    </div>
                    <div className="relative">
                        <Image
                            width={600}
                            height={400}
                            src="https://placehold.co/600x400"
                            alt="Room 1"
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized={true}
                        />
                        <input
                            type="text"
                            placeholder="https://placehold.co/600x400"
                            className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                        />
                    </div>
                    <div className="relative">
                        <Image
                            width={600}
                            height={400}
                            src="https://placehold.co/600x400"
                            alt="Room 1"
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized={true}
                        />
                        <input
                            type="text"
                            placeholder="https://placehold.co/600x400"
                            className="text-sm w-11/12 p-2 border border-primary rounded-lg mt-2 absolute left-1/2 -translate-x-1/2 bottom-2 bg-white"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <span className="text-xl font-bold edit">Price in USD<i className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"></i> </span>
                    <span className="text-gray-600 ml-1">per night</span>
                </div>

                <div className="mb-4">
                    <span className="edit">Available X rooms</span>
                    <i className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                        <div className="border-b pb-6 mb-6">
                            <div className="grid grid-cols-1 gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-person"></i>
                                    <span className="edit">How many Guest can Stay?</span>
                                    <i className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-door-open"></i>
                                    <span className="edit">How many Bedrooms ? </span>
                                    <i className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-bed"></i>
                                    <span className="edit">How many beds available ?</span>
                                    <i className="fas fa-pencil-alt text-gray-400 ml-1 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">About this place</h3>
                            <div className='flex items-center'>
                                <p className="text-gray-700 leading-relaxed edit">
                                    Write a short description about this place
                                </p>
                                <i className="fas fa-pencil-alt text-gray-400 ml-2 cursor-pointer text-sm hover:scale-110 transition-all"></i>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4" id="amenities">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <i className="fa-solid fa-umbrella-beach"></i>
                                    <span>Beach access</span>
                                </div>
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <i className="fa-solid fa-person-swimming"></i>
                                    <span>Private pool</span>
                                </div>
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <i className="fa-solid fa-wifi"></i>
                                    <span>Free Wi-Fi</span>
                                </div>
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <i className="fa-solid fa-sink"></i>
                                    <span>Kitchen</span>
                                </div>

                                <div className="flex items-center gap-2 cursor-pointer">
                                    <i className="fa-solid fa-square-parking"></i>
                                    <span>Free Parking</span>
                                </div>

                                <div className="flex items-center gap-2 cursor-pointer">
                                    <i className="fa-solid fa-dumbbell"></i>
                                    <span>Fitness Center</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Create;