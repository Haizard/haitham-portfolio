import { config } from 'dotenv';
config();

import '@/ai/flows/generate-blog-post.ts';
import '@/ai/flows/suggest-content-topics.ts';
import '@/ai/flows/generate-social-post.ts';