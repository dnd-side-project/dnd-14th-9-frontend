"use client";

import { useState } from "react";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { ImageUploader } from "@/components/ImageUploader/ImageUploader";
import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";

const CATEGORIES = [
  "개발",
  "디자인",
  "기획 · PM",
  "커리어 · 자기개발",
  "스터디 · 독서",
  "크리에이티브",
  "팀 프로젝트",
  "자유",
] as const;

export function SessionCreateForm() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

      {/* 대표 이미지 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">대표 이미지</span>
        <ImageUploader
          hintText="최대 5MB 파일만 업로드 가능해요"
          accept="image/jpeg,image/png"
          containerClassName="max-w-[380px]"
        />
        <span className="text-text-secondary text-sm">* .jpg, .png 파일만 가능해요</span>
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-base">카테고리</span>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((category) => (
            <CategoryFilterButton
              key={category}
              isSelected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category}
            </CategoryFilterButton>
          ))}
        </div>
      </div>
    </form>
  );
}
