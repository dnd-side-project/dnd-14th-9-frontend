"use client";

import { useState } from "react";

import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";

export function SessionCreateForm() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [notice, setNotice] = useState("");

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

      {/* 공지사항 */}
      <Textarea
        label="공지사항"
        placeholder="예) 세션의 규칙, 공지사항을 작성해주세요"
        maxLength={100}
        showCharacterCount
        value={notice}
        onChange={(e) => setNotice(e.target.value)}
        containerClassName="max-w-full"
        className="h-[260px] max-w-full"
      />
    </form>
  );
}
