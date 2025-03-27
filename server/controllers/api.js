"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCamunitedAPI = exports.getAPI = void 0;
function getAPI(_req, res) {
    res.status(200).json({ message: `Welcome to Mattix API` });
}
exports.getAPI = getAPI;
function getCamunitedAPI(_req, res) {
    res.status(200).json({
        message: `Welcome to Mattix Team API! ;)`
    });
}
exports.getCamunitedAPI = getCamunitedAPI;
//# sourceMappingURL=api.js.map