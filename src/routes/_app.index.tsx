import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/")({
  component: ChatPage,
});

function ChatPage() {
  const { messages, sendMessage, isThinking, pendingPrompt, setPendingPrompt } =
    useApp();
  const { t } = useI18n();
  const STARTERS = [t("chat.starter.1"), t("chat.starter.2"), t("chat.starter.3")];
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingPrompt) {
      setText(pendingPrompt);
      setPendingPrompt(null);
      inputRef.current?.focus();
    }
  }, [pendingPrompt, setPendingPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (!text.trim() || isThinking) return;
    sendMessage(text);
    setText("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="relative flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 pb-32">
            <h1 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
  {t("chat.title")}
</h1>

{/* Подзаголовок: будет автоматически адаптироваться под тему */}
<p className="mt-3 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase px-4 leading-relaxed max-w-xl mx-auto">
  {t("chat.subtitle.heading")}
</p>

{/* Разделительная линия: bg-border автоматически перекрасится в нужный тон */}
<div className="w-16 h-[1px] bg-border my-5 mx-auto" />

{/* Основное описание: text-muted-foreground правильно отобразится и на белом, и на черном фоне */}
<p className="text-center text-sm text-muted-foreground leading-relaxed max-w-xl px-4 mx-auto">
  {t("chat.subtitle.desc")}
</p>
            <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-2xl bg-secondary/70 p-4 text-left text-sm leading-snug text-foreground transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-10 px-6 pb-40 pt-12">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user" ? "flex flex-col items-end" : "flex flex-col"
                }
              >
                <span className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {m.role === "user" ? t("chat.you") : t("chat.assistant")}
                </span>
                <p
                  className={
                    m.role === "user"
                      ? "max-w-[85%] text-right text-[15px] leading-relaxed text-foreground"
                      : "max-w-[85%] text-[15px] leading-relaxed text-foreground"
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {isThinking && (
              <div className="flex flex-col">
                <span className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("chat.assistant")}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span
                    className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-10">
        <div className="pointer-events-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-[24px] bg-card px-4 py-3 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={t("chat.placeholder")}
              className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim() || isThinking}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
              aria-label={t("chat.send")}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}