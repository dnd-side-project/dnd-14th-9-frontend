"use client";

import { useState } from "react";

import { Input } from "@/components/Input/Input";

export function SessionCreateForm() {
  const [roomName, setRoomName] = useState("");

  return (
    <form className="gap-xl flex w-full flex-col">
      {/* 방 이름 */}
      <Input
        label="방 이름*"
        placeholder="예) 아침코딩모각작"
        maxLength={20}
        showCharacterCount
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        onClear={() => setRoomName("")}
        containerClassName="max-w-full"
        className="max-w-full"
      />
    </form>
  );
}
