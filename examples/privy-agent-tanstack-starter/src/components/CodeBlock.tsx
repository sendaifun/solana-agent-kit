interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const match = /language-(\w+)/.test(className || "");
  if (match) {
    return (
      <pre
        {...props}
        className={`text-sm w-fit overflow-x-auto dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-700 rounded-sm dark:text-zinc-50 text-zinc-900`}
      >
        <code className="whitespace-pre-wrap break-words">{children}</code>
      </pre>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
