"use client"

import React, { useState, useEffect } from "react";
import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import { Copy } from "lucide-react";
type Expense = { name: string; amount: number };

const calculateSettlement = (totalPeople: number, expenses: Expense[]) => {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = totalAmount / totalPeople;
  const balanceMap: Record<string, number> = {};

  expenses.forEach((e) => {
    balanceMap[e.name] = (balanceMap[e.name] || 0) + (e.amount - perPerson);
  });

  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];

  Object.entries(balanceMap).forEach(([name, balance]) => {
    if (balance > 0) creditors.push({ name, amount: balance });
    else if (balance < 0) debtors.push({ name, amount: -balance });
  });

  const transactions = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(amount),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return { totalAmount, perPerson, transactions };
};

const BillSplitterApp = () => {
  const [totalPeople, setTotalPeople] = useState(5);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [result, setResult] = useState<null | ReturnType<typeof calculateSettlement>>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [debouncedPeople, setDebouncedPeople] = useState(totalPeople);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPeople(totalPeople);
    }, 500); // 0.5초 동안 입력이 없으면 반영

    return () => clearTimeout(handler);
  }, [totalPeople]);

  useEffect(() => {
    setExpenses(Array.from({ length: debouncedPeople }, () => ({ name: "", amount: 0 })));
  }, [debouncedPeople]);

  const handleCalculate = () => {
    const normalizedExpenses = expenses.map((e, i) => ({
      name: e.name.trim() === "" ? `미입력자${i + 1}` : e.name.trim(),
      amount: e.amount || 0,
    }));
    setResult(calculateSettlement(totalPeople, normalizedExpenses));
    setModalOpen(true);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `총 지출: ${result.totalAmount.toLocaleString()}원`,
      `1인당 부담금: ${result.perPerson.toLocaleString()}원`,
      ...result.transactions.map((t) => `${t.from} → ${t.to}: ${t.amount.toLocaleString()}원`),
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#D8E7C5] px-6 py-[30px]">
      <div className="bg-white rounded-2xl p-6 shadow-lg text-center 
                max-w-sm md:max-w-2xl lg:max-w-4xl 
                max-h-[90vh] md:max-h-none overflow-auto mx-4 md:mx-auto">
        <h1 className="text-2xl font-bold mt-6 mb-10">🌿 더치페이 계산기 🌿</h1>

        <label className="block text-lg mb-3 text-gray-800">참여 인원
        </label>
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setTotalPeople((prev) => Math.max(1, prev - 1))}
            className="w-10 h-10 border-2 border-[#E5B9A8] bg-white text-[#E5B9A8] rounded-full text-2xl font-bold flex items-center justify-center
             hover:bg-[#E78F81] hover:text-white active:bg-[#E78F81] active:text-white transition touch-action-manipulation"
          >
            -
          </button>
          <span className="text-3xl font-semibold w-12 text-center text-gray-800">{totalPeople}</span>
          <button
            onClick={() => setTotalPeople((prev) => prev + 1)}
            className="w-10 h-10 border-2 border-[#E5B9A8] bg-white text-[#E5B9A8] rounded-full text-2xl font-bold flex items-center justify-center
             hover:bg-[#E78F81] hover:text-white active:bg-[#E78F81] active:text-white transition touch-action-manipulation"
          >
            +
          </button>
        </div>

        <div className="mb-8 max-h-[40vh] overflow-auto">
          <h2 className="font-semibold mb-3 text-left text-lg text-gray-800">비용 입력</h2>
          {expenses.map((exp, idx) => (
            <div key={idx} className="flex gap-3 mb-3">
              <input
                type="text"
                value={exp.name}
                onChange={(e) => {
                  const newExpenses = [...expenses];
                  newExpenses[idx].name = e.target.value;
                  setExpenses(newExpenses);
                }}
                placeholder="이름"
                className="border border-gray-300 p-3 rounded-xl w-1/2 focus:outline-none focus:border-[#E78F81]" />
              <input
                type="number"
                value={exp.amount === 0 ? '' : exp.amount}
                onChange={(e) => {
                  const input = e.target.value;

                  const newExpenses = [...expenses];
                  newExpenses[idx].amount = parseInt(input.replace(/^0+/, '')) || 0;
                  setExpenses(newExpenses);
                }}
                placeholder="0"
                className="border border-gray-300 p-3 rounded-xl w-1/2 focus:outline-none focus:border-[#E78F81]"
              />
            </div>
          ))}
        </div>

        <Button className="mb-3" onClick={handleCalculate}>계산하기</Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        {result && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">정산 결과</h2>
            <p className="text-lg mb-2">총 지출: {result.totalAmount.toLocaleString()}원</p>
            <p className="text-lg mb-4">1인당 부담금: {result.perPerson.toLocaleString()}원</p>
            <ul className="text-left text-base mb-6">
              {result.transactions.map((t, idx) => (
                <li key={idx}>{t.from} → {t.to}: {t.amount.toLocaleString()}원</li>
              ))}
            </ul>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-4 bg-[#E78F81] text-white rounded-xl w-full hover:opacity-90 text-base font-medium"
            >
              <Copy className="w-5 h-5" /> 복사하기
            </button>
            {copied && <p className="text-sm text-gray-500 mt-2">클립보드에 복사되었습니다!</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillSplitterApp;
