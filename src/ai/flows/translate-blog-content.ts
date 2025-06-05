
'use server';
/**
 * @fileOverview Translates HTML blog content to a specified target language.
 *
 * - translateBlogContent - A function that handles the blog content translation.
 * - TranslateBlogContentInput - The input type for the translateBlogContent function.
 * - TranslateBlogContentOutput - The return type for the translateBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateBlogContentInputSchema = z.object({
  htmlContent: z.string().describe('The HTML content of the blog post to be translated.'),
  targetLanguage: z.string().describe('The language to translate the content into (e.g., "Spanish", "French", "Japanese").'),
  originalLanguage: z.string().describe('The original language of the content (e.g., "English").'),
});
export type TranslateBlogContentInput = z.infer<typeof TranslateBlogContentInputSchema>;

const TranslateBlogContentOutputSchema = z.object({
  translatedHtmlContent: z.string().describe('The translated HTML content, with HTML structure preserved.'),
});
export type TranslateBlogContentOutput = z.infer<typeof TranslateBlogContentOutputSchema>;

export async function translateBlogContent(input: TranslateBlogContentInput): Promise<TranslateBlogContentOutput> {
  return translateBlogContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateBlogContentPrompt',
  input: {schema: TranslateBlogContentInputSchema},
  output: {schema: TranslateBlogContentOutputSchema},
  prompt: `You are an expert multilingual translator specializing in translating HTML content while preserving all HTML tags and structure perfectly.

Translate the following HTML content from '{{originalLanguage}}' to '{{targetLanguage}}'.
It is crucial that all HTML tags (like <p>, <h2>, <ul>, <li>, <a>, <strong>, <em>, <img>, etc.), their attributes (like href, src, id, class, style, etc.), and the overall HTML structure remain unchanged. Only translate the textual content within the tags.

Do not add, remove, or alter any HTML tags or attributes.
Do not translate content within <script> or <style> tags if present.
Do not translate URLs or code snippets unless explicitly part of a sentence that needs translation.

Original HTML Content (from {{originalLanguage}}):
\`\`\`html
{{{htmlContent}}}
\`\`\`

Your task is to provide ONLY the translated HTML content in '{{targetLanguage}}'.
`,
});

const translateBlogContentFlow = ai.defineFlow(
  {
    name: 'translateBlogContentFlow',
    inputSchema: TranslateBlogContentInputSchema,
    outputSchema: TranslateBlogContentOutputSchema,
  },
  async (input: TranslateBlogContentInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to translate content. The output was empty.");
    }
    return output;
  }
);
