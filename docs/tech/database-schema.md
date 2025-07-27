# Database Schema

## ClickHouse Database
[![ClickHouse](https://img.shields.io/badge/ClickHouse-FFCC01?style=for-the-badge&logo=clickhouse&logoColor=black)](https://clickhouse.com/)

We use **ClickHouse** as our primary database for optimal performance:

- **Speed**: 10-100x faster query performance compared to MySQL/PostgreSQL for analytical workloads, specifically designed to handle Observer Lite's high-volume data streams
- **Compression**: Achieves 10x better compression ratios than PostgreSQL or MySQL, significantly reducing storage costs
- **Scalability**: Handles millions of records with sub-second response times, enabling complex player statistics calculations (like total damage across all games) in under 50ms

## Performance Testing

Run database performance tests with:

```bash
npm run db-tests
```

## Test Configuration

The performance tests use a configuration file at `scripts/test-config.json`:

```json
{
  "baseUrl": "http://localhost:3000",
  "iterations": 100,
  "concurrentRequests": 5,
  "timeout": 30000,
  "testData": {
    "sampleMatchIds": [
      "1753467757387916",
      "1753467757378750",
      "1753467757376875",
      "1753467757369458",
      "1753467755573166"
    ],
    "sampleGuilds": ["Missed Grasping By A Country", "Rebel Rising", "One Time Too Many"],
    "sampleDates": {
      "recent": ["2024-01-01", "2024-12-31"],
      "old": ["2020-01-01", "2021-12-31"]
    }
  }
}
```

### Running Your Own Tests

To test with your database (~1600 matches), ensure:
1. **Update `sampleMatchIds`** with valid match IDs from your database
2. **Update `sampleGuilds`** with existing guild names
3. **Adjust date ranges** to match your data timeframe

### Latest Performance Results (1600+ Matches)

**Test Configuration:**
- Total execution time: 72.64s
- Test scenarios: 29 endpoints
- Iterations per test: 100
- Concurrent requests: 5
- Request timeout: 30s

**Overall Metrics:**
- Total tests executed: 2,900
- Success rate: 100.0%
- Average response time: 107.9ms
- Fastest response: 4.7ms
- Slowest response: 380.3ms

### Detailed Results


PERFORMANCE TEST RESULTS

| Test Name               | Endpoint      | Full URL                                         | Success Rate| Min    | Avg    | P50    | P90    | P95    | P99    | Max    |
|-------------------------|---------------|--------------------------------------------------|------------|--------|--------|--------|--------|--------|--------|--------|
| HOMEPAGE_BASIC          | /api/matchs   | http://localhost:3000/api/matchs?limit=10        | 100.0%     | 56.8ms | 82.5ms | 77.0ms | 91.8ms | 193.6ms| 208.5ms| 208.5ms|
| HOMEPAGE_LARGE_LIMIT    | /api/matchs   | http://localhost:3000/api/matchs?limit=100       | 100.0%     | 62.9ms | 86.2ms | 87.1ms | 102.3ms| 104.9ms| 112.3ms| 112.3ms|
| HOMEPAGE_WITH_PAGINATION| /api/matchs   | http://localhost:3000/api/matchs?limit=20&offset=| 100.0%     | 59.9ms | 78.9ms | 77.6ms | 87.2ms | 103.0ms| 116.3ms| 116.3ms|
| SINGLE_MATCH_DETAILS    | /api/matchs   | http://localhost:3000/api/matchs?match_id=nonexis| 100.0%     | 5.3ms  | 10.2ms | 10.0ms | 13.2ms | 18.4ms | 22.2ms | 22.2ms |
| MULTIPLE_MATCH_DETAILS  | /api/matchs   | http://localhost:3000/api/matchs?match_ids=nonexi| 100.0%     | 5.5ms  | 7.6ms  | 7.6ms  | 9.1ms  | 9.8ms  | 10.7ms | 10.7ms |
| MEMORIAL_BASIC          | /api/memorial | http://localhost:3000/api/memorial?limit=50      | 100.0%     | 71.6ms | 109.4ms| 107.8ms| 133.6ms| 144.1ms| 157.2ms| 157.2ms|
| MEMORIAL_LARGE_DATASET  | /api/memorial | http://localhost:3000/api/memorial?limit=200&offs| 100.0%     | 68.3ms | 114.8ms| 112.4ms| 143.8ms| 151.7ms| 179.0ms| 179.0ms|
| MEMORIAL_DEEP_PAGINATION| /api/memorial | http://localhost:3000/api/memorial?limit=50&offse| 100.0%     | 90.3ms | 122.4ms| 115.1ms| 141.5ms| 227.2ms| 275.4ms| 275.4ms|
| MEMORIAL_TEXT_SEARCH_SHO| /api/memorial | http://localhost:3000/api/memorial?search=vs&limi| 100.0%     | 85.1ms | 142.3ms| 118.7ms| 294.8ms| 315.1ms| 320.5ms| 320.5ms|
| MEMORIAL_TEXT_SEARCH_GUI| /api/memorial | http://localhost:3000/api/memorial?search=guild&l| 100.0%     | 55.6ms | 103.7ms| 102.6ms| 125.5ms| 134.0ms| 145.0ms| 145.0ms|
| MEMORIAL_TEXT_SEARCH_TAG| /api/memorial | http://localhost:3000/api/memorial?search=tag&lim| 100.0%     | 70.6ms | 113.8ms| 103.1ms| 182.3ms| 215.4ms| 220.8ms| 220.8ms|
| MEMORIAL_TEXT_SEARCH_PLA| /api/memorial | http://localhost:3000/api/memorial?search=player&| 100.0%     | 79.0ms | 115.3ms| 109.8ms| 153.5ms| 168.5ms| 181.5ms| 181.5ms|
| MEMORIAL_DATE_RANGE_RECE| /api/memorial | http://localhost:3000/api/memorial?dateFrom=2024-| 100.0%     | 27.5ms | 59.9ms | 59.8ms | 69.8ms | 72.6ms | 105.9ms| 105.9ms|
| MEMORIAL_DATE_RANGE_OLD | /api/memorial | http://localhost:3000/api/memorial?dateFrom=2020-| 100.0%     | 40.0ms | 62.9ms | 63.4ms | 74.6ms | 76.6ms | 95.5ms | 95.5ms |
| MEMORIAL_SINGLE_DATE    | /api/memorial | http://localhost:3000/api/memorial?dateFrom=2024-| 100.0%     | 20.0ms | 50.1ms | 49.8ms | 62.2ms | 75.0ms | 79.0ms | 79.0ms |
| MEMORIAL_SINGLE_PROFESSI| /api/memorial | http://localhost:3000/api/memorial?profession1=1&| 100.0%     | 117.5ms| 195.3ms| 189.8ms| 254.1ms| 320.9ms| 335.2ms| 335.2ms|
| MEMORIAL_MULTIPLE_PROFES| /api/memorial | http://localhost:3000/api/memorial?profession1=1&| 100.0%     | 158.4ms| 234.5ms| 222.6ms| 322.6ms| 414.2ms| 447.2ms| 447.2ms|
| MEMORIAL_HIGH_PROFESSION| /api/memorial | http://localhost:3000/api/memorial?profession1=1&| 100.0%     | 71.9ms | 123.6ms| 109.2ms| 160.5ms| 259.1ms| 289.1ms| 289.1ms|
| MEMORIAL_COMPLEX_PROFESS| /api/memorial | http://localhost:3000/api/memorial?profession1=1&| 100.0%     | 186.5ms| 313.9ms| 282.7ms| 477.4ms| 650.0ms| 666.0ms| 666.0ms|
| MEMORIAL_TEXT_AND_DATE  | /api/memorial | http://localhost:3000/api/memorial?search=test&da| 100.0%     | 42.7ms | 86.6ms | 78.5ms | 122.4ms| 136.1ms| 140.0ms| 140.0ms|
| MEMORIAL_TEXT_AND_PROFES| /api/memorial | http://localhost:3000/api/memorial?search=guild&p| 100.0%     | 129.1ms| 211.3ms| 201.5ms| 252.6ms| 361.8ms| 386.9ms| 386.9ms|
| MEMORIAL_DATE_AND_PROFES| /api/memorial | http://localhost:3000/api/memorial?dateFrom=2024-| 100.0%     | 98.5ms | 164.5ms| 141.9ms| 242.8ms| 269.8ms| 326.0ms| 326.0ms|
| MEMORIAL_ALL_FILTERS_SIM| /api/memorial | http://localhost:3000/api/memorial?search=test&da| 100.0%     | 92.9ms | 156.1ms| 142.6ms| 181.9ms| 374.4ms| 397.8ms| 397.8ms|
| MEMORIAL_ALL_FILTERS_COM| /api/memorial | http://localhost:3000/api/memorial?search=guild&d| 100.0%     | 175.8ms| 273.7ms| 240.2ms| 360.6ms| 587.7ms| 626.6ms| 626.6ms|
| MEMORIAL_FILTER_OCCASION| /api/memorial | http://localhost:3000/api/memorial               | 100.0%     | 27.6ms | 47.6ms | 38.7ms | 89.4ms | 99.4ms | 103.6ms| 103.6ms|
| MEMORIAL_FILTER_FLUXES  | /api/memorial | http://localhost:3000/api/memorial               | 100.0%     | 21.1ms | 35.0ms | 32.4ms | 48.6ms | 53.3ms | 63.4ms | 63.4ms |
| MEMORIAL_FILTER_MAPS    | /api/memorial | http://localhost:3000/api/memorial               | 100.0%     | 17.9ms | 36.4ms | 33.3ms | 46.6ms | 90.7ms | 100.9ms| 100.9ms|
| MEMORIAL_FILTER_GUILDS  | /api/memorial | http://localhost:3000/api/memorial               | 100.0%     | 4.9ms  | 11.3ms | 10.2ms | 15.8ms | 27.2ms | 29.3ms | 29.3ms |
| MEMORIAL_FILTER_GUILDS_S| /api/memorial | http://localhost:3000/api/memorial               | 100.0%     | 5.7ms  | 10.4ms | 9.8ms  | 15.3ms | 15.8ms | 19.2ms | 19.2ms |

## Understanding ClickHouse Performance

### Important Test Considerations

**Background Processing:**
ClickHouse performs multiple optimizations in the background including caching, query optimization, and data compression. This can occasionally result in higher response times (up to 600ms in tests) that don't reflect real-world performance once the system is warmed up.

**API vs Database Performance:**
The test results show **end-to-end API response times**, not raw database query times. This includes:

- Database query execution
- API processing overhead  
- JSON serialization
- Network latency

**Example Performance Breakdown:**
```
Database Query: 5ms
API Processing: 145ms
Total Response: 150ms (what users experience)
```

### Learn More

For detailed ClickHouse documentation and advanced optimization techniques:
[ClickHouse Operations Guide](https://clickhouse.com/docs/operations/overview)