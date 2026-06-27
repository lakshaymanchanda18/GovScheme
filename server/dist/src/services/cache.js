"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheClear = exports.cacheSet = exports.cacheGet = void 0;
const store = new Map();
const cacheGet = (key) => {
    const entry = store.get(key);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
};
exports.cacheGet = cacheGet;
const cacheSet = (key, value, ttlMs) => {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
};
exports.cacheSet = cacheSet;
const cacheClear = (prefix) => {
    if (!prefix) {
        store.clear();
        return;
    }
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
            store.delete(key);
        }
    }
};
exports.cacheClear = cacheClear;
