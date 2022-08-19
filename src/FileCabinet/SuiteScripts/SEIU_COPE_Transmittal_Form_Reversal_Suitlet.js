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
  function mapData(cashDepositId, copeId, dataArr) {
    log.debug("cashDepositId", cashDepositId);
    var cashsaleSearchObj = search.create({
      type: "cashsale",
      filters: [
        ["type", "anyof", "CashSale"],
        "AND",
        ["custbody_je_source_record", "anyof", cashDepositId],
        "AND",
        ["mainline", "is", "T"],
        "AND",
        ["applyingtransaction.number", "isempty", ""],
      ],
      columns: [
        search.createColumn({ name: "internalid", label: "Internal ID" }),
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
    if (searchResultCount == 0) {
      ('checkData("True")');
    }
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
    cashsaleSearchObj.run().each(function (r) {
      // .run().each has a limit of 4,000 results
      const formIds = {
        copeId: copeId,
        cashSales: "",
        cdID: "",
        fundType: "",
        recordMemo: "",
        totalAmount: "",
      };

      // log.debug("", r);
      if (searchindex == 0) {
        formIds.cashSales = r.getValue("internalid");
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
        dataArr.push(formIds);
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
      var reversalForm = serverWidget.createForm({
        title: "SEIU | COPE Cash Sales Reversal",
      });
      reversalForm.clientScriptModulePath =
        "SuiteScripts/GenericResolverecordforCancelbuttonclientscript.js";
      const COPEFIELDSOBJ = JSON.parse(
        context.request.parameters["array_item"]
      );
      //   var recordType = "customtransaction108";

      log.debug("COPEFIELDSOBJ", COPEFIELDSOBJ);

      try {
        for (const key in COPEFIELDSOBJ) {
          if (COPEFIELDSOBJ.hasOwnProperty.call(COPEFIELDSOBJ, key)) {
            if (key == "CTFInternalId") {
              // formIds.copeId = COPEFIELDSOBJ[key];
            } else {
              if (COPEFIELDSOBJ[key] == "") {
                continue;
              } else {
                // log.debug("", mapData(COPEFIELDSOBJ[key]));
                mapData(
                  COPEFIELDSOBJ[key],
                  COPEFIELDSOBJ["CTFInternalId"],
                  tableData
                );
              }
            }
          }
        }

        log.debug("tableData", tableData);

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

        let sublist = reversalForm.addSublist({
          id: "custpage_deposit_list",
          type: serverWidget.SublistType.INLINEEDITOR,
          label: "Cash Deposit List",
        });

        let copeId = sublist.addField({
          id: "custpage_rec_id",
          label: "Internal ID",
          type: serverWidget.FieldType.TEXT,
        });
        copeId.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });

        let cashSales = sublist.addField({
          id: "custpage_cash_sales",
          label: "Cash Sales",
          type: serverWidget.FieldType.SELECT,
          source: "transaction",
        });

        cashSales.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });

        let select = sublist.addField({
          id: "custpage_cd_select",
          label: "Select",
          type: serverWidget.FieldType.CHECKBOX,
        });

        select.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.NORMAL,
        });

        let posting_date = sublist.addField({
          id: "custpage_rec_posting_date",
          label: "Posting Date",
          type: serverWidget.FieldType.DATE,
        });

        posting_date.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.NORMAL,
        });

        let tran_id = sublist.addField({
          id: "custpage_rec_tran_id",
          label: "Document Number",
          type: serverWidget.FieldType.SELECT,
          source: "transaction",
        });

        tran_id.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        let fundType = sublist.addField({
          id: "custpage_rec_fund_type",
          label: "Fund Type",
          type: serverWidget.FieldType.TEXT,
          source: "customlist_seiu_cope_fund_type",
        });
        fundType.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        let recordMemo = sublist.addField({
          id: "custpage_rec_record_memo",
          label: "Memo",
          type: serverWidget.FieldType.TEXT,
        });

        recordMemo.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        let totalAmount = sublist.addField({
          id: "custpage_rec_total_amount",
          label: "Amount",
          type: serverWidget.FieldType.CURRENCY,
        });
        totalAmount.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        for (
          let mapdateindex = 0;
          mapdateindex < tableData.length;
          mapdateindex++
        ) {
          const tableRow = tableData[mapdateindex];

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

        context.response.writePage(reversalForm);
      } catch (error) {
        log.debug("erro during execution in get method", error);
        throw error;
      }
    } else {
      var ServerRequest = context.request;
      var totalSubLines = ServerRequest.getLineCount("custpage_deposit_list");
      log.debug("custpage_deposit_list ", totalSubLines);
      for (
        let totalresLines = 0;
        totalresLines < totalSubLines;
        totalresLines++
      ) {
        // const element = totalSubLines[totalresLines];
        const isSelect = ServerRequest.getSublistValue({
          group: "custpage_deposit_list",
          line: totalresLines,
          name: "custpage_cd_select",
        });
        log.debug("isSelect", isSelect);

        if (isSelect == "T") {
          const copeId = ServerRequest.getSublistValue({
            group: "custpage_deposit_list",
            line: totalresLines,
            name: "custpage_rec_id",
          });

          log.debug({
            title: "cope id is",
            details: copeId,
          });

          var postingDate = new Date(
            ServerRequest.getSublistValue({
              group: "custpage_deposit_list",
              line: totalresLines,
              name: "custpage_rec_posting_date",
            })
          );

          const cashSales = ServerRequest.getSublistValue({
            group: "custpage_deposit_list",
            line: totalresLines,
            name: "custpage_cash_sales",
          });

          log.debug("cashSales", cashSales);

          if (cashSales) {
            const cashRefundRecord = record.transform({
              fromType: record.Type.CASH_SALE,
              fromId: cashSales,
              toType: record.Type.CASH_REFUND,
              // isDynamic: true,
              // defaultValues: Object
            });

            if(postingDate){
              cashRefundRecord.setValue({
                fieldId: "trandate",
                value: postingDate ? postingDate : new Date(),
                ignoreFieldChange: true,
              });
            }

            const savedRefund = cashRefundRecord.save({
              enableSourcing: true,
              ignoreMandatoryFields: true,
            });

            log.debug("savedRefund", savedRefund);

            const form = serverWidget.createForm({ title: " " });
            //form.addPageInitMessage({type: message.Type.INFORMATION, message: 'COPE Transmittal form and Cash deposit adjustment done successfully',});
            context.response.writePage(form);
            form.clientScriptModulePath =
              "SuiteScripts/SEIU_COPE_tranmittal_form_clientScript_for_reversal.js";
            
            if(savedRefund){

              const updatedCopeForm = record.submitFields({
                type: "customtransaction108",
                id: copeId,
                values: {"custbody_seiu_ctf_is_reversal_create": true}
              });

              log.debug("",`udpated cope form id is ${updatedCopeForm}`);
            }
          }
        }
      }
    }
  }

  return {
    onRequest: onRequest,
  };
});
