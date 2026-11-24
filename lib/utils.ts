import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}): string {
  const currentParams = new URLSearchParams(params);
  if (value) {
    currentParams.set(key, value);
  } else {
    currentParams.delete(key);
  }
  const queryString = currentParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function removeKeysFromUrlQuery({
  params,
  keysToRemove,
}: {
  params: string;
  keysToRemove: string[];
}): string {
  const currentParams = new URLSearchParams(params);
  for (const key of keysToRemove) {
    currentParams.delete(key);
  }
  const queryString = currentParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const getSubjectColor = (subject?: string) => {
  if (!subject) return "#E5D0FF";
  return subjectsColors[subject.toLowerCase() as keyof typeof subjectsColors] || "#E5D0FF";
};

export const configureAssistant = (
  voice: string,
  style: string,
  maxDurationSeconds?: number
) => {
  const voiceId =
    voices[voice as keyof typeof voices][
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "EXAVITQu4vr4xnSDxMaL";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Companion",
    firstMessage:
      "Hello, let's start the session. Today we'll be talking about {{topic}}.",
    // Vapi server-side maximum call duration guardrail (hard limit enforced by Vapi telephony)
    maxDurationSeconds: maxDurationSeconds ? Math.max(10, Math.floor(maxDurationSeconds)) : undefined,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 0.9,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.
  
                    Tutor Guidelines:
                    Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
                    Keep the conversation flowing smoothly while maintaining control.
                    From time to time make sure that the student is following you and understands you.
                    Break down the topic into smaller parts and teach the student one part at a time.
                    Keep your style of conversation {{ style }}.
                    Keep your responses short, like in a real voice conversation.
                    Do not include any special characters in your responses - this is a voice conversation.
              `,
        },
      ],
    },
  };
  return vapiAssistant;
};
