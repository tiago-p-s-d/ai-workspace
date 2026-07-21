const UserService = require('../services/UserService');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.login = async(req, res) =>{
    try{
        const {email, password} = req.body;
        const user = await UserService.authenticate(email, password);

        return res.status(200).json({
            message: 'loginu successful',
            user
        });
    }catch(error){
        return res.status(401).json({error:error.message});
    }
}