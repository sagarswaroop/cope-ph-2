/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define([
  "N/ui/serverWidget",
  "N/redirect",
  "N/search",
  "N/record",
  "N/format",
  "./SEIU_ML_Cope_Adjustment.js",
  "N/task"
], function (serverWidget, redirect, search, record, format, adjustment,task) {
  function onRequest(context) {
    if (context.request.method === "GET") {
      var currentForm = serverWidget.createForm({
        title: "Run Batch Deposit",
        hideNavBar: true,
      });

      // currentForm.clientScriptFileId = 205331;

      currentForm.addSubmitButton({
        label: "Process Cope Records ",
      });

      context.response.writePage(currentForm);
    } else {
      // return;
      log.debug("code execute after retrun....");
      try {
        var scriptTask = task.create({
          taskType: task.TaskType.MAP_REDUCE,
        });
        scriptTask.scriptId = "customscript_run_batch_for_cope";
        scriptTask.deploymentId = "customdeploy_run_batch_for_cope";
        var scriptTaskId = scriptTask.submit();

        log.debug("scriptTaskId",scriptTaskId);

      } catch (error) {
        log.error("erro during execution of batch deposit", error);
        log.debug("erro during execution of batch deposit", error);
      }

      redirect.toSavedSearchResult({
        id: "customsearch_processed_cope_trans_record",
      });
    }
  }

  return {
    onRequest: onRequest,
  };
});
