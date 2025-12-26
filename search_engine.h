#ifndef SEARCH_ENGINE_H
#define SEARCH_ENGINE_H

#include <vector>
#include <string>
#include <chrono>
#include <functional>

struct SearchResult {
    int index;
    int comparisons;
    long long execution_time_ns;
    bool found;
    std::string algorithm;
    std::string target;
    int data_size;
};

struct BenchmarkData {
    int size;
    long long iterative_time_ns;
    long long recursive_time_ns;
    int iterative_comparisons;
    int recursive_comparisons;
};

class LinearSearchEngine {
public:
    static std::vector<std::string> generateVideoData(int n);
    static SearchResult linearSearchIterative(const std::vector<std::string>& data, 
                                             const std::string& target);
    static SearchResult linearSearchRecursive(const std::vector<std::string>& data, 
                                             const std::string& target);
    static SearchResult runBenchmark(int data_size, const std::string& algorithm);
    static std::vector<BenchmarkData> runPerformanceAnalysis();
};

#endif