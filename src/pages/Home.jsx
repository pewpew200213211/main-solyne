import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CollectionBanner from '../components/home/CollectionBanner';
import OurStoryPreview from '../components/home/OverStoryPreview';
import ReviewsSection from '../components/home/ReviewSection';
import InstagramGallery from '../components/home/InstragramGallary';

export default function Home() {
    return (
        <div>
            <HeroSection />
            <FeaturedProducts />
            <CollectionBanner />
            <OurStoryPreview />
            <ReviewsSection />
            <InstagramGallery />
        </div>
    );
}