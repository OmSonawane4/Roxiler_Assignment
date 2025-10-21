// Simple HTTP API client pointing to the Express backend
const BASE = 'http://localhost:5000/api';

export const httpApi = {
  async listStores() {
    const res = await fetch(`${BASE}/stores`);
    if (!res.ok) {
      let msg = 'Failed to fetch stores';
      try { const body = await res.json(); if (body?.message) msg = body.message } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
  async addStore(data) {
    const res = await fetch(`${BASE}/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let msg = 'Failed to add store';
      try { const body = await res.json(); if (body?.message) msg = body.message } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
  async deleteStore(id) {
    const res = await fetch(`${BASE}/stores/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let msg = 'Failed to delete store';
      try { const body = await res.json(); if (body?.message) msg = body.message } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
  async getUserRatingForStore(storeId, userId) {
    const res = await fetch(`${BASE}/stores/${storeId}/ratings?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      let msg = 'Failed to fetch user rating';
      try { const body = await res.json(); if (body?.message) msg = body.message } catch {}
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  },
  async upsertRating({ storeId, userId, rating, comment }) {
    const res = await fetch(`${BASE}/ratings/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: storeId, user_id: userId, rating, comment }),
    });
    if (!res.ok) {
      let msg = 'Failed to save rating';
      try { const body = await res.json(); if (body?.message) msg = body.message } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
};
