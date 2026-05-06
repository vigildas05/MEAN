const { connectDb, json, Task, taskStatuses, requireAuth } = require('../_lib');

module.exports = async (req, res) => {
  await connectDb();
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { projectId, status, search } = req.query || {};
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: String(search), $options: 'i' };

    const tasks = await Task.find(filter).sort({ updatedAt: -1 });
    return json(res, 200, tasks);
  }

  if (req.method === 'POST') {
    const { projectId, title, description, status, assigneeId, priority, dueDate } = req.body || {};
    if (!projectId || !title || title.length < 2) return json(res, 400, { message: 'Invalid task payload' });
    if (status && !taskStatuses.includes(status)) return json(res, 400, { message: 'Invalid task status' });

    const task = await Task.create({
      projectId,
      title,
      description: description || '',
      status: status || 'todo',
      assigneeId,
      priority: priority || 'medium',
      dueDate
    });
    return json(res, 201, task);
  }

  return json(res, 405, { message: 'Method not allowed' });
};
