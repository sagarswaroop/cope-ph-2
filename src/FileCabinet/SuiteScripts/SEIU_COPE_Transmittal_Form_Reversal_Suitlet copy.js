/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@Author Sagar Kumar
 *@description : IT shows all the transactions related to cope form which is triggered from.
 */
define([
  "N/ui/serverWidget",
  "N/record",
  "N/http",
  "N/redirect",
  "N/search",
], function (serverWidget, record, http, redirect, search) {
  const formIds = {
    copeId: "",
    cashSales: "",
    cdID: "",
    fundType: "",
    recordMemo: "",
    totalAmount: "",
  };

  function mapData(cashDepositId, arr) {
    log.debug("cashDepositId", cashDepositId);
    var cashsaleSearchObj = search.create({
      type: "cashsale",
      filters: [
        ["type", "anyof", "CashSale"],
        "AND",
        ["custbody_je_source_record", "anyof", cashDepositId],
        "AND",
        ["mainline", "is", "T"],
      ],
      columns: [
        search.createColumn({ name: "tranid", label: "Document Number" }),
        search.createColumn({
          name: "custbody_je_source_record",
          label: "Source Record",
        }),
        search.createColumn({ name: "amount", label: "Amount" }),
        search.createColumn({
          name: "formulatext",
          formula: "{custbody_je_source_record.memo}",
          label: "Formula (Text)",
        }),
        search.createColumn({
          name: "formulatext_1",
          formula: "{custbody_je_source_record.custbody_seiu_cd_fundtype}",
          label: "Formula (Text)",
        }),
      ],
    });
    var searchResultCount = cashsaleSearchObj.runPaged().count;
    log.debug("cashsaleSearchObj result count", searchResultCount);
    let searchindex = 0;

    // var searchResult = cashsaleSearchObj.runPaged({
    //   pageSize: searchResultCount
    // })
    //   let searchResult;
    //   cashsaleSearchObj.run().each(function(result){
    //     // .run().each has a limit of 4,000 results
    //     searchResult = result
    //     return true;
    //  });

    //   log.debug({
    //     title: "searchResult",
    //     details: searchResult
    //   })
    // const formIds = {};
    cashsaleSearchObj.run().each(function (r) {
      // .run().each has a limit of 4,000 results

      // log.debug("", r);
      if (searchindex == 0) {
        formIds.cashSales = r.getValue("tranid");
        formIds.cdID = r.getValue("custbody_je_source_record");
        formIds.totalAmount = r.getValue("amount");
        formIds.recordMemo = r.getValue("formulatext");
        let isType = r.getValue("formulatext_1");

        log.debug(isType);

        if (isType == "") {
          formIds.fundType = "Adjustment";
        } else {
          formIds.fundType = isType;
        }
        log.debug(" formIds inside serach result", formIds);
        arr.push(formIds);
      }
      searchindex++;
      return true;
    });

    // return formIds;
  }

  function onRequest(context) {
    //var currentRecord=context.newRecord;

    if (context.request.method === "GET") {
      const tableData = [];
      const COPEFIELDSOBJ = JSON.parse(
        context.request.parameters["array_item"]
      );
      //   var recordType = "customtransaction108";

      log.debug("COPEFIELDSOBJ", COPEFIELDSOBJ);

      try {
        log.debug("tableData", tableData);

        var reversalForm = serverWidget.createForm({
          title: "SEIU | COPE Cash Sales Reversal",
        });

        reversalForm.addSubmitButton({
          label: "Submit",
        });

        reversalForm.addButton({
          id: "custpagecancelbutton",
          label: "Cancel",
          functionName:
            'setButton("' +
            COPEFIELDSOBJ.CTFInternalId +
            '","' +
            "customtransaction108" +
            '")',
        });

        reversalForm.clientScriptModulePath =
          "SuiteScripts/GenericResolverecordforCancelbuttonclientscript.js";

        var sublist = reversalForm.addSublist({
          id: "custpage_deposit_list",
          type: serverWidget.SublistType.INLINEEDITOR,
          label: "Cash Deposit List",
        });

        var copeId = sublist.addField({
          id: "custpage_rec_id",
          label: "Internal ID",
          type: serverWidget.FieldType.TEXT,
        });
        copeId.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });

        var cashSales = sublist.addField({
          id: "custpage_cash_sales",
          label: "Cash Sales",
          type: serverWidget.FieldType.SELECT,
        });

        cashSales.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });

        var select = sublist.addField({
          id: "custpage_cd_select",
          label: "Select",
          type: serverWidget.FieldType.CHECKBOX,
        });

        select.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.NORMAL,
        });

        var posting_date = sublist.addField({
          id: "custpage_rec_posting_date",
          label: "Posting Date",
          type: serverWidget.FieldType.DATE,
        });
        posting_date.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.NORMAL,
        });

        var tran_id = sublist.addField({
          id: "custpage_rec_tran_id",
          label: "Document Number",
          type: serverWidget.FieldType.SELECT,
          source: "transaction",
        });

        tran_id.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var fundType = sublist.addField({
          id: "custpage_rec_fund_type",
          label: "Fund Type",
          type: serverWidget.FieldType.TEXT,
          source: "customlist_seiu_cope_fund_type",
        });
        fundType.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var recordMemo = sublist.addField({
          id: "custpage_rec_record_memo",
          label: "Memo",
          type: serverWidget.FieldType.TEXT,
        });

        recordMemo.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var totalAmount = sublist.addField({
          id: "custpage_rec_total_amount",
          label: "Amount",
          type: serverWidget.FieldType.CURRENCY,
        });
        totalAmount.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        // for (
        //   let mapdateindex = 0;
        //   mapdateindex < tableData.length;
        //   mapdateindex++
        // ) {
        //   const tableRow = tableData[mapdateindex];

        //   sublist.setSublistValue({
        //     id: "custpage_rec_id",
        //     line: mapdateindex,
        //     value: tableRow.copeId,
        //   });

        //   sublist.setSublistValue({
        //     id: "custpage_cash_sales",
        //     line: mapdateindex,
        //     value: tableRow.cashSales,
        //   });

        //   sublist.setSublistValue({
        //     id: "custpage_rec_tran_id",
        //     line: mapdateindex,
        //     value: tableRow.cdID,
        //   });

        //   sublist.setSublistValue({
        //     id: "custpage_rec_fund_type",
        //     line: mapdateindex,
        //     value: tableRow.fundType,
        //   });

        //   sublist.setSublistValue({
        //     id: "custpage_rec_record_memo",
        //     line: mapdateindex,
        //     value: tableRow.recordMemo,
        //   });

        //   sublist.setSublistValue({
        //     id: "custpage_rec_total_amount",
        //     line: mapdateindex,
        //     value: tableRow.totalAmount,
        //   });
        // }

        for (const key in COPEFIELDSOBJ) {
          if (COPEFIELDSOBJ.hasOwnProperty.call(COPEFIELDSOBJ, key)) {
            if (key == "CTFInternalId") {
              formIds.copeId = COPEFIELDSOBJ[key];
            } else {
              if (COPEFIELDSOBJ[key] == "") {
                continue;
              } else {
                // log.debug("", mapData(COPEFIELDSOBJ[key]));
                // mapData(COPEFIELDSOBJ[key],tableData);
                var cashsaleSearchObj = search.create({
                  type: "cashsale",
                  filters: [
                    ["type", "anyof", "CashSale"],
                    "AND",
                    ["custbody_je_source_record", "anyof", COPEFIELDSOBJ[key]],
                    "AND",
                    ["mainline", "is", "T"],
                  ],
                  columns: [
                    search.createColumn({
                      name: "tranid",
                      label: "Document Number",
                    }),
                    search.createColumn({
                      name: "custbody_je_source_record",
                      label: "Source Record",
                    }),
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({
                      name: "formulatext",
                      formula: "{custbody_je_source_record.memo}",
                      label: "Formula (Text)",
                    }),
                    search.createColumn({
                      name: "formulatext_1",
                      formula:
                        "{custbody_je_source_record.custbody_seiu_cd_fundtype}",
                      label: "Formula (Text)",
                    }),
                  ],
                });
                var searchResultCount = cashsaleSearchObj.runPaged().count;
                log.debug("cashsaleSearchObj result count", searchResultCount);
                let searchindex = 0;

                cashsaleSearchObj.run().each(function (r) {
                  // .run().each has a limit of 4,000 results

                  // log.debug("", r);
                  if (searchindex == 0) {
                    formIds.cashSales = r.getValue("tranid");
                    formIds.cdID = r.getValue("custbody_je_source_record");
                    formIds.totalAmount = r.getValue("amount");
                    formIds.recordMemo = r.getValue("formulatext");
                    let isType = r.getValue("formulatext_1");

                    log.debug(isType);

                    if (isType == "") {
                      formIds.fundType = "Adjustment";
                    } else {
                      formIds.fundType = isType;
                    }
                    log.debug(" formIds inside serach result", formIds);
                    // arr.push(formIds);

                      sublist.setSublistValue({
                        id: "custpage_rec_id",
                        line: mapdateindex,
                        value: tableRow.copeId,
                      });

                      sublist.setSublistValue({
                        id: "custpage_cash_sales",
                        line: mapdateindex,
                        value: tableRow.cashSales,
                      });

                      sublist.setSublistValue({
                        id: "custpage_rec_tran_id",
                        line: mapdateindex,
                        value: tableRow.cdID,
                      });

                      sublist.setSublistValue({
                        id: "custpage_rec_fund_type",
                        line: mapdateindex,
                        value: tableRow.fundType,
                      });

                      sublist.setSublistValue({
                        id: "custpage_rec_record_memo",
                        line: mapdateindex,
                        value: tableRow.recordMemo,
                      });

                      sublist.setSublistValue({
                        id: "custpage_rec_total_amount",
                        line: mapdateindex,
                        value: tableRow.totalAmount,
                      });
                  }
                  searchindex++;
                  return true;
                });
              }
            }
          }
        }

        context.response.writePage(reversalForm);
      } catch (error) {
        log.debug("erro during execution in get method", error);
        throw error;
      }
    } else if (context.request.method === "POST") {
      var postDate = context.request.parameters.custpagedate;
      var ReversalRecordtype =
        context.request.parameters.custpagereversalrecord;
      log.debug({
        title: "Reversal Record Type",
        details: ReversalRecordtype,
      });
    }
  }

  return {
    onRequest: onRequest,
  };
});
