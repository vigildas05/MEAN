const { connectDb, json, requireAuth, Task } = require('../../_lib');

module.exports = async (req, res) => {
  await connectDb();
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  const { body } = req.body || {};
  if (!body) return json(res, 400, { message: 'Invalid comment payload' });

  const task = await Task.findByIdAndUpdate(req.query.id, { $push: { comments: { authorId: user.id, body } } }, { new: true });
  return json(res, 201, task);
};
