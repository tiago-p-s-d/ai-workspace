const UserService = require('../services/UserService');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.store = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = await UserService.createUser({ name, email, password });
        
        return res.status(201).json({ id: userId, name });
    } catch (error) {
        console.error("Erro no Controller:", error);
        return res.status(400).json({ error: error.message });
    }
};