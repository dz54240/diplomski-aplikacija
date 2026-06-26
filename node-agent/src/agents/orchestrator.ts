import { generateObject } from 'ai';
import { z } from 'zod';
import { ROUTING_MODEL } from '../lib/ai-model.js';
import { logger } from '../lib/logger.js';

export type AgentLabel = 'qa' | 'quiz' | 'tutor';

const RoutingSchema = z.object({
  agent: z.enum(['qa', 'quiz', 'tutor']),
});

const ROUTING_SYSTEM = `You classify a student's chat message into one of three intents:
- "qa": question about course material that needs an answer with citations (default for any factual / explanatory question)
- "quiz": user wants to generate a quiz / practice questions / MCQs
- "tutor": user wants an explanation of why a previously-answered quiz question was wrong, or asks for pedagogical breakdown of a mistake

If unsure, choose "qa". Respond ONLY with the JSON object {"agent": "<label>"}.`;

export async function routeMessage(userMessage: string): Promise<{ agent: AgentLabel }> {
  try {
    const { object } = await generateObject({
      model: ROUTING_MODEL,
      schema: RoutingSchema,
      system: ROUTING_SYSTEM,
      prompt: userMessage,
    });
    return { agent: object.agent };
  } catch (e) {
    logger.warn({ err: e }, 'orchestrator routing failed, defaulting to qa');
    return { agent: 'qa' };
  }
}
