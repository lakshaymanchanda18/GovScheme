type VerificationResult = {
  verified: boolean;
  provider: string;
  message?: string;
};

export interface IntegrationProvider {
  verifyAadhaar: (data: any) => Promise<VerificationResult>;
  verifyPan: (data: any) => Promise<VerificationResult>;
  verifyBank: (data: any) => Promise<VerificationResult>;
  getStatus: (data: any) => Promise<{ currentStatus: string; history: Array<{ status: string; at: string; source: string; details?: string }>; source: string }>;
}

export class MockIntegrationProvider implements IntegrationProvider {
  async verifyAadhaar(): Promise<VerificationResult> {
    return { verified: false, provider: 'mock', message: 'Aadhaar integration not configured' };
  }

  async verifyPan(): Promise<VerificationResult> {
    return { verified: false, provider: 'mock', message: 'PAN integration not configured' };
  }

  async verifyBank(): Promise<VerificationResult> {
    return { verified: false, provider: 'mock', message: 'Bank verification not configured' };
  }

  async getStatus(data: any): Promise<any> {
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

export class HttpIntegrationProvider implements IntegrationProvider {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async verifyAadhaar(data: any): Promise<VerificationResult> {
    return { verified: false, provider: 'official-http', message: 'Not implemented' };
  }

  async verifyPan(data: any): Promise<VerificationResult> {
    return { verified: false, provider: 'official-http', message: 'Not implemented' };
  }

  async verifyBank(data: any): Promise<VerificationResult> {
    return { verified: false, provider: 'official-http', message: 'Not implemented' };
  }

  async getStatus(data: any) {
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

export const integrationProvider: IntegrationProvider =
  process.env.OFFICIAL_STATUS_ENDPOINT
    ? new HttpIntegrationProvider(process.env.OFFICIAL_STATUS_ENDPOINT, process.env.OFFICIAL_STATUS_API_KEY)
    : new MockIntegrationProvider();
