import React, { useRef, ChangeEvent, Dispatch, SetStateAction, KeyboardEvent } from "react";

interface ExpandingTextAreaProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  disabled?: boolean;
  onEnter?: (text: string) => void;
}

const ExpandingTextArea: React.FC<ExpandingTextAreaProps> = ({
  text,
  setText,
  placeholder = "Type something...",
  onEnter,
  disabled,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);

    // Adjust the height of the textarea
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto"; // Reset height to auto for re-calculation
      textArea.style.height = `${Math.min(textArea.scrollHeight, 200)}px`; // Set height, capping at 200px
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey && onEnter) {
      e.preventDefault(); // Prevent default behavior of creating a new line
      onEnter(text);
      setText(""); // Optionally clear the text area after pressing Enter
    }
  };

  return (
    <textarea
      ref={textAreaRef}
      disabled={disabled}
      value={text}
      className="w-full min-h-14 max-h-40 overflow-auto resize-none p-2 text-sm outline-none text-indigo-700"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      />
  );
};

export default ExpandingTextArea;
