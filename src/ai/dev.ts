
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-blog-post.ts';
import '@/ai/flows/suggest-content-topics.ts';
import '@/ai/flows/generate-social-post.ts';
import '@/ai/flows/translate-blog-content.ts'; // Added this line
import '@/ai/flows/generate-inspired-content.ts';
import '@/ai/flows/generate-image-for-post.ts'; // Added this line

