import { getWishlists, session } from '@/app/action';
import React from 'react';
import AnimatedHeroBanner from "@/components/Hero";

const HeroSection = async () => {
     const wishlistsData = await getWishlists();
        const sessionData = await session();
        
        const wishlists = wishlistsData?.wishlists || [];
        const user = sessionData?.user || null;

    return (
        <AnimatedHeroBanner wishlists={wishlists} />
    );
};

export default HeroSection;