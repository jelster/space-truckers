
class ConsoleProxy {

    constructor(console) {
        this._console = console;
        this._consoleIsPresent = this._console;
        this._messageBuffer = [];
    }

    logInfo(message) {
        const logObj = { type: "INFO", message: message};
        if (this._consoleIsPresent) { 
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push();
    }

    logWarning(message) {
        const logObj = { type: "WARN", message: message};
        if (this._consoleIsPresent) { 
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push();
    }

    logError(message) {
        const logObj = { type: "ERROR", message: message};
        if (this._consoleIsPresent) { 
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push();
    }

    logFatal(message) {
        const logObj = { type: "FATAL", message: message};
        if (this._consoleIsPresent) { 
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push();
    }

    flushBuffer() {
        this._messageBuffer.splice(0, this._messageBuffer.length);
    }
}
const theProxy = new ConsoleProxy(console);
export default theProxy;