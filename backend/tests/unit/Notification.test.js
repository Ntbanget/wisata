jest.mock('../../src/models/database', () => ({
  query: jest.fn()
}));

const { query } = require('../../src/models/database');
const Notification = require('../../src/models/Notification');

describe('Notification.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts only supported columns when legacy columns are not present', async () => {
    query.mockImplementation((sql) => {
      if (sql === 'SHOW COLUMNS FROM notifications') {
        return Promise.resolve([
          { Field: 'id' },
          { Field: 'user_id' },
          { Field: 'title' },
          { Field: 'message' },
          { Field: 'type' },
          { Field: 'is_read' },
          { Field: 'booking_id' },
          { Field: 'admin_id' },
          { Field: 'admin_name' },
          { Field: 'created_at' }
        ]);
      }

      if (sql.startsWith('INSERT INTO notifications')) {
        return Promise.resolve({ insertId: 42 });
      }

      if (sql === 'SELECT * FROM notifications WHERE id = ?') {
        return Promise.resolve([
          {
            id: 42,
            user_id: 7,
            title: 'Hello',
            message: 'World',
            type: 'info',
            is_read: 0,
            booking_id: null,
            admin_id: 3,
            admin_name: 'Admin'
          }
        ]);
      }

      return Promise.resolve([]);
    });

    const result = await Notification.create({
      user_id: 7,
      title: 'Hello',
      message: 'World',
      type: 'admin_message',
      created_by: 'ADMIN',
      admin_id: 3,
      admin_name: 'Admin'
    });

    expect(result).toMatchObject({ id: 42, title: 'Hello', message: 'World', type: 'info' });

    const insertSql = query.mock.calls.find((call) => call[0].startsWith('INSERT INTO notifications'))[0];
    expect(insertSql).not.toContain('created_by');
    expect(insertSql).toContain('user_id');
    expect(insertSql).toContain('admin_id');
    expect(insertSql).toContain('admin_name');
  });
});
