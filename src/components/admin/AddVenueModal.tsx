import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { ScoutedVenue } from '../../types';

interface AddVenueModalProps {
  onClose: () => void;
  onSaveVenue: (venue: ScoutedVenue) => void;
  existingVenue?: ScoutedVenue | null;
}

export const AddVenueModal: React.FC<AddVenueModalProps> = ({
  onClose,
  onSaveVenue,
  existingVenue,
}) => {
  const [name, setName] = useState(existingVenue?.name || '');
  const [tentativeDate, setTentativeDate] = useState(existingVenue?.tentativeDate || '');
  const [address, setAddress] = useState(existingVenue?.address || '');
  const [quotedCost, setQuotedCost] = useState<string>(
    existingVenue?.quotedCost != null ? String(existingVenue.quotedCost) : ''
  );
  const [miscDetails, setMiscDetails] = useState(existingVenue?.miscDetails || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a venue name.');
      return;
    }
    let numCost: number | undefined;
    if (quotedCost.trim()) {
      numCost = parseFloat(quotedCost.replace(/,/g, ''));
      if (isNaN(numCost) || numCost < 0) {
        setError('Please provide a valid numeric quoted cost.');
        return;
      }
    }

    const venue: ScoutedVenue = {
      id: existingVenue ? existingVenue.id : `venue-${Date.now()}`,
      name: name.trim(),
      tentativeDate: tentativeDate.trim() || undefined,
      address: address.trim() || undefined,
      quotedCost: numCost,
      miscDetails: miscDetails.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveVenue(venue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-6 my-8">

        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-primary-container/20 text-on-primary-container flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-on-surface">
                {existingVenue ? 'Edit Scouted Venue' : 'Add Scouted Venue'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Committee-internal shortlist — not shown to attendees
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-xs font-medium rounded border border-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dusit Thani Manila (Grand Ballroom)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Tentative Date
              </label>
              <input
                type="text"
                placeholder="e.g. Saturday, April 24, 2027"
                value={tentativeDate}
                onChange={(e) => setTentativeDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Quoted Cost (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₱</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="140000"
                  value={quotedCost}
                  onChange={(e) => setQuotedCost(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. Ayala Center, San Lorenzo, Makati City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
              Miscellaneous Details <span className="text-outline font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Includes 5-hour rental, in-house catering minimum of 70 pax, free parking for 30 cars."
              value={miscDetails}
              onChange={(e) => setMiscDetails(e.target.value)}
              className="w-full p-3 rounded border border-secondary/30 text-xs text-on-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded border border-secondary/30 text-on-surface-variant text-xs font-semibold hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary text-xs font-bold shadow-soft"
            >
              {existingVenue ? 'Save Changes' : 'Add to Shortlist'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
