
'use server';
/**
 * @fileOverview Generates an image for a blog post using AI.
 *
 * - generateImageForPost - A function that handles image generation.
 * - GenerateImageForPostInput - The input type for the function.
 * - GenerateImageForPostOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageForPostInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for image generation, typically the blog post title or topic.'),
});
export type GenerateImageForPostInput = z.infer<typeof GenerateImageForPostInputSchema>;

const GenerateImageForPostOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
  suggestedHint: z.string().describe('A suggested hint for the image, derived from the prompt (e.g., a couple of keywords).'),
});
export type GenerateImageForPostOutput = z.infer<typeof GenerateImageForPostOutputSchema>;

export async function generateImageForPost(input: GenerateImageForPostInput): Promise<GenerateImageForPostOutput> {
  return generateImageForPostFlow(input);
}

const generateImageForPostFlow = ai.defineFlow(
  {
    name: 'generateImageForPostFlow',
    inputSchema: GenerateImageForPostInputSchema,
    outputSchema: GenerateImageForPostOutputSchema,
  },
  async (input) => {
    const {media, textOutput} = await ai.generate({
      // IMPORTANT: Updated to the recommended model for image generation.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually appealing featured image suitable for a blog header. The blog post is about: "${input.prompt}". The image should be vibrant and relevant. Also, provide two keywords describing the image.`,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // MUST provide both TEXT and IMAGE
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate an image. No media URL returned.');
    }
    
    // Extract keywords from the textOutput if available, otherwise use the prompt
    let hint = input.prompt.split(' ').slice(0, 2).join(' '); // Default hint from prompt
    if (textOutput) {
        // Attempt to parse keywords from textOutput, assuming simple comma separation or just use it if short
        const potentialKeywords = textOutput.split(',').map(k => k.trim());
        if (potentialKeywords.length > 0 && potentialKeywords[0]) {
            hint = potentialKeywords.slice(0,2).join(' ');
        }
    }


    return {
      imageDataUri: media.url, // This will be a data URI like "data:image/png;base64,..."
      suggestedHint: hint,
    };
  }
);
