'use server';

/**
 * @fileOverview AI agent that generates a progress note for a task based on its recent history.
 *
 * - generateProgressNote - A function that generates the progress note.
 * - GenerateProgressNoteInput - The input type for the generateProgressNote function.
 * - GenerateProgressNoteOutput - The return type for the generateProgressNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProgressNoteInputSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  taskHistory: z.string().describe('The recent history of the task.'),
});
export type GenerateProgressNoteInput = z.infer<typeof GenerateProgressNoteInputSchema>;

const GenerateProgressNoteOutputSchema = z.object({
  progress: z.string().describe('A short, one-sentence summary of the progress.'),
});
export type GenerateProgressNoteOutput = z.infer<typeof GenerateProgressNoteOutputSchema>;

export async function generateProgressNote(input: GenerateProgressNoteInput): Promise<GenerateProgressNoteOutput> {
  return generateProgressNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProgressNotePrompt',
  input: {schema: GenerateProgressNoteInputSchema},
  output: {schema: GenerateProgressNoteOutputSchema},
  prompt: `You are an AI assistant helping to generate progress notes for tasks.

  Based on the task history provided, create a concise, one-sentence summary of the task's progress.

  Task Name: {{{taskName}}}
  Task History: {{{taskHistory}}}
  Progress Note: `,
});

const generateProgressNoteFlow = ai.defineFlow(
  {
    name: 'generateProgressNoteFlow',
    inputSchema: GenerateProgressNoteInputSchema,
    outputSchema: GenerateProgressNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
