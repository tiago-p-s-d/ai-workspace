const UserService = require('../services/UserService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.login = async(req, res) =>{
    try{
        const {email, password} = req.body;
        const user = await UserService.authenticate(email, password);

        const payload = {
            id: user.id,
            email: user.email,
            nome: user.nome
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        
        return res.status(200).json({
            message: 'successful login!',
            token,
            user: payload
        });
    }catch(error){
        return res.status(401).json({error:error.message});
    }
}