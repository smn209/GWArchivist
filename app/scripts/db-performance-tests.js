#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// load configuration
const configPath = path.join(__dirname, 'test-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const BASE_URL = config.baseUrl;
const ITERATIONS = config.iterations;
const CONCURRENT_REQUESTS = config.concurrentRequests;
const TIMEOUT = config.timeout;

// test scenarios
const TEST_SCENARIOS = [
  // Homepage Tests
  {
    name: 'HOMEPAGE_BASIC',
    description: 'Basic homepage load',
    url: '/api/matchs?limit=10',
    method: 'GET'
  },
  {
    name: 'HOMEPAGE_LARGE_LIMIT',
    description: 'Homepage with large limit',
    url: '/api/matchs?limit=100',
    method: 'GET'
  },
  {
    name: 'HOMEPAGE_WITH_PAGINATION',
    description: 'Homepage with pagination',
    url: '/api/matchs?limit=20&offset=50',
    method: 'GET'
  },
  {
    name: 'SINGLE_MATCH_DETAILS',
    description: 'Single match detailed view',
    url: `/api/matchs?match_id=${config.testData.sampleMatchIds[0]}`,
    method: 'GET'
  },
  {
    name: 'MULTIPLE_MATCH_DETAILS',
    description: 'Multiple matches detailed view',
    url: `/api/matchs?match_ids=${config.testData.sampleMatchIds.slice(0, 3).join(',')}`,
    method: 'GET'
  },

  // Memorial Basic Tests
  {
    name: 'MEMORIAL_BASIC',
    description: 'Basic memorial load',
    url: '/api/memorial?limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_LARGE_DATASET',
    description: 'Memorial with large dataset',
    url: '/api/memorial?limit=200&offset=0',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_DEEP_PAGINATION',
    description: 'Memorial deep pagination',
    url: '/api/memorial?limit=50&offset=1000',
    method: 'GET'
  },

  // Memorial Text Search Tests
  {
    name: 'MEMORIAL_TEXT_SEARCH_SHORT',
    description: 'Text search with short term',
    url: '/api/memorial?search=vs&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_TEXT_SEARCH_GUILD',
    description: 'Text search for guild name',
    url: `/api/memorial?search=${encodeURIComponent(config.testData.sampleGuilds[0])}&limit=50`,
    method: 'GET'
  },
  {
    name: 'MEMORIAL_TEXT_SEARCH_TAG',
    description: 'Text search for guild tag',
    url: '/api/memorial?search=tag&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_TEXT_SEARCH_PLAYER',
    description: 'Text search for player pseudo',
    url: '/api/memorial?search=player&limit=50',
    method: 'GET'
  },

  // Memorial Date Filtering Tests
  {
    name: 'MEMORIAL_DATE_RANGE_RECENT',
    description: 'Recent date range filter',
    url: `/api/memorial?dateFrom=${config.testData.sampleDates.recent[0]}&dateTo=${config.testData.sampleDates.recent[1]}&limit=50`,
    method: 'GET'
  },
  {
    name: 'MEMORIAL_DATE_RANGE_OLD',
    description: 'Old date range filter',
    url: `/api/memorial?dateFrom=${config.testData.sampleDates.old[0]}&dateTo=${config.testData.sampleDates.old[1]}&limit=50`,
    method: 'GET'
  },
  {
    name: 'MEMORIAL_SINGLE_DATE',
    description: 'Single date filter',
    url: '/api/memorial?dateFrom=2024-06-15&dateTo=2024-06-15&limit=50',
    method: 'GET'
  },

  // Memorial Profession Filtering Tests
  {
    name: 'MEMORIAL_SINGLE_PROFESSION',
    description: 'Single profession filter',
    url: '/api/memorial?profession1=1&profession1Count=1&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_MULTIPLE_PROFESSIONS',
    description: 'Multiple profession filters',
    url: '/api/memorial?profession1=1&profession1Count=2&profession2=3&profession2Count=2&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_HIGH_PROFESSION_COUNT',
    description: 'High profession count requirement',
    url: '/api/memorial?profession1=1&profession1Count=6&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_COMPLEX_PROFESSION_MIX',
    description: 'Complex profession combinations',
    url: '/api/memorial?profession1=1&profession1Count=3&profession2=7&profession2Count=3&profession3=3&profession3Count=2&limit=50',
    method: 'GET'
  },

  // Memorial Combined Complex Filters
  {
    name: 'MEMORIAL_TEXT_AND_DATE',
    description: 'Text search with date range',
    url: '/api/memorial?search=test&dateFrom=2024-01-01&dateTo=2024-12-31&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_TEXT_AND_PROFESSION',
    description: 'Text search with profession filter',
    url: '/api/memorial?search=guild&profession1=1&profession1Count=2&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_DATE_AND_PROFESSION',
    description: 'Date range with profession filter',
    url: '/api/memorial?dateFrom=2024-01-01&profession1=1&profession1Count=3&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_ALL_FILTERS_SIMPLE',
    description: 'All filter types combined (simple)',
    url: '/api/memorial?search=test&dateFrom=2024-01-01&flux=test&occasion=test&profession1=1&profession1Count=1&limit=50',
    method: 'GET'
  },
  {
    name: 'MEMORIAL_ALL_FILTERS_COMPLEX',
    description: 'All filter types combined (complex)',
    url: '/api/memorial?search=guild&dateFrom=2024-01-01&dateTo=2024-12-31&mapId=1&flux=test&occasion=tournament&profession1=1&profession1Count=3&profession2=7&profession2Count=2&profession3=3&profession3Count=1&limit=50',
    method: 'GET'
  },

  // Memorial Filter Options Tests
  {
    name: 'MEMORIAL_FILTER_OCCASIONS',
    description: 'Load occasion filter options',
    url: '/api/memorial',
    method: 'POST',
    body: { type: 'occasions' }
  },
  {
    name: 'MEMORIAL_FILTER_FLUXES',
    description: 'Load flux filter options',
    url: '/api/memorial',
    method: 'POST',
    body: { type: 'fluxes' }
  },
  {
    name: 'MEMORIAL_FILTER_MAPS',
    description: 'Load map filter options',
    url: '/api/memorial',
    method: 'POST',
    body: { type: 'maps' }
  },
  {
    name: 'MEMORIAL_FILTER_GUILDS',
    description: 'Load guild filter options',
    url: '/api/memorial',
    method: 'POST',
    body: { type: 'guilds' }
  },
  {
    name: 'MEMORIAL_FILTER_GUILDS_SEARCH',
    description: 'Search guild filter options',
    url: '/api/memorial',
    method: 'POST',
    body: { type: 'guilds', search: 'test' }
  }
];

class PerformanceStats {
  constructor() {
    this.times = [];
  }

  addTime(time) {
    this.times.push(time);
  }

  getStats() {
    if (this.times.length === 0) return null;

    const sorted = [...this.times].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: sum / sorted.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      count: sorted.length
    };
  }
}

