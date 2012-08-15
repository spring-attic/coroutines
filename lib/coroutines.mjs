(function () {
    'use strict';

    var monads = require('monadic'),
        monad = monads.stateT(monads.contT(monads.identity())),
        processM = Object.create(monad),
        runQ = [],
        pids = {},
        nextPid = 1,
        currentPid = undefined,
        booted = false,
        halted = false;

    function boot () {
        var thunk;
        while ((! halted) && 0 !== runQ.length) {
            currentPid = runQ.shift();
            thunk = pids[currentPid];
            delete pids[currentPid];
            thunk();
        }
        currentPid = undefined;
        booted = false;
    }

    function ensureBooting () {
        if ((!booted) && (!halted)) {
            booted = true;
            process.nextTick(boot);
        }
    }

    // yield is a reserved keyword, hence mess.
    function aYield () {
        return do processM {
            pid <- processM.myPid();
            state <- processM.get();
            processM.suspend(function (k) {
                if (!halted) {
                    pids[pid] = function () { k(undefined, state); };
                    runQ.push(pid);
                    currentPid = undefined;
                    ensureBooting();
                }
            });
        };
    }

    function spawn (thunk) {
        return do processM {
            return (function () {
                if (!halted) {
                    var pid = nextPid;
                    nextPid += 1;
                    pids[pid] = function () {
                        processM.innerMonad.run(processM.run(thunk, {pid: pid}));
                    };
                    runQ.push(pid);
                    ensureBooting();
                    return pid;
                }
            }());
        };
    }

    function quit () {
        return do processM {
            processM.suspend(function (k) {
                // and we never run the continuation
            });
        };
    }

    function myPid (x) {
        return do processM {
            state <- processM.get();
            return state.pid;
        }
    }

    function halt () {
        halted = true;
    }

    function kill (pid) {
        return do processM {
            me <- myPid();
            if (pid === me) {
                quit();
            } else {
                return (function () {
                    var idx = runQ.indexOf(pid);
                    if (idx !== -1) {
                        runQ.splice(idx, 1);
                        delete pids[pid];
                        return true;
                    }
                    return false;
                }());
            };
        };
    }

    function run (m) {
        var pid = nextPid;
        nextPid += 1;
        console.log('launching pid',pid);
        return processM.innerMonad.run(processM.run(m, {pid: pid}));
    }

    processM['yield'] = aYield;
    processM.spawn = spawn;
    processM.quit = quit;
    processM.myPid = myPid;
    processM.kill = kill;

    exports.halt = halt;
    exports.monad = processM;
    exports.boot = boot;
    exports.run = run;

}());
