import axios from 'axios';
import { performance } from 'perf_hooks';

class LoadTester {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
        this.results = [];
    }

    async runLoadTest(concurrency = 10, requests = 100) {
        console.log('⚡ LOAD TESTING STARTED');
        console.log('=' * 30);
        console.log(`🎯 Target: ${this.baseUrl}`);
        console.log(`👥 Concurrency: ${concurrency}`);
        console.log(`📊 Total Requests: ${requests}`);
        console.log('');

        const tests = [
            { name: 'Health Check', endpoint: '/api/health', method: 'GET' },
            { name: 'Login Attempt', endpoint: '/api/auth/login', method: 'POST', data: { email: 'test', password: 'test' } },
            { name: 'Registration', endpoint: '/api/auth/register', method: 'POST', data: this.getRandomUserData() }
        ];

        for (const test of tests) {
            console.log(`🧪 Testing: ${test.name}`);
            await this.testEndpoint(test, concurrency, Math.floor(requests / tests.length));
            console.log('');
        }

        this.generateLoadReport();
    }

    async testEndpoint(test, concurrency, totalRequests) {
        const requestsPerWorker = Math.floor(totalRequests / concurrency);
        const workers = [];

        const startTime = performance.now();

        // Create concurrent workers
        for (let i = 0; i < concurrency; i++) {
            workers.push(this.worker(test, requestsPerWorker, i));
        }

        // Wait for all workers to complete
        const results = await Promise.all(workers);
        const endTime = performance.now();

        // Aggregate results
        const allResults = results.flat();
        const successCount = allResults.filter(r => r.success).length;
        const errorCount = allResults.length - successCount;
        const avgResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length;
        const totalDuration = endTime - startTime;
        const requestsPerSecond = (allResults.length / totalDuration) * 1000;

        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   ⚡ Avg Response: ${Math.round(avgResponseTime)}ms`);
        console.log(`   🚀 Requests/sec: ${requestsPerSecond.toFixed(2)}`);
        console.log(`   ⏱️  Total Duration: ${Math.round(totalDuration)}ms`);

        this.results.push({
            test: test.name,
            successCount,
            errorCount,
            avgResponseTime: Math.round(avgResponseTime),
            requestsPerSecond: requestsPerSecond.toFixed(2),
            totalDuration: Math.round(totalDuration)
        });
    }

    async worker(test, requestCount, workerId) {
        const results = [];

        for (let i = 0; i < requestCount; i++) {
            const start = performance.now();
            let success = false;

            try {
                let data = test.data;
                if (test.name === 'Registration') {
                    data = this.getRandomUserData();
                }

                if (test.method === 'POST') {
                    await axios.post(`${this.baseUrl}${test.endpoint}`, data);
                } else {
                    await axios.get(`${this.baseUrl}${test.endpoint}`);
                }
                success = true;
            } catch (error) {
                // Expected errors (like 401 for login) are OK
                if (error.response && error.response.status < 500) {
                    success = true;
                }
            }

            const responseTime = performance.now() - start;
            results.push({ success, responseTime });
        }

        return results;
    }

    getRandomUserData() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);

        return {
            email: `loadtest-${timestamp}-${random}@example.com`,
            password: 'testpass123',
            firstName: `User${random}`,
            lastName: `Test${timestamp}`,
            dateOfBirth: '1990-01-01',
            nationality: 'India',
            phoneNumber: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            documentType: 'passport',
            documentNumber: `P${timestamp}`
        };
    }

    generateLoadReport() {
        console.log('📊 LOAD TEST SUMMARY');
        console.log('=' * 30);

        this.results.forEach(result => {
            console.log(`\n🧪 ${result.test}:`);
            console.log(`   Success Rate: ${(result.successCount / (result.successCount + result.errorCount) * 100).toFixed(1)}%`);
            console.log(`   Avg Response: ${result.avgResponseTime}ms`);
            console.log(`   Throughput: ${result.requestsPerSecond} req/sec`);
        });

        const totalSuccesses = this.results.reduce((sum, r) => sum + r.successCount, 0);
        const totalErrors = this.results.reduce((sum, r) => sum + r.errorCount, 0);
        const overallSuccessRate = (totalSuccesses / (totalSuccesses + totalErrors) * 100);

        console.log('\n🎯 OVERALL PERFORMANCE:');
        console.log(`   Success Rate: ${overallSuccessRate.toFixed(1)}%`);
        console.log(`   Total Requests: ${totalSuccesses + totalErrors}`);

        if (overallSuccessRate >= 95) {
            console.log('   Status: 🟢 EXCELLENT');
        } else if (overallSuccessRate >= 85) {
            console.log('   Status: 🟡 GOOD');
        } else if (overallSuccessRate >= 70) {
            console.log('   Status: 🟠 NEEDS IMPROVEMENT');
        } else {
            console.log('   Status: 🔴 POOR');
        }
    }
}

// Run load test
const tester = new LoadTester();
tester.runLoadTest(5, 50) // 5 concurrent users, 50 total requests
    .then(() => {
        console.log('\n🏁 Load testing completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Load testing failed:', error);
        process.exit(1);
    });
