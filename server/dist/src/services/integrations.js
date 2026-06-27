"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationProvider = exports.HttpIntegrationProvider = exports.MockIntegrationProvider = void 0;
class MockIntegrationProvider {
    async verifyAadhaar() {
        return { verified: false, provider: 'mock', message: 'Aadhaar integration not configured' };
    }
    async verifyPan() {
        return { verified: false, provider: 'mock', message: 'PAN integration not configured' };
    }
    async verifyBank() {
        return { verified: false, provider: 'mock', message: 'Bank verification not configured' };
    }
    async getStatus(data) {
        return {
            currentStatus: 'PENDING',
            history: [
                { status: 'SUBMITTED', at: new Date(Date.now() - 86400000).toISOString(), source: 'mock' },
                { status: 'PENDING', at: new Date().toISOString(), source: 'mock', details: 'Under review' }
            ],
            source: 'mock'
        };
    }
}
exports.MockIntegrationProvider = MockIntegrationProvider;
class HttpIntegrationProvider {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    async verifyAadhaar(data) {
        return { verified: false, provider: 'official-http', message: 'Not implemented' };
    }
    async verifyPan(data) {
        return { verified: false, provider: 'official-http', message: 'Not implemented' };
    }
    async verifyBank(data) {
        return { verified: false, provider: 'official-http', message: 'Not implemented' };
    }
    async getStatus(data) {
        const resp = await fetch(`${this.baseUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey ? { 'x-api-key': this.apiKey } : {})
            },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            throw new Error(`Official status provider error: ${resp.status}`);
        }
        return resp.json();
    }
}
exports.HttpIntegrationProvider = HttpIntegrationProvider;
exports.integrationProvider = process.env.OFFICIAL_STATUS_ENDPOINT
    ? new HttpIntegrationProvider(process.env.OFFICIAL_STATUS_ENDPOINT, process.env.OFFICIAL_STATUS_API_KEY)
    : new MockIntegrationProvider();
