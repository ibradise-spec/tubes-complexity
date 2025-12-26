#include "search_engine.h"
#include <random>
#include <algorithm>
#include <iostream>
#include <fstream>
#include <iomanip>

using namespace std;
using namespace chrono;

vector<string> LinearSearchEngine::generateVideoData(int n) {
    vector<string> videos(n);
    
    for(int i = 0; i < n; i++) {
        videos[i] = "VID_" + to_string(1000000 + i) + "_YouTube";
    }
    
    random_device rd;
    mt19937 g(rd());
    shuffle(videos.begin(), videos.end(), g);
    
    return videos;
}

SearchResult LinearSearchEngine::linearSearchIterative(const vector<string>& data, 
                                                     const string& target) {
    SearchResult result;
    result.algorithm = "iterative";
    result.target = target;
    result.data_size = static_cast<int>(data.size());
    result.comparisons = 0;
    
    auto start = high_resolution_clock::now();
    
    for(size_t i = 0; i < data.size(); i++) {
        result.comparisons++;
        if(data[i] == target) {
            result.index = static_cast<int>(i);
            result.found = true;
            
            auto end = high_resolution_clock::now();
            result.execution_time_ns = duration_cast<nanoseconds>(end - start).count();
            
            return result;
        }
    }
    
    result.index = -1;
    result.found = false;
    auto end = high_resolution_clock::now();
    result.execution_time_ns = duration_cast<nanoseconds>(end - start).count();
    
    return result;
}

SearchResult LinearSearchEngine::linearSearchRecursive(const vector<string>& data, 
                                                     const string& target) {
    SearchResult result;
    result.algorithm = "recursive";
    result.target = target;
    result.data_size = static_cast<int>(data.size());
    result.comparisons = 0;
    
    auto start = high_resolution_clock::now();
    
    function<int(const vector<string>&, const string&, int, int&)> recursiveSearch;
    recursiveSearch = [&recursiveSearch](const vector<string>& arr, const string& tgt, 
                                        int idx, int& comps) -> int {
        if(idx >= static_cast<int>(arr.size())) return -1;
        
        comps++;
        if(arr[idx] == tgt) return idx;
        
        return recursiveSearch(arr, tgt, idx + 1, comps);
    };
    
    result.index = recursiveSearch(data, target, 0, result.comparisons);
    result.found = (result.index != -1);
    
    auto end = high_resolution_clock::now();
    result.execution_time_ns = duration_cast<nanoseconds>(end - start).count();
    
    return result;
}

SearchResult LinearSearchEngine::runBenchmark(int data_size, const string& algorithm) {
    auto videos = generateVideoData(data_size);
    
    if(videos.empty()) {
        SearchResult empty_result;
        empty_result.algorithm = algorithm;
        empty_result.data_size = data_size;
        empty_result.found = false;
        return empty_result;
    }
    
    string target = videos[data_size / 2];
    
    if(algorithm == "iterative") {
        return linearSearchIterative(videos, target);
    } 
    else if(algorithm == "recursive") {
        if(data_size > 10000) {
            SearchResult result;
            result.algorithm = "recursive";
            result.data_size = data_size;
            result.found = false;
            result.execution_time_ns = 0;
            result.comparisons = 0;
            result.index = -1;
            return result;
        }
        return linearSearchRecursive(videos, target);
    }
    else {
        return linearSearchIterative(videos, target);
    }
}

vector<BenchmarkData> LinearSearchEngine::runPerformanceAnalysis() {
    vector<BenchmarkData> results;
    vector<int> sizes = {1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 
                         100, 200, 300, 400, 500, 600, 700, 800, 900,
                         1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000};
    
    cout << "Running performance analysis for " << sizes.size() << " different sizes..." << endl;
    
    for(int size : sizes) {
        BenchmarkData data;
        data.size = size;
        
        auto iter_result = runBenchmark(size, "iterative");
        auto rec_result = runBenchmark(size, "recursive");
        
        data.iterative_time_ns = iter_result.execution_time_ns;
        data.recursive_time_ns = rec_result.execution_time_ns;
        data.iterative_comparisons = iter_result.comparisons;
        data.recursive_comparisons = rec_result.comparisons;
        
        results.push_back(data);
        
        cout << "Size: " << setw(5) << size 
             << " | Iterative: " << setw(8) << iter_result.execution_time_ns << " ns"
             << " | Recursive: " << setw(8) << rec_result.execution_time_ns << " ns"
             << " | Iter Comps: " << setw(5) << iter_result.comparisons
             << " | Rec Comps: " << setw(5) << rec_result.comparisons
             << endl;
    }
    
    ofstream csv_file("performance_results.csv");
    csv_file << "Size,Iterative_Time_ns,Recursive_Time_ns,Iterative_Comparisons,Recursive_Comparisons" << endl;
    
    for(const auto& data : results) {
        csv_file << data.size << ","
                << data.iterative_time_ns << ","
                << data.recursive_time_ns << ","
                << data.iterative_comparisons << ","
                << data.recursive_comparisons << endl;
    }
    
    csv_file.close();
    cout << "\nResults saved to performance_results.csv" << endl;
    
    return results;
}