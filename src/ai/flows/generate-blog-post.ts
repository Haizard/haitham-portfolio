
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
  content: z.string().describe('The generated blog post content, formatted in HTML (e.g., including a table of contents, headings <h2 id="section-id">, paragraphs <p>, lists <ul><li>, etc.).'),
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
  prompt: `You are an expert blog post writer, skilled at creating comprehensive, engaging, well-structured, and SEO-optimized content in HTML format.

Your task is to generate a detailed blog post based on the provided topic, SEO keywords, and brand voice.

**Blog Post Structure Guidelines:**

1.  **Title**: Create a compelling title for the blog post.
2.  **Table of Contents (HTML)**:
    *   Generate an HTML table of contents (e.g., using \`<ul>\` and \`<li>\` tags) with clickable links (e.g., \`<a href="#section-id">Section Title</a>\`).
    *   Each main section heading in the content (e.g., \`<h2>\`) should have a corresponding entry in the table of contents.
    *   Ensure the \`href\` attributes in the table of contents match the \`id\` attributes of the corresponding section headings in the blog post content. For example, if a heading is \`<h2 id="why-this-matters">Why This Matters</h2>\`, the TOC link should be \`<a href="#why-this-matters">Why This Matters</a>\`. Use descriptive, URL-friendly IDs.
3.  **Content (HTML)**:
    *   The content should be well-organized with clear headings (e.g., \`<h2>\`, \`<h3>\`) for main topics and subtopics. Each \`<h2>\` heading must have a unique \`id\` attribute that matches a link in the table of contents.
    *   **Crucially, include dedicated sections that address the following aspects of the topic, each with its own clear heading (with an \`id\` for the TOC) and detailed content:**
        *   **Why this topic is important/relevant.** (e.g., \`<h2 id="why-topic-is-important">Why {{{topic}}} Matters</h2>\`)
        *   **When this topic is most applicable or timely.** (e.g., \`<h2 id="when-topic-is-applicable">When to Focus on {{{topic}}}</h2>\`)
        *   **The benefits or advantages for the reader.** (e.g., \`<h2 id="benefits-of-topic">Key Benefits of Exploring {{{topic}}}</h2>\`)
        *   **What is special or unique about this topic, or key takeaways for the user.** (e.g., \`<h2 id="unique-aspects-of-topic">What Makes {{{topic}}} Stand Out</h2>\`)
    *   Incorporate the provided SEO keywords naturally throughout the content.
    *   Use other HTML elements like paragraphs (\`<p>\`), lists (\`<ul>\`, \`<ol>\`, \`<li>\`), bold text (\`<strong>\` or \`<b>\`), and italics (\`<em>\` or \`<i>\`) where appropriate to enhance readability and structure.
    *   Ensure the overall content is comprehensive, genuinely helpful, and provides detailed information with multiple paragraphs per section.
4.  **SEO Keyword Reasoning**: After the blog post content, provide a brief explanation of how and why you incorporated (or chose not to incorporate) the SEO keywords.

**Input:**
Topic: \`{{{topic}}}\`
SEO Keywords: \`{{{seoKeywords}}}\`
Brand Voice: \`{{{brandVoice}}}\`

**Output Format (strictly follow for the 'output' schema):**

Blog Post Title: (Your generated title here)

Blog Post Content:
(Your fully generated HTML content here. Start with the Table of Contents \`<nav class="table-of-contents"><h2>Table of Contents</h2><ul><li><a href="#why-topic-is-important">...</a></li>...</ul></nav>\`. Then, include the detailed sections like \`<h2 id="why-topic-is-important">Why {{{topic}}} Matters</h2><p>Detailed content...</p>\` and so on for 'When', 'Benefits', and 'What's Special', ensuring all \`<h2>\` elements have \`id\` attributes that are linked from the TOC. Add other relevant sections as needed.)

Reasoning: (Your explanation about SEO keyword usage here)
`,
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

