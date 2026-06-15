require('dotenv').config({ path: '.env.test' });

// Mock database
jest.mock('../src/db', () => ({
  query: jest.fn(),
  pool: jest.fn()
}));

// Mock external services
jest.mock('../src/services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../src/services/teams', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true })
}));

// Global test setup
beforeAll(() => {
  console.log('Test suite starting...');
});

afterAll(() => {
  console.log('Test suite completed');
});