# TitanPL Performance Benchmark Report

Date: 2026-01-16

## Introduction

This report documents a series of performance benchmarks comparing TitanPL with Express.js. The intent is to provide an objective technical assessment of throughput, latency, routing scalability, memory behavior, and CPU efficiency under controlled test conditions. All tests were executed on identical hardware and concurrency levels using the Autocannon benchmarking tool.

---

## 1. Test Scenarios

The evaluation includes the following scenarios:

1. Simple route handling (single endpoint)
2. Large route table performance (2000 routes)
3. Complex JavaScript business logic execution
4. Memory usage stability under load
5. Latency distribution (p50, p97.5, p99)
6. Throughput and payload transfer characteristics

---

## 2. Results Summary

### 2.1 Throughput and Latency

| Scenario                      | TitanPL | Express.js | Improvement |
| ----------------------------- | ------- | ---------- | ----------- |
| Simple Route Requests/sec     | 14,437  | 10,238     | +41%        |
| Large Route Requests/sec      | 14,400  | 899.5      | +1,501%     |
| Business Logic Requests/sec   | ~1,200  | ~950       | +25%        |
| Average Latency (2000 routes) | ~35 ms  | 546 ms     | −93.6%      |
| P99 Latency (2000 routes)     | ~55 ms  | 786 ms     | −93%        |

TitanPL consistently delivers superior throughput and substantially lower tail latency across all workloads.

---

## 3. Memory Utilization

### 3.1 Baseline and Load Comparison

| Framework                | Before Load | Under Load | Change |
| ------------------------ | ----------- | ---------- | ------ |
| TitanPL (2000 routes)    | 60.55 MB    | 60.52 MB   | −0.05% |
| Express.js (2000 routes) | 54.84 MB    | 65.20 MB   | +18.9% |

TitanPL demonstrates near-constant memory usage due to Rust’s deterministic allocation model, whereas Express.js exhibits observable growth under sustained pressure, partially attributed to Node.js heap expansion and garbage collection cycles.

---

## 4. Routing Architecture Analysis

TitanPL utilizes a constant-time routing mechanism. The cost of route resolution remains constant regardless of table size, contributing to stable performance even with thousands of endpoints.

Express.js employs sequential route matching. As the route table grows, lookup overhead increases, negatively affecting both throughput and latency.

---

## 5. Business Logic Execution

A dedicated benchmark was executed where each request triggered complex JavaScript operations, including filtering, mapping, reducing, and sorting. The objective was to isolate the effect of routing from pure compute time.

TitanPL maintained a 25 percent performance advantage due to reduced overhead in request parsing and dispatch. When computation dominates, TitanPL effectively returns more available CPU capacity to the user’s business logic.

---

## 6. Throughput Characteristics

Under large-scale routing scenarios, TitanPL achieves data transfer rates roughly ten times higher than Express.js within identical execution windows. The difference stems from the combination of lower overhead, constant-time dispatch, and efficient binary response handling.

---

## 7. Latency Distribution

TitanPL maintains stable latency profiles across the 50th, 97.5th, and 99th percentiles. In contrast, Express.js exhibits significant tail latency degradation, especially under high concurrency or large route tables.

---

## 8. Test Environment

* Operating System: Windows
* TitanPL Version: 26.9.1
* Express.js Version: 5.2.1
* Node.js Version: 24.12.0
* Concurrency: 500 connections
* Duration: 10 seconds per scenario
* Benchmark Tool: Autocannon

---

## 9. Conclusion

The benchmarks demonstrate that TitanPL delivers:

* Higher throughput across all scenarios
* Significantly lower average and tail latency
* Superior performance with large route tables
* Stable and predictable memory behavior
* Better efficiency during complex business logic execution

Express.js remains suitable for rapid development and broad ecosystem compatibility. However, TitanPL is more appropriate for high-scale, high-performance, or latency-sensitive applications.

---

## 10. Recommendations

TitanPL is recommended for:

* High-concurrency API services
* Applications with extensive routing requirements
* Performance-critical microservices
* Systems requiring predictable memory usage
* Long-running production workloads

Express.js is recommended for:

* Prototyping
* Middleware-intensive applications
* Projects requiring extensive third-party packages
