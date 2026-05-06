const { connectDb, json, Profile, requireAuth } = require('../_lib');

module.exports = async (req, res) => {
  await connectDb();
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') return json(res, 405, { message: 'Method not allowed' });

  const users = await Profile.find().sort({ name: 1 });
  return json(res, 200, users);
};
