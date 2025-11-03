'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/log-problem-detection.ts';
import '@/ai/flows/network-topology-suggestions.ts';
import '@/ai/flows/network-topology-optimization.ts';
import '@/ai/flows/ip-check-flow.ts';