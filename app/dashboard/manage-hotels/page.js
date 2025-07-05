/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { getAllHotels, getReviews, session } from '../../action'
import Link from 'next/link'
import ManageHotelList from '@/components/ManageHotelList'
import { redirect } from 'next/navigation'

export default async function ManageHotel() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect('/login');
    }

    const { user } = authResult;
    const { hotels } = await getAllHotels()
    const { reviews } = await getReviews()
    const filteredHotels = hotels.filter(hotel => String(hotel.ownerId) === String(user.id))

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-800">Manage Hotels</h1>
                    <Link
                        href='/dashboard/create-hotel'
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:brightness-90 transition-colors"
                    >
                        + Create Hotel
                    </Link>
                </div>
                <ManageHotelList filteredHotels={filteredHotels} reviews={reviews} />
            </div>
        </>
    )
}
