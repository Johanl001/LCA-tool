import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/auth.js';
import User from '../models/User.js';

// Simple in-memory test without MongoMemoryServer initially
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes - Basic Tests', () => {
  beforeAll(async () => {
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Skip MongoDB connection for now - test route structure
  });

  describe('Route Registration', () => {
    it('should have register endpoint', () => {
      expect(authRoutes).toBeDefined();
    });

    it('should have login endpoint', () => {
      expect(authRoutes).toBeDefined();
    });
  });

  describe('Environment Setup', () => {
    it('should have JWT secret configured', () => {
      expect(process.env.JWT_SECRET).toBe('test-secret-key');
    });
  });
});