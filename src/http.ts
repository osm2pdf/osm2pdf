import rateLimit from 'axios-rate-limit';
import axios from 'axios';

export const getHttp = (rps: number) =>
  rps === 0 ? axios : rateLimit(axios, { maxRequests: 1, perMilliseconds: 1000 / rps });
