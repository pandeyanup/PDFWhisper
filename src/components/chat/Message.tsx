import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import React, { forwardRef } from "react";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

type Props = {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
};

const Message = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-end", {
        "justify-end": props.message.isUserMessage,
      })}
    >
      <div
        className={cn(
          "relative flex h-6 w-6 aspect-square items-center justify-center",
          {
            "order-2 bg-green-600 rounded-full": props.message.isUserMessage,
            "order-1 bg-zinc-800 rounded-full": !props.message.isUserMessage,
            invisible: props.isNextMessageSamePerson,
          }
        )}
      >
        {props.message.isUserMessage ? (
          <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
        ) : (
          <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
        )}
      </div>

      <div
        className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
          "order-1 items-end": props.message.isUserMessage,
          "order-2 items-start": !props.message.isUserMessage,
        })}
      >
        <div
          className={cn("px-4 py-2 rounded-lg inline-block", {
            "bg-green-600 text-white": props.message.isUserMessage,
            "bg-gray-200 text-gray-900": !props.message.isUserMessage,
            "rounder-br-none":
              !props.isNextMessageSamePerson && props.message.isUserMessage,
            "rounder-bl-none":
              !props.isNextMessageSamePerson && !props.message.isUserMessage,
          })}
        >
          {typeof props.message.text === "string" ? (
            <ReactMarkdown
              className={cn("prose", {
                "text-zinc-50": props.message.isUserMessage,
              })}
            >
              {props.message.text}
            </ReactMarkdown>
          ) : (
            props.message.text
          )}
          {props.message.id !== "loading-message" ? (
            <div
              className={cn("text-sx select-none mt-2 w-full text-right", {
                "text-green-900": props.message.isUserMessage,
                "text-zinc-500": !props.message.isUserMessage,
              })}
            >
              {format(new Date(props.message.createdAt), "HH:mm")}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

Message.displayName = "Message";

export default Message;
