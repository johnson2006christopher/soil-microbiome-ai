import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createFarm, updateFarm } from '../api/farms';

const EMPTY = { name: '', location: '', region: '', sizeHa: '', cropType: 'TOMATO' };

// Create a farm, or edit `farm` when one is passed. Calls onSaved(savedFarm).
export default function FarmModal({ farm, onClose, onSaved }) {
  const [form, setForm] = useState(
    farm
      ? { name: farm.name, location: farm.location, region: farm.region || '', sizeHa: farm.sizeHa ?? '', cropType: farm.cropType }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = farm ? await updateFarm(farm.id, form) : await createFarm(form);
      toast.success(farm ? 'Farm updated' : 'Farm created');
      onSaved(saved);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save farm');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">{farm ? 'Edit Farm' : 'New Farm'}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
          <input value={form.name} onChange={set('name')} className={inputClass} placeholder="e.g. Kilimanjaro Tomato Farm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input value={form.location} onChange={set('location')} className={inputClass} placeholder="e.g. Moshi, Tanzania" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region <span className="text-gray-400">(optional)</span></label>
            <input value={form.region} onChange={set('region')} className={inputClass} placeholder="e.g. Kilimanjaro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size (ha) <span className="text-gray-400">(optional)</span></label>
            <input type="number" step="0.1" min="0.1" value={form.sizeHa} onChange={set('sizeHa')} className={inputClass} placeholder="e.g. 2.5" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Main Crop</label>
          <select value={form.cropType} onChange={set('cropType')} className={inputClass}>
            <option value="TOMATO">Tomato</option>
            <option value="CORN">Corn (maize)</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 disabled:opacity-60">
            {saving ? 'Saving...' : farm ? 'Save' : 'Create Farm'}
          </button>
        </div>
      </form>
    </div>
  );
}
