#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <chrono>
#include <random>
#include <algorithm>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <thread>
#include <atomic>
#include <map>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

// ==================== SEARCH ENGINE ====================
class LinearSearchEngine {
public:
    static vector<string> generateVideoData(int n) {
        vector<string> videos(n);
        for(int i = 0; i < n; i++) {
            videos[i] = "VID_" + to_string(1000000 + i) + "_YouTube";
        }
        random_device rd;
        mt19937 g(rd());
        shuffle(videos.begin(), videos.end(), g);
        return videos;
    }
    
    static int linearSearch(const vector<string>& data, const string& target, int& comparisons) {
        comparisons = 0;
        for(size_t i = 0; i < data.size(); i++) {
            comparisons++;
            if(data[i] == target) {
                return i;
            }
        }
        return -1;
    }
};

// ==================== HTTP SERVER ====================
class SimpleApiServer {
private:
    int port;
    SOCKET server_socket;
    atomic<bool> running;
    
public:
    SimpleApiServer(int p = 8080) : port(p), server_socket(INVALID_SOCKET), running(false) {
        WSADATA wsaData;
        if(WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            throw runtime_error("Failed to initialize Winsock");
        }
    }
    
    ~SimpleApiServer() {
        stop();
        WSACleanup();
    }
    
    bool start() {
        server_socket = socket(AF_INET, SOCK_STREAM, 0);
        if(server_socket == INVALID_SOCKET) {
            cerr << "Failed to create socket" << endl;
            return false;
        }
        
        int yes = 1;
        setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (char*)&yes, sizeof(yes));
        
        sockaddr_in server_addr;
        server_addr.sin_family = AF_INET;
        server_addr.sin_addr.s_addr = INADDR_ANY;
        server_addr.sin_port = htons(port);
        
        if(bind(server_socket, (sockaddr*)&server_addr, sizeof(server_addr)) == SOCKET_ERROR) {
            cerr << "Failed to bind to port " << port << endl;
            cerr << "Trying port " << port + 1 << "..." << endl;
            port++;
            server_addr.sin_port = htons(port);
            if(bind(server_socket, (sockaddr*)&server_addr, sizeof(server_addr)) == SOCKET_ERROR) {
                closesocket(server_socket);
                return false;
            }
        }
        
        if(listen(server_socket, 10) == SOCKET_ERROR) {
            cerr << "Failed to listen" << endl;
            closesocket(server_socket);
            return false;
        }
        
        running = true;
        
        // Tampilkan info server
        system("cls");
        cout << "================================================" << endl;
        cout << "   LINEAR SEARCH API SERVER - C++ BACKEND      " << endl;
        cout << "================================================" << endl;
        cout << "Anggota Kelompok:" << endl;
        cout << "1. 103072400122 - Ibrahimovich Paradise" << endl;
        cout << "2. 103072400074 - Ical Helmizar Tambunan" << endl;
        cout << "3. 103072400096 - Muhammad Kelvin Firmansyah" << endl;
        cout << "================================================" << endl;
        cout << "🚀 Server started on http://localhost:" << port << endl;
        cout << "📡 Available endpoints:" << endl;
        cout << "  GET /api/health" << endl;
        cout << "  GET /api/search?size=1000" << endl;
        cout << "  GET /api/complexity" << endl;
        cout << "  GET /api/batch?sizes=100,500,1000" << endl;
        cout << "================================================" << endl;
        cout << "Press Ctrl+C to stop server" << endl;
        cout << "================================================" << endl;
        
        while(running) {
            sockaddr_in client_addr;
            int client_size = sizeof(client_addr);
            SOCKET client_socket = accept(server_socket, (sockaddr*)&client_addr, &client_size);
            
            if(client_socket == INVALID_SOCKET) {
                if(running) {
                    cerr << "Accept failed" << endl;
                }
                continue;
            }
            
            thread(&SimpleApiServer::handle_client, this, client_socket).detach();
        }
        
