import "babel-polyfill";
import "./network";
import * as output from "./output";
import * as input from "./input";
import * as server from "./server";
import { initDone } from "./init";

let onAuthHandlers = [],
    userInputHandlers = [],
    AUTHORIZED = false;

/**
 * @type {Terminal}
 */
export let terminal = null;

export const VERSION = "/* @echo package.version */";
export const RELEASE_NUMBER = "/* @echo package.releaseNumber */";

let NAMESPACE = "USER";

export function setNamespace (ns) {
    return NAMESPACE = ns;
}

/**
 * Returns terminal instance.
 * @param options
 * @avoidUsing - use direct methods instead.
 * @returns {*}
 */
export function initTerminal (options) {
    if (terminal)
        return terminal;
    return terminal = new Terminal(options);
}

window.initTerminal = initTerminal;

export function onAuth (callback) {
    if (AUTHORIZED) {
        callback();
        return;
    }
    onAuthHandlers.push(callback);
}

export function authDone () {
    AUTHORIZED = true;
    onAuthHandlers.forEach(h => h());
}

export function userInput (text, mode) {
    userInputHandlers.forEach((h) => h(text, mode));
}

/**
 * WebTerminal's API object.
 * @author ZitRo
 * @param setup {{
 *     authKey: String
 * }}
 */
export function Terminal (setup = {}) {

    server.send("Auth", setup.authKey);
    initDone(this);

}

Terminal.prototype.MODE_PROMPT = 1;
Terminal.prototype.MODE_SQL = 2;
Terminal.prototype.MODE_READ = 3;
Terminal.prototype.MODE_READ_CHAR = 4;

/**
 * Function accepts the callback, which is fired when user enter a command, character or a string.
 * @param {terminalUserEntryCallback} callback
 */
Terminal.prototype.onUserInput = function (callback) {
    userInputHandlers.push(callback);
};

/**
 * Handles user input.
 * @callback terminalUserEntryCallback
 * @param {String} text
 * @param {Number} mode
 */

/**
 * Print the text on terminal.
 * @param {string} text
 */
Terminal.prototype.print = function (text) {
    input.clearPrompt();
    output.print(text);
    input.reprompt();
};

/**
 * Print the text on terminal.
 * @param {string} command
 * @param {boolean=false} echo
 * @param {boolean=false} prompt
 */
Terminal.prototype.execute = function (command, { echo = false, prompt = false } = {}) {
    server.send("Execute", { command, echo: +echo, prompt: +prompt });
};

/*
Terminal.prototype.initialize = function () {

    var i,
        favicon = document.getElementById("favicon");

    if (favicon)
        favicon.href = lib.images.favicon;

    for (i in this.controller.internalCommands) {
        this.autocomplete.register(this.autocomplete.TYPES.keyword, "/" + i);
    }

    for (i in this.dictionary.KEYWORDS) {
        if (i.length < 2) continue;
        this.autocomplete.register(this.autocomplete.TYPES.keyword, i);
        this.autocomplete.register(this.autocomplete.TYPES.keyword, i.toUpperCase());
    }

    for (i = 0; i < this._execReady.length; i++) {
        this._execReady[i].function.apply(this._execReady[i].this, this._execReady[i].args);
    }
    
    terminal = this;
    initDone();

};*/

/**
 * This function is executed when server instance ready and basic server info is sent to the client.
 */
/*
Terminal.prototype.serverInit = function (data) {

    if (typeof data.system === "string") {
        var nodeInfo = data.system.split(":"); // [PCName, Instance]
        data.node = nodeInfo[0];
        data.instance = nodeInfo[1];
    }

    if (data.node && data.instance) {
        document.title = (data.name ? data.name + " " : "") + data.instance
            + " (" + data.node + ")" + " - Caché WEB Terminal";
        this.output.print(this.localization.get(
            data.name ? 55 : 54, data.node, data.instance, data.name ? data.name : undefined
        ) + "\r\n");
    }

};*/

/**
 * Function to register execution of other functions when terminal in ready state. (when all
 * modules loaded)
 *
 * @param thisArg
 * @param {function} callback
 * @param {Array} [args]
 */
/*
Terminal.prototype.execReady = function (thisArg, callback, args) {

    this._execReady.push({
        function: callback,
        this: thisArg,
        args: args
    });

};*/

/**
 * Resets terminal settings.
 */
/*
Terminal.prototype.reset = function () {

    var _this = this;

    this.output.printSync(this.localization.get(9) + "\r\n");

    window.addEventListener("beforeunload", function () {
        _this.storage.clear();
    })

};*/