import { analyze } from './httpAnalyzer';

export type AnalyzerConfig = {
  rules: any;
  failOnFirst?: boolean;
  showFullResult?: boolean;
};

export interface ValidationRequest {
    path: string;
    method: string;
    headers?: any;
    query?: any;
    body?: any;
  }

export { analyze };
