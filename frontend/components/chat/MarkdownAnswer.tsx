"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownAnswer({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-[15px] leading-[1.65] text-[#eee] [&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-[22px] [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-white [&_p]:mb-3 [&_strong]:font-semibold [&_a]:text-[#7db3ff] [&_a:hover]:underline [&_ul]:space-y-1.5 [&_ul]:pl-[22px] [&_ul]:list-disc [&_ol]:space-y-1.5 [&_ol]:pl-[22px] [&_ol]:list-decimal [&_blockquote]:border-l-2 [&_blockquote]:border-[#3a3a37] [&_blockquote]:pl-[14px] [&_blockquote]:text-[#a8a8a2] [&_code]:rounded-md [&_code]:bg-[#1f1f1e] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:border [&_pre]:border-[#3a3a37] [&_pre]:bg-[#1f1f1e] [&_pre]:p-[14px] [&_pre]:text-[13px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#3a3a37] [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-[#3a3a37] [&_td]:px-3 [&_td]:py-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
