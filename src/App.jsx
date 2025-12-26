import { useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  const [page, setPage] = useState("login"); // login | test | compare
  const [jumlahData, setJumlahData] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // DUMMY DATA (nanti backend ganti)
  const dummyChart = {
    labels: [100, 200, 300, 400, 500],
    datasets: [
      {
        label: "Iteratif",
        data: [2, 4, 6, 8, 10],
        borderColor: "#dc2626", // Merah (primary)
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: "Rekursif",
        data: [3, 6, 9, 12, 15],
        borderColor: "#2563eb", // Biru (secondary)
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  /* ================= LOGIN PAGE ================= */
  if (page === "login") {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white py-6 px-4 text-center shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider">COMPLEXITY</h1>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-wider mt-2">ANALYZER</h2>
        </div>

        {/* Login Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-center text-xl font-semibold mb-8 text-gray-700">Log In / Sign Up</h3>
            
            <input 
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-6 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
            />

            <button
              onClick={() => setPage("test")}
              className="w-full bg-[var(--primary)] hover:bg-red-600 hover:scale-[1.02] text-white py-4 rounded-xl font-semibold shadow-lg transition duration-300"
            >
              Login
            </button>

            <p className="mt-6 text-sm text-center text-gray-600 hover:text-red-500 cursor-pointer transition">
              Forgot Password
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= TEST PAGE ================= */
  if (page === "test") {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        {/* Header */}
        <div className="bg-gray-800 text-white py-6 px-4 text-center shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider">COMPLEXITY</h1>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-wider mt-2">ANALYZER</h2>
        </div>

        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Judul Data Section */}
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Jenis Data:</h3>
            <div className="flex justify-center gap-4 md:gap-8 mt-4">
              <button className="px-6 py-3 bg-[var(--bg-card)] rounded-xl font-semibold shadow hover:shadow-lg transition">
                Fungsi Rekursi
              </button>
              <button className="px-6 py-3 bg-[var(--bg-card)] rounded-xl font-semibold shadow hover:shadow-lg transition">
                Fungsi Iteratif
              </button>
            </div>
          </div>

          {/* Input Jumlah Data */}
          <div className="flex justify-center mb-8">
            <input
              type="number"
              placeholder="Jumlah Data"
              value={jumlahData}
              onChange={(e) => setJumlahData(e.target.value)}
              className="p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none w-full max-w-md shadow"
            />
          </div>

          {/* Grafik Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Grafik Rekursif */}
            <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-lg">
              <h2 className="font-bold text-xl mb-4 text-gray-800">
                Fungsi Rekursif
              </h2>
              <div className="h-64 md:h-80">
                {hasResult ? (
                  <Line data={dummyChart} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500 text-center p-4">
                      Tempat input Grafik setelah mulai tes
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Grafik Iteratif */}
            <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-lg">
              <h2 className="font-bold text-xl mb-4 text-gray-800">
                Fungsi Iteratif
              </h2>
              <div className="h-64 md:h-80">
                {hasResult ? (
                  <Line data={dummyChart} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500 text-center p-4">
                      Tempat input Grafik setelah mulai tes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            <button
              onClick={() => setHasResult(true)}
              className="bg-[var(--primary)] hover:bg-red-600 text-white px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl font-semibold text-lg transition duration-300"
            >
              Mulai Tes
            </button>

            <button
              onClick={() => setPage("compare")}
              className="bg-white border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-red-50 px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl font-semibold text-lg transition duration-300"
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
      {/* Header */}
      <div className="bg-gray-800 text-white py-6 px-4 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider">COMPLEXITY</h1>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-wider mt-2">ANALYZER</h2>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Detail Perbandingan
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grafik Side by Side */}
          <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-lg">
            <div className="h-80 md:h-96">
              <Line data={dummyChart} options={chartOptions} />
            </div>
          </div>

          {/* Table Comparison */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="pb-4 font-bold text-gray-700 text-lg">Kompleksitas</th>
                    <th className="pb-4 font-bold text-gray-700 text-lg text-center">Rekursif</th>
                    <th className="pb-4 font-bold text-gray-700 text-lg text-center">Iteratif</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 font-semibold">Best Case</td>
                    <td className="py-4 text-center">O(1)</td>
                    <td className="py-4 text-center">O(1)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 font-semibold">Average Case</td>
                    <td className="py-4 text-center">O(n)</td>
                    <td className="py-4 text-center">O(n)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 font-semibold">Worst Case</td>
                    <td className="py-4 text-center">O(n²)</td>
                    <td className="py-4 text-center">O(n)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-semibold">Run Time</td>
                    <td className="py-4 text-center font-bold text-red-600">Lebih Lambat</td>
                    <td className="py-4 text-center font-bold text-green-600">Lebih Cepat</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-700 mb-2">Kesimpulan:</h4>
              <p className="text-gray-600">
                Fungsi iteratif umumnya memiliki performa yang lebih baik dalam hal penggunaan memori 
                dan kecepatan eksekusi dibandingkan fungsi rekursif, terutama untuk data dalam jumlah besar.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage("test")}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-xl shadow hover:shadow-xl font-semibold transition duration-300"
          >
            Kembali ke Tes
          </button>
        </div>
      </div>
    </div>
  );
}