function makeRequest(scenario) {
  return new Promise((resolve, reject) => {
    const url = new URL(scenario.url, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: scenario.method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DB-Performance-Test/1.0'
      }
    };

    const startTime = process.hrtime.bigint();
    
    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // convert to milliseconds
        
        try {
          const response = JSON.parse(data);
          resolve({
            duration,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            dataSize: data.length,
            response,
            error: res.statusCode >= 400 ? `HTTP ${res.statusCode}: ${response.error || 'Unknown error'}` : undefined
          });
        } catch (error) {
          resolve({
            duration,
            status: res.statusCode,
            success: false,
            error: `HTTP ${res.statusCode}: Invalid JSON response`,
            dataSize: data.length
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      reject({
        duration,
        success: false,
        error: error.message
      });
    });

    if (scenario.body) {
      req.write(JSON.stringify(scenario.body));
    }

    req.end();
  });
}

async function runTestScenario(scenario, iterations = ITERATIONS) {
  console.log(`Running test: ${scenario.name} (${iterations} iterations)`);
  
  const stats = new PerformanceStats();
  const errors = [];
  let successCount = 0;

  // run tests in batches to avoid overwhelming the server
  for (let i = 0; i < iterations; i += CONCURRENT_REQUESTS) {
    const batch = [];
    const batchSize = Math.min(CONCURRENT_REQUESTS, iterations - i);
    
    for (let j = 0; j < batchSize; j++) {
      batch.push(makeRequest(scenario));
    }

    try {
      const results = await Promise.allSettled(batch);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { duration, success, error } = result.value;
          stats.addTime(duration);
          
          if (success) {
            successCount++;
          } else {
            errors.push(error || 'unknown error');
          }
        } else {
          errors.push(result.reason?.error || 'request failed');
        }
      });
    } catch (error) {
      errors.push(`batch error: ${error.message}`);
    }

    // small delay between batches
    if (i + CONCURRENT_REQUESTS < iterations) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  return {
    scenario: scenario.name,
    description: scenario.description,
    endpoint: scenario.url.split('?')[0],
    fullUrl: `${BASE_URL}${scenario.url}`,
    stats: stats.getStats(),
    successCount,
    errorCount: errors.length,
    successRate: (successCount / iterations) * 100,
    errors: errors.slice(0, 5) // keep only first 5 errors
  };
}

