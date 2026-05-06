const { connectDb, json, Profile, requireAuth } = require('../_lib');

module.exports = async (req, res) => {
  await connectDb();
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const profile = await Profile.findOne({ authUserId: user.id });
    return json(res, 200, profile || { authUserId: user.id, email: user.email, role: user.role });
  }

  if (req.method === 'PUT') {
    const { name, avatarUrl } = req.body || {};
    if (!name || name.length < 2) return json(res, 400, { message: 'Invalid profile payload' });

    const profile = await Profile.findOneAndUpdate(
      { authUserId: user.id },
      { authUserId: user.id, email: user.email, role: user.role, name, avatarUrl },
      { new: true, upsert: true }
    );
    return json(res, 200, profile);
  }

  return json(res, 405, { message: 'Method not allowed' });
};
