import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AppContextValue = {
  messages: ChatMessage[];
  isThinking: boolean;
  sendMessage: (text: string) => void;
  resetChat: () => void;
  pendingPrompt: string | null;
  setPendingPrompt: (text: string | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function mockReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("документ"))
    return "Базовый пакет документов: транскрипт оценок, мотивационное письмо, рекомендательные письма (2–3), сертификат IELTS/TOEFL, копия паспорта и CV. Конкретные требования зависят от вуза — уточните дедлайны в разделе «Календарь».";
  if (q.includes("корея") || q.includes("korea"))
    return "Дедлайны в Южную Корею обычно проходят двумя волнами: до 1 ноября — на весенний семестр, до 1 мая — на осенний. Самые востребованные вузы — SNU, Yonsei, KAIST. Минимум: GPA 3.3 и IELTS 6.0.";
  if (q.includes("gpa") || q.includes("балл"))
    return "Большинство партнёрских программ требуют GPA от 3.0 до 3.7. Воспользуйтесь «Калькулятором шансов», чтобы увидеть подходящие вам вузы.";
  if (q.includes("стипенди"))
    return "Самые крупные программы: Erasmus+, DAAD, Chevening, Fulbright, Global Korea Scholarship. Рекомендую начать подготовку минимум за 6 месяцев до дедлайна.";
  return "Хороший вопрос. Подскажите, какая страна и специальность вас интересуют — я подберу программы и проверю требования.";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
  if (!text.trim()) return;

  // Создаем сообщение пользователя и выводим его на экран
  const userMessage = { id: Date.now().toString(), role: 'user', content: text };
  setMessages(prev => [...prev, userMessage]);
  setIsThinking(true);

  try {
    // Отправляем текст на вебхук n8n
    const response = await fetch("https://makhambet-university.app.n8n.cloud/webhook/academic-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      throw new Error("Ошибка сети при запросе к n8n");
    }

    const data = await response.json();
    
    // Вытаскиваем ответ от ИИ-агента (в n8n ответ обычно лежит в поле output)
    const aiText = data.output || data.response || "Извините, не удалось получить ответ.";

    const assistantMessage = { 
      id: (Date.now() + 1).toString(), 
      role: 'assistant', 
      content: aiText 
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error("Ошибка при работе чата с n8n:", error);
    // Опционально: вывод сообщения об ошибке для пользователя на экран
  } finally {
    setIsThinking(false);
  }
};

  const resetChat = useCallback(() => setMessages([]), []);

  const value = useMemo(
    () => ({
      messages,
      isThinking,
      sendMessage,
      resetChat,
      pendingPrompt,
      setPendingPrompt,
    }),
    [messages, isThinking, sendMessage, resetChat, pendingPrompt],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}