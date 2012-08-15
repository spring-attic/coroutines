(function () {
    'use strict';

    var coroutines = require('../index'),
        monadic = require('monadic'),
        monad = coroutines.monad,
        pidLimit = 8,

        makeProcess = function () {
            var count = 0,
                x = do monad {
                    pid <- monad.myPid();
                    return console.log(''+pid,': process still alive with count',count);
                    if (pid >= pidLimit) {
                        return console.log(''+pid,': pid too high, dying');
                        monad.quit();
                    } else {
                        return;
                    };
                    return console.log(''+pid,': increasing count to', ++count);
                    if (count === 10) {
                        newPid <- monad.spawn(makeProcess());
                        return console.log(''+pid,': hit 10, spawned new pid',newPid);
                    } else if (count === 20) {
                        res <- monad.kill(pid + 2);
                        return console.log(''+pid,': hit 20, killed pid',(pid+2),':',res);
                        monad.quit();
                    } else {
                        return;
                    };
                    monad.yield();
                    x;
                };
            return x;
        };

    exports.test = function () {
        coroutines.run(makeProcess());
        coroutines.run(makeProcess());
    };
}());
