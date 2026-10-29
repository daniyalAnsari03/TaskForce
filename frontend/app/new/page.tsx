import { Suspense } from "react";
import ChatLayout from "@/components/chat/ChatLayout";

export default function NewTaskPage() {
  return (
    <Suspense fallback={null}>
      <ChatLayout />
    </Suspense>
  );
}
