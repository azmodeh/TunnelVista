'use server';

/**
 * @fileOverview A network topology optimization AI agent.
 *
 * - getNetworkTopologySuggestions - A function that handles the network topology analysis and suggestion process.
 * - GetNetworkTopologySuggestionsInput - The input type for the getNetworkTopologySuggestions function.
 * - GetNetworkTopologySuggestionsOutput - The return type for the getNetworkTopologySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetNetworkTopologySuggestionsInputSchema = z.object({
  networkTopologyDescription: z
    .string()
    .describe('Detailed description of the current network topology, including devices, connections, and configurations.'),
  performanceMetrics: z
    .string()
    .describe('Current network performance metrics, such as latency, bandwidth utilization, and error rates.'),
  optimizationGoals: z
    .string()
    .describe('Specific goals for network optimization, such as reducing latency, increasing bandwidth, or improving reliability.'),
});
export type GetNetworkTopologySuggestionsInput = z.infer<
  typeof GetNetworkTopologySuggestionsInputSchema
>;

const GetNetworkTopologySuggestionsOutputSchema = z.object({
  analysis: z.string().describe('AI analysis of the current network topology.'),
  suggestions: z
    .string()
    .describe('AI-driven suggestions for optimizing the network topology.'),
  predictedImprovements: z
    .string()
    .describe('Predicted improvements in network performance after applying the suggestions.'),
});
export type GetNetworkTopologySuggestionsOutput = z.infer<
  typeof GetNetworkTopologySuggestionsOutputSchema
>;

export async function getNetworkTopologySuggestions(
  input: GetNetworkTopologySuggestionsInput
): Promise<GetNetworkTopologySuggestionsOutput> {
  return getNetworkTopologySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'networkTopologySuggestionsPrompt',
  input: {schema: GetNetworkTopologySuggestionsInputSchema},
  output: {schema: GetNetworkTopologySuggestionsOutputSchema},
  prompt: `You are an expert network engineer specializing in network topology optimization. Analyze the current network topology, performance metrics, and optimization goals to provide actionable suggestions for improving network efficiency and reducing latency.\n\nCurrent Network Topology Description: {{{networkTopologyDescription}}}\n\nPerformance Metrics: {{{performanceMetrics}}}\n\nOptimization Goals: {{{optimizationGoals}}}\n\nProvide a detailed analysis of the current network topology, identify bottlenecks and inefficiencies, and suggest specific changes to the network topology, device configurations, or routing protocols.\n\nInclude predicted improvements in network performance after applying the suggestions.\n\nAnalysis: \nSuggestions: \nPredicted Improvements: `,
});

const getNetworkTopologySuggestionsFlow = ai.defineFlow(
  {
    name: 'getNetworkTopologySuggestionsFlow',
    inputSchema: GetNetworkTopologySuggestionsInputSchema,
    outputSchema: GetNetworkTopologySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);