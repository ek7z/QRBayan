const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

class AuthService {
  async register(email, password) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error("Email already registered");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      role: "user",
      balance: 3,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );
  }

  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
