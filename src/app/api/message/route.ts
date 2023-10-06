import { db } from "@/db";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { NextResponse } from "next/server";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { openai } from "@/lib/openai";

import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(request: Request) {
  const body = await request.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();

  const { id: userId } = user;

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { fileId, message } = sendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: userId,
    },
  });

  if (!file) return new NextResponse("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId: userId,
      fileId: fileId,
    },
  });

  // vectorize the incomming message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const pineconeIndex = pinecone.Index("pdf-index");
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((messsage) => ({
    role: messsage.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: messsage.text,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
          \n----------------\n
          
          PREVIOUS CONVERSATION:
          ${formattedPrevMessages.map((message) => {
            if (message.role === "user") return `User: ${message.content}\n`;
            return `Assistant: ${message.content}\n`;
          })}
          
          \n----------------\n
          
          CONTEXT:
          ${results.map((r) => r.pageContent).join("\n\n")}
          
          USER INPUT: ${message}`,
      },
    ],
  });

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          userId: userId,
          fileId: fileId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
}
