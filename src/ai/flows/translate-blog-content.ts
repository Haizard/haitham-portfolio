
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
  targetLanguage: z.string().describe('The language to translate the content into (e.g., "Swahili", "Spanish", "French", "Japanese").'),
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
  prompt: `You are an expert multilingual translator specializing in translating complex HTML content while perfectly preserving all HTML tags, attributes, and overall structure.

Your task is to translate the following HTML content from '{{originalLanguage}}' to '{{targetLanguage}}'.

**Crucial Instructions:**
1.  **Preserve HTML Structure:** All HTML tags (e.g., \`<h1>\`, \`<h2>\`, \`<p>\`, \`<ul>\`, \`<li>\`, \`<a>\`, \`<strong>\`, \`<em>\`, \`<img>\`, \`<nav>\`, \`<div>\`) and their attributes (\`id\`, \`class\`, \`href\`, \`src\`, \`style\`, etc.) MUST remain completely unchanged.
2.  **Translate Text Content Only:** Only translate the text that appears between the HTML tags. Do not translate the tags themselves or any part of their attributes.
3.  **Do Not Translate URLs:** URLs in \`href\` or \`src\` attributes should not be translated. For example, if you see \`<a href="/blog/my-post">\`, keep it exactly as it is.
4.  **Handle Special Cases:**
    *   Do not translate content within \`<script>\` or \`<style>\` tags.
    *   Do not translate code snippets, especially those within \`<pre>\` or \`<code>\` tags.
    *   Pay close attention to text within attributes like \`alt\` or \`title\` and translate them appropriately without altering the attribute name.

**Example:**
*Original ('{{originalLanguage}}'):* \`<h2 id="section-one">Section One</h2><p>This is a paragraph with a <a href="/link">link</a>.</p>\`
*Translated to Swahili:* \`<h2 id="section-one">Sehemu ya Kwanza</h2><p>Hii ni aya yenye <a href="/link">kiungo</a>.</p>\`

**Content to Translate:**

**Original HTML Content (from {{originalLanguage}}):**
\`\`\`html
{{{htmlContent}}}
\`\`\`

Provide ONLY the fully translated HTML content in '{{targetLanguage}}' in the specified JSON output format.
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
