'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    HomeIcon, 
    ChevronRightIcon,
    ChartBarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { EnhancedLineChart, EnhancedBarChart, InteractivePieChart } from '../inventory_analytics/components/Charts';

export default function YearlyPredictionsPage() {
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchYearlyPredictions = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/inventory/forecast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ timeRange: 'year' })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch yearly predictions');
                }

                const result = await response.json();
                if (result.status === 'success') {
                    setPredictionData(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch yearly predictions');
                }
            } catch (error) {
                console.error('Error fetching yearly predictions:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchYearlyPredictions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-tools-pattern p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fdc501]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-tools-pattern p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center text-red-500 p-4">
                        Error loading predictions: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tools-pattern p-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb Navigation */}
                <nav className="flex mb-4" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-700 hover:text-[#fdc501]">
                                <HomeIcon className="w-4 h-4 mr-2"/>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRightIcon className="w-5 h-5 text-gray-400"/>
                                <Link href="/inventory_management" className="ml-1 text-sm font-medium text-gray-700 hover:text-[#fdc501] md:ml-2">
                                    Inventory Management
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <ChevronRightIcon className="w-5 h-5 text-gray-400"/>
                                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Yearly Predictions</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-7 w-7 text-[#fdc501]" />
                        <h1 className="text-3xl font-bold text-gray-900">Yearly Predictions</h1>
                    </div>
                    <p className="text-gray-600 mt-1">AI-powered predictions for the next year</p>
                </div>

                {/* Prediction Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Stock Trend Prediction */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Stock Trend Prediction</h3>
                        <div className="h-72">
                            <EnhancedLineChart 
                                data={predictionData?.stockTrend || []}
                                color="#fdc501"
                                height={275}
                                showAverage={true}
                            />
                        </div>
                    </div>

                    {/* Sales Volume Prediction */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Volume Prediction</h3>
                        <div className="h-72">
                            <EnhancedBarChart 
                                data={predictionData?.salesVolume || []}
                                color="#10b981"
                                height={275}
                            />
                        </div>
                    </div>

                    {/* Category Distribution Prediction */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution Prediction</h3>
                        <div className="flex justify-center">
                            <InteractivePieChart 
                                data={predictionData?.categoryDistribution || []}
                                height={275}
                                width={275}
                            />
                        </div>
                    </div>

                    {/* Supplier Performance Prediction */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Performance Prediction</h3>
                        <div className="h-72">
                            <EnhancedBarChart 
                                data={predictionData?.supplierPerformance || []}
                                color="#8b5cf6"
                                height={275}
                            />
                        </div>
                    </div>
                </div>

                {/* Predictions Insights */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Yearly Predictions Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Key Predictions</h4>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                {predictionData?.insights?.map((insight, index) => (
                                    <li key={index}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                {predictionData?.recommendations?.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 