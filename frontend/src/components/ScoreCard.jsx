import React from 'react';

const ScoreCard = ({ title, score, color, trend, average }) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'green': return 'text-green-600 bg-green-50';
      case 'orange': return 'text-orange-600 bg-orange-50';
      case 'purple': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <span className="text-green-600 text-sm ml-2">↑</span>;
    } else if (trend === 'down') {
      return <span className="text-red-600 text-sm ml-2">↓</span>;
    }
    return <span className="text-gray-400 text-sm ml-2">→</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {average && (
          <span className="text-xs text-gray-400">
            Avg: {average}
          </span>
        )}
      </div>
      <div className="flex items-baseline">
        <span className={`text-3xl font-bold ${getColorClasses().split(' ')[0]}`}>{score}</span>
        <span className="text-gray-400 ml-1">/100</span>
        {trend && getTrendIcon()}
      </div>
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 bg-${color}-500`}
          style={{ width: `${score}%`, backgroundColor: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : '#8B5CF6' }}
        />
      </div>
      {trend && (
        <p className="text-xs text-gray-500 mt-2">
          {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'} trend
        </p>
      )}
    </div>
  );
};

export default ScoreCard;