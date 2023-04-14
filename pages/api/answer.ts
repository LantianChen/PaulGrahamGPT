import { OpenAIStream } from "@/utils";

export const config = {
    runtime: "edge"
  };
  
const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt } = (await req.json()) as {prompt: string};
    console.log("this step has succeeded: " + prompt);

    const stream = await OpenAIStream(prompt);

    return new Response(stream, {status: 200});

  } catch (e) {
    return new Response("Error is here", { status: 500 });
  }
};

export default handler;