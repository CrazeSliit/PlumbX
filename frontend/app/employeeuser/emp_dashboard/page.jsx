'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Search, Bell, Calendar, FileText, Users, HelpCircle, DollarSign, MoreHorizontal, Clock, Briefcase, BarChart2 } from 'lucide-react';

export default function EmpDashboard() {
  const [animateUI, setAnimateUI] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Array of video data
  const videos = [
    {
      id: 'OidfTkHp9vs',
      title: 'CEO Message',
      speaker: 'Lisa McGregor, CEO',
      quote: 'Things are always changing. Part of being successful is being comfortable with not knowing what\'s going to happen.'
    },
    {
      id: 'YyEpGMNjtdk',
      title: 'Innovation Talk',
      speaker: 'David Chen, CTO',
      quote: 'The best way to predict the future is to create it.'
    },
    {
      id: 'chpCYb52_wo',
      title: 'Company Vision',
      speaker: 'Sarah Johnson, COO',
      quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.'
    }
  ];

  // Simple loading and animation effect
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setAnimateUI(true);
    }
  }, [loading]);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Format time (hours:minutes AM/PM)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTimeString(`${formattedHours}:${formattedMinutes} ${ampm}`);
      
      // Format date (Day of week, Month Day)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayOfWeek = days[now.getDay()];
      const month = months[now.getMonth()];
      const date = now.getDate();
      setCurrentDateString(`${dayOfWeek}, ${month} ${date}`);
    };
    
    // Update time immediately
    updateTime();
    
    // Set interval to update time every second
    const interval = setInterval(updateTime, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Auto-rotate videos every 30 seconds when video is not playing
  useEffect(() => {
    if (!showVideo) {
      const interval = setInterval(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      }, 30000); // Change video every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [showVideo, videos.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fdc501]"></div>
        <p className="ml-3 text-lg text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-black text-white sticky top-0 z-10 shadow-md">
        <div className="font-bold text-xl flex items-center">
          <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#fdc501" />
            <path d="M2 17L12 22L22 17" stroke="#fdc501" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#fdc501" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          PlumbX
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-[#fdc501] text-black rounded-full flex items-center justify-center font-bold text-sm">
            EM
          </div>
        </div>
      </nav>

      {/* Welcome Banner */}
      <section className="bg-black text-white p-8 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl">
          <p className="text-gray-400 mb-1">Nice Day,</p>
          <h1 className="text-3xl font-bold mb-3">Welcome back</h1>
          <p className="text-gray-300">
  <span className="block mt-1 text-sm italic text-gray-400">Keep up the great work — together, we achieve more!</span>
</p>

        </div>
        <div className="mt-6 md:mt-0 bg-gray-900 p-5 rounded-lg">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-[#fdc501]" />
            <div className="text-2xl font-bold">{currentTimeString}</div>
            <div className="text-sm text-gray-400">{currentDateString}</div>
          </div>
        </div>
      </section>

        <br /><br></br>

      {/* Quick Links */}
      <section className="px-6 pb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
          <Link href="/employeeuser/emp_attendance" className="block">
            <div className="flex flex-col items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all">
              <div className="text-[#fdc501] mb-2">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-gray-700">Attendance</span>
            </div>
          </Link>
          <Link href="/employeeuser/emp_leaverequest" className="block">
            <div className="flex flex-col items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all">
              <div className="text-[#fdc501] mb-2">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-gray-700">Leave Request</span>
            </div>
          </Link>
        </div>
      </section>

      {/* CEO Message */}
      <section className="px-6 pb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="md:flex">
            <div className="p-8 md:w-2/3">
              <div className="text-sm text-[#fdc501] font-medium mb-2">Company Update</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{videos[currentVideoIndex].title}</h2>
              <p className="text-gray-600 italic mb-6">
                "{videos[currentVideoIndex].quote}" 
              </p>
              <p className="text-gray-500 mb-4">— {videos[currentVideoIndex].speaker}</p>
              
              <div className="flex space-x-4 mb-4">
                <button 
                  onClick={() => setShowVideo(!showVideo)}
                  className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
                >
                  {showVideo ? 'Hide Video' : 'Watch Video'} <Play className="ml-2 h-4 w-4" />
                </button>
                
                {!showVideo && (
                  <div className="flex space-x-2">
                    {videos.map((video, index) => (
                      <button 
                        key={video.id}
                        onClick={() => setCurrentVideoIndex(index)}
                        className={`w-3 h-3 rounded-full ${currentVideoIndex === index ? 'bg-[#fdc501]' : 'bg-gray-300'}`}
                        aria-label={`Switch to ${video.title}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {showVideo && (
                <div className="mt-2 aspect-video w-full">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${videos[currentVideoIndex].id}?si=d1ku3a6Q1GYwn6n_&autoplay=1`} 
                    title={videos[currentVideoIndex].title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="rounded-lg shadow-md"
                  ></iframe>
                </div>
              )}
            </div>
            {!showVideo && (
              <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-8">
                <div 
                  className="relative w-full h-48 rounded-lg overflow-hidden shadow-md cursor-pointer" 
                  onClick={() => setShowVideo(true)}
                >
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#fdc501] rounded-full p-4 shadow-lg">
                      <Play className="h-10 w-10 text-black" />
                    </div>
                  </div>
                  <img 
                    src={`https://i.ytimg.com/vi/${videos[currentVideoIndex].id}/hqdefault.jpg`} 
                    alt={`${videos[currentVideoIndex].title} thumbnail`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
