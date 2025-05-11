'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { FaWrench, FaHome, FaPhoneAlt, FaInfoCircle, FaTools, FaUserTie, FaClock, FaCheckCircle, FaShieldAlt, FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { MdPlumbing, MdWaterDrop, MdEngineering, MdLocalOffer, MdLocationOn, MdArrowForward } from 'react-icons/md';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

export default function Homepage() {
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const videoRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 300 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 2;
            const y = (clientY / innerHeight - 0.5) * 2;
            mouseX.set(x * 50);
            mouseY.set(y * 50);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
            {/* Hero Section with Video Background */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/plumbing-video.mp4" type="video/mp4" />
                </video>
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[#fdc501]/20 to-transparent z-10"
                    animate={{ 
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{ 
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
                <div className="container mx-auto text-center px-4 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h1 
                            className="text-7xl font-bold mb-6 text-white"
                            style={{
                                textShadow: '0 0 20px rgba(253, 197, 1, 0.5)',
                                background: 'linear-gradient(45deg, #ffffff, #fdc501)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundSize: '200% 200%',
                                animation: 'gradient 5s ease infinite'
                            }}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                duration: 0.8,
                                type: "spring",
                                stiffness: 100
                            }}
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                Professional
                            </motion.span>{" "}
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="inline-block"
                            >
                                Plumbing
                            </motion.span>{" "}
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="inline-block"
                            >
                                Solutions
                            </motion.span>
                        </motion.h1>
                        <motion.p 
                            className="text-2xl mb-10 max-w-3xl mx-auto text-white/90"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Expert plumbing services for your home and business. Quality work, fair prices, and exceptional service.
                        </motion.p>
                        <motion.div 
                            className="flex flex-col sm:flex-row justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.button 
                                className="bg-gradient-to-r from-[#fdc501] to-[#ffd700] text-black px-8 py-3 rounded-md font-bold hover:bg-opacity-90 transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Our Services
                            </motion.button>
                            <motion.button 
                                className="border-2 border-[#fdc501] text-white px-8 py-3 rounded-md font-bold hover:bg-[#fdc501] hover:text-black transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Contact Us
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
                <motion.div 
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-4xl"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    ↓
                </motion.div>
            </section>

            {/* Statistics Section with Parallax */}
            <section className="py-20 bg-gradient-to-b from-black to-gray-900 text-white relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"
                    style={{
                        x: springX,
                        y: springY
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { number: "10+", label: "Years Experience" },
                            { number: "5000+", label: "Happy Customers" },
                            { number: "24/7", label: "Service Available" },
                            { number: "100%", label: "Satisfaction Rate" }
                        ].map((stat, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{
                                    transform: `perspective(1000px) rotateX(${springY}deg) rotateY(${springX}deg)`
                                }}
                            >
                                <motion.div 
                                    className="text-5xl font-bold text-[#fdc501] mb-2"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {stat.number}
                                </motion.div>
                                <div className="text-gray-300">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid with 3D Effect */}
            

            {/* Special Offers Section with Animated Background */}
            <section className="py-20 bg-gradient-to-r from-[#fdc501] to-[#ffd700] relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"
                    animate={{ 
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{ 
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.h2 
                        className="text-4xl font-bold text-center mb-16 text-black"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Special Offers
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: "First-Time Customer", offer: "20% OFF", description: "Get 20% off your first service call" },
                            { title: "Seasonal Maintenance", offer: "15% OFF", description: "Book your seasonal maintenance and save" }
                        ].map((offer, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-8 rounded-xl shadow-lg"
                                style={{
                                    transform: `perspective(1000px) rotateX(${springY}deg) rotateY(${springX}deg)`
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold">{offer.title}</h3>
                                    <span className="text-3xl font-bold text-[#fdc501]">{offer.offer}</span>
                                </div>
                                <p className="text-gray-600">{offer.description}</p>
                                <motion.button 
                                    className="mt-4 bg-black text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Claim Offer
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section with 3D Effect */}
            <section id="contact" className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"
                    style={{
                        x: springX,
                        y: springY
                    }}
                />
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            style={{
                                transform: `perspective(1000px) rotateX(${springY}deg) rotateY(${springX}deg)`
                            }}
                        >
                            <h2 className="text-4xl font-bold mb-8 text-white">Get in Touch</h2>
                            <p className="text-gray-300 mb-8">Have a plumbing emergency or need a quote? Contact us today!</p>
                            <div className="space-y-6">
                                {[
                                    { icon: <FaPhone />, title: "Phone", content: "(555) 123-4567" },
                                    { icon: <FaEnvelope />, title: "Email", content: "info@plumbpro.com" },
                                    { icon: <FaMapMarkerAlt />, title: "Address", content: "123 Plumbing Street, City, State 12345" }
                                ].map((item, index) => (
                                    <motion.div 
                                        key={index}
                                        className="flex items-center gap-4"
                                        whileHover={{ x: 10 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#fdc501] to-[#ffd700] rounded-full flex items-center justify-center">
                                            <div className="text-black text-xl">{item.icon}</div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{item.title}</h3>
                                            <p className="text-gray-300">{item.content}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                       
                    </div>
                </div>
            </section>

            
        </div>
    );
}