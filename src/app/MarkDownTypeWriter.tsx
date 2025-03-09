import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Typewriter from "./TypeWriter";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import DynamicComponent from "@/components/MadabinaUI/GenerateTable";
import GenerateTable from "@/components/MadabinaUI/GenerateTable";

interface SequentialMarkdownTypewriterProps {
  content: string; // Markdown content
  delay?: number; // Delay between blocks
  duration?: number; // Duration of each block's animation
  data?: any;
}

const SequentialMarkdownTypewriter: React.FC<
  SequentialMarkdownTypewriterProps
> = ({ content, delay = 0.5, duration = 1, data }) => {
  // Split the content into blocks (paragraphs, headings, code blocks, etc.)
  const blocks = content.split("\n");

  return (
    <div>
      {blocks.map((block, index) => (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]} // Render math with KaTeX
          components={{
            p: ({ node, ...props }) => {
              if (
                props.children &&
                typeof props.children === "string" &&
                props.children.startsWith("{{GenerateTable")
              ) {
                const match = props.children.match(
                  /\{\{GenerateTable\((.*?)\)\}\}/
                );
                if (!match) return;
                console.log(match);

                const args = match[1].replace(/(\w+):/g, '"$1":');
                console.log("args", args);
                const resolvedString = args.replace(
                  /data\.data_original/g,
                  JSON.stringify(data.data_original)
                );
                const parsedObject = JSON.parse(resolvedString);

                return (
                  <Typewriter delay={index * delay} duration={duration}>
                    <GenerateTable {...parsedObject} />
                  </Typewriter>
                );
              }
              return (
                <Typewriter delay={index * delay} duration={duration}>
                  <p className="mb-4">{props.children}</p>
                </Typewriter>
              );
            },
            h1: ({ node, ...props }) => (
              <Typewriter delay={index * delay} duration={duration}>
                <h1 className="font-bold text-3xl mb-6">{props.children}</h1>
              </Typewriter>
            ),
            h2: ({ node, ...props }) => (
              <Typewriter delay={index * delay} duration={duration}>
                <h2 className="font-3xl mb-5">{props.children}</h2>
              </Typewriter>
            ),
            code: ({ node, ...props }) => (
              <Typewriter delay={index * delay} duration={duration}>
                <code className="mb-4">{props.children}</code>
              </Typewriter>
            ),
            li: ({ node, ...props }) => (
              <Typewriter delay={index * delay} duration={duration}>
                <li className="mb-3">- {props.children}</li>
              </Typewriter>
            ),
            hr: (
              { node, ...props } // Horizontal rule
            ) => (
              <Typewriter delay={index * delay} duration={duration}>
                <hr className="border border-gray-600 my-6" />
              </Typewriter>
            ),
          }}
        >
          {block}
        </ReactMarkdown>
      ))}
    </div>
  );
};

export default SequentialMarkdownTypewriter;
