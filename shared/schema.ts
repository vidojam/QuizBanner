import { z } from "zod";

export const questionAnswerSchema = z.object({
  id: z.string(),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export const insertQuestionAnswerSchema = questionAnswerSchema.omit({ id: true });

export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
export type InsertQuestionAnswer = z.infer<typeof insertQuestionAnswerSchema>;
