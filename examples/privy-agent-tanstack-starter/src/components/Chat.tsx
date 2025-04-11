import type { Attachment, UIMessage } from "ai";
import { useState } from "react";
import { MultimodalInput } from "./MultimodalInput";
import { Messages } from "./Messages";
import { useChat } from "~/hooks/useChat";

export function Chat({
  id,
  initialMessages,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  isReadonly: boolean;
}) {
  const {
    reload,
    status,
    handleSubmit,
    messages,
    setMessages,
    append,
    setInput,
    stop,
    input,
  } = useChat({
    id,
    initialMessages,
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <>
      <div className="flex flex-col min-w-0 min-h-[95vh] max-h-[95vh]">
        <Messages
          chatId={id}
          status={status}
          // @ts-expect-error
          messages={messages}
          setMessages={(v) => {
            if (typeof v === "function") {
              setMessages(v(messages));
              return;
            }
            setMessages(v);
          }}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={false}
        />
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              // @ts-expect-error
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              // @ts-expect-error
              messages={messages}
              setMessages={setMessages}
              // @ts-expect-error
              append={append}
            />
          )}
        </form>
      </div>
    </>
  );
}
