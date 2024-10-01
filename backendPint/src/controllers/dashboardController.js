const {sptoValidate, spValidated, sppostsbycity, speventsbycity, spcomments_by_city} = require('../database/logic_objects/dashboard');
const controllers = {};

controllers.toValidate = (req, res) => {
    sptoValidate().then((result) => {
        res.json(result);
    });
};

controllers.validated = (req, res) => {
    spValidated().then((result) => {
        res.json(result);
    });
};

controllers.postsbycity = (req, res) => {
    sppostsbycity().then((result) => {
        res.json(result);
    });
}

controllers.eventsbycity = (req, res) => {
    speventsbycity().then((result) => {
        res.json(result);
    });
}

controllers.comments_by_city = (req, res) => {
    spcomments_by_city().then((result) => {
        res.json(result);
    });
}


module.exports = controllers;