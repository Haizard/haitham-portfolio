
'use server';

/**
 * @fileOverview Generates a blog post based on a topic, SEO keywords, and brand voice.
 *
 * - generateBlogPost - A function that handles the blog post generation process.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic of the blog post.'),
  seoKeywords: z.string().describe('SEO keywords to incorporate into the blog post.'),
  brandVoice: z.string().describe('The brand voice to use for the blog post.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  content: z.string().describe('The generated blog post content, formatted in HTML (e.g., using <p>, <h2>, <ul>, <li> tags).'),
  reasoning: z.string().describe('The reasoning for incorporating or not incorporating the SEO keywords.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert blog post writer, skilled at creating engaging and SEO-optimized content in HTML format.

You will generate a blog post based on the provided topic, SEO keywords, and brand voice.

First, reason whether or not you will incorporate the provided SEO keywords into the blog post. Explain your reasoning.

Then, write the blog post.

Topic: {{{topic}}}
SEO Keywords: {{{seoKeywords}}}
Brand Voice: {{{brandVoice}}}

Blog Post Title: (Provide a title for the blog post here)
Blog Post Content: (Write the blog post content here, ensuring it is formatted in HTML using tags like <p>, <h2>, <ul>, <li>, etc., for proper rendering on a webpage. For example: <p>This is a paragraph.</p><h2>This is a heading</h2><ul><li>Item 1</li><li>Item 2</li></ul>)
Reasoning: (Explain whether or not you incorporated the SEO keywords and why.)`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

