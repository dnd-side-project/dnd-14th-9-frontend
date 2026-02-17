"use client";

import { useState } from "react";

import { Pagination } from "@/components/Pagination/Pagination";

export default function PaginationTestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = 20;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gray-50 p-10">
      <h1 className="text-2xl font-bold">Pagination Component Test</h1>

      <div className="flex w-full max-w-2xl flex-col gap-8 rounded-xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="border-b pb-2 text-xl">1. List Type (Default)</h2>
          <p className="text-gray-500">
            Current: {currentPage} / Total: {totalPage}
          </p>
          <div className="flex justify-center py-4">
            <Pagination
              variant="list"
              totalPage={totalPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xt border-b pb-2">2. Fraction Type</h2>
          <p className="text-gray-500">
            Current: {currentPage} / Total: {totalPage}
          </p>
          <div className="flex justify-center py-4">
            <Pagination
              variant="fraction"
              totalPage={3}
              currentPage={currentPage % 3 === 0 ? 3 : currentPage % 3}
              onPageChange={(page) => console.log("Fraction page change:", page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
