'use server';

/**
 * @fileOverview Extracts and summarizes key decisions from a meeting transcript.
 *
 * - extractKeyDecisions - A function that extracts key decisions from a meeting transcript.
 * - ExtractKeyDecisionsInput - The input type for the extractKeyDecisions function.
 * - ExtractKeyDecisionsOutput - The return type for the extractKeyDecisions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyDecisionsInputSchema = z.object({
  transcript: z.string().describe('The transcript of the meeting.'),
  instructions: z
    .string()
    .optional()
    .describe('Custom instructions for the AI.'),
});
export type ExtractKeyDecisionsInput = z.infer<typeof ExtractKeyDecisionsInputSchema>;

const ExtractKeyDecisionsOutputSchema = z.object({
  keyDecisions: z
    .array(z.string())
    .describe('A list of key decisions made during the meeting.'),
  summary: z.string().describe('A summary of the key decisions.'),
});
export type ExtractKeyDecisionsOutput = z.infer<typeof ExtractKeyDecisionsOutputSchema>;

export async function extractKeyDecisions(input: ExtractKeyDecisionsInput): Promise<ExtractKeyDecisionsOutput> {
  return extractKeyDecisionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeyDecisionsPrompt',
  input: {schema: ExtractKeyDecisionsInputSchema},
  output: {schema: ExtractKeyDecisionsOutputSchema},
  prompt: `You are an AI assistant tasked with extracting key decisions from meeting transcripts.

  Analyze the following transcript and identify the key decisions made during the meeting.
  Provide a list of the decisions and a brief summary.

  {{#if instructions}}
  Follow these special instructions: {{{instructions}}}
  {{/if}}

  Transcript: {{{transcript}}}

  Format the output as a JSON object with 'keyDecisions' (an array of strings) and 'summary' (a string).
  Make sure the output matches the schema exactly.
  `,
});

const extractKeyDecisionsFlow = ai.defineFlow(
  {
    name: 'extractKeyDecisionsFlow',
    inputSchema: ExtractKeyDecisionsInputSchema,
    outputSchema: ExtractKeyDecisionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
