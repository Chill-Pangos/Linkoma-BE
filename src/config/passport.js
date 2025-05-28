const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { tokenTypes } = require("./tokens");
const db = require("./database");

const cookieExtractor = (req) => {
  return req.cookies?.token || null;
};

const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    cookieExtractor,
  ]),
};

const jwtVerify = async (payload, done) => {
  if (payload.type !== tokenTypes.ACCESS) {
    return done(new Error("Invalid token type"), false);
  }

  const connection = db.getConnection();

  const [user] = await connection.execute(
    "SELECT * FROM users WHERE userID = ?",
    [payload.sub]
  );

  if (!user || user.length === 0) {
    return done(new Error("User not found"), false);
  }

  return done(null, user[0]);
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

passport.use(jwtStrategy);

module.exports = {
  jwtStrategy,
};
