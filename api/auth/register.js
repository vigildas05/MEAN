const { bcrypt, connectDb, json, Profile, signToken, User } = require('../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  await connectDb();
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || password.length < 8) {
    return json(res, 400, { message: 'Invalid registration payload' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return json(res, 409, { message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: 'member' });
  await Profile.findOneAndUpdate(
    { authUserId: user.id },
    { authUserId: user.id, name, email, role: user.role },
    { upsert: true }
  );

  return json(res, 201, {
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};
