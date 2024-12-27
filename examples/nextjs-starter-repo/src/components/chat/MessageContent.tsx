'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Image as ImageIcon, FileText, Code, Link as LinkIcon } from 'lucide-react';
import { MessageContent as MessageContentType } from '../../types/chat';

interface MessageContentProps {
  content: MessageContentType;
}

export default function MessageContent({ content }: MessageContentProps) {

  const convertMsg = (msg: string) => {
    let content = msg.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    content = content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");
    content = `<p>${content}</p>`;
    return content;
  };

  if (typeof content === 'string') {
    return <p dangerouslySetInnerHTML={{ __html: convertMsg(content) }} />
  }

  switch (content.type) {
    case 'image':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon size={16} />
            <span>Image</span>
          </div>
          <img 
            src={content.url} 
            alt={content.alt || 'Shared image'} 
            className="rounded-lg max-w-md max-h-96 object-contain"
          />
        </div>
      );
    case 'code':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code size={16} />
              <span>{content.language}</span>
            </div>
          </div>
          <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
            <code>{content.code}</code>
          </pre>
        </div>
      );
    case 'file':
      return (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg max-w-sm">
          <FileText className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{content.name}</p>
            <p className="text-xs text-muted-foreground">{content.size}</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}