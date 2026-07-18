const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.password - Plain text password
 * @returns {Promise<number>} ID of the created user
 */
const createUser = async ({ name, email, password }) => {
    const saltRounds = 10;

    const password_hash = await bcrypt.hash(password, saltRounds);

    const [id] = await db('users').insert({
        name,
        email,
        password_hash
    });

    return id;
};

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User object if authentication is successful
 * @throws {Error} If credentials are invalid
 */
const authenticate = async (email, password) => {
    const user = await db('users').where({ email }).first();
    
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return { id: user.id, name: user.name };
};

module.exports = { createUser, authenticate };