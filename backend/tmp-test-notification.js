const Notification = require('./src/models/Notification');

(async () => {
  try {
    const result = await Notification.create({
      user_id: 1,
      title: 'test',
      message: 'hello',
      type: 'admin_message',
      created_by: 'ADMIN',
      admin_id: 2,
      admin_name: 'Admin'
    });
    console.log(JSON.stringify(result));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
