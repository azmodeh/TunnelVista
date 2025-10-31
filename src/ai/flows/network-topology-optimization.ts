'use server';

/**
 * @fileOverview A network topology optimization AI agent that takes the current state.
 *
 * - optimizeNetworkTopology - A function that handles the network topology analysis and suggestion process.
 * - OptimizeNetworkTopologyInput - The input type for the optimizeNetworkTopology function.
 * - OptimizeNetworkTopologyOutput - The return type for the optimizeNetworkTopology function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeNetworkTopologyInputSchema = z.object({
  currentTopology: z
    .string()
    .describe('A JSON string representing the current network state, including devices and tunnels.'),
  optimizationGoals: z
    .string()
    .describe('Specific goals for network optimization, such as reducing latency, increasing bandwidth, or improving reliability.'),
});
export type OptimizeNetworkTopologyInput = z.infer<
  typeof OptimizeNetworkTopologyInputSchema
>;

const OptimizeNetworkTopologyOutputSchema = z.object({
  analysis: z.string().describe('AI analysis of the current network topology, identifying bottlenecks and inefficiencies.'),
  suggestions: z
    .string()
    .describe('Actionable, step-by-step suggestions for optimizing the network topology. This could include adding/removing tunnels or changing protocols.'),
});
export type OptimizeNetworkTopologyOutput = z.infer<
  typeof OptimizeNetworkTopologyOutputSchema
>;

export async function optimizeNetworkTopology(
  input: OptimizeNetworkTopologyInput
): Promise<OptimizeNetworkTopologyOutput> {
  return optimizeNetworkTopologyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeNetworkTopologyPrompt',
  input: {schema: OptimizeNetworkTopologyInputSchema},
  output: {schema: OptimizeNetworkTopologyOutputSchema},
  prompt: `You are an expert network architect specializing in optimizing complex global networks. Your task is to analyze the provided network topology and user goals to provide a clear, concise, and actionable optimization plan.

Analyze the current network topology, performance metrics, and optimization goals to provide actionable suggestions for improving network efficiency and reducing latency.

Current Network Topology (JSON):
\`\`\`json
{{{currentTopology}}}
\`\`\`

User's Optimization Goals:
"{{{optimizationGoals}}}"

Based on the data, provide:
1.  **Analysis:** A brief analysis of the current network state. Identify potential bottlenecks, single points of failure, or inefficient routes based on the user's goals.
2.  **Suggestions:** Provide a clear, step-by-step list of suggested changes. For example: "1. Create a new WireGuard tunnel between 'DE-FRA' and 'US-NY' to create a direct path." or "2. Remove the IPIP tunnel between 'IR-TEH' and 'US-NY' as it has high latency."
`,
});

const optimizeNetworkTopologyFlow = ai.defineFlow(
  {
    name: 'optimizeNetworkTopologyFlow',
    inputSchema: OptimizeNetworkTopologyInputSchema,
    outputSchema: OptimizeNetworkTopologyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
