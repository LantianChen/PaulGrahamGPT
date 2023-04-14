import { PGChunk } from "@/types";
import Head from 'next/head';
import {useState} from "react";
import endent from "endent";

export default function Home() {
  const[query, setQuery] = useState("");
  const[answer, setAnswer] = useState("");
  const[chunks, setChunks] = useState<PGChunk[]>([]);
  const[loading, setLoading] = useState(false);


  const handleAnswer = async () => {


    setAnswer("");
    setChunks([]);
    
    setLoading(true);

    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query})
    });

    if (!searchResponse.ok) {
      setLoading(false);
      return;
    }

    const results: PGChunk[] = await searchResponse.json();
    setChunks(results);

    console.log(results);

    const prompt = endent`
    Use the following passages to answer the query: ${query}

    ${results.map((chunk) => chunk.content).join("\n")}
    `;

    console.log("okay prompt is here: ", prompt);

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if(!answerResponse.ok){
      setLoading(false);
      return;
    }

    const data = answerResponse.body;

    if (!data){
      return;
    }

    console.log("response data: ", data);
    console.log("answer before: ", answer);

    const reader = data?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done){
      const {value, done: doneReading} = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      // console.log("chunk value: ", chunkValue);

      setAnswer((prev) => prev + chunkValue);
    }

    console.log("answer after: ", answer);

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Paul Graham GPT</title>
        <meta name="description" content="AI Q&A on PG's essays" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className = "flex flex-col w-[350px]">

        <input
          className = "border border-gray-300 rounded-md p-2"
          type="text"
          placeholder="Ask Paul Graham a question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick = {handleAnswer}
        >
          Submit
        </button>

        <div className="mt-4">
          {
            loading
            ? <div> Loading...</div>
            : <div>
              {answer}
            </div>
          }
        </div>
      </div>
    </>
  );
}
