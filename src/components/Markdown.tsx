import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Markdown 渲染(服务端/客户端通用;不开 raw HTML,杜绝 XSS 面)。
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
