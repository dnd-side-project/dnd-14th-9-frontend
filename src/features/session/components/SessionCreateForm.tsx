"use client";

import { useState } from "react";

import { Input } from "@/components/Input/Input";

export function SessionCreateForm() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

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

      {/* 방 한줄 소개 */}
      <Input
        label="방 한줄 소개*"
        placeholder="예) 1일 1목표를 달성하는 방이에요"
        maxLength={50}
        showCharacterCount
        value={roomDescription}
        onChange={(e) => setRoomDescription(e.target.value)}
        onClear={() => setRoomDescription("")}
        containerClassName="max-w-full"
        className="max-w-full"
      />
    </form>
  );
}
