"use client";

import React, { useContext, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { ChatContext } from "./ChatContext";

type Props = {
  isDisabled?: boolean;
};

const ChatInput = (props: Props) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex flex-1 h-full items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                maxRows={4}
                ref={textAreaRef}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    addMessage();
                    textAreaRef.current?.focus();
                  }
                }}
                placeholder="Enter your query..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-green scrollbar-thumb-rounded scrollbar-track-green-lighter scrollbar-w-2 scrolling-touch"
              />
              <Button
                disabled={isLoading || props.isDisabled}
                onClick={() => {
                  addMessage();
                  textAreaRef.current?.focus();
                }}
                variant="link"
                aria-label="send message"
                className="absolute bottom-1.5 right-[8px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
