
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
// DO NOT EXPORT THE SCHEMA OBJECT ITSELF
const GenerateInspiredContentOutputSchemaInternal = z.discriminatedUnion("analysisMode", [
  z.object({ analysisMode: z.literal('brainstormIdeas'), ...BrainstormPayloadSchema.shape }),
  z.object({ analysisMode: z.literal('synthesizeOutline'), ...SynthesizePayloadSchema.shape })
]);
export type GenerateInspiredContentOutput = z.infer<typeof GenerateInspiredContentOutputSchemaInternal>;


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

The user's selected 'analysisMode' is '{{analysisMode}}'.
{{#if targetTopic}}
Their desired target topic or angle for the new content is: "{{{targetTopic}}}"
{{else}}
They have not specified a particular target topic, so focus on the general themes from the articles.
{{/if}}

IMPORTANT: You are NOT to directly copy or plagiarize content from the provided URLs. Your goal is to provide inspiration and structure for NEW, ORIGINAL content.
Your output MUST be a single JSON object. Do NOT include the 'analysisMode' field in this JSON output.

Your task is to generate a JSON object. The specific fields in this JSON object depend on the user's 'analysisMode'.

IF '{{analysisMode}}' is 'brainstormIdeas':
  Your JSON output MUST EXACTLY match the structure for 'brainstormIdeas' and include ALL of the following keys:
  1.  "suggestedTopics": An array of 5-7 unique and engaging blog post titles or topics. These should be inspired by the source articles. {{#if targetTopic}}They MUST also align with or expand upon the user's target topic: "{{targetTopic}}".{{/if}}
  2.  "keyThemes": An array of 3-5 key themes or concepts identified from the source articles that are relevant to the generated topics.
  3.  "introductionHook": A string containing one catchy introduction hook (1-2 sentences) for one of the suggested topics.

  Example JSON structure for brainstormIdeas (ensure all fields are present):
  {
    "suggestedTopics": ["Topic Example 1", "Another Great Topic Idea", "More Inspiration Here"],
    "keyThemes": ["Core Concept A", "Important Theme B", "Key Insight C"],
    "introductionHook": "Imagine a world where insightful content is just a click away..."
  }
  Make sure your JSON output for 'brainstormIdeas' precisely follows this structure.

ELSE IF '{{analysisMode}}' is 'synthesizeOutline':
  Your JSON output MUST EXACTLY match the structure for 'synthesizeOutline' and include ALL of the following keys:
  1.  "draftTitle": A string containing a compelling draft title for the new, synthesized article. {{#if targetTopic}}This new post should focus on the user's target topic: "{{targetTopic}}", drawing inspiration and information selectively from the sources.{{else}}This new post should synthesize key information from the sources into a cohesive new narrative or argument.{{/if}}
  2.  "draftOutline": A string containing a detailed, structured outline (use markdown for headings like #, ##, ### and bullet points like - or *) for the new article.
  3.  "keyTalkingPoints": An array of 3-5 key talking points that should be emphasized in the new article.
  4.  "originalityStatement": A string (1-2 sentences) explaining how this synthesized article will offer a unique perspective, a novel combination of information, or address a gap not fully covered by the sources.

  Example JSON structure for synthesizeOutline (ensure all fields are present):
  {
    "draftTitle": "My New Synthesized Article Title on {{{targetTopic}}}",
    "draftOutline": "# Introduction\\n## Main Point 1\\n- Subpoint a\\n- Subpoint b\\n# Deeper Dive into {{{targetTopic}}}\\n## Angle X\\n# Conclusion",
    "keyTalkingPoints": ["Key Takeaway 1 Regarding {{{targetTopic}}}", "Essential Argument 2", "Novel Perspective on Source Material"],
    "originalityStatement": "This article offers a novel synthesis by combining insights from provided sources to specifically address {{{targetTopic}}}."
  }
  Make sure your JSON output for 'synthesizeOutline' precisely follows this structure.

END IF

CRITICAL REMINDER: Based on the 'analysisMode' of '{{analysisMode}}', ensure your output is a single JSON object that strictly adheres to ONE of the structures described above and includes ALL specified fields for that structure. Do not add any extra text before or after the JSON object.
`,
});

const generateInspiredContentFlow = ai.defineFlow(
  {
    name: 'generateInspiredContentFlow',
    inputSchema: GenerateInspiredContentInputSchema,
    outputSchema: GenerateInspiredContentOutputSchemaInternal, // Flow's final output is the full discriminated union
  },
  async (input: GenerateInspiredContentInput): Promise<GenerateInspiredContentOutput> => {
    const {output: llmOutput} = await prompt(input); // llmOutput is BrainstormPayloadSchema | SynthesizePayloadSchema | undefined

    if (!llmOutput) {
        throw new Error("AI failed to generate inspired content. The output was empty.");
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

