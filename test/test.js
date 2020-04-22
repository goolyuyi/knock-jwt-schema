const expect = require('chai').expect;
const got = require('got');
const tough = require('tough-cookie');
const app = require('./mock-server');
const launch = require('express-quick-launcher');
describe('mock test with jwt-schema', function () {
    let agent;
    let addr;
    let cookieJar;
    before(async function () {
        const protocol = 'https';
        addr = await launch(app, 0, {protocol});
        cookieJar = new tough.CookieJar();
        agent = got.extend({
            prefixUrl: addr.localhostURL,
            cookieJar,
            rejectUnauthorized: false,
            throwHttpErrors: false,
            followRedirect: false,
            retry: 0
        });
    });

    it('login with mock', async function () {
        let res = await agent.post("login", {json: {user: 'mock'}});

        //ISSUE here
        console.log(res.body);
        expect(res.statusCode).equal(200);
        let res2 = await agent.get("dashboard", {headers: JSON.parse(res.body)});
        expect(res2.statusCode).equal(200);
        console.log(res2.body);
    });

    describe('fuzzy', function () {
        it('null login', async function () {
            let res = await agent.post("login");
            console.log(res.body);
            expect(res.statusCode).equal(401);

        })
        it('dashboard without login', async function () {
            let res = await agent.get("dashboard");
            console.log(res.body);
            expect(res.statusCode).equal(401);
        })
    });
    after(function () {
        addr.close();
    })
});
