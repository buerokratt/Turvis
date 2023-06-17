export interface ValidationRequest {
    path: string;
    method: string;
    headers?: any;
    query?: any;
    body?: any;
  }

  export interface ValidationResult {
    status: 'success' | 'failure';
    details?: [];
  }