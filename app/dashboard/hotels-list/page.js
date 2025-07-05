/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { getAllHotels, getReviews, session } from '../../action'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import HotelsList from '@/components/HotelsList'

export default async function ManageHotel() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect('/login');
    }

    const { hotels } = await getAllHotels();
    const { reviews } = await getReviews();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800">Manage Hotels</h1>
                <Link
                    href='/dashboard/create-hotel'
                    className="bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:brightness-90 transition-colors text-sm sm:text-base"
                >
                    + Create Hotel
                </Link>
            </div>
            <HotelsList filteredHotels={hotels} reviews={reviews} />
        </div>
    );
}