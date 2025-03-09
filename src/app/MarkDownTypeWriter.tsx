import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Typewriter from "./TypeWriter";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import DynamicComponent from "@/components/MadabinaUI/DynamicTable";

interface SequentialMarkdownTypewriterProps {
  content: string; // Markdown content
  delay?: number; // Delay between blocks
  duration?: number; // Duration of each block's animation
}

const SequentialMarkdownTypewriter: React.FC<
  SequentialMarkdownTypewriterProps
> = ({ content, delay = 0.5, duration = 1 }) => {
  // Split the content into blocks (paragraphs, headings, code blocks, etc.)
  const blocks = content.split("\n");
  console.log("blocks", blocks);

  return (
    <div>
      {blocks.map((block, index) => (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]} // Render math with KaTeX
          components={{
            p: ({ node, ...props }) => (
              <Typewriter delay={index * delay} duration={duration}>
                <p className="mb-4">{props.children}</p>
              </Typewriter>
            ),
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
