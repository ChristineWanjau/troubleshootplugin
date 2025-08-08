const request = require('supertest');
const app = require('../server');

describe('Azure App Configuration Troubleshooting API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/troubleshooting', () => {
    it('should return troubleshooting guide in markdown format', async () => {
      const response = await request(app)
        .get('/api/troubleshooting')
        .expect(200);

      expect(response.text).toContain('Azure App Configuration');
      expect(response.text).toContain('Feature Flag Creator');
    });

    it('should return troubleshooting guide in JSON format', async () => {
      const response = await request(app)
        .get('/api/troubleshooting?format=json')
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('POST /api/troubleshooting', () => {
    it('should return complete troubleshooting guide', async () => {
      const response = await request(app)
        .post('/api/troubleshooting')
        .send({
          format: 'json'
        })
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.section).toBe('complete');
    });

    it('should return specific section when requested', async () => {
      const response = await request(app)
        .post('/api/troubleshooting')
        .send({
          format: 'json',
          section: 'overview'
        })
        .expect(200);

      expect(response.body).toHaveProperty('content');
      expect(response.body.section).toBe('overview');
    });

    it('should handle custom request ID', async () => {
      const customRequestId = 'test-request-123';
      const response = await request(app)
        .post('/api/troubleshooting')
        .send({
          format: 'json',
          requestId: customRequestId
        })
        .expect(200);

      expect(response.body.requestId).toBe(customRequestId);
    });
  });

  describe('GET /api/troubleshooting/sections', () => {
    it('should return available sections', async () => {
      const response = await request(app)
        .get('/api/troubleshooting/sections')
        .expect(200);

      expect(response.body).toHaveProperty('sections');
      expect(Array.isArray(response.body.sections)).toBe(true);
      expect(response.body.sections.length).toBeGreaterThan(0);
      
      const firstSection = response.body.sections[0];
      expect(firstSection).toHaveProperty('id');
      expect(firstSection).toHaveProperty('title');
      expect(firstSection).toHaveProperty('description');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });
});
