"use client";
import { useState, useEffect } from 'react';
import { URLS } from '@/utils/URLS';
import { GET_REQUEST } from '@/utils/requests';

export default function DebugMarketplace() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      console.log('=== Testing Direct API Call ===');
      const url = `${URLS.BASE}${URLS.propertyBaseUrl}/all?briefType=Outright%20Sales&page=1&limit=12`;
      console.log('URL:', url);
      
      const response = await GET_REQUEST(url);
      console.log('Response:', response);
      
      setData(response);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('DebugMarketplace mounted');
    testAPI();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold text-lg mb-4">Debug Marketplace</h3>
      
      <div className="mb-4 text-sm">
        <p><strong>Status:</strong> {loading ? 'Loading...' : 'Idle'}</p>
        <p><strong>BASE URL:</strong> {URLS.BASE}</p>
        <p><strong>Endpoint:</strong> {URLS.propertyBaseUrl}/all</p>
      </div>

      <button 
        onClick={testAPI}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="p-3 bg-green-100 border border-green-300 rounded">
          <strong>Success!</strong>
          <p>Properties found: {data?.data?.length || 0}</p>
          <p>Success: {String(data?.success)}</p>
          {data?.data?.length > 0 && (
            <div className="mt-2">
              <p>First property: {data.data[0]._id}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
