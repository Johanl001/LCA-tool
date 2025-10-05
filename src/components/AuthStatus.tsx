import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';
import authService from '../utils/authService';

interface AuthStatusProps {
  onAuthError?: () => void;
}

const AuthStatus: React.FC<AuthStatusProps> = ({ onAuthError }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'warning' | 'error'>('success');

  useEffect(() => {
    // Check token expiration periodically
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('lca_token');
      if (token && !authService.isTokenValid(token)) {
        setStatusMessage('Your session will expire soon. Please save your work.');
        setStatusType('warning');
        setShowStatus(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => setShowStatus(false), 10000);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    // Initial check
    checkTokenExpiration();
    
    return () => clearInterval(interval);
  }, []);

  const handleRefreshToken = async () => {
    try {
      const newToken = await authService.getValidToken();
      if (newToken) {
        setStatusMessage('Session refreshed successfully!');
        setStatusType('success');
        setTimeout(() => setShowStatus(false), 3000);
      } else {
        setStatusMessage('Session refresh failed. Please login again.');
        setStatusType('error');
        onAuthError?.();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setStatusMessage('Session refresh failed. Please login again.');
      setStatusType('error');
      onAuthError?.();
    }
  };

  if (!showStatus) {
    return null;
  }

  const getStatusIcon = () => {
    switch (statusType) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColors = () => {
    switch (statusType) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border shadow-lg z-50 ${getStatusColors()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{statusMessage}</p>
            {statusType === 'warning' && (
              <button
                onClick={handleRefreshToken}
                className="mt-2 inline-flex items-center text-sm font-medium text-yellow-700 hover:text-yellow-900"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Session
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowStatus(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AuthStatus;