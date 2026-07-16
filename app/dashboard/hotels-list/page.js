/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { getAllHotels, getReviews, session } from '../../action'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import HotelSearch from '@/components/HotelSearch'

export default async function ManageHotel() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect('/login');
    }

    const { hotels } = await getAllHotels();
    const { reviews } = await getReviews();

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">Manage Hotels</h1>
                <Link
                    href='/dashboard/create-hotel'
                    className="flex items-center gap-1 bg-brass-dark text-cream px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-brass transition-colors text-sm sm:text-base"
                >
                    <Plus className="w-4 h-4" />
                    Create Hotel
                </Link>
            </div>
            <HotelSearch hotels={hotels} reviews={reviews} />
        </div>
    );
}
