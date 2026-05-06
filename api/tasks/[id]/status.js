const { connectDb, json, requireAuth, Task, taskStatuses } = require('../../_lib');

module.exports = async (req, res) => {
  await connectDb();
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'PATCH') return json(res, 405, { message: 'Method not allowed' });

  const { status } = req.body || {};
  if (!taskStatuses.includes(status)) return json(res, 400, { message: 'Invalid task status' });

  const task = await Task.findByIdAndUpdate(req.query.id, { status }, { new: true });
  return json(res, 200, task);
};
