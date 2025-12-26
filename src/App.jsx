import { useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  const [page, setPage] = useState("login"); // login | test | compare
  const [jumlahData, setJumlahData] = useState("");
  const [hasResult, setHasResult] = useState(false);

  // DUMMY DATA (nanti backend ganti)
  const dummyChart = {
    labels: [100, 200, 300, 400, 500],
    datasets: [
      {
        label: "Iteratif",
        data: [2, 4, 6, 8, 10],
        borderColor: "#e53935",
      },
      {
        label: "Rekursif",
        data: [3, 6, 9, 12, 15],
        borderColor: "#1e88e5",
      },
    ],
  };

  /* ================= LOGIN PAGE ================= */
  if (page === "login") {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center">
        <header className="bg-gray-800 text-white text-center py-5 text-2xl font-bold tracking-widest shadow">
            COMPLEXITY ANALYZER
        </header>

        <div className="bg-[var(--bg-card)] p-10 rounded-3xl w-96 shadow-xl">
          
          <input 
            type="email"
            placeholder="Enter your email"
            className="w-full mb-4 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 outline-none"
          />

          <button
            onClick={() => setPage("test")}
            className="w-full bg-[var(--primary)] hover:scale-[1.02] text-white py-3 rounded-xl font-semibold shadow"
          >
            Login
          </button>

          <p className="mt-6 text-sm text-center underline cursor-pointer">
            Forgot Password
          </p>
        </div>
      </div>
    );
  }

  /* ================= TEST PAGE ================= */
  if (page === "test") {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <header className="bg-gray-800 text-white text-center py-5 text-2xl font-bold tracking-widest shadow">
          COMPLEXITY ANALYZER
        </header>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <input
              type="number"
              placeholder="Jumlah Data"
              value={jumlahData}
              onChange={(e) => setJumlahData(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-lg">
              <h2 className="font-semibold text-lg mb-4">
                Fungsi Rekursif
              </h2>

              {hasResult ? (
                <Line data={dummyChart} />
              ) : (
                <p className="text-gray-500">
                  Tempat input grafik setelah mulai tes
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setHasResult(true)}
              className="bg-[var(--bg-card)] px-8 py-3 rounded-2xl shadow-md hover:shadow-xl font-semibold"
            >
              Mulai Tes
            </button>

            <button
              onClick={() => setPage("compare")}
              className="bg-white px-8 py-3 rounded-xl shadow hover:shadow-lg transition font-semibold"
            >
              Bandingkan Grafik
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= COMPARE PAGE ================= */
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <header className="bg-gray-800 text-white text-center py-5 text-2xl font-bold tracking-widest shadow">
        COMPLEXITY ANALYZER
      </header>


      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-lg">
          <Line data={dummyChart} />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h2 className="font-bold text-xl mb-6 text-center">
            Detail Perbandingan
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">Rekursif</h3>
              <p>Best Case: O(1)</p>
              <p>Average Case: O(n)</p>
              <p>Worst Case: O(n)</p>
              <p className="mt-2 font-semibold text-red-600">
                Run Time: lebih lambat
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Iteratif</h3>
              <p>Best Case: O(1)</p>
              <p>Average Case: O(n)</p>
              <p>Worst Case: O(n)</p>
              <p className="mt-2 font-semibold text-green-600">
                Run Time: lebih cepat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
