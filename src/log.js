import config from './config';

const colors = {
  DEBUG: "#01467a;",
  INFO: "#185e00;",
  WARN: "#a37a00;",
  ERROR: "#780000;",
};

const logLevels = [
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR"
];

const levelEmoji = {
  DEBUG: "🛠",
  INFO: "💡",
  WARN: "🚧",
  ERROR: "🔥"
}

const defaultStyle = "font-weight:bold;color:white;padding:5px;border-radius:2px;";

const rx = /^\s?([A-Z0-9]*)\s*[-|:|,]+/gm;

function argsParse(args) {
  let final = [];

  if (args.length > 1) {
    for (var i = 1; i < args.length; i++) {
      final.push(args[i]);
    }
  }

  return final;
}

class Log {

  constructor() {
    this.history = [];
  }

  logMessage = function(level, msg, callingArgs) {

    if (!config.log_level || logLevels.indexOf(level) < logLevels.indexOf(config.log_level)) {
      return;
    }
  
    if (config.log_type && config.log_type !== "") {
      let match = rx.exec(msg);
      rx.lastIndex = 0;
  
      if (!match || match[1] !== config.log_type) {
        return;
      }
    }
  
    let args = argsParse(callingArgs);
    let date = new Date().toISOString();
    let formatted = `%c${levelEmoji[level]} ${level}: ${msg}`;
    let style = `${defaultStyle}background-color:${colors[level]}`;
    let func = console.log;

    if (level === "DEBUG") {
      func = console.debug;
    }
  
    if (level === "WARN") {
      func = console.warn;
    }
  
    if (level === "ERROR") {
      func = console.error;
    }

    this.history.push({
      date: date,
      level: level,
      message: msg,
      arguments: args,
    });
  
    if (args.length > 0) {
      return func(formatted, style, ...args);
    }
      
    func(formatted, style);
  };

  debug = function(msg) {
    this.logMessage("DEBUG", msg, arguments);
  };

  info = function(msg) {
    this.logMessage("INFO", msg, arguments);
  };

  warn = function(msg) {
    this.logMessage("WARN", msg, arguments);
  };
  
  error = function(msg) {
    this.logMessage("ERROR", msg, arguments);
  };

  dump = function() {
    console.log(JSON.stringify(this.history, null, 2));
  }
}

const logs = new Log();

if (window) {
  window.logs = logs;
}

export default logs;