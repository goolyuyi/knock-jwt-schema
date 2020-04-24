const rej = require('rest-express-jwt');
const assert = require('assert');
let modes = ['jwt-in-cookie', 'jwt-in-header'];

function normalizeOption(option) {
    assert(option && option.secret);

    option.mode = modes.some((i) => {
        return i === option.mode
    }) ? option.mode : modes[0];

    return option;
}

module.exports = (option) => {
    return new function () {
        option = normalizeOption(option);
        option.requestProperty = 'user';

        const jwtCreate = rej.create(option);
        const jwtAuth = rej.auth(option);

        this.create = async function (req, res) {
            let jwt = jwtCreate(req.user, option.signOption);

            if (option.mode === modes[0]) {
                res.cookie('jwt', jwt.jwt, {httpOnly: true, sameSite: 'strict'});
                //TODO:optional set this in header
                res.json({'jwtid_digest': jwt.jwtid_digest});
            } else {
                res.cookie('jwtid', jwt.jwtid, {httpOnly: true, sameSite: 'strict'});
                res.json(jwt.jwt);
            }
            req.user = jwt.jwt_raw;
        }

        this.knockAuth = this.auth = async function (req, res) {
            await jwtAuth.promisified(req, res);
        }

        //TODO
        this.revoke = function (req, res) {
            throw TypeError('not implemented!');
        }

        this.name = 'jwt auth';
    };
}
