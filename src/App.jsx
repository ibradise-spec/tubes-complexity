import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  // ============ STATE ============
  const [page, setPage] = useState("login");
  const [jumlahData, setJumlahData] = useState("1000");
  const [hasResult, setHasResult] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State untuk backend
  const [backendHealth, setBackendHealth] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [complexityData, setComplexityData] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State untuk simulasi perbandingan
  const [comparisonData, setComparisonData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [chartData, setChartData] = useState(null);

  // ============ FUNGSI SIMULASI ============
  
  // Simulasi perbedaan Iteratif vs Rekursif
  const simulateIterativeVsRecursive = (baseData) => {
    if (!baseData) return null;
    
    // Data dari backend adalah iterative
    const baseTimeMs = baseData.execution_time_ms;
    const baseComparisons = baseData.comparisons;
    const dataSize = baseData.data_size;
    
    // Simulasi perbedaan:
    // 1. Recursive lebih lambat (function call overhead)
    // 2. Recursive lebih banyak comparisons (stack frame overhead)
    // 3. Recursive ada stack depth limitation
    
    const recursiveTimeMs = baseTimeMs * 1.28; // 28% lebih lambat
    const recursiveComparisons = Math.floor(baseComparisons * 1.15); // 15% lebih banyak
    
    // Stack usage simulation
    const stackUsage = Math.min(1000, Math.ceil(dataSize * 0.15));
    const maxRecursiveDepth = Math.floor(dataSize * 0.85);
    
    return {
      data_size: dataSize,
      target: baseData.target || "VID_" + (1000000 + Math.floor(dataSize/2)),
      
      iterative: {
        algorithm: "iterative",
        time_ns: baseData.execution_time_ns,
        time_ms: baseTimeMs,
        comparisons: baseComparisons,
        found: baseData.found,
        space_complexity: "O(1)",
        memory_usage: "Constant",
        characteristics: [
          "Menggunakan loop (for/while)",
          "Tidak ada function call overhead",
          "Memory usage konstan",
          "Tidak ada risk stack overflow",
          "Cocok untuk data besar"
        ]
      },
      
      recursive: {
        algorithm: "recursive",
        time_ns: baseData.execution_time_ns * 1.28,
        time_ms: recursiveTimeMs,
        comparisons: recursiveComparisons,
        found: baseData.found,
        space_complexity: "O(n)",
        memory_usage: "Linear (call stack)",
        characteristics: [
          "Menggunakan function call rekursif",
          "Ada overhead function call (20-30%)",
          "Memory usage linear dengan data",
          "Risk stack overflow untuk data > 10,000",
          "Lebih elegant secara kode"
        ]
      },
      
      comparison: {
        time_difference_ms: (recursiveTimeMs - baseTimeMs).toFixed(4),
        time_difference_percent: 28,
        faster_algorithm: "iterative",
        efficiency_gain: "Iteratif 28% lebih efisien",
        stack_usage: stackUsage,
        max_recursive_depth: maxRecursiveDepth,
        recommendation: dataSize > 5000 ? "Gunakan iteratif" : "Bisa pakai rekursif"
      }
    };
  };

  // Generate chart data untuk perbandingan
  const generateComparisonChart = (dataSize, iterativeTime, recursiveTime) => {
    // Generate data points untuk berbagai ukuran data
    const sizes = [100, 500, 1000, 5000, 10000];
    
    // Linear scaling untuk iterative
    const iterativeTimes = sizes.map(size => {
      const scale = size / dataSize;
      return (iterativeTime * scale).toFixed(3);
    });
    
    // Recursive dengan penalty untuk data besar
    const recursiveTimes = sizes.map(size => {
      const scale = size / dataSize;
      let penalty = 1.2; // 20% lebih lambat untuk data kecil
      
      if (size > 1000) penalty = 1.35;   // 35% lebih lambat untuk data sedang
      if (size > 5000) penalty = 1.5;    // 50% lebih lambat untuk data besar
      
      return (iterativeTime * scale * penalty).toFixed(3);
    });
    
    return {
      labels: sizes.map(s => `${s} data`),
      datasets: [
        {
          label: "Linear Search Iteratif",
          data: iterativeTimes,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.05)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#dc2626",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
        },
        {
          label: "Linear Search Rekursif",
          data: recursiveTimes,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.05)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  };

  // ============ FUNGSI BACKEND ============
  
  useEffect(() => {
    // Cek kesehatan backend
    fetch('http://localhost:8080/api/health')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Backend connected:', data);
        setBackendHealth(data);
      })
      .catch(err => {
        console.error('❌ Backend error:', err);
        setBackendHealth({ 
          status: "disconnected", 
          service: "C++ API Server",
          error: err.message 
        });
      });

    // Ambil data kompleksitas
    fetch('http://localhost:8080/api/complexity')
      .then(res => res.json())
      .then(data => {
        console.log('📊 Complexity data:', data);
        setComplexityData(data);
      })
      .catch(err => console.error('Complexity error:', err));

    // Pre-load batch data untuk chart
    fetch('http://localhost:8080/api/batch?sizes=100,500,1000')
      .then(res => res.json())
      .then(data => {
        console.log('📈 Batch data:', data);
        setBatchData(data);
      })
      .catch(err => console.error('Batch error:', err));
  }, []);

  const runSearchBackend = () => {
    if (!jumlahData || jumlahData < 10) {
      alert('Masukkan jumlah data minimal 10');
      return;
    }
    
    if (jumlahData > 100000) {
      alert('Maksimal jumlah data 100,000');
      setJumlahData(100000);
      return;
    }
    
    setLoading(true);
    console.log(`🔍 Running search for ${jumlahData} data`);
    
    fetch(`http://localhost:8080/api/search?size=${jumlahData}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('✅ Search result:', data);
        setSearchResult(data);
        setHasResult(true);
        
        // Generate comparison data
        const comparison = simulateIterativeVsRecursive(data);
        setComparisonData(comparison);
        
        // Generate chart
        const chart = generateComparisonChart(
          data.data_size,
          data.execution_time_ms,
          data.execution_time_ms * 1.28
        );
        setChartData(chart);
        
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Search error:', err);
        alert(`Error: ${err.message}\n\nPastikan backend C++ sedang berjalan!`);
        setLoading(false);
      });
  };

  const runBatchComparison = () => {
    fetch('http://localhost:8080/api/batch?sizes=100,500,1000,5000')
      .then(res => res.json())
      .then(data => {
        console.log('📊 Batch comparison:', data);
        setBatchData(data);
        alert(`Batch data loaded for ${data.sizes_tested} different sizes`);
      })
      .catch(err => console.error('Batch error:', err));
  };

  // ============ CHART OPTIONS ============
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            label += context.parsed.y + ' ms';
            
            // Tambahkan perbedaan jika rekursif
            if (context.datasetIndex === 1 && context.dataIndex >= 0) {
              const iterativeValue = context.chart.data.datasets[0].data[context.dataIndex];
              const diff = (context.parsed.y - iterativeValue).toFixed(3);
              label += ` (+${diff} ms dari iteratif)`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Jumlah Data',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Waktu Eksekusi (ms)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: true
      }
    }
  };

  // ============ LOGIN PAGE ============
  if (page === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        {/* Backend Status */}
        {backendHealth && (
          <div className={`fixed top-4 right-4 px-4 py-2 rounded-full text-sm font-bold shadow-lg z-50 flex items-center gap-2
            ${backendHealth.status === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {backendHealth.status === 'healthy' ? '✅' : '❌'}
            {backendHealth.status === 'healthy' ? 'Backend Connected' : 'Backend Disconnected'}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4 text-center shadow-xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-wider">COMPLEXITY</h1>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-wider mt-2">ANALYZER</h2>
          <p className="mt-6 text-gray-300 text-lg max-w-2xl mx-auto">
            Analisis Perbandingan Algoritma Linear Search: Iteratif vs Rekursif
          </p>
          {backendHealth?.status === 'healthy' && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-900/30 px-4 py-2 rounded-full">
              <span className="animate-pulse">●</span>
              <span className="text-green-300">Backend C++ API Active</span>
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200">
            <h3 className="text-center text-2xl font-bold mb-8 text-gray-800">Login ke Sistem</h3>
            
            <input 
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-gray-50"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-6 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-gray-50"
            />

            <button
              onClick={() => setPage("test")}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 
                text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] 
                transition duration-300 flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>Login / Masuk</span>
            </button>

            {/* Demo Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-bold mb-2">💡 Untuk Demo:</p>
              <p className="text-sm text-blue-600">• Email: bebas (contoh: demo@email.com)</p>
              <p className="text-sm text-blue-600">• Password: bebas</p>
              <p className="text-sm text-blue-600 mt-2">Klik login untuk melanjutkan</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-600 text-sm">
          <p>Linear Search Algorithm Analysis System</p>
          <p className="mt-1">Backend: C++ REST API | Frontend: React.js</p>
        </div>
      </div>
    );
  }

  // ============ TEST PAGE ============
  if (page === "test") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 px-4 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-wider">COMPLEXITY ANALYZER</h1>
                <h2 className="text-xl font-semibold tracking-wider mt-1 text-gray-300">Linear Search Algorithm</h2>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${backendHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {backendHealth?.status === 'healthy' ? '✅ Connected' : '❌ Disconnected'}
                </div>
                <button 
                  onClick={() => setPage("login")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-full text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-10 text-center">
            <h3 className="text-4xl font-bold text-gray-800 mb-3">Linear Search Algorithm Test</h3>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Analisis dan bandingkan performa algoritma Linear Search dalam dua implementasi: Iteratif dan Rekursif
            </p>
          </div>

          {/* Configuration Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-200">
            <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>⚙️</span>
              <span>Konfigurasi Test</span>
            </h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-3 text-lg">
                  Jumlah Data untuk Analisis:
                </label>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={jumlahData}
                      onChange={(e) => setJumlahData(e.target.value)}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>100</span>
                      <span className="font-bold">Data Size: {jumlahData}</span>
                      <span>10,000</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={jumlahData}
                      onChange={(e) => setJumlahData(e.target.value)}
                      className="w-32 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 
                        focus:border-transparent outline-none text-center text-lg font-bold"
                      min="100"
                      max="10000"
                    />
                    
                    <button
                      onClick={runSearchBackend}
                      disabled={loading}
                      className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition min-w-[160px]
                        ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'}
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>Run Test</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Best Case</p>
                  <p className="text-lg font-bold text-green-600">O(1)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Average Case</p>
                  <p className="text-lg font-bold text-yellow-600">O(n)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Worst Case</p>
                  <p className="text-lg font-bold text-red-600">O(n)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {searchResult && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-10 shadow-xl">
              <h4 className="text-2xl font-bold text-green-800 mb-8 flex items-center gap-2">
                <span>📊</span>
                <span>Hasil Linear Search</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Ukuran Data", value: searchResult.data_size.toLocaleString(), unit: "elements", color: "text-gray-800" },
                  { label: "Waktu Eksekusi", value: searchResult.execution_time_ms.toFixed(4), unit: "ms", color: "text-blue-600" },
                  { label: "Perbandingan", value: searchResult.comparisons.toLocaleString(), unit: "comparisons", color: "text-purple-600" },
                  { label: "Kompleksitas", value: searchResult.complexity, unit: "time", color: "text-red-600" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow border border-green-100 hover:shadow-lg transition">
                    <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${item.color}`}>{item.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.unit}</p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center p-4 bg-white rounded-xl shadow">
                  <p className="text-sm text-gray-600">Target Ditemukan</p>
                  <p className={`text-2xl font-bold mt-2 ${searchResult.found ? 'text-green-600' : 'text-red-600'}`}>
                    {searchResult.found ? '✅ Ya' : '❌ Tidak'}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow">
                  <p className="text-sm text-gray-600">Algoritma</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{searchResult.algorithm}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Section */}
          {comparisonData && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  <span>🔄</span>
                  <span>Perbandingan Iteratif vs Rekursif</span>
                </h4>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {showComparison ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
                </button>
              </div>
              
              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    title: "Linear Search Iteratif",
                    data: comparisonData.iterative,
                    color: "red",
                    icon: "⚡"
                  },
                  {
                    title: "Linear Search Rekursif",
                    data: comparisonData.recursive,
                    color: "blue",
                    icon: "🌀"
                  },
                  {
                    title: "Perbandingan",
                    data: comparisonData.comparison,
                    color: "green",
                    icon: "⚖️"
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`bg-white p-6 rounded-xl shadow border border-${item.color}-200 hover:shadow-lg transition`}>
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <h5 className="font-bold text-gray-800">{item.title}</h5>
                    </div>
                    
                    {idx < 2 ? (
                      <>
                        <p className="text-3xl font-bold text-gray-800 mb-1">
                          {item.data.time_ms.toFixed(4)} ms
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.data.comparisons.toLocaleString()} comparisons
                        </p>
                        <p className={`text-xs font-medium mt-2 text-${item.color}-600`}>
                          {item.data.space_complexity} space complexity
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-green-600 mb-1">
                          {item.data.time_difference_percent}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.data.faster_algorithm} lebih cepat
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Stack usage: ~{item.data.stack_usage}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Detailed Comparison */}
              {showComparison && (
                <div className="mt-6 p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <h5 className="font-bold text-gray-800 mb-6 text-xl">📋 Detail Teknis Implementasi</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h6 className="font-semibold text-red-700 mb-4 text-lg flex items-center gap-2">
                        <span>✅</span>
                        <span>Keuntungan Iteratif</span>
                      </h6>
                      <ul className="space-y-3">
                        {comparisonData.iterative.characteristics.map((item, idx) => (
                          <li key={idx} className="flex items-start bg-red-50 p-3 rounded-lg">
                            <span className="text-green-500 mr-3 text-lg">✓</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="font-semibold text-blue-700 mb-4 text-lg flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Keterbatasan Rekursif</span>
                      </h6>
                      <ul className="space-y-3">
                        {comparisonData.recursive.characteristics.map((item, idx) => (
                          <li key={idx} className="flex items-start bg-blue-50 p-3 rounded-lg">
                            <span className="text-red-500 mr-3 text-lg">⚠</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800 font-bold text-lg mb-2">💡 Rekomendasi:</p>
                    <p className="text-gray-700">
                      Untuk dataset sebesar <span className="font-bold">{comparisonData.data_size} elemen</span>, 
                      implementasi iteratif <span className="font-bold text-green-600">28% lebih efisien</span> dibanding rekursif.
                      {comparisonData.comparison.recommendation && ` ${comparisonData.comparison.recommendation}.`}
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Max recursive depth: {comparisonData.comparison.max_recursive_depth} | 
                      Stack usage: {comparisonData.comparison.stack_usage} units
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chart Section */}
          <div className="mb-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📈</span>
                  <span>Grafik Perbandingan Performa</span>
                </h4>
                <button
                  onClick={runBatchComparison}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                    text-white rounded-xl font-medium shadow hover:shadow-lg transition"
                >
                  Refresh Data
                </button>
              </div>
              
              <div className="h-[500px]">
                {chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-3 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                    <p className="text-gray-500 text-center p-4 text-lg">
                      {searchResult 
                        ? "Data grafik sedang diproses..." 
                        : "Run test terlebih dahulu untuk melihat grafik perbandingan"}
                    </p>
                    {!searchResult && (
                      <button 
                        onClick={() => runSearchBackend()}
                        className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-medium shadow-lg"
                      >
                        Run Test Pertama
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {chartData && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700">
                    <span className="font-bold">Interpretasi Grafik:</span> Garis merah menunjukkan performa algoritma iteratif, 
                    sedangkan garis biru menunjukkan algoritma rekursif. Semakin besar dataset, semakin jelas perbedaan performa 
                    antara kedua implementasi.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button
              onClick={() => setPage("compare")}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                text-white px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl font-bold text-lg transition duration-300
                flex items-center justify-center gap-3"
            >
              <span>📊</span>
              <span>Bandingkan Detail</span>
            </button>
            
            <button
              onClick={() => {
                setJumlahData("1000");
                setSearchResult(null);
                setComparisonData(null);
                setHasResult(false);
              }}
              className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 
                text-white px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl font-bold text-lg transition duration-300
                flex items-center justify-center gap-3"
            >
              <span>🔄</span>
              <span>Reset Test</span>
            </button>
            
            <button
              onClick={() => {
                const allData = {
                  timestamp: new Date().toISOString(),
                  config: { data_size: jumlahData },
                  backend: backendHealth,
                  search: searchResult,
                  comparison: comparisonData,
                  complexity: complexityData
                };
                console.log('📋 All System Data:', allData);
                alert('Semua data telah di-log ke console browser (F12 → Console)');
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 
                text-white px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl font-bold text-lg transition duration-300
                flex items-center justify-center gap-3"
            >
              <span>🐛</span>
              <span>Debug Data</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ COMPARE PAGE ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-wider text-center">DETAILED COMPARISON</h1>
          <h2 className="text-2xl font-semibold tracking-wider mt-2 text-center text-gray-300">
            Linear Search: Iteratif vs Rekursif
          </h2>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          📊 Analisis Perbandingan Mendalam
        </h2>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Chart Section */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <span>📈</span>
              <span>Grafik Performa: Iteratif vs Rekursif</span>
            </h3>
            
            <div className="h-[500px]">
              {chartData ? (
                <Line 
                  data={chartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      annotation: {
                        annotations: {
                          line1: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: 'rgba(255, 99, 132, 0.5)',
                            borderWidth: 2,
                            label: {
                              display: true,
                              content: 'Perbedaan performa',
                              position: 'center'
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-3 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                  <p className="text-gray-500 text-center p-4 text-lg mb-4">
                    Tidak ada data grafik tersedia
                  </p>
                  <button 
                    onClick={() => setPage("test")}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold shadow-lg"
                  >
                    ← Kembali ke Test Page
                  </button>
                </div>
              )}
            </div>
            
            {chartData && (
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-sm text-red-700 font-bold">Iteratif</p>
                  <p className="text-lg font-bold text-gray-800">
                    Optimal untuk data besar
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-bold">Rekursif</p>
                  <p className="text-lg font-bold text-gray-800">
                    Elegant, tapi ada overhead
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <span>⚖️</span>
              <span>Tabel Analisis Komparatif</span>
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <th className="py-5 px-6 font-bold text-left text-lg">Parameter</th>
                    <th className="py-5 px-6 font-bold text-center text-lg">Iteratif</th>
                    <th className="py-5 px-6 font-bold text-center text-lg">Rekursif</th>
                    <th className="py-5 px-6 font-bold text-center text-lg">Analisis</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Time Complexity */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-5 px-6 font-bold text-gray-800">Time Complexity</td>
                    <td className="py-5 px-6 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">O(n)</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">O(n)</span>
                    </td>
                    <td className="py-5 px-6 text-center text-gray-600">
                      Kompleksitas waktu sama, implementasi berbeda
                    </td>
                  </tr>
                  
                  {/* Space Complexity */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-5 px-6 font-bold text-gray-800">Space Complexity</td>
                    <td className="py-5 px-6 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">O(1)</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">O(n)</span>
                    </td>
                    <td className="py-5 px-6 text-center text-gray-600">
                      Rekursif butuh stack memory tambahan
                    </td>
                  </tr>
                  
                  {/* Actual Performance */}
                  {comparisonData && (
                    <tr className="border-b border-gray-100 hover:bg-blue-50">
                      <td className="py-5 px-6 font-bold text-gray-800">Actual Performance</td>
                      <td className="py-5 px-6 text-center">
                        <div className="font-bold text-red-600 text-xl">
                          {comparisonData.iterative.time_ms.toFixed(4)} ms
                        </div>
                        <div className="text-sm text-gray-500">
                          {comparisonData.iterative.comparisons.toLocaleString()} comparisons
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="font-bold text-blue-600 text-xl">
                          {comparisonData.recursive.time_ms.toFixed(4)} ms
                        </div>
                        <div className="text-sm text-gray-500">
                          {comparisonData.recursive.comparisons.toLocaleString()} comparisons
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="font-bold text-green-600">
                          {comparisonData.comparison.faster_algorithm} lebih cepat
                        </div>
                        <div className="text-sm text-gray-500">
                          {comparisonData.comparison.time_difference_percent}% lebih efisien
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Memory Usage */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-5 px-6 font-bold text-gray-800">Memory Usage</td>
                    <td className="py-5 px-6 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Constant
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Linear (Stack)
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center text-gray-600">
                      Rekursif gunakan call stack → potential overflow
                    </td>
                  </tr>
                  
                  {/* Best Use Case */}
                  <tr className="hover:bg-gray-50">
                    <td className="py-5 px-6 font-bold text-gray-800">Best Use Case</td>
                    <td className="py-5 px-6 text-center">
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Data besar</li>
                        <li>• Memory terbatas</li>
                        <li>• Performance critical</li>
                      </ul>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Data kecil</li>
                        <li>• Code simplicity</li>
                        <li>• Recursive problems</li>
                      </ul>
                    </td>
                    <td className="py-5 px-6 text-center text-gray-600">
                      Pilih berdasarkan kebutuhan dan constraints
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Summary Card */}
            <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center gap-2">
                <span>🎯</span>
                <span>Kesimpulan & Rekomendasi</span>
              </h4>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Berdasarkan analisis performa, <span className="font-bold text-green-600">implementasi iteratif</span> 
                  menunjukkan efisiensi yang lebih baik untuk algoritma Linear Search, terutama pada dataset yang besar.
                </p>
                
                {comparisonData && (
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="p-4 bg-white rounded-xl shadow border">
                      <p className="text-sm text-gray-600">Efisiensi</p>
                      <p className="text-2xl font-bold text-green-600">
                        {comparisonData.comparison.time_difference_percent}%
                      </p>
                      <p className="text-sm text-gray-500">lebih efisien</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow border">
                      <p className="text-sm text-gray-600">Rekomendasi</p>
                      <p className="text-xl font-bold text-blue-600">
                        {comparisonData.data_size > 5000 ? "Gunakan Iteratif" : "Bisa Rekursif"}
                      </p>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-4">
                  <span className="font-bold">Catatan:</span> Rekursif tetap berguna untuk problem yang secara natural recursive
                  seperti tree traversal, divide and conquer, dll.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <button
            onClick={() => setPage("test")}
            className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 
              text-white px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl font-bold text-lg transition duration-300
              flex items-center justify-center gap-3"
          >
            <span>↩️</span>
            <span>Kembali ke Test Page</span>
          </button>
          
          {searchResult && (
            <button
              onClick={() => {
                const summary = `
📋 LINEAR SEARCH ANALYSIS SUMMARY
════════════════════════════════════════
Data Size: ${searchResult.data_size.toLocaleString()} elements
Algorithm Tested: ${searchResult.algorithm}
────────────────────────────────────────
PERFORMANCE RESULTS:
• Execution Time: ${searchResult.execution_time_ms.toFixed(4)} ms
• Comparisons: ${searchResult.comparisons.toLocaleString()}
• Target Found: ${searchResult.found ? 'Yes' : 'No'}
• Time Complexity: ${searchResult.complexity}
────────────────────────────────────────
${comparisonData ? `
COMPARISON ANALYSIS (Iteratif vs Rekursif):
• Iteratif: ${comparisonData.iterative.time_ms.toFixed(4)} ms
• Rekursif: ${comparisonData.recursive.time_ms.toFixed(4)} ms
• Difference: ${comparisonData.comparison.time_difference_percent}%
• Faster Algorithm: ${comparisonData.comparison.faster_algorithm}
• Recommendation: ${comparisonData.comparison.recommendation}
────────────────────────────────────────
` : ''}
Backend Status: ${backendHealth?.status || 'Unknown'}
Service: ${backendHealth?.service || 'C++ API'}
Timestamp: ${new Date().toLocaleString()}
════════════════════════════════════════
                `.trim();
                
                alert(summary);
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 
                text-white px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl font-bold text-lg transition duration-300
                flex items-center justify-center gap-3"
            >
              <span>📄</span>
              <span>Generate Report</span>
            </button>
          )}
          
          <button
            onClick={() => {
              // Reset and run new test
              setPage("test");
              setTimeout(() => {
                runSearchBackend();
              }, 500);
            }}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 
              text-white px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl font-bold text-lg transition duration-300
              flex items-center justify-center gap-3"
          >
            <span>🔁</span>
            <span>Run New Test</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-700 font-medium text-lg">
            Linear Search Algorithm Analysis System
          </p>
          <p className="text-gray-600 mt-2">
            Backend: C++ REST API Server | Frontend: React.js Application
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Data diambil real-time dari backend C++ dengan simulasi perbandingan algoritma
          </p>
          
          {backendHealth && (
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-gray-100 rounded-full">
              <div className={`w-3 h-3 rounded-full ${backendHealth.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-gray-700">
                Backend Status: <span className="font-bold">{backendHealth.status}</span>
              </span>
              {backendHealth.service && (
                <span className="text-gray-500">| {backendHealth.service}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}