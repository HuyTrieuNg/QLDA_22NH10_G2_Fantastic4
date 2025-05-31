import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import ConnectionTest from "./components/test/ConnectionTest";

function App() {
  const [count, setCount] = useState(0);
  const [showTest, setShowTest] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 dark:text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto backdrop-blur bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-2xl p-8 md:p-14 border border-gray-200 dark:border-slate-700">
        <header className="mb-12">
          <div className="flex justify-center gap-x-10 gap-y-4 flex-wrap mb-8">
            <a
              href="https://vite.dev"
              target="_blank"
              className="transition-transform duration-300 hover:scale-110"
            >
              <div className="p-5 bg-white dark:bg-slate-700 rounded-2xl shadow-xl">
                <img src={viteLogo} className="h-16" alt="Vite logo" />
              </div>
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              className="transition-transform duration-300 hover:scale-110"
            >
              <div className="p-5 bg-white dark:bg-slate-700 rounded-2xl shadow-xl">
                <img
                  src={reactLogo}
                  className="h-16 animate-spin-slow"
                  alt="React logo"
                />
              </div>
            </a>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-balance text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight py-6 md:py-8">
            QLDA - Project Management
          </h1>
        </header>

        <div className="flex flex-wrap gap-6 justify-center py-10">
          <button
            onClick={() => setShowTest(!showTest)}
            className={`${
              showTest
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold py-3 px-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-opacity-50 ${
              showTest ? "focus:ring-rose-300" : "focus:ring-blue-300"
            }`}
          >
            {showTest ? "Ẩn" : "Hiện"} Component Test
          </button>

          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50"
          >
            count is {count}
          </button>
        </div>

        {showTest ? (
          <div className="mt-8">
            <ConnectionTest />
          </div>
        ) : (
          <div className="mt-14 text-center p-10 bg-blue-50 dark:bg-slate-700/40 rounded-2xl border border-blue-100 dark:border-slate-600">
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Click vào nút "Hiện Component Test" để kiểm tra kết nối
              Frontend-Backend-Database
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
