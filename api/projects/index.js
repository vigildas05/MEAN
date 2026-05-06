const { connectDb, json, Project, requireAuth } = require('../_lib');

module.exports = async (req, res) => {
  await connectDb();
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const projects = await Project.find({ $or: [{ ownerId: user.id }, { memberIds: user.id }] }).sort({ createdAt: -1 });
    return json(res, 200, projects);
  }

  if (req.method === 'POST') {
    const { name, description, memberIds } = req.body || {};
    if (!name || name.length < 2) return json(res, 400, { message: 'Invalid project payload' });

    const project = await Project.create({
      name,
      description: description || '',
      ownerId: user.id,
      memberIds: memberIds || []
    });
    return json(res, 201, project);
  }

  return json(res, 405, { message: 'Method not allowed' });
};
