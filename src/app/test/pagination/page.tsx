"use client";

import { useState } from "react";

import { Pagination } from "@/components/Pagination/Pagination";

export default function PaginationTestPage() {
  const [listPage, setListPage] = useState(1);
  const [fractionPage, setFractionPage] = useState(1);
  const listTotalPage = 20;
  const fractionTotalPage = 3;

  return (
    <div className="text-text-primary min-h-screen w-full p-10">
      <div className="mx-auto flex w-full max-w-[896px] flex-col items-center gap-10">
        <h1 className="text-2xl font-bold">Pagination Component Test</h1>

        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-4">
            <h2 className="border-border-subtle border-b pb-2 text-xl">1. List Type (Default)</h2>
            <p className="text-text-muted">
              Current: {listPage} / Total: {listTotalPage}
            </p>
            <div className="flex justify-center py-4">
              <Pagination
                variant="list"
                totalPage={listTotalPage}
                currentPage={listPage}
                onPageChange={setListPage}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <h2 className="border-border-subtle border-b pb-2 text-xl">2. Fraction Type</h2>
            <p className="text-text-muted">
              Current: {fractionPage} / Total: {fractionTotalPage}
            </p>
            <div className="flex justify-center py-4">
              <Pagination
                variant="fraction"
                totalPage={fractionTotalPage}
                currentPage={fractionPage}
                onPageChange={setFractionPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
