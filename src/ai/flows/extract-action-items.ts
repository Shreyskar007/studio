'use server';

/**
 * @fileOverview Extracts action items from meeting transcripts and assigns them to specific individuals with deadlines.
 *
 * - extractActionItems - A function that handles the extraction and assignment of action items.
 * - ExtractActionItemsInput - The input type for the extractActionItems function.
 * - ExtractActionItemsOutput - The return type for the extractActionItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractActionItemsInputSchema = z.object({
  transcript: z.string().describe('The transcript of the meeting.'),
  instructions: z
    .string()
    .optional()
    .describe('Custom instructions for the AI.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

const ExtractActionItemsOutputSchema = z.array(
  z.object({
    actionItem: z.string().describe('The action item.'),
    assignee: z.string().describe('The person responsible for the action item.'),
    deadline: z.string().describe('The deadline for the action item (ISO format).'),
  })
);
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  prompt: `You are an AI assistant tasked with extracting action items from meeting transcripts.

  Analyze the provided meeting transcript and identify clear, actionable tasks assigned to specific individuals with deadlines.
  Format the output as a JSON array where each object contains the action item, the assignee, and the deadline.

  {{#if instructions}}
  Follow these special instructions: {{{instructions}}}
  {{/if}}

  Transcript: {{{transcript}}}
  Output format: 
  [
    {
      "actionItem": "Description of the action item",
      "assignee": "Name of the person responsible",
      "deadline": "Deadline for the action item (ISO format)"
    }
  ]

  Make sure all the deadlines are written in ISO format.
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const extractActionItemsFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFlow',
    inputSchema: ExtractActionItemsInputSchema,
    outputSchema: ExtractActionItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
