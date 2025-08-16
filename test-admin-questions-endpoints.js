#!/usr/bin/env node

/**
 * Test script to check all admin question management endpoints
 * 
 * This script tests all endpoints used by the /admin/questions route
 * to identify which ones are working and which need to be replaced.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'https://srv953380.hstgr.cloud/api/v1';
const ADMIN_EMAIL = 'admin@medcin.dz';
const ADMIN_PASSWORD = 'password123';

// Output directory for JSON files
const OUTPUT_DIR = './admin-questions-test-output';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Make HTTP request with promise support
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Questions-Test/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Save response to JSON file
 */
function saveResponse(filename, response) {
  const filepath = path.join(OUTPUT_DIR, filename);
  const formattedResponse = {
    timestamp: new Date().toISOString(),
    statusCode: response.statusCode,
    data: response.data
  };
  
  fs.writeFileSync(filepath, JSON.stringify(formattedResponse, null, 2));
  console.log(`   💾 Saved response to: ${filename}`);
}

/**
 * Authenticate and get admin token
 */
async function authenticateAdmin() {
  console.log('🔐 Authenticating admin user...');
  
  const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }
  });

  if (response.statusCode === 200 && response.data.success) {
    const accessToken = response.data.data?.tokens?.accessToken;
    if (accessToken) {
      console.log('✅ Admin authentication successful');
      return accessToken;
    }
  }
  throw new Error('Authentication failed');
}

/**
 * Test all question management endpoints
 */
async function testQuestionEndpoints() {
  console.log('🚀 Testing Admin Question Management Endpoints');
  console.log('==============================================');
  
  try {
    // Step 1: Authenticate
    const adminToken = await authenticateAdmin();
    
    const results = [];
    
    // Test endpoints one by one
    const endpoints = [
      {
        name: 'Get Questions',
        method: 'GET',
        url: '/admin/questions?page=1&limit=5',
        filename: '01-get-questions.json'
      },
      {
        name: 'Get Question Filters',
        method: 'GET',
        url: '/admin/questions/filters',
        filename: '02-question-filters.json'
      },
      {
        name: 'Get Single Question',
        method: 'GET',
        url: '/admin/questions/1',
        filename: '03-single-question.json'
      },
      {
        name: 'Create Question',
        method: 'POST',
        url: '/admin/questions',
        filename: '04-create-question.json',
        body: {
          questionText: "Test question - What is 2+2?",
          explanation: "Basic arithmetic test question",
          questionType: "SINGLE_CHOICE",
          courseId: 1,
          universityId: 1,
          yearLevel: "ONE",
          answers: [
            {
              answerText: "4",
              isCorrect: true,
              explanation: "Correct answer"
            },
            {
              answerText: "3",
              isCorrect: false,
              explanation: "Incorrect"
            },
            {
              answerText: "5",
              isCorrect: false,
              explanation: "Incorrect"
            }
          ]
        }
      },
      {
        name: 'Update Question',
        method: 'PUT',
        url: '/admin/questions/1',
        filename: '05-update-question.json',
        body: {
          questionText: "Updated test question - What is 3+3?",
          explanation: "Updated explanation"
        }
      },
      {
        name: 'Update Question Explanation',
        method: 'PUT',
        url: '/admin/questions/1/explanation',
        filename: '06-update-explanation.json',
        body: {
          explanation: "Updated explanation via explanation endpoint"
        }
      },
      {
        name: 'Delete Question',
        method: 'DELETE',
        url: '/admin/questions/999',
        filename: '07-delete-question.json'
      },
      {
        name: 'Bulk Create Questions',
        method: 'POST',
        url: '/admin/questions/bulk',
        filename: '08-bulk-create.json',
        body: {
          questions: [
            {
              questionText: "Bulk test question 1",
              explanation: "Test explanation 1",
              questionType: "SINGLE_CHOICE",
              courseId: 1,
              universityId: 1,
              yearLevel: "ONE",
              answers: [
                { answerText: "Answer 1", isCorrect: true, explanation: "Correct" },
                { answerText: "Answer 2", isCorrect: false, explanation: "Wrong" }
              ]
            }
          ]
        }
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n📋 Testing ${endpoint.name}...`);
      console.log(`   ${endpoint.method} ${endpoint.url}`);
      
      try {
        const response = await makeRequest(`${API_BASE_URL}${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          body: endpoint.body
        });
        
        saveResponse(endpoint.filename, response);
        
        const status = response.statusCode === 200 ? '✅ WORKING' : 
                      response.statusCode === 404 ? '❌ NOT FOUND' :
                      response.statusCode >= 400 ? '⚠️ ERROR' : '❓ UNKNOWN';
        
        console.log(`   Status: ${response.statusCode} - ${status}`);
        
        if (response.data?.error) {
          console.log(`   Error: ${response.data.error.message || response.data.error}`);
        }
        
        results.push({
          name: endpoint.name,
          method: endpoint.method,
          url: endpoint.url,
          statusCode: response.statusCode,
          working: response.statusCode === 200,
          error: response.data?.error?.message || null
        });
        
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        results.push({
          name: endpoint.name,
          method: endpoint.method,
          url: endpoint.url,
          statusCode: 0,
          working: false,
          error: error.message
        });
      }
    }
    
    // Generate summary
    console.log('\n==============================================');
    console.log('📊 ENDPOINT FUNCTIONALITY SUMMARY');
    console.log('==============================================');
    
    const working = results.filter(r => r.working).length;
    const total = results.length;
    
    console.log(`✅ Working Endpoints: ${working}/${total}`);
    console.log(`❌ Non-working Endpoints: ${total - working}/${total}`);
    console.log(`📊 Success Rate: ${Math.round((working/total) * 100)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const status = result.working ? '✅' : '❌';
      console.log(`${status} ${result.method} ${result.url} - ${result.statusCode}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Save summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalEndpoints: total,
      workingEndpoints: working,
      successRate: Math.round((working/total) * 100),
      results: results
    };
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`\n💾 Summary saved to: ${OUTPUT_DIR}/summary.json`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testQuestionEndpoints().catch(console.error);
}
