const { bcrypt, connectDb, json, signToken, User } = require('../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  await connectDb();
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  const valid = user ? await bcrypt.compare(password || '', user.passwordHash) : false;

  if (!user || !valid) {
    return json(res, 401, { message: 'Invalid credentials' });
  }

  return json(res, 200, {
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};
