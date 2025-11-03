'use server';

/**
 * @fileOverview A log problem detection AI agent.
 *
 * - detectLogProblem - A function that handles the log problem detection process.
 * - DetectLogProblemInput - The input type for the detectLogProblem function.
 * - DetectLogProblemOutput - The return type for the detectLogProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectLogProblemInputSchema = z.object({
  logs: z.string().describe('The logs to analyze.'),
});
export type DetectLogProblemInput = z.infer<typeof DetectLogProblemInputSchema>;

const DetectLogProblemOutputSchema = z.object({
  problemDetected: z.boolean().describe('Whether or not a problem was detected.'),
  problemDescription: z.string().describe('The description of the problem, if any.'),
  suggestedSolutions: z.string().describe('Suggested solutions to the problem, if any.'),
});
export type DetectLogProblemOutput = z.infer<typeof DetectLogProblemOutputSchema>;

export async function detectLogProblem(input: DetectLogProblemInput): Promise<DetectLogProblemOutput> {
  return detectLogProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLogProblemPrompt',
  input: {schema: DetectLogProblemInputSchema},
  output: {schema: DetectLogProblemOutputSchema},
  prompt: `You are an expert network administrator specializing in detecting network problems from logs.

You will analyze the logs and determine if there is a problem or anomaly. If a problem is detected, you will provide a description of the problem and suggest solutions.

Logs:
{{logs}}`,
});

const detectLogProblemFlow = ai.defineFlow(
  {
    name: 'detectLogProblemFlow',
    inputSchema: DetectLogProblemInputSchema,
    outputSchema: DetectLogProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);