function formatTime(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function printResultsTable(results) {
  console.log('\nPERFORMANCE TEST RESULTS\n');
  
  // table header
  const headers = [
    'Test Name',
    'Endpoint',
    'Full URL',
    'Success Rate',
    'Min',
    'Avg',
    'P50',
    'P90',
    'P95',
    'P99',
    'Max'
  ];
  
  const colWidths = [
    25, // test name
    15, // endpoint
    50, // full URL
    12, // success rate
    8,  // min
    8,  // avg
    8,  // p50
    8,  // p90
    8,  // p95
    8,  // p99
    8   // max
  ];

  // print header
  let headerRow = '|';
  headers.forEach((header, i) => {
    headerRow += ` ${header.padEnd(colWidths[i] - 1)}|`;
  });
  console.log(headerRow);

  // print separator
  let separator = '|';
  colWidths.forEach(width => {
    separator += '-'.repeat(width) + '|';
  });
  console.log(separator);

  // print data rows
  results.forEach(result => {
    const stats = result.stats;
    if (!stats) {
      console.log(`| ${result.scenario.padEnd(colWidths[0] - 1)}| ${result.endpoint?.padEnd(colWidths[1] - 1) || 'ERROR'.padEnd(colWidths[1] - 1)}| ${result.fullUrl?.padEnd(colWidths[2] - 1) || 'ERROR'.padEnd(colWidths[2] - 1)}| ${'0.0%'.padEnd(colWidths[3] - 1)}| ${'-'.repeat(7)}| ${'-'.repeat(7)}| ${'-'.repeat(7)}| ${'-'.repeat(7)}| ${'-'.repeat(7)}| ${'-'.repeat(7)}| ${'-'.repeat(7)}|`);
      return;
    }

    let row = '|';
    const values = [
      result.scenario.substring(0, colWidths[0] - 1),
      result.endpoint?.substring(0, colWidths[1] - 1) || '',
      result.fullUrl?.substring(0, colWidths[2] - 1) || '',
      `${result.successRate.toFixed(1)}%`,
      formatTime(stats.min),
      formatTime(stats.average),
      formatTime(stats.p50),
      formatTime(stats.p90),
      formatTime(stats.p95),
      formatTime(stats.p99),
      formatTime(stats.max)
    ];

    values.forEach((value, i) => {
      row += ` ${value.padEnd(colWidths[i] - 1)}|`;
    });
    console.log(row);
  });

  console.log('\nSUMMARY STATISTICS\n');
  
  const allSuccessful = results.filter(r => r.stats && r.successRate > 95);
  const avgResponseTime = allSuccessful.reduce((sum, r) => sum + r.stats.average, 0) / allSuccessful.length;
  const totalTests = results.reduce((sum, r) => sum + r.successCount + r.errorCount, 0);
  const totalSuccessful = results.reduce((sum, r) => sum + r.successCount, 0);
  
  console.log(`Total tests executed: ${totalTests}`);
  console.log(`Overall success rate: ${((totalSuccessful / totalTests) * 100).toFixed(1)}%`);
  console.log(`Average response time: ${formatTime(avgResponseTime)}`);
  console.log(`Fastest test: ${results.reduce((min, r) => r.stats && r.stats.min < min ? r.stats.min : min, Infinity) !== Infinity ? formatTime(results.reduce((min, r) => r.stats && r.stats.min < min ? r.stats.min : min, Infinity)) : 'N/A'}`);
  console.log(`Slowest test: ${results.reduce((max, r) => r.stats && r.stats.max > max ? r.stats.max : max, 0) > 0 ? formatTime(results.reduce((max, r) => r.stats && r.stats.max > max ? r.stats.max : max, 0)) : 'N/A'}`);
  
  // show errors if any
  const errorsFound = results.filter(r => r.errorCount > 0);
  if (errorsFound.length > 0) {
    console.log('\nTESTS WITH ERRORS:\n');
    errorsFound.forEach(result => {
      console.log(`${result.scenario}: ${result.errorCount} errors`);
      result.errors.forEach(error => console.log(`  - ${error}`));
    });
  }

  console.log('\nPERFORMANCE TESTING COMPLETED\n');
}

async function main() {
  console.log('STARTING DATABASE PERFORMANCE TESTS\n');
  console.log(`Configuration loaded from: ${configPath}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Iterations per test: ${ITERATIONS}`);
  console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Request timeout: ${TIMEOUT}ms`);
  console.log(`Total test scenarios: ${TEST_SCENARIOS.length}\n`);

  // check if server is running
  try {
    await makeRequest({ url: '/api/health', method: 'GET' });
    console.log('Server is responding\n');
  } catch (error) {
    console.error('Server is not responding. Please start the server first.');
    console.error('Run: npm run dev or npm run start\n');
    process.exit(1);
  }

  const results = [];
  const startTime = Date.now();

  for (const scenario of TEST_SCENARIOS) {
    try {
      const result = await runTestScenario(scenario, ITERATIONS);
      results.push(result);
      
      // show progress
      const progress = ((results.length / TEST_SCENARIOS.length) * 100).toFixed(1);
      console.log(`Completed (${progress}%): ${formatTime(result.stats?.average || 0)} avg\n`);
      
    } catch (error) {
      console.error(`Failed: ${error.message}\n`);
      results.push({
        scenario: scenario.name,
        description: scenario.description,
        endpoint: scenario.url.split('?')[0],
        fullUrl: `${BASE_URL}${scenario.url}`,
        stats: null,
        successCount: 0,
        errorCount: ITERATIONS,
        successRate: 0,
        errors: [error.message]
      });
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(`\nALL TESTS COMPLETED IN ${formatTime(totalTime)}\n`);

  printResultsTable(results);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTestScenario, TEST_SCENARIOS };