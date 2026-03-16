import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { analyzeUtilityData } from "@/inngest/functions";

console.log('Inngest Route - Loaded at /inngest-endpoint');

console.log('Inngest Route - Initializing');

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    analyzeUtilityData,
  ],
});
