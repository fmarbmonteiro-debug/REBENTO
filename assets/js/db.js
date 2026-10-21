const memory = new Map();

export const storage = {
  get(key) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.warn('Local storage is unavailable; using in-memory storage.', error);
    }
    return memory.get(key) ?? null;
  },

  set(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Could not persist data in local storage.', error);
    }
  },

  del(key) {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Could not remove data from local storage.', error);
    }
  }
};