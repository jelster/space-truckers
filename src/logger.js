import {  Logger} from "@babylonjs/core/Misc/logger"
class ConsoleProxy {

    constructor() {
         
    }

    logInfo(message) {
       Logger.Log(message);
    }

    logWarning(message) {
        Logger.Warn(message);
    }

    logError(message) {
        Logger.Error(message);
    }

    logFatal(message) {
        Logger.Error("FATAL: " + message);
    }

    flushBuffer() {
        Logger.ClearLogCache();
    }
}
const theProxy = new ConsoleProxy(Logger);

export default theProxy;