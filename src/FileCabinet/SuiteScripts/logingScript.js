/**
 * @NApiVersion 2.1
 */

define(['N/logs'
], function(require, factory) {
    'use strict';

    let logsObject = {
        start : "",
        printProcess : [],
        end: ""
    }

    function printlogs(logsObject){
        log.debug({
            title: "process start",
            details: logsObject.start
        });

        for (let logslines = 0; logslines < logsObject.printProcess.length; logslines++) {
            log.debug(`${logsObject.printProcess[logslines]}`,logsObject.printProcess[logslines]);
        }

        log.debug({
            title: "process end",
            details: logsObject.end
        });
  
    }

    function printErrors(errorObjects){

    }

    return {
        printlogs: printlogs,
        printErrors : printErrors
    }
    
});