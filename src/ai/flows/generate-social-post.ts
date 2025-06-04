// src/ai/flows/generate-social-post.ts
'use server';

/**
 * @fileOverview Generates unique social media posts tailored for different platforms from a single content idea.
 *
 * - generateSocialPost - A function that generates social media posts.
 * - GenerateSocialPostInput - The input type for the generateSocialPost function.
 * - GenerateSocialPostOutput - The return type for the generateSocialPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialPostInputSchema = z.object({
  contentIdea: z.string().describe('The main idea or topic for the social media posts.'),
  platforms: z
    .array(
      z.enum(['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok']).describe('The social media platforms to tailor the posts for.')
    )
    .describe('The social media platforms for which to generate posts.'),
});
export type GenerateSocialPostInput = z.infer<typeof GenerateSocialPostInputSchema>;

const GenerateSocialPostOutputSchema = z.object({
  posts: z.array(
    z.object({
      platform: z.enum(['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok']),
      post: z.string().describe('The generated social media post for the specified platform.'),
    })
  ).describe('The generated social media posts tailored for each platform.'),
});

export type GenerateSocialPostOutput = z.infer<typeof GenerateSocialPostOutputSchema>;

export async function generateSocialPost(input: GenerateSocialPostInput): Promise<GenerateSocialPostOutput> {
  return generateSocialPostFlow(input);
}

const generateSocialPostPrompt = ai.definePrompt({
  name: 'generateSocialPostPrompt',
  input: {
    schema: GenerateSocialPostInputSchema,
  },
  output: {
    schema: GenerateSocialPostOutputSchema,
  },
  prompt: `You are a social media expert. You will generate unique social media posts tailored for different platforms from a single content idea.

Content Idea: {{{contentIdea}}}

Platforms: {{#each platforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Generate a unique social media post for each platform.

Output the posts in JSON format:
{
  "posts": [
    {
      "platform": "Facebook",
      "post": "The generated Facebook post."
    },
    {
      "platform": "Twitter",
      "post": "The generated Twitter post."
    },
    {
      "platform": "Instagram",
      "post": "The generated Instagram post."
    },
    {
      "platform": "LinkedIn",
      "post": "The generated LinkedIn post."
    },
    {
      "platform": "TikTok",
      "post": "The generated TikTok post."
    }
  ]
}
`,
});

const generateSocialPostFlow = ai.defineFlow(
  {
    name: 'generateSocialPostFlow',
    inputSchema: GenerateSocialPostInputSchema,
    outputSchema: GenerateSocialPostOutputSchema,
  },
  async input => {
    const {output} = await generateSocialPostPrompt(input);
    return output!;
  }
);
