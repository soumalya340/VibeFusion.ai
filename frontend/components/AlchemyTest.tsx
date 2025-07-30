'use client';

import { useState } from 'react';
import AlchemyService from '../services/alchemyService';

const AlchemyTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testAddress, setTestAddress] = useState('vitalik.eth');

  const testAlchemy = async () => {
    setLoading(true);
    try {
      // Test the Alchemy service with Vitalik's address
      const nftResult = await AlchemyService.getNFTsForOwner(testAddress);
      setResult(nftResult);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">🧪 Alchemy Test</h3>
      
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={testAddress}
          onChange={(e) => setTestAddress(e.target.value)}
          placeholder="Enter address or ENS (e.g., vitalik.eth)"
          className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
        />
        <button
          onClick={testAlchemy}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Alchemy'}
        </button>
      </div>

      {result && (
        <div className="bg-black/30 rounded-lg p-4">
          <pre className="text-green-400 text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AlchemyTest;
