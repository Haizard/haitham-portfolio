
'use server';
/**
 * @fileOverview Generates content ideas or outlines inspired by existing articles.
 *
 * - generateInspiredContent - A function that handles the content inspiration process.
 * - GenerateInspiredContentInput - The input type for the generateInspiredContent function.
 * - GenerateInspiredContentOutput - The return type for the generateInspiredContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema (remains the same)
const GenerateInspiredContentInputSchema = z.object({
  articleUrls: z.array(z.string().url({ message: "Please enter valid URLs." })).min(1, "Please provide at least one article URL."),
  targetTopic: z.string().optional().describe('The specific topic or angle the user wants to focus on for their new content.'),
  analysisMode: z.enum(['brainstormIdeas', 'synthesizeOutline']).describe('Whether to brainstorm new ideas or synthesize an outline for a new article.'),
});
export type GenerateInspiredContentInput = z.infer<typeof GenerateInspiredContentInputSchema>;

// Schemas for the actual output payloads from LLM (without analysisMode)
const BrainstormPayloadSchema = z.object({
  suggestedTopics: z.array(z.string()).describe('A list of suggested blog post topics or titles.'),
  keyThemes: z.array(z.string()).describe('A list of key themes identified from the source articles relevant to the target topic.'),
  introductionHook: z.string().describe('A catchy introduction hook for one of the suggested topics.'),
});

const SynthesizePayloadSchema = z.object({
  draftTitle: z.string().describe('A compelling draft title for the new, synthesized article.'),
  draftOutline: z.string().describe('A structured outline for the new article (e.g., using markdown for headings and bullet points).'),
  keyTalkingPoints: z.array(z.string()).describe('A list of key talking points to be covered in the new article.'),
  originalityStatement: z.string().describe('A brief statement on how the synthesized article offers a unique perspective or combines information in a novel way compared to the source articles.'),
});

// This is what the LLM will be asked to output directly
const LLMOutputSchema = z.union([BrainstormPayloadSchema, SynthesizePayloadSchema]);

// This is the final output type of the flow, which includes analysisMode (discriminated union)
export const GenerateInspiredContentOutputSchema = z.discriminatedUnion("analysisMode", [
  z.object({ analysisMode: z.literal('brainstormIdeas'), ...BrainstormPayloadSchema.shape }),
  z.object({ analysisMode: z.literal('synthesizeOutline'), ...SynthesizePayloadSchema.shape })
]);
export type GenerateInspiredContentOutput = z.infer<typeof GenerateInspiredContentOutputSchema>;


export async function generateInspiredContent(input: GenerateInspiredContentInput): Promise<GenerateInspiredContentOutput> {
  return generateInspiredContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInspiredContentPrompt',
  input: {schema: GenerateInspiredContentInputSchema},
  output: {schema: LLMOutputSchema}, // Use the simpler union schema for the LLM's direct output
  prompt: `You are an expert content strategist and writer, skilled at analyzing existing content and generating fresh, original ideas and structured outlines.

You have been provided with content from the following article URLs:
{{#each articleUrls}}
- {{{this}}}
{{/each}}

The user wants to use these as inspiration. Their specific goal is: {{analysisMode}}.
{{#if targetTopic}}
Their desired target topic or angle for the new content is: "{{{targetTopic}}}"
{{else}}
They have not specified a particular target topic, so focus on the general themes from the articles.
{{/if}}

IMPORTANT: You are NOT to directly copy or plagiarize content from the provided URLs. Your goal is to provide inspiration and structure for NEW, ORIGINAL content.
Do NOT include the 'analysisMode' field in your direct JSON output. It will be added later.

Based on the user's selected 'analysisMode' (which is '{{analysisMode}}'), perform ONE of the following tasks:

IF '{{analysisMode}}' is 'brainstormIdeas':
  - Analyze the themes, topics, and potential gaps in the provided article(s).
  {{#if targetTopic}}
  - Generate 5-7 unique and engaging blog post titles or topics that are inspired by the source articles AND align with or expand upon the user's target topic: "{{targetTopic}}".
  {{else}}
  - Generate 5-7 unique and engaging blog post titles or topics that are inspired by the source articles.
  {{/if}}
  - Identify 3-5 key themes or concepts from the source articles that are relevant to the generated topics.
  - Provide one catchy introduction hook (1-2 sentences) for one of the suggested topics.
  - Structure your output according to the 'BrainstormPayloadSchema' (fields: suggestedTopics, keyThemes, introductionHook).

IF '{{analysisMode}}' is 'synthesizeOutline':
  - Synthesize the information from the provided article(s) to create a comprehensive outline for a NEW, ORIGINAL blog post.
  {{#if targetTopic}}
  - This new post should focus on the user's target topic: "{{targetTopic}}", drawing inspiration and information selectively from the sources.
  {{else}}
  - This new post should synthesize key information from the sources into a cohesive new narrative or argument.
  {{/if}}
  - Create a compelling draft title for this new article.
  - Develop a structured outline (use markdown for headings #, ##, ### and bullet points - or *) for the new article. The outline should be detailed enough to guide the writing process.
  - List 3-5 key talking points that should be emphasized in the new article.
  - Write a brief originality statement (1-2 sentences) explaining how this synthesized article will offer a unique perspective, a novel combination of information, or address a gap not fully covered by the sources.
  - Structure your output according to the 'SynthesizePayloadSchema' (fields: draftTitle, draftOutline, keyTalkingPoints, originalityStatement).

Ensure your output strictly matches the required Zod schema for the chosen 'analysisMode' (either BrainstormPayloadSchema or SynthesizePayloadSchema from above).
Do NOT include the 'analysisMode' field in your direct JSON output.
`,
});

const generateInspiredContentFlow = ai.defineFlow(
  {
    name: 'generateInspiredContentFlow',
    inputSchema: GenerateInspiredContentInputSchema,
    outputSchema: GenerateInspiredContentOutputSchema, // Flow's final output is the full discriminated union
  },
  async (input: GenerateInspiredContentInput): Promise<GenerateInspiredContentOutput> => {
    const {output: llmOutput} = await prompt(input); // llmOutput is BrainstormPayloadSchema | SynthesizePayloadSchema | undefined

    if (!llmOutput) {
        throw new Error("AI failed to generate inspired content.");
    }

    if (input.analysisMode === 'brainstormIdeas') {
      // Validate llmOutput against BrainstormPayloadSchema before creating the final object
      const brainstormData = BrainstormPayloadSchema.parse(llmOutput);
      return {
        analysisMode: 'brainstormIdeas',
        ...brainstormData
      };
    } else { // analysisMode is 'synthesizeOutline'
      // Validate llmOutput against SynthesizePayloadSchema
      const synthesizeData = SynthesizePayloadSchema.parse(llmOutput);
      return {
        analysisMode: 'synthesizeOutline',
        ...synthesizeData
      };
    }
  }
);

