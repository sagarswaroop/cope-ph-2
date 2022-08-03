/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 */
/*******************************************************************************
 *
 *
 *
 * *******************************************************************
 */
define([
  "N/search",
  "N/format",
  "N/error",
  "N/runtime",
  "N/record",
  "N/ui/dialog",
  "N/currentRecord",
  "N/https",
  "N/url",
  "N/ui/message",
], function (
  search,
  format,
  error,
  runtime,
  record,
  dialog,
  currentRecord,
  https,
  url,
  message
) {
  function pageInit(context) {}

  function onButtonClick(context) {
    debugger;

    var cashDeposit_rec = currentRecord.get();
    var cashDeposit_id = cashDeposit_rec.id;

    log.debug("cashDeposit_id", cashDeposit_id);

    var suiteletUrl = url.resolveScript({
      scriptId: "customscript_cash_deposit_ajustment",
      deploymentId: "customdeploy_cash_deposit_adjustment",
      params: { cashDeposit: cashDeposit_id },
      returnExternalUrl: false,
    });

    window.open(
      suiteletUrl,
      "MsgWindow",
      "left=200,top=200,width=1200,height=620"
    );

    return false;
  }

  return {
    pageInit: pageInit,
    onButtonClick: onButtonClick,
  };
});
