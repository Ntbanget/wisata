const AuthController = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

jest.mock('../../src/models/User', () => ({
  getByEmail: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAll: jest.fn(),
  getStats: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

describe('AuthController login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts users stored with a password column instead of password_hash', async () => {
    User.getByEmail.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'user',
      name: 'User'
    });
    bcrypt.compare.mockResolvedValue(true);

    const req = {
      body: {
        email: 'user@example.com',
        password: '123456'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await AuthController.login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-password');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
