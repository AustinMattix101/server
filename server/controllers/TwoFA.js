"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTwoFAValidate = exports.postTwoFAVerify = exports.postTwoFARegister = exports.getTwoFAOff = exports.getTwoFAOn = exports.getTwoFA = void 0;
const User_1 = __importDefault(require("../models/User"));
const errorResponse_1 = __importDefault(require("../utils/errorResponse"));
const getTwoFA = (_req, res) => {
    res.status(200).json({ message: `Welcome to the two factor authentication!` });
};
exports.getTwoFA = getTwoFA;
const getTwoFAOn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { altid } = req.user;
    try {
        yield User_1.default.findOneAndUpdate({ altid }, { $set: { preferedTwoFA: true } }, { new: true });
        yield res.status(201).json({ success: true, status: `ON`, message: `You have been turn on successfully for 2FA [Two Factor Authentication]!`, data: { email: req.user.email, username: req.user.username } });
    }
    catch (error) {
        console.log(`Error: ${error}`);
        next(error);
    }
});
exports.getTwoFAOn = getTwoFAOn;
const getTwoFAOff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { altid } = req.user;
    try {
        yield User_1.default.findOneAndUpdate({ altid }, { $set: { preferedTwoFA: false } });
        yield User_1.default.findOneAndUpdate({ altid }, { $set: { TwoFAKey: undefined } });
        yield User_1.default.findOneAndUpdate({ altid }, { $set: { verifiedTwoFA: undefined } });
        yield User_1.default.findOneAndUpdate({ altid }, { $set: { validatedTwoFA: undefined } });
        res.status(201).json({ success: true, status: `OFF`, message: `You have been turn off successfully for 2FA [Two Factor Authentication]!`, data: { email: req.user.email, username: req.user.username } });
    }
    catch (error) {
        console.log(`Error: ${error}`);
        next(error);
    }
});
exports.getTwoFAOff = getTwoFAOff;
const postTwoFARegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { altid } = req.user;
    const user = yield User_1.default.findOne({ altid });
    try {
        const tempKey = user.getTwoFAToken();
        yield user.save();
        yield res.status(201).json({ success: true, status: `CREATED`, key: tempKey.secret, qr: tempKey.qr, data: `Email: ${user.email} Username: ${user.username}` });
        user.verifiedTwoFA = undefined;
        user.validatedTwoFA = undefined;
        yield user.save();
    }
    catch (error) {
        console.log(`Error: ${error}`);
        next(new errorResponse_1.default(`Generating the key unsuccessfully!`, 500));
    }
});
exports.postTwoFARegister = postTwoFARegister;
const postTwoFAVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { altid } = req.user;
    const { token } = req.body;
    const user = yield User_1.default.findOne({ altid });
    try {
        if (!token) {
            return next(new errorResponse_1.default(`Please provide your token to continue...`, 400));
        }
        const delta = user.verifyTwoFAToken(token);
        if (delta > 0 || delta < 0) {
            user.verifiedTwoFA = false;
            yield user.save();
            return next(new errorResponse_1.default(`Oh bad request!, your token is not been verified! Ensure that you enter correctly or token is expired: ${delta} minute(s).`, 401));
        }
        else {
            user.verifiedTwoFA = true;
            user.validatedTwoFA = undefined;
            user.validationResetTime = undefined;
            yield user.save();
            yield res.status(201).json({ success: true, status: `VERIFIED`, message: `Congratulation, your token is been verified!` });
        }
    }
    catch (error) {
        console.log(`Error: ${error}`);
        next(new errorResponse_1.default(`Verification of the token unsuccessfully! Make sure you have been checked your token correctly`, 500));
    }
    ;
});
exports.postTwoFAVerify = postTwoFAVerify;
const postTwoFAValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.body;
    const user = yield User_1.default.findOne({ email });
    try {
        if (!email) {
            return next(new errorResponse_1.default(`Please provide your email to continue...`, 400));
        }
        if (!token) {
            return next(new errorResponse_1.default(`Please provide your token to continue...`, 400));
        }
        if (!user.verifiedTwoFA) {
            user.validatedTwoFA = false;
            yield user.save();
            return next(new errorResponse_1.default(`Validation is broken! Ensure that you have been verify your 2FA token yet to continue...!`, 403));
        }
        const delta = user.validateTwoFAToken(token);
        if (delta > 0 || delta < 0) {
            user.validatedTwoFA = false;
            yield user.save();
            return next(new errorResponse_1.default(`Oh bad request!, your token is not been validated! Ensure that you enter correctly or token is expired: ${delta} minute(s).`, 401));
        }
        else {
            user.validatedTwoFA = true;
            user.validationResetTime = Date.now() + 7 * 24 * 60 * (60 * 1000);
            yield user.save();
            yield res.status(201).json({ success: true, status: `VALIDATED`, message: `Congratulation, your Validation is been passed!` });
        }
    }
    catch (error) {
        console.log(`Error: ${error}`);
        next(new errorResponse_1.default(`Validation of the token unsuccessfully! Make sure you have been checked your token correctly`, 500));
    }
    ;
});
exports.postTwoFAValidate = postTwoFAValidate;
//# sourceMappingURL=TwoFA.js.map