        return true;
    }
    
    void stop() {
        running = false;
        if(server_socket != INVALID_SOCKET) {
            closesocket(server_socket);
        }
    }
    
    int get_port() const { return port; }
    
private:
    void handle_client(SOCKET client_socket) {
        char buffer[4096];
        int bytes_received = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
        
        if(bytes_received > 0) {
            buffer[bytes_received] = '\0';
            string request(buffer);
            string response = handle_request(request);
            send(client_socket, response.c_str(), response.length(), 0);
        }
        
        closesocket(client_socket);
    }
    
    string handle_request(const string& request) {
        istringstream iss(request);
        string method, path, protocol;
        iss >> method >> path >> protocol;
        
        // Log request
        cout << "[API] " << method << " " << path << endl;
        
        // Handle CORS preflight
        if(method == "OPTIONS") {
            return "HTTP/1.1 200 OK\r\n"
                   "Access-Control-Allow-Origin: *\r\n"
                   "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                   "Access-Control-Allow-Headers: Content-Type\r\n"
                   "Content-Length: 0\r\n\r\n";
        }
        
        // Handle GET requests
        if(method == "GET") {
            if(path == "/api/health") {
                return create_json_response(R"({
                    "status": "healthy",
                    "service": "Linear Search API",
                    "version": "1.0.0",
                    "timestamp": ")" + get_current_time() + R"(",
                    "endpoints": ["/api/health", "/api/search", "/api/complexity", "/api/batch"]
                })");
            }
            else if(path.find("/api/search") == 0) {
                return handle_search_request(path);
            }
            else if(path == "/api/complexity") {
                return create_json_response(R"({
                    "algorithm": "Linear Search",
                    "description": "Search through list sequentially",
                    "time_complexity": {
                        "best_case": "O(1) - element found at first position",
                        "average_case": "O(n) - element found in the middle",
                        "worst_case": "O(n) - element not found or at the end"
                    },
                    "space_complexity": {
                        "iterative": "O(1) - constant space",
                        "recursive": "O(n) - call stack depth"
                    },
                    "characteristics": [
                        "Simple to implement",
                        "Works on unsorted data",
                        "No preprocessing needed",
                        "Good for small datasets"
                    ]
                })");
            }
            else if(path.find("/api/batch") == 0) {
                return handle_batch_request(path);
            }
        }
        
        // 404 Not Found
        return "HTTP/1.1 404 Not Found\r\n"
               "Content-Type: application/json\r\n"
               "Access-Control-Allow-Origin: *\r\n\r\n"
               "{\"error\":\"Endpoint not found\"}";
    }
    
    string handle_search_request(const string& path) {
        int size = 1000;
        
        // Parse query parameters
        size_t qmark = path.find('?');
        if(qmark != string::npos) {
            string query = path.substr(qmark + 1);
            size_t size_pos = query.find("size=");
            if(size_pos != string::npos) {
                size_t start = size_pos + 5;
                size_t end = query.find('&', start);
                if(end == string::npos) end = query.length();
                string size_str = query.substr(start, end - start);
                try {
                    size = stoi(size_str);
                } catch(...) {
                    size = 1000;
                }
            }
        }
        
        // Validate size
        if(size > 100000) size = 100000;
        if(size < 10) size = 10;
        
        // Run benchmark
        auto start_time = chrono::high_resolution_clock::now();
        auto videos = LinearSearchEngine::generateVideoData(size);
        string target = videos[size / 2];
        int comparisons = 0;
        
        int index = LinearSearchEngine::linearSearch(videos, target, comparisons);
        bool found = (index != -1);
        
        auto end_time = chrono::high_resolution_clock::now();
        auto duration_ns = chrono::duration_cast<chrono::nanoseconds>(end_time - start_time).count();
        
        // Build JSON response
        string json = "{";
        json += "\"success\": true,";
        json += "\"data_size\": " + to_string(size) + ",";
        json += "\"algorithm\": \"iterative\","; 
        json += "\"execution_time_ns\": " + to_string(duration_ns) + ",";
        json += "\"execution_time_ms\": " + to_string(duration_ns / 1000000.0) + ",";
        json += "\"comparisons\": " + to_string(comparisons) + ",";
        json += "\"found\": " + string(found ? "true" : "false") + ",";
        json += "\"index\": " + to_string(index) + ",";
        json += "\"complexity\": \"O(n)\"";
        json += "}";
        
        return create_json_response(json);
    }
    
    string handle_batch_request(const string& path) {
        vector<int> sizes = {10, 100, 500, 1000, 5000};
        
        // Parse custom sizes
        size_t qmark = path.find('?');
        if(qmark != string::npos) {
            string query = path.substr(qmark + 1);
            size_t sizes_pos = query.find("sizes=");
            if(sizes_pos != string::npos) {
                sizes.clear();
                size_t start = sizes_pos + 6;
                size_t end = query.find('&', start);
                if(end == string::npos) end = query.length();
                string sizes_str = query.substr(start, end - start);
                
                stringstream ss(sizes_str);
                string token;
                while(getline(ss, token, ',')) {
                    try {
                        sizes.push_back(stoi(token));
                    } catch(...) {
                        // Skip invalid numbers
                    }
                }
            }
        }
        
        // Limit sizes
        if(sizes.size() > 10) sizes.resize(10);
        for(auto& s : sizes) {
            if(s > 50000) s = 50000;
            if(s < 1) s = 10;
        }
        
        // Build results array
        string results_array = "[";
        for(size_t i = 0; i < sizes.size(); i++) {
            int size = sizes[i];
            auto videos = LinearSearchEngine::generateVideoData(size);
            string target = videos[size / 2];
            int comparisons = 0;
            
            auto start = chrono::high_resolution_clock::now();
            LinearSearchEngine::linearSearch(videos, target, comparisons);
            auto end = chrono::high_resolution_clock::now();
            auto duration_ns = chrono::duration_cast<chrono::nanoseconds>(end - start).count();
            
            if(i > 0) results_array += ",";
            results_array += "{";
            results_array += "\"size\": " + to_string(size) + ",";
            results_array += "\"time_ns\": " + to_string(duration_ns) + ",";
            results_array += "\"comparisons\": " + to_string(comparisons);
            results_array += "}";
        }
        results_array += "]";
        
        string json = "{";
        json += "\"success\": true,";
        json += "\"sizes_tested\": " + to_string(sizes.size()) + ",";
        json += "\"results\": " + results_array;
        json += "}";
        
        return create_json_response(json);
    }
    
    string create_json_response(const string& json) {
        string response = "HTTP/1.1 200 OK\r\n";
        response += "Content-Type: application/json\r\n";
        response += "Access-Control-Allow-Origin: *\r\n";
        response += "Content-Length: " + to_string(json.length()) + "\r\n";
        response += "\r\n";
        response += json;
        return response;
    }
    
    string get_current_time() {
        auto now = chrono::system_clock::now();
        time_t now_time = chrono::system_clock::to_time_t(now);
        char buffer[80];
        ctime_s(buffer, sizeof(buffer), &now_time);
        string time_str(buffer);
        time_str.pop_back();
        return time_str;
    }
};

// ==================== MAIN ====================
int main() {
    cout << "Starting Linear Search API Server..." << endl;
    
    SimpleApiServer server(8080);
    
    try {
        if(!server.start()) {
            cerr << "Failed to start server. Maybe port is in use?" << endl;
            cerr << "Trying port 8081..." << endl;
            
            SimpleApiServer alt_server(8081);
            if(!alt_server.start()) {
                cerr << "Failed to start on alternative port too." << endl;
                return 1;
            }
        }
    }
    catch(const exception& e) {
        cerr << "Fatal error: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}