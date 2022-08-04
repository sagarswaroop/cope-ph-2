/**
 *@NApiVersion 2.x
 *@NModuleScope Public
 *@NScriptType Suitelet
 */

define([
  "N/log",
  "N/ui/serverWidget",
  "N/record",
  "N/search",
  "N/format",
  "./SEIU_ML_Cope_Adjustment.js",
  "N/url",
  "N/redirect",
  "N/ui/message",
], function (
  log,
  serverWidget,
  record,
  search,
  format,
  adjustment,
  url,
  redirect,
  message
) {
  function onRequest(options, scriptContext) {
    var request = options.request;
    var response = options.response;

    if (request.method === "GET") {
      var requestparam = request.parameters;
      var cashDeposit_ID = requestparam.cashDeposit;
      // var cashDeposit_Btach_Id = requestparam.recBatchId;
      var sucess,
        failure = false;
      var fundType;
      sucess = requestparam.success;
      failure = requestparam.Failure;

      log.debug("Cash Deposit", cashDeposit_ID);

      var form = serverWidget.createForm({ title: "Cope Adjustment" });

      if (sucess == "True")
        form.addPageInitMessage({
          type: message.Type.INFORMATION,
          message: "Adjustment Transactions Creation Process Completed.",
        });

      if (failure == "True")
        form.addPageInitMessage({
          type: message.Type.INFORMATION,
          message:
            "Adjustment amount entered is more than the balance amount.Please enter adjustment amount again.",
        });

      // Get Cash Deposit
      var fieldLookUp = search.lookupFields({
        type: "customtransaction_cd_101",
        id: cashDeposit_ID,
        columns: ["custbody_seiu_cd_fundtype"],
      });

      fundType = fieldLookUp.custbody_seiu_cd_fundtype[0].value;

      log.debug("fundType", fundType);

      // Create Suitelet
      //create page to display results and allow for user input
      // var form = serverWidget.createForm({title : 'Cope Adjustment'});

      if (fundType == 3) {
        var tab = form.addTab({
          id: "custpage_adjustment_tab",
          label: "Enter Adjusment Amount",
        });

        var sublist = form.addSublist({
          id: "sublistid",
          type: serverWidget.SublistType.INLINEEDITOR,
          label: "Enter Adjusment Amount",
          tab: "custpage_adjustment_tab",
        });
        var cashDepositField = sublist.addField({
          id: "custpage_rec_cashdeposit",
          label: "Cash Deposit",
          type: serverWidget.FieldType.TEXT,
        });
        cashDepositField.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });
        var idField = sublist.addField({
          id: "custpage_rec_id",
          label: "Internal ID",
          type: serverWidget.FieldType.TEXT,
        });
        idField.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });
        var year = sublist.addField({
          id: "custpage_rec_hold_year",
          label: "Internal ID",
          type: serverWidget.FieldType.TEXT,
        });
        year.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });
        var tran_qualified_Type = sublist.addField({
          id: "custpage_rec_transaction_type",
          label: "Type",
          type: serverWidget.FieldType.TEXT,
        });
        tran_qualified_Type.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var tran_date = sublist.addField({
          id: "custpage_rec_tran_date",
          label: "Date",
          type: serverWidget.FieldType.TEXT,
        });
        tran_date.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var bank_received_date = sublist.addField({
          id: "custpage_rec_bank_received_date",
          label: "Bank Received Date",
          type: serverWidget.FieldType.TEXT,
        });
        bank_received_date.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var tran_id = sublist.addField({
          id: "custpage_rec_tran_id",
          label: "Document Number",
          type: serverWidget.FieldType.TEXT,
        });
        tran_id.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var local_customer = sublist.addField({
          id: "custpage_rec_local_customer",
          label: "Local Customer",
          type: serverWidget.FieldType.SELECT,
          source: "customrecord_localized",
        });
        //   var local_customer = sublist.addField({id: 'custpage_rec_local_customer',label: 'Local Customer',type: serverWidget.FieldType.TEXT});
        local_customer.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var local_qualifying_funds = sublist.addField({
          id: "custpage_rec_local_qualifying_funds",
          label: "Local Qualifying Funds",
          type: serverWidget.FieldType.TEXT,
        });
        local_qualifying_funds.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var seiu_qualifying_funds = sublist.addField({
          id: "custpage_rec_seiu_qualifying_funds",
          label: "SEIU Qualifying Funds",
          type: serverWidget.FieldType.TEXT,
        });
        seiu_qualifying_funds.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var local_non_qualifying_fund = sublist.addField({
          id: "custpage_rec_local_non_qualifying_fund",
          label: "Local Non-Qualifying Funds",
          type: serverWidget.FieldType.TEXT,
        });
        local_non_qualifying_fund.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        var seiu_non_qualifying_funds = sublist.addField({
          id: "custpage_rec_seiu_non_qualifying_funds",
          label: "SEIU Non-Qualifying Funds",
          type: serverWidget.FieldType.TEXT,
        });
        seiu_non_qualifying_funds.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        // var seiu_adjustment_amount = sublist.addField({id: 'custpage_rec_seiu_adustment_amount',label: 'Enter Adjustment Amount',type: serverWidget.FieldType.TEXT});

        var attachementField = sublist.addField({
          id: "custpage_rec_attachment",
          label: "Attachment",
          type: serverWidget.FieldType.TEXT,
        });
        attachementField.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });
        var paymentMethodField = sublist.addField({
          id: "custpage_rec_paymentmethod",
          label: "Payment Method",
          type: serverWidget.FieldType.TEXT,
        });
        paymentMethodField.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.HIDDEN,
        });

        //Hold Use case
        var holdTotalPaymentField = sublist.addField({
          id: "custpage_rec_hold_total_payment",
          label: "Total Payment",
          type: serverWidget.FieldType.TEXT,
        });
        //holdTotalPaymentField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

        var holdHistoricalQualifiedField = sublist.addField({
          id: "custpage_rec_hold_historical_qualified_amount",
          label: "Adjusted Qualified Amt",
          type: serverWidget.FieldType.TEXT,
        });

        var holdHistoricalNonQualifiedField = sublist.addField({
          id: "custpage_rec_hold_historical_non_qualified_amount",
          label: "Adjusted Non-Qualified Amt",
          type: serverWidget.FieldType.TEXT,
        });

        var holdQualifiedField = sublist.addField({
          id: "custpage_rec_hold_qualified_amount",
          label: "Qualified Amount",
          type: serverWidget.FieldType.TEXT,
        });

        var holdNonQualifiedField = sublist.addField({
          id: "custpage_rec_hold_non_qualified_amount",
          label: "Non-Qualified Amount",
          type: serverWidget.FieldType.TEXT,
        });

        var totalBalancePaymentField = sublist.addField({
          id: "custpage_rec_total_balance_payment",
          label: "Balance Adjusted Amount",
          type: serverWidget.FieldType.TEXT,
        });

        // Create Suitelet

        var cashdeposit_rec = record.load({
          type: "customtransaction_cd_101",
          id: cashDeposit_ID,
        });

        var cashDepositMemo = cashdeposit_rec.getValue({ fieldId: "memo" });

        var cashDepositfundType = cashdeposit_rec.getValue({
          fieldId: "custbody_seiu_cd_fundtype",
        });

        var lineCount = cashdeposit_rec.getLineCount({ sublistId: "line" });

        for (var line = 0; line < lineCount; line++) {
          var line_memo, line_subsidiary, line_payment_method;
          var line_internalID,
            line_trandate,
            line_tranid,
            line_customer,
            line_bank_recieved_date;
          var line_local_qualifying_funds,
            line_seiu_qualifying_funds,
            line_local_non_qualifying_fund,
            line_seiu_non_qualifying_funds;
          var line_subsidiary, line_payment_method;
          var line_transaction_type;
          var attachment;
          var paymentMethod;
          var seiuTransmittedDate;
          var totalQualifiyingAdjustmentAmount = 0;
          var totalNonQualifiyingAdjustmentAmount = 0;

          var sourceTransmittalID = cashdeposit_rec.getSublistValue({
            sublistId: "line",
            fieldId: "custcol_seiu_source_record",
            line: line,
          }); //'252981';
          var paymentAmount = cashdeposit_rec.getSublistValue({
            sublistId: "line",
            fieldId: "amount",
            line: line,
          });
          var paymentYear = cashdeposit_rec.getSublistValue({
            sublistId: "line",
            fieldId: "custcol_tranmital_year",
            line: line,
          });

          //log.debug("sourceTransmittalID",sourceTransmittalID);

          if (!sourceTransmittalID) continue;

          // Get Historical adjusted amount

          var customrecord_cope_adjustment_transactionSearchObj = search.create(
            {
              type: "customrecord_cope_adjustment_transaction",
              filters: [
                ["custrecord_source_cash_deposit", "anyof", cashDeposit_ID],
                "AND",
                [
                  "custrecord_cope_transmittal_transaction",
                  "anyof",
                  sourceTransmittalID,
                ],
              ],
              columns: [
                search.createColumn({
                  name: "custrecord_adjustment_amount",
                  summary: "SUM",
                  label: "Qualifiying Adjustment Amount",
                }),
                search.createColumn({
                  name: "custrecord_non_adj_qualifying_amount",
                  summary: "SUM",
                  label: "Non-Qualitfying Adjustment Amount",
                }),
              ],
            }
          );
          var searchResultCount =
            customrecord_cope_adjustment_transactionSearchObj.runPaged().count;
          log.debug(
            "customrecord_cope_adjustment_transactionSearchObj result count",
            searchResultCount
          );
          customrecord_cope_adjustment_transactionSearchObj
            .run()
            .each(function (result) {
              // .run().each has a limit of 4,000 results

              totalQualifiyingAdjustmentAmount = result.getValue({
                name: "custrecord_adjustment_amount",
                summary: "SUM",
                label: "Qualifiying Adjustment Amount",
              });
              totalNonQualifiyingAdjustmentAmount = result.getValue({
                name: "custrecord_non_adj_qualifying_amount",
                summary: "SUM",
                label: "Non-Qualitfying Adjustment Amount",
              });

              if (!totalQualifiyingAdjustmentAmount)
                totalQualifiyingAdjustmentAmount = 0;

              if (!totalNonQualifiyingAdjustmentAmount)
                totalNonQualifiyingAdjustmentAmount = 0;

              log.debug(
                "totalQualifiyingAdjustmentAmount",
                totalQualifiyingAdjustmentAmount
              );
              log.debug(
                "totalNonQualifiyingAdjustmentAmount",
                totalNonQualifiyingAdjustmentAmount
              );

              return true;
            });

          // Get Historical adjusted amount

          var transactionSearchObj = search.create({
            type: "transaction",
            filters: [
              ["type", "anyof", "Custom108"],
              "AND",
              ["mainline", "is", "T"],
              "AND",
              ["internalid", "anyof", sourceTransmittalID],
            ],
            columns: [
              search.createColumn({ name: "internalid", label: "Internal ID" }),
              search.createColumn({ name: "memo", label: "Memo" }),
              search.createColumn({ name: "trandate", label: "Date" }),
              search.createColumn({
                name: "custbody_seiu_cope_bank_rec_date",
                label: "Bank Received Date",
              }),
              search.createColumn({ name: "tranid", label: "Document Number" }),
              search.createColumn({
                name: "custbody_local_customer",
                label: "Local Customer",
              }),
              search.createColumn({
                name: "custbody_date_transmitted",
                label: "Date Transmitted",
              }),
              search.createColumn({
                name: "custbody_local_qualifying_funds",
                label: "Local Qualifying Funds",
              }),
              search.createColumn({
                name: "custbody_seiu_qualifying_funds",
                label: "SEIU Qualifying Funds",
              }),
              search.createColumn({
                name: "custbody_local_non_qualifying_fund",
                label: "Local Non-Qualifying Funds",
              }),
              search.createColumn({
                name: "custbody_seiu_non_qualifying_funds",
                label: "SEIU Non-Qualifying Funds",
              }),
              search.createColumn({ name: "custbody_status", label: "Status" }),
              search.createColumn({
                name: "custbody_ctf_non_qual_cash_dep",
                label: "Cash Deposity(Non-Qualifying Amount)",
              }),
              search.createColumn({
                name: "custbody_ctf_qual_cash_dep",
                label: "Qualifying",
              }),
              search.createColumn({
                name: "custbody_cd_hold_accounts",
                label: "Cash Deposit(Hold Account)",
              }),
              search.createColumn({
                name: "custbody_ctf_payment_method_header",
                label: "Payment Method(Header)",
              }),
              search.createColumn({ name: "subsidiary", label: "Subsidiary" }),
              search.createColumn({
                name: "custbody_seiu_support_docs",
                label: "Attachment",
              }),
              search.createColumn({
                name: "custbody_2nd_date_transmitted",
                label: "SEIU Revised Date Transmitted",
              }),
              search.createColumn({
                name: "custbody_ctf_payment_method_header",
                label: "Payment Method",
              }),
            ],
          });
          var searchResultCount = transactionSearchObj.runPaged().count;
          //log.debug("transactionSearchObj result count",searchResultCount);
          transactionSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results

            line_internalID = result.getValue({
              name: "internalid",
              label: "Internal ID",
            });
            line_memo = result.getValue({ name: "memo", label: "Memo" });
            line_subsidiary = result.getValue({
              name: "subsidiary",
              label: "Subsidiary",
            });
            line_payment_method = result.getValue({
              name: "custbody_ctf_payment_method_header",
              label: "Payment Method(Header)",
            });
            line_trandate = result.getValue({
              name: "trandate",
              label: "Date",
            });
            line_tranid = result.getValue({
              name: "tranid",
              label: "Document Number",
            });
            line_customer = result.getValue({
              name: "custbody_local_customer",
              label: "Local Customer",
            });
            line_bank_recieved_date = result.getValue({
              name: "custbody_seiu_cope_bank_rec_date",
              label: "Bank Received Date",
            });
            line_local_qualifying_funds = result.getValue({
              name: "custbody_local_qualifying_funds",
              label: "Local Qualifying Funds",
            });
            line_seiu_qualifying_funds = result.getValue({
              name: "custbody_seiu_qualifying_funds",
              label: "SEIU Qualifying Funds",
            });
            line_local_non_qualifying_fund = result.getValue({
              name: "custbody_local_non_qualifying_fund",
              label: "Local Non-Qualifying Funds",
            });
            line_seiu_non_qualifying_funds = result.getValue({
              name: "custbody_seiu_non_qualifying_funds",
              label: "SEIU Non-Qualifying Funds",
            });
            attachment = result.getValue({
              name: "custbody_seiu_support_docs",
              label: "Attachment",
            });
            paymentMethod = result.getValue({
              name: "custbody_ctf_payment_method_header",
              label: "Payment Method",
            });
            line_year = result.getValue({
              name: "custcol_tranmital_year",
              label: "Year",
            });
            seiuTransmittedDate = result.getValue({
              name: "custbody_2nd_date_transmitted",
              label: "SEIU Revised Date Transmitted",
            });

            var isQualifiedCashDeposit =
              cashDepositMemo.indexOf(" Qualifying ");
            var isNonQualifiedCashDeposit = cashDepositMemo.indexOf("NQ");
            var isHoldCashDeposit = cashDepositMemo.indexOf("HOLD");

            if (cashDepositfundType == 2) {
              line_transaction_type = "Non-Qualifying";

              var holdTotalPaymentField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_total_payment" });
              var holdQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_qualified_amount" });
              var holdNonQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_non_qualified_amount" });

              holdTotalPaymentField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              holdQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              holdNonQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });

              // Disabled Qualified/Non Qualified
              var local_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_local_qualifying_funds" });
              var seiu_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_seiu_qualifying_funds" });
              var local_non_qualifying_fund = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_local_non_qualifying_fund" });
              var seiu_non_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_seiu_non_qualifying_funds" });
              local_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              seiu_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              local_non_qualifying_fund.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              seiu_non_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
            } else if (cashDepositfundType == 3) {
              line_transaction_type = "Hold";

              //Enable Hold columns
              var holdTotalPaymentField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_total_payment" });
              var holdQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_qualified_amount" });
              var holdNonQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_non_qualified_amount" });

              var holdHistoricalQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({
                  id: "custpage_rec_hold_historical_qualified_amount",
                });
              var holdHistoricalNonQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({
                  id: "custpage_rec_hold_historical_non_qualified_amount",
                });
              var totalBalancePaymentField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_total_balance_payment" });

              holdHistoricalQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              holdHistoricalNonQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              totalBalancePaymentField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });

              holdTotalPaymentField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              holdQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY,
              });
              holdNonQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY,
              });

              // Hide Qualified/Non Qualified
              var local_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_local_qualifying_funds" });
              var seiu_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_seiu_qualifying_funds" });
              var local_non_qualifying_fund = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_local_non_qualifying_fund" });
              var seiu_non_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_seiu_non_qualifying_funds" });

              local_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              seiu_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              local_non_qualifying_fund.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              seiu_non_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
            } else {
              line_transaction_type = "Qualifying";

              var holdTotalPaymentField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_total_payment" });
              var holdQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_qualified_amount" });
              var holdNonQualifiedField = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_hold_non_qualified_amount" });

              holdTotalPaymentField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              holdQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });
              holdNonQualifiedField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN,
              });

              // Disabled Qualified/Non Qualified
              var local_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_local_qualifying_funds" });
              var seiu_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_seiu_qualifying_funds" });
              var local_non_qualifying_fund = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_local_non_qualifying_fund" });
              var seiu_non_qualifying_funds = form
                .getSublist({ id: "sublistid" })
                .getField({ id: "custpage_rec_seiu_non_qualifying_funds" });
              local_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              seiu_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              local_non_qualifying_fund.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
              seiu_non_qualifying_funds.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED,
              });
            }

            if (!attachment) attachment = 174041;

            sublist.setSublistValue({
              id: "custpage_rec_cashdeposit",
              line: line,
              value: cashDeposit_ID,
            });
            sublist.setSublistValue({
              id: "custpage_rec_id",
              line: line,
              value: line_internalID,
            });
            sublist.setSublistValue({
              id: "custpage_rec_transaction_type",
              line: line,
              value: line_transaction_type,
            });
            sublist.setSublistValue({
              id: "custpage_rec_tran_date",
              line: line,
              value: line_trandate,
            });
            sublist.setSublistValue({
              id: "custpage_rec_tran_id",
              line: line,
              value: line_tranid,
            });
            sublist.setSublistValue({
              id: "custpage_rec_bank_received_date",
              line: line,
              value: line_bank_recieved_date,
            });
            sublist.setSublistValue({
              id: "custpage_rec_local_customer",
              line: line,
              value: line_customer,
            });
            sublist.setSublistValue({
              id: "custpage_rec_local_qualifying_funds",
              line: line,
              value: line_local_qualifying_funds
                ? line_local_qualifying_funds
                : 0,
            });
            sublist.setSublistValue({
              id: "custpage_rec_seiu_qualifying_funds",
              line: line,
              value: line_seiu_qualifying_funds
                ? line_seiu_qualifying_funds
                : 0,
            });
            sublist.setSublistValue({
              id: "custpage_rec_local_non_qualifying_fund",
              line: line,
              value: line_local_non_qualifying_fund
                ? line_local_non_qualifying_fund
                : 0,
            });
            sublist.setSublistValue({
              id: "custpage_rec_seiu_non_qualifying_funds",
              line: line,
              value: line_seiu_non_qualifying_funds
                ? line_seiu_non_qualifying_funds
                : 0,
            });
            sublist.setSublistValue({
              id: "custpage_rec_attachment",
              line: line,
              value: attachment,
            });
            sublist.setSublistValue({
              id: "custpage_rec_paymentmethod",
              line: line,
              value: paymentMethod,
            });
            sublist.setSublistValue({
              id: "custpage_rec_hold_total_payment",
              line: line,
              value: paymentAmount,
            });
            sublist.setSublistValue({
              id: "custpage_rec_hold_year",
              line: line,
              value: paymentYear,
            });
            sublist.setSublistValue({
              id: "custpage_rec_hold_historical_qualified_amount",
              line: line,
              value: totalQualifiyingAdjustmentAmount,
            });
            sublist.setSublistValue({
              id: "custpage_rec_hold_historical_non_qualified_amount",
              line: line,
              value: totalNonQualifiyingAdjustmentAmount,
            });

            if (seiuTransmittedDate) {
              //Calculate total adjustment amount
              var totalAdjustmentAmount =
                parseFloat(totalQualifiyingAdjustmentAmount) +
                parseFloat(totalNonQualifiyingAdjustmentAmount);
              log.debug("totalAdjustmentAmount", totalAdjustmentAmount);

              if (totalAdjustmentAmount >= paymentAmount) {
                line_seiu_qualifying_funds = 0;
                line_seiu_non_qualifying_funds = 0;
              } else {
                if (line_seiu_qualifying_funds)
                  line_seiu_qualifying_funds =
                    line_seiu_qualifying_funds -
                    totalQualifiyingAdjustmentAmount;
                else line_seiu_qualifying_funds = 0;

                if (line_seiu_non_qualifying_funds)
                  line_seiu_non_qualifying_funds =
                    line_seiu_non_qualifying_funds -
                    totalNonQualifiyingAdjustmentAmount;
                else line_seiu_non_qualifying_funds = 0;
              }

              var totalBalanceAdjustmentAmount =
                parseFloat(line_seiu_qualifying_funds) +
                parseFloat(line_seiu_non_qualifying_funds);
              log.debug(
                "totalBalanceAdjustmentAmount",
                totalBalanceAdjustmentAmount
              );

              sublist.setSublistValue({
                id: "custpage_rec_hold_qualified_amount",
                line: line,
                value: line_seiu_qualifying_funds,
              });
              sublist.setSublistValue({
                id: "custpage_rec_hold_non_qualified_amount",
                line: line,
                value: line_seiu_non_qualifying_funds,
              });
              sublist.setSublistValue({
                id: "custpage_rec_total_balance_payment",
                line: line,
                value: totalBalanceAdjustmentAmount,
              });
            } else {
              //Calculate total adjustment amount
              var totalAdjustmentAmount =
                parseFloat(totalQualifiyingAdjustmentAmount) +
                parseFloat(totalNonQualifiyingAdjustmentAmount);
              log.debug("Local totalAdjustmentAmount", totalAdjustmentAmount);

              if (totalAdjustmentAmount >= paymentAmount) {
                line_local_qualifying_funds = 0;
                line_local_non_qualifying_fund = 0;
              } else {
                if (line_local_qualifying_funds)
                  line_local_qualifying_funds =
                    line_local_qualifying_funds -
                    totalQualifiyingAdjustmentAmount;
                else line_local_qualifying_funds = 0;

                if (line_local_non_qualifying_fund)
                  line_local_non_qualifying_fund =
                    line_local_non_qualifying_fund -
                    totalNonQualifiyingAdjustmentAmount;
                else line_local_non_qualifying_fund = 0;
              }

              var totalBalanceAdjustmentAmount =
                parseFloat(line_local_qualifying_funds) +
                parseFloat(line_local_non_qualifying_fund);
              log.debug(
                "totalBalanceAdjustmentAmount",
                totalBalanceAdjustmentAmount
              );

              sublist.setSublistValue({
                id: "custpage_rec_hold_qualified_amount",
                line: line,
                value: line_local_qualifying_funds,
              });
              sublist.setSublistValue({
                id: "custpage_rec_hold_non_qualified_amount",
                line: line,
                value: line_local_non_qualifying_fund,
              });
              sublist.setSublistValue({
                id: "custpage_rec_total_balance_payment",
                line: line,
                value: totalBalanceAdjustmentAmount,
              });
            }

            return true;
          });
        }
      }

      // Add the History Tab

      var transactionLine = 0;

      var tabadjustment = form.addTab({
        id: "custpage_adjustment_details",
        label: "Applied Adjusment Amount",
      });

      var sublistAdjustmentTransactions = form.addSublist({
        id: "custpage_sublist",
        type: serverWidget.SublistType.LIST,
        label: "Applied Adjusment Amount",
        tab: "custpage_adjustment_details",
      });

      var dateField = sublistAdjustmentTransactions.addField({
        id: "custpage_rec_trans_date",
        label: "Date",
        type: serverWidget.FieldType.TEXT,
      });

      var copeTransmittalField = sublistAdjustmentTransactions.addField({
        id: "custpage_rec_cope_transmittal_transaction",
        type: serverWidget.FieldType.TEXT,
        label: "Cope Transmittal Transaction",
      });

      var copeQualifyingAmountField = sublistAdjustmentTransactions.addField({
        id: "custpage_rec_qualifying_adjustment_amount",
        type: serverWidget.FieldType.TEXT,
        label: "Qualifying Adjustment Amount",
      });

      var copeNonQualifyingAmountField = sublistAdjustmentTransactions.addField(
        {
          id: "custpage_rec_non_qualifying_adjustment_amount",
          type: serverWidget.FieldType.TEXT,
          label: "Non-Qualifying Adjustment Amount",
        }
      );

      var copeQualifyingCashDepositField =
        sublistAdjustmentTransactions.addField({
          id: "custpage_rec_cope_qualifying_cd",
          type: serverWidget.FieldType.TEXTAREA,
          label: " Qualifiying Cash Deposit",
        });

      var copeNonQualifyingCashDepositField =
        sublistAdjustmentTransactions.addField({
          id: "custpage_rec_cope_non_qualifying_cd",
          type: serverWidget.FieldType.TEXTAREA,
          label: "Non-Qualifiying Cash Deposit",
        });

      var copeQualifyingVBField = sublistAdjustmentTransactions.addField({
        id: "custpage_rec_cope_qualifying_vb",
        type: serverWidget.FieldType.TEXTAREA,
        label: "Qualifying Vendor Bill",
      });

      var copeNonQualifyingVBField = sublistAdjustmentTransactions.addField({
        id: "custpage_rec_cope_non_qualifying_vb",
        type: serverWidget.FieldType.TEXTAREA,
        label: "Non-Qualifying Vendor Bill",
      });

      // Search Cash Deposit

      var customrecord_cope_adjustment_transactionSearchObj = search.create({
        type: "customrecord_cope_adjustment_transaction",
        filters: [["custrecord_source_cash_deposit", "anyof", cashDeposit_ID]],
        columns: [
          search.createColumn({ name: "internalid", label: "Internal ID" }),
          search.createColumn({ name: "created", label: "Date" }),
          search.createColumn({
            name: "custrecord_source_cash_deposit",
            label: "Source Cash Deposit",
          }),
          search.createColumn({
            name: "custrecord_cope_transmittal_transaction",
            label: "Cope Transmittal Transaction",
          }),
          search.createColumn({
            name: "custrecord_adjustment_amount",
            label: "Qualifiying Adjustment Amount",
          }),
          search.createColumn({
            name: "custrecord_non_adj_qualifying_amount",
            label: "Non-Qualitfying Adjustment Amount",
          }),
          search.createColumn({
            name: "custrecord_adjustment_cash_deposit",
            label: "Adjustment Qualifiying Cash Deposit ",
          }),
          search.createColumn({
            name: "custrecord_adjustment_non_qualifying_cd",
            label: "Adjustment Non- Qualifiying Cash Deposit",
          }),
          search.createColumn({
            name: "custrecord_adjustment_qualifying_vb",
            label: "Adjustment Qualifying Vendor Bill",
          }),
          search.createColumn({
            name: "custrecord_adjustment_non_qualifying_vb",
            label: "Adjustment Non-Qualifying Vendor Bill",
          }),
        ],
      });
      var searchResultCount =
        customrecord_cope_adjustment_transactionSearchObj.runPaged().count;
      log.debug(
        "customrecord_cope_adjustment_transactionSearchObj result count",
        searchResultCount
      );
      customrecord_cope_adjustment_transactionSearchObj
        .run()
        .each(function (result) {
          // .run().each has a limit of 4,000 results

          // Date
          var line_date = result.getValue({ name: "created", label: "Date" });
          //Source Tramsmittal Link
          var sourceTransmittalForm = result.getValue({
            name: "custrecord_cope_transmittal_transaction",
            label: "Cope Transmittal Transaction",
          });
          var sourceTransmittalFormText = result.getText({
            name: "custrecord_cope_transmittal_transaction",
            label: "Cope Transmittal Transaction",
          });

          var qualifyingAmount = result.getValue({
            name: "custrecord_adjustment_amount",
            label: "Qualifiying Adjustment Amount",
          });
          var nonQualifyingAmount = result.getValue({
            name: "custrecord_non_adj_qualifying_amount",
            label: "Non-Qualitfying Adjustment Amount",
          });

          var qualifyingCD = result.getValue({
            name: "custrecord_adjustment_cash_deposit",
            label: "Adjustment Qualifiying Cash Deposit ",
          });
          var qualifyingCDText = result.getText({
            name: "custrecord_adjustment_cash_deposit",
            label: "Adjustment Qualifiying Cash Deposit ",
          });

          //log.debug("qualifyingCD",qualifyingCD);

          var nonQualifyingCD = result.getValue({
            name: "custrecord_adjustment_non_qualifying_cd",
            label: "Adjustment Non- Qualifiying Cash Deposit",
          });
          var nonQualifyingCDText = result.getText({
            name: "custrecord_adjustment_non_qualifying_cd",
            label: "Adjustment Non- Qualifiying Cash Deposit",
          });

          //log.debug("nonQualifyingCD",nonQualifyingCD);

          var qualifyingVB = result.getValue({
            name: "custrecord_adjustment_qualifying_vb",
            label: "Adjustment Qualifying Vendor Bill",
          });
          var qualifyingVBText = result.getText({
            name: "custrecord_adjustment_qualifying_vb",
            label: "Adjustment Qualifying Vendor Bill",
          });

          var nonQualifyingVB = result.getValue({
            name: "custrecord_adjustment_non_qualifying_vb",
            label: "Adjustment Non-Qualifying Vendor Bill",
          });
          var nonQualifyingVBText = result.getText({
            name: "custrecord_adjustment_non_qualifying_vb",
            label: "Adjustment Non-Qualifying Vendor Bill",
          });

          sublistAdjustmentTransactions.setSublistValue({
            id: "custpage_rec_trans_date",
            line: transactionLine,
            value: line_date,
          });
          sublistAdjustmentTransactions.setSublistValue({
            id: "custpage_rec_qualifying_adjustment_amount",
            line: transactionLine,
            value: qualifyingAmount ? qualifyingAmount : 0,
          });
          sublistAdjustmentTransactions.setSublistValue({
            id: "custpage_rec_non_qualifying_adjustment_amount",
            line: transactionLine,
            value: nonQualifyingAmount ? nonQualifyingAmount : 0,
          });

          //log.debug("sourceTransmittalFormText",sourceTransmittalFormText);
          if (sourceTransmittalForm) {
            var viewUrl = url.resolveRecord({
              recordType: "customtransaction108",
              recordId: sourceTransmittalForm,
              isEditMode: false,
            });
            viewUrl =
              '<a target="_blank" href="' +
              viewUrl +
              '">' +
              sourceTransmittalFormText +
              "</a>";
            sublistAdjustmentTransactions.setSublistValue({
              id: "custpage_rec_cope_transmittal_transaction",
              line: transactionLine,
              value: viewUrl,
            });
          }
          if (qualifyingCD) {
            var viewQualifyingCDUrl = url.resolveRecord({
              recordType: "customtransaction_cd_101",
              recordId: qualifyingCD,
              isEditMode: false,
            });
            viewQualifyingCDUrl =
              '<a target="_blank" href="' +
              viewQualifyingCDUrl +
              '">' +
              qualifyingCDText +
              "</a>";
            sublistAdjustmentTransactions.setSublistValue({
              id: "custpage_rec_cope_qualifying_cd",
              line: transactionLine,
              value: viewQualifyingCDUrl,
            });
          }

          if (nonQualifyingCD) {
            var viewNonQualifyingCDUrl = url.resolveRecord({
              recordType: "customtransaction_cd_101",
              recordId: nonQualifyingCD,
              isEditMode: false,
            });
            viewNonQualifyingCDUrl =
              '<a target="_blank" href="' +
              viewNonQualifyingCDUrl +
              '">' +
              nonQualifyingCDText +
              "</a>";
            sublistAdjustmentTransactions.setSublistValue({
              id: "custpage_rec_cope_non_qualifying_cd",
              line: transactionLine,
              value: viewNonQualifyingCDUrl,
            });
          }

          if (qualifyingVB) {
            var viewQualifyingVBUrl = url.resolveRecord({
              recordType: "vendorbill",
              recordId: qualifyingVB,
              isEditMode: false,
            });
            viewQualifyingVBUrl =
              '<a target="_blank" href="' +
              viewQualifyingVBUrl +
              '">' +
              qualifyingVBText +
              "</a>";
            sublistAdjustmentTransactions.setSublistValue({
              id: "custpage_rec_cope_qualifying_vb",
              line: transactionLine,
              value: viewQualifyingVBUrl,
            });
          }

          if (nonQualifyingVB) {
            var viewNonQualifyingVBUrl = url.resolveRecord({
              recordType: "vendorbill",
              recordId: nonQualifyingVB,
              isEditMode: false,
            });
            viewNonQualifyingVBUrl =
              '<a target="_blank" href="' +
              viewNonQualifyingVBUrl +
              '">' +
              nonQualifyingVBText +
              "</a>";
            sublistAdjustmentTransactions.setSublistValue({
              id: "custpage_rec_cope_non_qualifying_vb",
              line: transactionLine,
              value: viewNonQualifyingVBUrl,
            });
          }

          transactionLine++;
          return true;
        });

      // Add Histroy Tab
      if (fundType == 3) {
        form.addSubmitButton({ label: "Process Adjustment" });
      }

      //display page for user input
      response.writePage(form);
    } else {
      var request = options.request;
      var response = options.response;

      var requestparam = request.parameters;
      var cashDeposit_Btach_Id;

      // POST method

      var subsidiary,
        account,
        PrimaryAttachment,
        line_type,
        line_lineAccount,
        line_department,
        line_projectCode,
        line_paymentMethod;

      var line_memo, line_subsidiary, line_payment_method;
      var line_internalID,
        line_trandate,
        line_tranid,
        line_customer,
        line_bank_recieved_date;
      var line_local_qualifying_funds,
        line_seiu_qualifying_funds,
        line_local_non_qualifying_fund,
        line_seiu_non_qualifying_funds;
      var line_subsidiary, line_payment_method;
      var line_transaction_type;
      var line_account;
      var attachment;
      var paymentMethod;
      var paymentMethodText;
      var holdQualifiedAmount,
        holdNonQualifiedAmount,
        totalBalanceAdjustmentAmount,
        userEnteredAdjAmount = 0;
      var cashDeposit_ID;
      var line_year;

      var sublist_count = request.getLineCount({ group: "sublistid" });

      for (var i = 0; i < sublist_count; i++) {
        var bank_reciveDate = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_bank_received_date",
          line: i,
        });
        var cope_transmittalid = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_id",
          line: i,
        });
        var adjustmentAmount = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_seiu_adustment_amount",
          line: i,
        });
        var transaction_type = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_transaction_type",
          line: i,
        });
        cashDeposit_ID = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_cashdeposit",
          line: i,
        });
        line_internalID = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_id",
          line: i,
        });
        line_trandate = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_tran_date",
          line: i,
        });
        line_tranid = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_tran_id",
          line: i,
        });
        line_customer = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_local_customer",
          line: i,
        });
        line_local_qualifying_funds = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_local_qualifying_funds",
          line: i,
        });
        line_seiu_qualifying_funds = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_seiu_qualifying_funds",
          line: i,
        });
        line_local_non_qualifying_fund = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_local_non_qualifying_fund",
          line: i,
        });
        line_seiu_non_qualifying_funds = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_seiu_non_qualifying_funds",
          line: i,
        });
        attachment = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_attachment",
          line: i,
        });
        paymentMethod = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_paymentmethod",
          line: i,
        });
        line_year = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_hold_year",
          line: i,
        });

        var depRecord = record.load({
          type: "customtransaction_cd_101",
          id: cashDeposit_ID,
        });

        cashDeposit_Btach_Id = depRecord.getValue({
          fieldId: "custbody_batch_id",
        });

        log.debug("cashDeposit_Btach_Id", cashDeposit_Btach_Id);

        if (paymentMethod == 1) paymentMethodText = "ACH";
        else if (paymentMethod == 2) paymentMethodText = "CHECK";
        else if (paymentMethod == 3) {
          paymentMethod = 5;
          paymentMethodText = "WIRE";
        }

        holdQualifiedAmount = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_hold_qualified_amount",
          line: i,
        });
        holdNonQualifiedAmount = request.getSublistValue({
          group: "sublistid",
          name: "custpage_rec_hold_non_qualified_amount",
          line: i,
        });

        totalBalanceAdjustmentAmount = parseFloat(
          request.getSublistValue({
            group: "sublistid",
            name: "custpage_rec_total_balance_payment",
            line: i,
          })
        );

        userEnteredAdjAmount =
          parseFloat(holdQualifiedAmount) + parseFloat(holdNonQualifiedAmount);

        log.debug("userEnteredAdjAmount", userEnteredAdjAmount);
        log.debug("totalBalanceAdjustmentAmount", totalBalanceAdjustmentAmount);

        if (userEnteredAdjAmount > totalBalanceAdjustmentAmount) {
          log.debug("Error", "Error");

          var suiteletURL = url.resolveScript({
            scriptId: "customscript_cash_deposit_ajustment",
            deploymentId: "customdeploy_cash_deposit_adjustment",
            params: {
              Failure: "True",
              TransmittalForm: cope_transmittalid,
              cashDeposit: cashDeposit_ID,
            },
          });
          redirect.redirect({ url: suiteletURL });
          return;
        }

        log.debug("No Error", "Error");

        // Check if user entered Qualified and Non Qualified amount are more than balance

        var bank_reciveDate = format.parse({
          value: bank_reciveDate,
          type: format.Type.DATE,
        });
        //log.debug("bank_reciveDate",bank_reciveDate);

        var calculateAdjustmentAmount = 0;

        if (transaction_type == "Qualifying") {
          var cashDepositQualified = [];
          calculateAdjustmentAmount =
            line_local_qualifying_funds - line_seiu_qualifying_funds;
          log.debug("calculateAdjustmentAmount", calculateAdjustmentAmount);

          cashDepositQualified.push({
            Fields: {
              Record: "Non-Qualifying",
              CashDeposit: cashDeposit_ID,
              postingDate: bank_reciveDate,
              PrimaryAttachment: attachment,
              Memo:
                paymentMethodText +
                " " +
                " " +
                formateDate(bank_reciveDate) +
                " " +
                transaction_type,
              LocalCustomer: line_customer,
              AdjustmentAmount: calculateAdjustmentAmount,
              TransmittalID: cope_transmittalid,
              HoldQualifyingAmount: holdQualifiedAmount,
              HoldNonQualifyingAmount: holdNonQualifiedAmount,
              PaymentMethod: paymentMethod,
              originBatchId: cashDeposit_Btach_Id,
              year: line_year,
            },
          });

          log.debug("cashDepositQualified", cashDepositQualified);
          var id =
            adjustment.CreateAdjustmentTransactions(cashDepositQualified);
        } else if (transaction_type == "Non-Qualifying") {
          calculateAdjustmentAmount =
            line_local_non_qualifying_fund - line_seiu_non_qualifying_funds;

          var cashDepositNonQualified = [];

          cashDepositNonQualified.push({
            Fields: {
              Record: "Qualifying",
              CashDeposit: cashDeposit_ID,
              postingDate: bank_reciveDate,
              PrimaryAttachment: attachment,
              Memo:
                paymentMethodText +
                " " +
                " " +
                formateDate(bank_reciveDate) +
                " " +
                transaction_type,
              LocalCustomer: line_customer,
              AdjustmentAmount: calculateAdjustmentAmount,
              TransmittalID: cope_transmittalid,
              PaymentMethod: paymentMethod,
              originBatchId: cashDeposit_Btach_Id,
              year: line_year,
            },
          });

          log.debug("cashDepositNonQualified", cashDepositNonQualified);
          var id = adjustment.CreateAdjustmentTransactions(
            cashDepositNonQualified
          );
        } else if (transaction_type == "Hold") {
          var operationType = "Create";
          log.debug("operationType", operationType);
          if (holdQualifiedAmount > 0) {
            var cashDepositHoldQualified = [];
            cashDepositHoldQualified.push({
              Fields: {
                Record: "Hold-Qualifying",
                CashDeposit: cashDeposit_ID,
                postingDate: bank_reciveDate,
                PrimaryAttachment: attachment,
                Memo:
                  paymentMethodText +
                  " " +
                  " " +
                  formateDate(bank_reciveDate) +
                  " " +
                  transaction_type,
                LocalCustomer: line_customer,
                AdjustmentAmount: holdQualifiedAmount,
                TransmittalID: cope_transmittalid,
                Operation: operationType,
                PaymentMethod: paymentMethod,
                originBatchId: cashDeposit_Btach_Id,
                year: line_year,
              },
            });

            var holdQualfiedAdjustmentTransactions = [];

            holdQualfiedAdjustmentTransactions =
              adjustment.CreateAdjustmentTransactions(cashDepositHoldQualified);

            record.submitFields({
              type: "customtransaction108",
              id: cope_transmittalid,
              values: {
                custbody_adj_qualifying_cash_deposit:
                  holdQualfiedAdjustmentTransactions[0].cashDeposit,
                custbody_adjustment_qual_vb:
                  holdQualfiedAdjustmentTransactions[0].vendorBill,
              },
            });

            operationType = "Update";
          }

          log.debug("operationType2", operationType);

          if (holdNonQualifiedAmount > 0) {
            // Non Qualified amount
            var cashDepositHoldNonQualified = [];

            cashDepositHoldNonQualified.push({
              Fields: {
                Record: "Hold-NonQualifying",
                CashDeposit: cashDeposit_ID,
                postingDate: bank_reciveDate,
                PrimaryAttachment: attachment,
                Memo:
                  paymentMethodText +
                  " " +
                  " " +
                  formateDate(bank_reciveDate) +
                  " " +
                  transaction_type,
                LocalCustomer: line_customer,
                AdjustmentAmount: holdNonQualifiedAmount,
                TransmittalID: cope_transmittalid,
                Operation: operationType,
                PaymentMethod: paymentMethod,
                originBatchId: cashDeposit_Btach_Id,
                year: line_year,
              },
            });

            var holdNondQualfiedAdjustmentTransactions = [];
            holdNondQualfiedAdjustmentTransactions =
              adjustment.CreateAdjustmentTransactions(
                cashDepositHoldNonQualified
              );

            record.submitFields({
              type: "customtransaction108",
              id: cope_transmittalid,
              values: {
                custbody_adj_noqualifying_cash_deposit:
                  holdNondQualfiedAdjustmentTransactions[0].cashDeposit,
                custbody_adj_nonqualifying_vendor_bill:
                  holdNondQualfiedAdjustmentTransactions[0].vendorBill,
              },
            });
          }
        }
      }

      var suiteletURL = url.resolveScript({
        scriptId: "customscript_cash_deposit_ajustment",
        deploymentId: "customdeploy_cash_deposit_adjustment",
        params: { success: "True", cashDeposit: cashDeposit_ID },
      });
      redirect.redirect({ url: suiteletURL });
    }
  }

  // covert netsuite date to calculation date.
  function formateDate(date) {
    var dateCorresion = new Date(date);
    log.debug("dateCorresion", dateCorresion);
    var transDate = dateCorresion.toLocaleDateString();
    var dteArray = transDate.split(" ");
    var month = {
      January: 01,
      Feburary: 02,
      March: 03,
      April: 04,
      May: 05,
      June: 06,
      July: 07,
      August: 08,
      September: 09,
      October: 10,
      November: 11,
      December: 12,
    };

    var toDisplyDate =
      month[dteArray[0]] +
      "/" +
      dteArray[1].replace(",", "") +
      "/" +
      dteArray[2];

    log.debug("to Disply date is ", toDisplyDate);

    return toDisplyDate;
  }

  return {
    onRequest: onRequest,
  };
});
