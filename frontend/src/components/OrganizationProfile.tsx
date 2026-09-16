import React, { useState, useEffect } from 'react';
import { getMsmeProfile, updateMsmeProfile, MsmeProfile } from '../api';
import { Save, Loader2, Building, ShieldCheck, MapPin, Target } from 'lucide-react';

interface OrganizationProfileProps {
  organizationId: string;
}

export const OrganizationProfile: React.FC<OrganizationProfileProps> = ({ organizationId }) => {
  const [profile, setProfile] = useState<MsmeProfile>({
    organizationId,
    turnoverInCrores: 0,
    yearsOfExperience: 0,
    operatingLocations: [],
    coreCapabilities: []
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const data = await getMsmeProfile(organizationId);
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [organizationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'operatingLocations' | 'coreCapabilities') => {
    const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
    setProfile(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    const updated = await updateMsmeProfile(organizationId, profile);
    if (updated) {
      setProfile(updated);
      setMessage({ text: 'Profile successfully updated. Changes will apply to future AI evaluations.', type: 'success' });
    } else {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading organizational profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Procurement Profile</h1>
        <p className="text-gray-500 mt-1">This data powers the deterministic AI RuleEngine for tender matching.</p>
      </header>

      {message && (
        <div className={`p-4 mb-6 rounded border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        
        {/* Core Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <Building className="w-5 h-5 mr-2 text-indigo-500" /> Core Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Turnover (INR Crores)</label>
              <input
                type="number"
                name="turnoverInCrores"
                min="0"
                step="0.1"
                value={profile.turnoverInCrores || 0}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                min="0"
                value={profile.yearsOfExperience || 0}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Operational Context */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" /> Operational Context
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Locations (Comma separated)</label>
            <input
              type="text"
              defaultValue={profile.operatingLocations.join(', ')}
              onChange={(e) => handleArrayChange(e, 'operatingLocations')}
              placeholder="e.g., Bangalore, Karnataka, Maharashtra"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </section>

        {/* Capabilities */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <Target className="w-5 h-5 mr-2 text-indigo-500" /> Technical Capabilities
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Core Capabilities (Comma separated)</label>
            <input
              type="text"
              defaultValue={profile.coreCapabilities.join(', ')}
              onChange={(e) => handleArrayChange(e, 'coreCapabilities')}
              placeholder="e.g., Embedded Systems, AI Development, Network Hardware"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </section>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center transition ${
              saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};