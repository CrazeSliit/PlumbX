'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon, 
  ChevronRightIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { generateInventoryPDF, printReport } from '@/utils/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#fdc501', '#FF8042', '#00C49F', '#0088FE', '#FFBB28', '#FF8042'];

// Enhanced Line Chart with more features and better tooltips
function EnhancedLineChart({ 
  data, 
  color = "#fdc501", 
  height = 250, 
  showAverage = false,
  secondaryData = null, // For comparison with previous period
  compareLabel = "Previous Period"
}) {
  if (!data || data.length === 0) return null;
  const [hoverPoint, setHoverPoint] = useState(null);
  const [hoverComparisonPoint, setHoverComparisonPoint] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Calculate the min and max values for proper scaling, including secondary data if present
  const allValues = [...data.map(d => Number(d.value) || 0)];
  if (secondaryData) {
    allValues.push(...secondaryData.map(d => Number(d.value) || 0));
  }
  
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1 || 100; // Fallback to 100 if no valid values
  const range = maxValue - minValue;
  
  // Generate points for the primary line
  const points = data.map((point, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (((Number(point.value) || 0) - minValue) / range) * 80;
    return { x, y, ...point };
  });
  
  // Generate points for secondary comparison line if provided
  const secondaryPoints = secondaryData ? secondaryData.map((point, i) => {
    const x = (i / (secondaryData.length - 1)) * 100;
    const y = 100 - (((Number(point.value) || 0) - minValue) / range) * 80;
    return { x, y, ...point };
  }) : [];
  
  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${linePoints} 100,100 0,100`;
  
  // Use stable IDs for gradients
  const gradientId = `line-gradient-${color.replace('#', '')}`;
  const secondaryGradientId = `sec-line-gradient-${color.replace('#', '')}`;
  
  // Calculate average line if needed
  const averageValue = showAverage ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length : null;
  const averageY = showAverage ? 100 - (((averageValue - minValue) / range) * 80) : null;
  
  // Generate animation effects for line paths
  useEffect(() => {
    setAnimationComplete(false);
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [data, secondaryData]);

  return (
    <div className="relative">
      <svg 
        width="100%" 
        height={height} 
        className="overflow-visible"
        onMouseLeave={() => {
          setHoverPoint(null);
          setHoverComparisonPoint(null);
        }}
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
          </linearGradient>
          {secondaryData && (
            <linearGradient id={secondaryGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.1"/>
            </linearGradient>
          )}
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(percent => {
          const y = height - (percent / 100) * height * 0.8;
          return (
            <g key={`grid-${percent}`}>
              <line
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={percent === 0 ? '0' : '2,2'}
              />
              <text
                x="0"
                y={y - 5}
                fontSize="9"
                fill="#6b7280"
                textAnchor="start"
              >
                {Math.round((percent / 100) * maxValue)}
              </text>
            </g>
          );
        })}
        
        {/* Vertical grid lines */}
        {data.map((_, i) => {
          const x = (i / (data.length - 1)) * 100;
          return (
            <line 
              key={`xline-${i}`}
              x1={`${x}%`}
              y1="0"
              x2={`${x}%`}
              y2={`${height * 0.8}px`}
              stroke={i % 2 === 0 ? '#f3f4f6' : 'transparent'}
              strokeWidth="8"
              strokeOpacity="0.5"
            />
          );
        })}
        
        {/* Area fill under secondary line if present */}
        {secondaryData && (
          <polygon
            points={secondaryPoints.map(p => `${p.x},${p.y}`).join(' ') + ' 100,100 0,100'}
            fill={`url(#${secondaryGradientId})`}
            style={{
              opacity: animationComplete ? 0.4 : 0,
              transition: 'opacity 1s ease-in'
            }}
          />
        )}
        
        {/* Area fill under the primary line */}
        <polygon
          points={areaPoints}
          fill={`url(#${gradientId})`}
          style={{
            opacity: animationComplete ? 1 : 0, 
            transition: 'opacity 0.8s ease-in'
          }}
        />
        
        {/* Average line if needed */}
        {showAverage && (
          <>
            <line
              x1="0"
              y1={averageY}
              x2="100%"
              y2={averageY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            <text
              x="100%"
              y={averageY - 5}
              fontSize="9"
              fill="#f59e0b"
              fontWeight="bold"
              textAnchor="end"
            >
              Avg: {Math.round(averageValue)}
            </text>
          </>
        )}
        
        {/* Secondary comparison line */}
        {secondaryData && (
          <polyline
            points={secondaryPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            style={{
              opacity: animationComplete ? 1 : 0,
              transition: 'opacity 1s ease-in'
            }}
          />
        )}
        
        {/* Primary line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          style={{
            opacity: animationComplete ? 1 : 0,
            transition: 'opacity 0.8s ease-in'
          }}
        />
        
        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r={hoverPoint === i ? 7 : 5}
              fill={hoverPoint === i ? color : "white"}
              stroke={color}
              strokeWidth="2"
              onMouseEnter={() => setHoverPoint(i)}
              style={{
                cursor: 'pointer', 
                transition: 'all 0.3s',
                opacity: animationComplete ? 1 : 0,
                transform: `scale(${animationComplete ? 1 : 0})`
              }}
            />
            
            {/* X-axis labels */}
            <text
              x={`${point.x}%`}
              y={height - 10}
              fontSize="9"
              textAnchor="middle"
              fill="#6b7280"
              fontWeight={hoverPoint === i ? "bold" : "normal"}
            >
              {point.label}
            </text>
          </g>
        ))}
        
        {/* Enhanced tooltip for primary data */}
        {hoverPoint !== null && (
          <g>
            <rect
              x={`${points[hoverPoint].x - 50}%`}
              y={`${points[hoverPoint].y - 40}%`}
              width="100%"
              height="25%"
              rx="4"
              fill="#1f2937"
              opacity="0.95"
            />
            <text
              x={`${points[hoverPoint].x}%`}
              y={`${points[hoverPoint].y - 25}%`}
              fontSize="10"
              textAnchor="middle"
              fill="white"
            >
              {points[hoverPoint].value}
            </text>
          </g>
        )}
        
        {/* Enhanced tooltip for comparison data */}
        {hoverComparisonPoint !== null && hoverComparisonPoint !== hoverPoint && (
          <g>
            <rect
              x={`${secondaryPoints[hoverComparisonPoint].x - 50}%`}
              y={`${secondaryPoints[hoverComparisonPoint].y - 40}%`}
              width="100%"
              height="25%"
              rx="4"
              fill="#1f2937"
              opacity="0.95"
            />
            <text
              x={`${secondaryPoints[hoverComparisonPoint].x}%`}
              y={`${secondaryPoints[hoverComparisonPoint].y - 25}%`}
              fontSize="10"
              textAnchor="middle"
              fill="white"
            >
              {compareLabel}: {secondaryPoints[hoverComparisonPoint].value}
            </text>
          </g>
        )}
      </svg>
      
      {/* Chart legend */}
      {secondaryData && (
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#fdc501] rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Current Period</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#94a3b8] rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">{compareLabel}</span>
          </div>
          {showAverage && (
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-[#f59e0b] mr-2"></div>
              <span className="text-sm text-gray-700">Average</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced Bar Chart with hover effects, clearer labels, and increased spacing between bars
function EnhancedBarChart({ 
  data, 
  color = "#fdc501", 
  height = 250,
  showComparison = false,
  comparisonData = null,
  comparisonLabel = "Previous Period",
  showLabels = false,
  labelPosition = "top",
  colors = ['#fdc501', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444']
}) {
  if (!data || data.length === 0) return null;
  const [hoverBar, setHoverBar] = useState(null);
  const [hoverComparisonBar, setHoverComparisonBar] = useState(null);
  
  // Ensure all values are valid numbers and filter out invalid data
  const validData = data
    .filter(item => item && typeof item.value !== 'undefined' && !isNaN(Number(item.value)))
    .map(item => ({
      ...item,
      value: Number(item.value) || 0
    }));

  const validComparisonData = comparisonData 
    ? comparisonData
        .filter(item => item && typeof item.value !== 'undefined' && !isNaN(Number(item.value)))
        .map(item => ({
          ...item,
          value: Number(item.value) || 0
        }))
    : null;
  
  // Calculate max value including comparison data if present
  const allValues = [...validData.map(item => item.value)];
  if (validComparisonData) {
    allValues.push(...validComparisonData.map(item => item.value));
  }
  const maxValue = Math.max(...allValues) * 1.1 || 100; // Fallback to 100 if no valid values
  
  // Calculate bar width and spacing
  const barWidth = 100 / (validData.length * (showComparison ? 2 : 1));
  const barSpacing = barWidth * 0.2; // 20% spacing between bars
  
  // Format large numbers
  const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };
  
  return (
    <div className="relative">
      <svg 
        width="100%" 
        height={height} 
        className="overflow-visible" 
        onMouseLeave={() => {
          setHoverBar(null);
          setHoverComparisonBar(null);
        }}
      >
        {/* Y-axis value grid lines */}
        {[0, 25, 50, 75, 100].map(percent => {
          const y = height - (percent / 100) * height * 0.8;
          return (
            <g key={`grid-${percent}`}>
              <line
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={percent === 0 ? '0' : '2,2'}
              />
              <text
                x="0"
                y={y - 5}
                fontSize="9"
                fill="#6b7280"
                textAnchor="start"
              >
                {formatNumber(Math.round((percent / 100) * maxValue))}
              </text>
            </g>
          );
        })}
        
        {/* Bars with increased spacing */}
        {validData.map((item, i) => {
          const barHeight = Math.max(0, (item.value / maxValue) * height * 0.8);
          const gradientId = `bar-gradient-${i}`;
          const isHovered = hoverBar === i;
          const barColor = colors[i % colors.length];
          
          // Calculate bar position
          const barX = (i * barWidth * (showComparison ? 2 : 1)) + barSpacing;
          const actualBarWidth = barWidth - (barSpacing * 2);
          
          return (
            <g 
              key={i}
              onMouseEnter={() => setHoverBar(i)}
              style={{ cursor: 'pointer' }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={barColor} stopOpacity="1"/>
                  <stop offset="100%" stopColor={barColor} stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              
              {/* Main bar */}
              <rect
                x={`${barX}%`}
                y={`${height - barHeight - 20}`}
                width={`${actualBarWidth}%`}
                height={barHeight}
                rx="4"
                fill={`url(#${gradientId})`}
                stroke={isHovered ? "#1f2937" : "transparent"}
                strokeWidth="1.5"
                className="transition-all duration-300"
                style={{
                  transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                  transformOrigin: 'bottom'
                }}
              />
              
              {/* Comparison bar if enabled */}
              {showComparison && validComparisonData && validComparisonData[i] && (
                <rect
                  x={`${barX + barWidth}%`}
                  y={`${height - (validComparisonData[i].value / maxValue) * height * 0.8 - 20}`}
                  width={`${actualBarWidth}%`}
                  height={(validComparisonData[i].value / maxValue) * height * 0.8}
                  rx="4"
                  fill="#94a3b8"
                  fillOpacity="0.6"
                  stroke={hoverComparisonBar === i ? "#1f2937" : "transparent"}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoverComparisonBar(i)}
                  className="transition-all duration-300"
                  style={{
                    transform: hoverComparisonBar === i ? 'scaleY(1.02)' : 'scaleY(1)',
                    transformOrigin: 'bottom'
                  }}
                />
              )}
              
              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={`${barX - 0.15 * barWidth}%`}
                    y={`${height - barHeight - 45}`}
                    width={`${actualBarWidth + 0.3 * barWidth}%`}
                    height="24"
                    rx="4"
                    fill="#1f2937"
                    opacity="0.9"
                  />
                  <text
                    x={`${barX + actualBarWidth/2}%`}
                    y={`${height - barHeight - 30}`}
                    fontSize="11"
                    textAnchor="middle"
                    fill="white"
                    fontWeight="bold"
                  >
                    {formatNumber(item.value)}
                  </text>
                </g>
              )}
              
              {/* Comparison tooltip */}
              {showComparison && hoverComparisonBar === i && validComparisonData && validComparisonData[i] && (
                <g>
                  <rect
                    x={`${barX + barWidth - 0.15 * barWidth}%`}
                    y={`${height - (validComparisonData[i].value / maxValue) * height * 0.8 - 45}`}
                    width={`${actualBarWidth + 0.3 * barWidth}%`}
                    height="24"
                    rx="4"
                    fill="#1f2937"
                    opacity="0.9"
                  />
                  <text
                    x={`${barX + barWidth + actualBarWidth/2}%`}
                    y={`${height - (validComparisonData[i].value / maxValue) * height * 0.8 - 30}`}
                    fontSize="11"
                    textAnchor="middle"
                    fill="white"
                    fontWeight="bold"
                  >
                    {formatNumber(validComparisonData[i].value)}
                  </text>
                </g>
              )}
              
              {/* X-axis labels */}
              {showLabels && (
                <text
                  x={`${barX + (showComparison ? barWidth : 0) + actualBarWidth/2}%`}
                  y={`${height - 5}`}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#374151"
                  fontWeight={isHovered || hoverComparisonBar === i ? "bold" : "normal"}
                  transform={validData.length > 8 ? `rotate(-30, ${barX + (showComparison ? barWidth : 0) + actualBarWidth/2}, ${height - 5})` : ''}
                >
                  {item.label || `Item ${i + 1}`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Chart legend */}
      {showComparison && (
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#fdc501] rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Current Period</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#94a3b8] rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">{comparisonLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive Pie Chart with better labels and hover effects
function InteractivePieChart({ 
  data, 
  height = 250, 
  width = 250,
  showComparison = false,
  comparisonData = null,
  comparisonLabel = "Previous Period"
}) {
  if (!data || data.length === 0) return null;
  const [activeSlice, setActiveSlice] = useState(null);
  const [activeComparisonSlice, setActiveComparisonSlice] = useState(null);
  
  // Ensure all values are valid numbers
  const validData = data.map(item => ({
    ...item,
    value: Number(item.value) || 0
  }));

  const validComparisonData = comparisonData ? comparisonData.map(item => ({
    ...item,
    value: Number(item.value) || 0
  })) : null;
  
  const total = validData.reduce((sum, item) => sum + item.value, 0);
  const comparisonTotal = validComparisonData ? validComparisonData.reduce((sum, item) => sum + item.value, 0) : 0;
  
  let currentAngle = 0;
  let comparisonCurrentAngle = 0;
  
  // Center points and radius
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 15;
  const innerRadius = radius * 0.6;
  const comparisonRadius = radius * 1.2;
  
  // Colors palette
  const colors = ['#fdc501', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];
  
  // Generate slices with fixed precision
  const slices = validData.map((item, index) => {
    const percentage = item.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + (percentage * Math.PI * 2);
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    currentAngle = endAngle;
    
    // Calculate path with fixed precision
    const x1 = Number((centerX + radius * Math.cos(startAngle)).toFixed(2));
    const y1 = Number((centerY + radius * Math.sin(startAngle)).toFixed(2));
    const x2 = Number((centerX + radius * Math.cos(endAngle)).toFixed(2));
    const y2 = Number((centerY + radius * Math.sin(endAngle)).toFixed(2));
    
    // Inner circle points with fixed precision
    const innerX1 = Number((centerX + innerRadius * Math.cos(startAngle)).toFixed(2));
    const innerY1 = Number((centerY + innerRadius * Math.sin(startAngle)).toFixed(2));
    const innerX2 = Number((centerX + innerRadius * Math.cos(endAngle)).toFixed(2));
    const innerY2 = Number((centerY + innerRadius * Math.sin(endAngle)).toFixed(2));
    
    // Determine if we need large arc flag
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    
    // Enhanced path with donut effect and fixed precision
    const outerPath = [
      `M ${innerX1} ${innerY1}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${innerX2} ${innerY2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
      'Z'
    ].join(' ');
    
    const color = colors[index % colors.length];
    
    // Label positioning with fixed precision
    const labelRadius = radius * 1.1;
    const labelX = Number((centerX + labelRadius * Math.cos(midAngle)).toFixed(2));
    const labelY = Number((centerY + labelRadius * Math.sin(midAngle)).toFixed(2));
    const textAnchor = labelX > centerX ? 'start' : 'end';
    
    return {
      path: outerPath,
      color,
      percentage,
      label: item.label,
      value: item.value,
      midAngle,
      labelX,
      labelY,
      textAnchor,
      index
    };
  });

  // Generate comparison slices if enabled
  const comparisonSlices = showComparison && validComparisonData ? validComparisonData.map((item, index) => {
    const percentage = item.value / comparisonTotal;
    const startAngle = comparisonCurrentAngle;
    const endAngle = comparisonCurrentAngle + (percentage * Math.PI * 2);
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    comparisonCurrentAngle = endAngle;
    
    // Calculate path with fixed precision
    const x1 = Number((centerX + comparisonRadius * Math.cos(startAngle)).toFixed(2));
    const y1 = Number((centerY + comparisonRadius * Math.sin(startAngle)).toFixed(2));
    const x2 = Number((centerX + comparisonRadius * Math.cos(endAngle)).toFixed(2));
    const y2 = Number((centerY + comparisonRadius * Math.sin(endAngle)).toFixed(2));
    
    // Inner circle points with fixed precision
    const innerX1 = Number((centerX + radius * Math.cos(startAngle)).toFixed(2));
    const innerY1 = Number((centerY + radius * Math.sin(startAngle)).toFixed(2));
    const innerX2 = Number((centerX + radius * Math.cos(endAngle)).toFixed(2));
    const innerY2 = Number((centerY + radius * Math.sin(endAngle)).toFixed(2));
    
    // Determine if we need large arc flag
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    
    // Enhanced path with donut effect and fixed precision
    const outerPath = [
      `M ${innerX1} ${innerY1}`,
      `L ${x1} ${y1}`,
      `A ${comparisonRadius} ${comparisonRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${innerX2} ${innerY2}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
      'Z'
    ].join(' ');
    
    const color = colors[index % colors.length];
    
    // Label positioning with fixed precision
    const labelRadius = comparisonRadius * 1.1;
    const labelX = Number((centerX + labelRadius * Math.cos(midAngle)).toFixed(2));
    const labelY = Number((centerY + labelRadius * Math.sin(midAngle)).toFixed(2));
    const textAnchor = labelX > centerX ? 'start' : 'end';
    
    return {
      path: outerPath,
      color,
      percentage,
      label: item.label,
      value: item.value,
      midAngle,
      labelX,
      labelY,
      textAnchor,
      index
    };
  }) : [];
  
  return (
    <div className="relative">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Comparison slices */}
        {showComparison && comparisonSlices.map((slice, i) => (
          <g key={`comparison-${i}`}>
            <path
              d={slice.path}
              fill={slice.color}
              fillOpacity="0.6"
              stroke="white"
              strokeWidth="1.5"
              onMouseEnter={() => setActiveComparisonSlice(i)}
              onMouseLeave={() => setActiveComparisonSlice(null)}
              opacity={activeComparisonSlice === null || activeComparisonSlice === i ? 1 : 0.5}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: activeComparisonSlice === i ? 'scale(1.03)' : 'scale(1)',
                transformOrigin: `${centerX}px ${centerY}px`
              }}
            />
          </g>
        ))}
        
        {/* Main slices */}
        {slices.map((slice, i) => (
          <g key={i}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="1.5"
              onMouseEnter={() => setActiveSlice(i)}
              onMouseLeave={() => setActiveSlice(null)}
              opacity={activeSlice === null || activeSlice === i ? 1 : 0.5}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: activeSlice === i ? 'scale(1.03)' : 'scale(1)',
                transformOrigin: `${centerX}px ${centerY}px`
              }}
            />
          </g>
        ))}
        
        {/* Center info */}
        <text
          x={centerX}
          y={centerY - 10}
          fontSize="12"
          textAnchor="middle"
          fill="#4b5563"
          fontWeight="bold"
        >
          {activeSlice !== null ? slices[activeSlice].label : 
           activeComparisonSlice !== null ? comparisonSlices[activeComparisonSlice].label : 'Total'}
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          fontSize="14"
          textAnchor="middle"
          fill="#111827"
          fontWeight="bold"
        >
          {activeSlice !== null ? 
            `${slices[activeSlice].value} (${Math.round(slices[activeSlice].percentage * 100)}%)` :
            activeComparisonSlice !== null ?
            `${comparisonSlices[activeComparisonSlice].value} (${Math.round(comparisonSlices[activeComparisonSlice].percentage * 100)}%)` :
            total
          }
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {slices.map((slice, i) => (
          <div 
            key={i} 
            className={`flex items-center p-1 rounded-md ${activeSlice === i ? 'bg-gray-100' : ''}`}
            onMouseEnter={() => setActiveSlice(i)}
            onMouseLeave={() => setActiveSlice(null)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="w-4 h-4 rounded-sm mr-2" 
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-gray-800 font-medium">
              {slice.label} ({Math.round(slice.percentage * 100)}%)
            </span>
          </div>
        ))}
      </div>
      
      {/* Comparison legend */}
      {showComparison && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{comparisonLabel}</h4>
          <div className="grid grid-cols-2 gap-3">
            {comparisonSlices.map((slice, i) => (
              <div 
                key={i} 
                className={`flex items-center p-1 rounded-md ${activeComparisonSlice === i ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setActiveComparisonSlice(i)}
                onMouseLeave={() => setActiveComparisonSlice(null)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="w-4 h-4 rounded-sm mr-2" 
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-800 font-medium">
                  {slice.label} ({Math.round(slice.percentage * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Add new Forecast component
function ForecastTab({ timeRange }) {
  const [forecastData, setForecastData] = useState({
    stockTrend: [],
    salesVolume: [],
    categoryDistribution: [],
    supplierPerformance: [],
    insights: [],
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecastData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Helper function to generate time-based labels
        const generateTimeLabels = (count) => {
          const now = new Date();
          const labels = [];
          
          for (let i = 0; i < count; i++) {
            const date = new Date(now);
            switch (timeRange) {
              case 'week':
                date.setDate(date.getDate() + (i + 1) * 1);
                labels.push(`Day ${i + 1}`);
                break;
              case 'month':
                date.setDate(date.getDate() + (i + 1) * 7);
                labels.push(`Week ${i + 1}`);
                break;
              case 'quarter':
                date.setMonth(date.getMonth() + (i + 1));
                labels.push(`Month ${i + 1}`);
                break;
              case 'year':
                date.setMonth(date.getMonth() + (i + 1) * 3);
                labels.push(`Q${i + 1}`);
                break;
              default:
                labels.push(`Period ${i + 1}`);
            }
          }
          return labels;
        };

        // Helper function to generate sample data with appropriate ranges
        const generateSampleData = (count, min, max) => {
          const labels = generateTimeLabels(count);
          return labels.map((label, i) => ({
            label,
            value: Math.floor(Math.random() * (max - min + 1)) + min
          }));
        };

        // Determine data points count based on time range
        const getDataPointsCount = () => {
          switch (timeRange) {
            case 'week': return 7;
            case 'month': return 4;
            case 'quarter': return 3;
            case 'year': return 4;
            default: return 4;
          }
        };

        const dataPointsCount = getDataPointsCount();
        
        const sampleData = {
          stockTrend: generateSampleData(dataPointsCount, 500, 1000),
          salesVolume: generateSampleData(dataPointsCount, 200, 500),
          categoryDistribution: [
            { label: 'Pipes', value: 35 },
            { label: 'Fittings', value: 25 },
            { label: 'Valves', value: 20 },
            { label: 'Tools', value: 15 },
            { label: 'Other', value: 5 }
          ],
          supplierPerformance: [
            { label: 'Supplier A', value: 85 },
            { label: 'Supplier B', value: 75 },
            { label: 'Supplier C', value: 90 }
          ],
          insights: [
            {
              title: 'Inventory Turnover',
              description: `Expected turnover rate increase of ${Math.floor(Math.random() * 5) + 3}% next ${timeRange}`,
              icon: <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />,
              color: 'green'
            },
            {
              title: 'Seasonal Demand',
              description: `Higher demand expected for pipes in upcoming ${timeRange}`,
              icon: <CalendarIcon className="h-5 w-5 text-blue-500" />,
              color: 'blue'
            },
            {
              title: 'Supplier Performance',
              description: 'Supplier A showing consistent delivery improvements',
              icon: <TruckIcon className="h-5 w-5 text-yellow-500" />,
              color: 'yellow'
            }
          ],
          recommendations: [
            `Increase stock levels for high-demand items in the next ${timeRange}`,
            'Consider bulk ordering from top-performing suppliers',
            `Review and adjust reorder points based on ${timeRange}ly forecast`
          ]
        };

        setForecastData(sampleData);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setError('Failed to load forecast data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecastData();
  }, [timeRange]);

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Forecast</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Forecast Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-yellow-50 rounded-lg mr-3">
            <ChartBarIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Inventory Forecast</h2>
            <p className="text-gray-500">
              {timeRange === 'week' ? 'Next 7 Days' :
               timeRange === 'month' ? 'Next 4 Weeks' :
               timeRange === 'quarter' ? 'Next 3 Months' :
               'Next 4 Quarters'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Forecast Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Trend Forecast */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Stock Trend Forecast ({timeRange === 'week' ? 'Daily' :
                                    timeRange === 'month' ? 'Weekly' :
                                    timeRange === 'quarter' ? 'Monthly' :
                                    'Quarterly'})
              </h3>
              <div className="h-64">
                <EnhancedLineChart 
                  data={forecastData.stockTrend}
                  color="#fdc501"
                  height={250}
                  showAverage={true}
                />
              </div>
            </div>

            {/* Sales Volume Forecast */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sales Volume Forecast ({timeRange === 'week' ? 'Daily' :
                                     timeRange === 'month' ? 'Weekly' :
                                     timeRange === 'quarter' ? 'Monthly' :
                                     'Quarterly'})
              </h3>
              <div className="h-64">
                <EnhancedBarChart 
                  data={forecastData.salesVolume}
                  color="#3b82f6"
                  height={250}
                />
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Category Distribution Forecast ({timeRange === 'week' ? 'Next Week' :
                                           timeRange === 'month' ? 'Next Month' :
                                           timeRange === 'quarter' ? 'Next Quarter' :
                                           'Next Year'})
            </h3>
            <div className="flex justify-center">
              <InteractivePieChart 
                data={forecastData.categoryDistribution}
                height={250}
                width={250}
              />
            </div>
          </div>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {timeRange === 'week' ? 'Weekly' :
                 timeRange === 'month' ? 'Monthly' :
                 timeRange === 'quarter' ? 'Quarterly' :
                 'Yearly'} Forecast Insights
              </h3>
              <div className="space-y-4">
                {forecastData.insights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className={`p-1.5 bg-${insight.color}-100 rounded-lg mr-2`}>
                        {insight.icon}
                      </div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {timeRange === 'week' ? 'Weekly' :
                 timeRange === 'month' ? 'Monthly' :
                 timeRange === 'quarter' ? 'Quarterly' :
                 'Yearly'} Recommendations
              </h3>
              <div className="space-y-3">
                {forecastData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <div className="p-1.5 bg-yellow-100 rounded-lg mr-3 mt-1">
                      <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-gray-600">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function InventoryAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    stockTrend: [],
    previousStockTrend: [],
    monthlySales: [],
    categoryDistribution: [],
    supplierPerformance: [],
    stockLevels: { current: 0, lowStock: 0, outOfStock: 0 },
    value: { total: 0, average: 0 }
  });

  // Add new function to handle category selection
  const handleCategorySelection = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Add new component for category comparison
  const CategoryComparisonChart = ({ data, selectedCategories }) => {
    if (!data || data.length === 0) return null;

    const filteredData = data.filter(item => selectedCategories.includes(item.label));
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-50 rounded-lg mr-3">
            <ChartBarIcon className="h-5 w-5 text-black" />
          </div>
          <h3 className="text-lg font-medium text-black">Category Comparison</h3>
        </div>
        <div className="h-72">
          <EnhancedBarChart 
            data={filteredData}
            color="#8b5cf6"
            height={275}
            showLabels={true}
            labelPosition="bottom"
            colors={['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ef4444']}
          />
        </div>
      </div>
    );
  };

  // Add new component for category selection
  const CategorySelector = ({ categories, selectedCategories, onCategorySelect }) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-yellow-50 rounded-lg mr-3">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-black" />
          </div>
          <h3 className="text-lg font-medium text-black">Select Categories to Compare</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => onCategorySelect(category.label)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategories.includes(category.label)
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch inventory data directly from the database
        const response = await fetch('/api/inventory');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        const inventoryData = await response.json();

        if (Array.isArray(inventoryData)) {
          // Filter data based on time range
          const now = new Date();
          let startDate;
          let previousStartDate;
          
          // Set date ranges based on time period
          switch (timeRange) {
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              previousStartDate = new Date(startDate);
              previousStartDate.setDate(previousStartDate.getDate() - 7);
              break;
            case 'month':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);
              previousStartDate = new Date(startDate);
              previousStartDate.setMonth(previousStartDate.getMonth() - 1);
              break;
            case 'quarter':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 3);
              previousStartDate = new Date(startDate);
              previousStartDate.setMonth(previousStartDate.getMonth() - 3);
              break;
            case 'year':
              startDate = new Date(now);
              startDate.setFullYear(now.getFullYear() - 1);
              previousStartDate = new Date(startDate);
              previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
              break;
            default:
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              previousStartDate = new Date(startDate);
              previousStartDate.setDate(previousStartDate.getDate() - 7);
          }

          // Filter data based on time range
          const filteredData = inventoryData.filter(item => {
            const itemDate = new Date(item.lastUpdated);
            return itemDate >= startDate && itemDate <= now;
          });

          // Filter previous period data
          const previousData = inventoryData.filter(item => {
            const itemDate = new Date(item.lastUpdated);
            return itemDate >= previousStartDate && itemDate < startDate;
          });

          // Group by category and calculate total quantity for current period
          const categoryTotals = filteredData.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + (Number(item.quantity) || 0);
            return acc;
          }, {});

          // Group by category and calculate total quantity for previous period
          const previousCategoryTotals = previousData.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + (Number(item.quantity) || 0);
            return acc;
          }, {});

          // Transform to chart data format
          const stockTrend = Object.entries(categoryTotals).map(([label, value]) => ({
            label,
            value: Number(value) || 0
          }));

          const previousStockTrend = Object.entries(previousCategoryTotals).map(([label, value]) => ({
            label,
            value: Number(value) || 0
          }));

          // Calculate total stock levels
          const totalStock = filteredData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
          const lowStock = filteredData.filter(item => (Number(item.quantity) || 0) < (Number(item.reorderPoint) || 10)).length;
          const outOfStock = filteredData.filter(item => (Number(item.quantity) || 0) === 0).length;

          // Calculate total value
          const totalValue = filteredData.reduce((sum, item) => 
            sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0
          );

          // Calculate top selling and slow moving items
          const itemSales = filteredData.map(item => ({
            label: item.itemName,
            value: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            lastUpdated: new Date(item.lastUpdated)
          }));

          // Sort items by quantity to determine top selling and slow moving
          const sortedItems = [...itemSales].sort((a, b) => b.value - a.value);
          const topSellingItems = sortedItems.slice(0, 5).map(item => ({
            label: item.label,
            value: item.value
          }));
          const slowMovingItems = sortedItems.slice(-5).map(item => ({
            label: item.label,
            value: item.value
          }));

          // Set the transformed data
          setAnalyticsData({
            stockTrend,
            previousStockTrend,
            categoryDistribution: stockTrend,
            topSellingItems,
            slowMovingItems,
            stockLevels: {
              current: totalStock,
              lowStock,
              outOfStock
            },
            value: {
              total: totalValue,
              average: totalValue / (filteredData.length || 1)
            }
          });
        } else {
          throw new Error('Invalid inventory data format');
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setError(error.message);
        // Set default data with valid numbers
        setAnalyticsData({
          stockTrend: [],
          previousStockTrend: [],
          categoryDistribution: [],
          topSellingItems: [],
          slowMovingItems: [],
          stockLevels: { current: 0, lowStock: 0, outOfStock: 0 },
          value: { total: 0, average: 0 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Calculate metrics from actual data with proper formatting
  const metrics = [
    { 
      title: 'Total Items', 
      value: analyticsData.stockLevels.current.toLocaleString(), 
      icon: <ChartBarIcon className="h-6 w-6 text-blue-500" />, 
      change: '+3.2%', 
      bgColor: 'bg-blue-50' 
    },
    { 
      title: 'Inventory Value', 
      value: `Rs${analyticsData.value.total.toLocaleString()}`, 
      icon: <CurrencyDollarIcon className="h-6 w-6 text-green-500" />, 
      change: '+5.4%', 
      bgColor: 'bg-green-50' 
    },
    { 
      title: 'Turnover Rate', 
      value: '3.4x', 
      icon: <ClockIcon className="h-6 w-6 text-yellow-500" />, 
      change: '+0.3', 
      bgColor: 'bg-yellow-50' 
    }
  ];

  // Update time range with loading animation
  const updateTimeRange = (range) => {
    if (range === timeRange) return;
    setIsLoading(true);
    setTimeRange(range);
    // Reset data to show loading state
    setAnalyticsData({
      stockTrend: [],
      previousStockTrend: [],
      categoryDistribution: [],
      topSellingItems: [],
      slowMovingItems: [],
      stockLevels: { current: 0, lowStock: 0, outOfStock: 0 },
      value: { total: 0, average: 0 }
    });
  };

  // Get current data based on selected time range
  const currentData = analyticsData;

  // Toggle for comparison data
  const [compareEnabled, setCompareEnabled] = useState(false);

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
                <span className="ml-1 text-sm font-medium text-black md:ml-2">Inventory Analytics</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full -mr-32 -mt-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200 rounded-full -ml-32 -mb-32 opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <DocumentChartBarIcon className="h-7 w-7 text-black" />
                  </div>
                  <h1 className="text-3xl font-bold text-black">Inventory Analytics</h1>
                </div>
                <p className="text-black/90 mt-2">Track performance, monitor trends, and optimize your inventory</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateTimeRange('week')}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    timeRange === 'week' ? 'bg-white text-black shadow-md' : 'bg-white/20 text-black hover:bg-white/30'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Week
                </button>
                <button
                  onClick={() => updateTimeRange('month')}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    timeRange === 'month' ? 'bg-white text-black shadow-md' : 'bg-white/20 text-black hover:bg-white/30'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Month
                </button>
                <button
                  onClick={() => updateTimeRange('quarter')}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    timeRange === 'quarter' ? 'bg-white text-black shadow-md' : 'bg-white/20 text-black hover:bg-white/30'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Quarter
                </button>
                <button
                  onClick={() => updateTimeRange('year')}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    timeRange === 'year' ? 'bg-white text-black shadow-md' : 'bg-white/20 text-black hover:bg-white/30'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Year
                </button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mt-6 border-b border-black/20">
              <div className="flex justify-between items-center">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setSelectedTab('overview')}
                    className={`py-2 px-1 ${
                      selectedTab === 'overview'
                        ? 'border-b-2 border-black text-black'
                        : 'text-black/70 hover:text-black hover:border-black/30 hover:border-b-2'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setSelectedTab('forecast')}
                    className={`py-2 px-1 ${
                      selectedTab === 'forecast'
                        ? 'border-b-2 border-black text-black'
                        : 'text-black/70 hover:text-black hover:border-black/30 hover:border-b-2'
                    }`}
                  >
                    Forecast
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Period Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 transform hover:scale-[1.01] transition-all duration-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                <CalendarIcon className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-medium text-black">
                  Showing data for: <span className="font-bold text-black">{timeRange}</span>
                </h3>
                <p className="text-sm text-black">Data updated in real-time</p>
              </div>
            </div>
            <div className="text-sm text-black flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-5 transform hover:scale-105 transition-all duration-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-black">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1 text-black">{metric.value}</p>
                </div>
                <div className={`p-2 ${metric.bgColor} rounded-lg shadow-sm`}>
                  {metric.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex items-center text-green-500 text-xs font-medium">
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  <span>{metric.change}</span>
                </div>
                <span className="mx-2 text-black text-xs">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Primary Charts Row */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                  <ChartBarIcon className="h-5 w-5 text-black" />
                </div>
                <h3 className="text-lg font-medium text-black">Inventory Stock Trend</h3>
              </div>
              <div className="flex items-center">
                <div className="mr-2 text-sm text-black">Compare with previous</div>
                <button 
                  onClick={() => setCompareEnabled(!compareEnabled)}
                  className={`w-10 h-5 ${compareEnabled ? 'bg-yellow-500' : 'bg-gray-300'} rounded-full relative transition-colors duration-300 ease-in-out`}
                >
                  <div 
                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transform ${compareEnabled ? 'translate-x-5' : ''} transition-transform duration-300 ease-in-out`}
                  />
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fdc501]"></div>
              </div>
            ) : (
              <>
                <div className="h-72 relative">
                  <EnhancedBarChart 
                    data={currentData.stockTrend} 
                    color="#fdc501" 
                    height={275}
                    showComparison={compareEnabled}
                    comparisonData={currentData.previousStockTrend}
                    comparisonLabel="Previous Period"
                    showLabels={true}
                    labelPosition="bottom"
                    colors={['#fdc501', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444']}
                  />
                </div>
                <div className="mt-4 border-t pt-4 border-gray-100">
                  <div className="flex items-center text-xs text-black">
                    <ChartBarIcon className="h-4 w-4 mr-1 text-[#fdc501]" />
                    <span className="font-medium mr-1">Chart explanation:</span> 
                    This chart shows inventory stock levels. {compareEnabled ? 
                      'Yellow bars show current period, gray bars show previous period.' : 
                      'Toggle comparison to see previous period data.'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <DocumentChartBarIcon className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-lg font-medium text-black">Inventory Distribution by Category</h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-72">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
              </div>
            ) : (
              <InteractivePieChart 
                data={currentData.categoryDistribution} 
                height={275} 
                width={275}
              />
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <ChartBarIcon className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-lg font-medium text-black">Top Selling vs Slow Moving Items</h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5cf6]"></div>
              </div>
            ) : (
              <EnhancedLineChart 
                data={analyticsData.topSellingItems}
                color="#10b981"
                height={275}
                showAverage={true}
                secondaryData={analyticsData.slowMovingItems}
                compareLabel="Slow Moving Items"
              />
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform hover:scale-[1.01] transition-all duration-200">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-50 rounded-lg mr-3">
              <ArrowTrendingUpIcon className="h-5 w-5 text-black" />
            </div>
            <h3 className="text-lg font-medium text-black">Analytics Insights & Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center mb-2">
                <div className="p-1.5 bg-green-100 rounded-lg mr-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-black" />
                </div>
                <h4 className="font-medium text-black">Inventory Turnover</h4>
              </div>
              <p className="text-black text-sm">Turnover rate is <span className="font-medium text-black">up 8%</span> from last quarter, indicating improved efficiency in stock management.</p>
              <div className="mt-3 text-xs text-black font-medium">Recommendation: Continue current practices</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center mb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                  <ChartBarIcon className="h-4 w-4 text-black" />
                </div>
                <h4 className="font-medium text-black">Top Selling Items</h4>
              </div>
              <p className="text-black text-sm">PVC Pipes and Copper Fittings remain the highest selling categories this month.</p>
              <div className="mt-3 text-xs text-black font-medium">Recommendation: Maintain optimal stock levels</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center mb-2">
                <div className="p-1.5 bg-yellow-100 rounded-lg mr-2">
                  <CalendarIcon className="h-4 w-4 text-black" />
                </div>
                <h4 className="font-medium text-black">Seasonal Trend</h4>
              </div>
              <p className="text-black text-sm">Prepare for the upcoming season by stocking up on Valves and Fixtures based on last year's trends.</p>
              <div className="mt-3 text-xs text-black font-medium">Recommendation: Increase inventory by 15%</div>
            </div>
          </div>
        </div>

        {/* Add Category Selector */}
        <CategorySelector 
          categories={analyticsData.categoryDistribution}
          selectedCategories={selectedCategories}
          onCategorySelect={handleCategorySelection}
        />

        {/* Add Category Comparison Chart */}
        {selectedCategories.length > 0 && (
          <CategoryComparisonChart 
            data={analyticsData.categoryDistribution}
            selectedCategories={selectedCategories}
          />
        )}
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {selectedTab === 'overview' && (
          <>
            {/* Time Period Indicator */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6 transform hover:scale-[1.01] transition-all duration-200">
              {/* ... existing overview content ... */}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* ... existing metrics content ... */}
            </div>

            {/* Primary Charts Row */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* ... existing charts content ... */}
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* ... existing charts content ... */}
            </div>

            {/* Insights Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform hover:scale-[1.01] transition-all duration-200">
              {/* ... existing insights content ... */}
            </div>
          </>
        )}

        {selectedTab === 'forecast' && (
          <ForecastTab timeRange={timeRange} />
        )}
      </div>
    </div>
  );
}
