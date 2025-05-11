import React, { useState, useEffect } from 'react';
import LineChart from '@/components/LineChart';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';

const ForecastTab = () => {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('3m');

    const fetchForecastData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/inventory/forecast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ timeRange })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch forecast data');
            }

            const data = await response.json();
            if (data.status === 'success') {
                setForecastData(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch forecast data');
            }
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError(err.message || 'Failed to fetch forecast data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecastData();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={fetchForecastData}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!forecastData) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Inventory Forecast</h3>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="border rounded px-3 py-1"
                >
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="1y">1 Year</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Stock Trend</h4>
                    <LineChart
                        data={forecastData.stockTrend}
                        xAxis="label"
                        yAxis="value"
                        height={200}
                    />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Sales Volume</h4>
                    <LineChart
                        data={forecastData.salesVolume}
                        xAxis="label"
                        yAxis="value"
                        height={200}
                    />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Category Distribution</h4>
                    <PieChart
                        data={forecastData.categoryDistribution}
                        nameKey="label"
                        valueKey="value"
                        height={200}
                    />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Supplier Performance</h4>
                    <BarChart
                        data={forecastData.supplierPerformance}
                        xAxis="label"
                        yAxis="value"
                        height={200}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Key Insights</h4>
                    <ul className="space-y-2">
                        {forecastData.insights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Recommendations</h4>
                    <ul className="space-y-2">
                        {forecastData.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>{recommendation}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ForecastTab; 