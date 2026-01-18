"use client";

import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic, List, ListOrdered, Type } from "lucide-react";

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function WYSIWYGEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  minHeight = "200px",
}: WYSIWYGEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleChange();
  };

  const handleInput = () => {
    handleChange();
  };

  const buttonClass =
    "p-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 active:bg-gray-200";

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className={buttonClass}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className={buttonClass}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className={buttonClass}
          title="Underline (Ctrl+U)"
        >
          <u className="text-sm font-bold">U</u>
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className={buttonClass}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className={buttonClass}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <select
          onChange={(e) => {
            if (e.target.value) {
              executeCommand("formatBlock", `<${e.target.value}>`);
              e.target.value = "";
            }
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className={buttonClass}
          title="Clear Formatting"
        >
          <Type size={18} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight,
          outline: isFocused ? "2px solid #10b981" : "none",
          outlineOffset: isFocused ? "0px" : "0px",
        }}
        className="px-4 py-3 bg-white text-gray-900 text-sm leading-relaxed focus:outline-none"
      >
        {!value && placeholder && (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
    </div>
  );
}
