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
], function (serverWidget, redirect, search, record, format, adjustment) {
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
      try {
        execute();

        redirect.toSavedSearchResult({
          id: "customsearch_seiu_cope_membership_list",
        });
      } catch (error) {
        log.error("erro during execution of batch deposit", error);
        log.debug("erro during execution of batch deposit", error);
      }
    }

    function execute() {
      // var copeFromFields = {
      //   copeId: "internalid",
      //   customer: "custbody_local_customer",
      //   localNonQualiyingFund: "custbody_local_non_qualifying_fund",
      //   localQualiyingFund: "custbody_local_qualifying_funds",
      //   seiuNonQualiyingFund: "custbody_seiu_non_qualifying_funds",
      //   seiuQualiyingFund: "custbody_seiu_qualifying_funds",
      //   totalAmount: "amount",
      //   paymentMethod: "custbody_ctf_payment_method_header",
      //   BankRecDate: "custbody_seiu_cope_bank_rec_date",
      //   holdAcc: "custbody_cust_bank_hold_acc",
      //   isPAc: "custbody_seiu_pac_bank_acc",
      //   attachment: "custbody_seiu_support_docs",
      //   year: "custbodycope_year",
      //   qualiConfirmationNo : "custbody_qualifying_conf_no",
      //   nonQualiConfirmationNo: "custbody_non_qualifying_conf_no",
      //   holdConfirmationNo:"custbody_hold_acc_conf_no"
      // };

      //get default data form custom record for cash deposit.
      var accountsData = {
        qaulifyingAccount: getAccount(1),
        nonQaulifyingAccount: getAccount(2),
        holdAccount: getAccount(3),
      };

      var transmittalpaymentMethods = {
        ach: 1,
        check: 2,
        wire: 3,
      };

      var copePaymentMethods = {
        ach: 1,
        check: 2,
        wire: 5,
      };

      // get the customer data to to set on line level.
      function getcustomerDetails(recordId) {
        var localList = record.load({
          type: "customrecord_localized",
          id: recordId,
        });

        var customerId = localList.getValue({
          fieldId: "custrecord_lz_customer",
        });

        var customerRecord = record.load({
          type: record.Type.CUSTOMER,
          id: customerId,
        });

        var localCode = customerRecord.getValue({
          fieldId: "cseg_local_code",
        });

        var displaylocalCode = customerRecord.getText({
          fieldId: "cseg_local_code",
        });

        return {
          customerId: parseInt(customerId),
          customerCode: parseInt(localCode),
          displaylocalCode: displaylocalCode,
        };
      }

      //create deposit for batch data.
      function createDeposit(dataObj) {
        log.debug("deposit creating for ", dataObj);
        var sourceRecordList = [];
        var createdAdjustmentTranList = [];
        var linetotalAmnt = 0;

        var transBody = dataObj.body;
        var transLines = dataObj.line;

        log.debug("createdAdjustmentTranList", createdAdjustmentTranList);

        var newRecord = record.create({
          type: "customtransaction_cd_101",
          isDynamic: true,
          // defaultValues : {"subsidiary":transBody.subsidiary}
        });

        // log.debug("new record initial face is", newRecord);

        if (transBody.subsidiary)
          newRecord.setValue({
            fieldId: "subsidiary",
            value: transBody.subsidiary,
          });

        if (transBody.account)
          newRecord.setValue({
            fieldId: "custbody_bk_acct",
            value: transBody.account,
          });

        if (transBody.postingDate)
          newRecord.setValue({
            fieldId: "trandate",
            value: transBody.postingDate,
          });

        if (transBody.fundType)
          newRecord.setValue({
            fieldId: "custbody_seiu_cd_fundtype",
            value: transBody.fundType,
          });

        newRecord.setValue({
          fieldId: "custbody_batch_process",
          value: true,
        });

        if (transBody.memo)
          newRecord.setValue({
            fieldId: "memo",
            value: transBody.memo,
          });

        if (transBody.PrimaryAttachment)
          newRecord.setValue({
            fieldId: "custbody_prim_attach",
            value: transBody.PrimaryAttachment,
          });

        log.debug("body fields are added");

        // log.debug("new record initial face is", newRecord);

        for (var i = 0; i < transLines.length; i++) {
          // log.debug("transLines line datat", transLines);

          var lineData = transLines[i];
          // log.debug("depsit line datat", lineData);

          log.debug("lineData.amount", lineData.amount);

          if (lineData.amount && parseFloat(lineData.amount) > 0) {
            newRecord.selectLine({
              sublistId: "line",
              line: i,
            });

            // log.debug("line initialized");

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "account",
              line: i,
              value: transBody.account,
            });

            // log.debug("transBody.account", transBody.account);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "entity",
              line: i,
              value: lineData.entityName,
            });

            // log.debug("lineData.entityName", lineData.entityName);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "custcol_cdt",
              line: i,
              value: transBody.line_type,
            });

            // log.debug("transBody.line_type ", transBody.line_type);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "custcol_cr_acct",
              line: i,
              value: transBody.line_lineAccount,
            });

            // log.debug("transBody.line_lineAccount ", transBody.line_lineAccount);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "custcol_cd_pay_meth",
              line: i,
              value: lineData.line_paymentMethod,
            });

            // log.debug(
            //   "transBody.line_paymentMethod ",
            //   transBody.line_paymentMethod
            // );

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "memo",
              line: i,
              value: lineData.lineMemo,
            });

            // log.debug("lineData.lineMemo ", lineData.lineMemo);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "custcol_cd_check_ach_num",
              line: i,
              value: lineData.confirmationNo,
            });

            // log.debug("lineData.amount", parseFloat(lineData.amount));

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "amount",
              line: i,
              value: parseFloat(lineData.amount),
            });
            linetotalAmnt += parseFloat(lineData.amount);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "custcol_seiu_source_record",
              line: i,
              value: parseInt(lineData.sourceRecord),
            });

            // log.debug(
            //   "parseInt(lineData.sourceRecord)",
            //   parseInt(lineData.sourceRecord)
            // );

            sourceRecordList.push(parseInt(lineData.sourceRecord));

            log.debug(
              "sourceRecordList.push(parseInt(lineData.sourceRecord))",
              sourceRecordList
            );

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "department",
              line: i,
              value: transBody.line_department, //101
            });

            // log.debug("transBody.line_department", transBody.line_department);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "custcol_tranmital_year",
              line: i,
              value: lineData.year,
            });

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "cseg3",
              line: i,
              value: transBody.line_projectCode, //602
            });

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "cseg1",
              line: i,
              // forceSyncSourcing: true,
              value: transBody.line_lm2code, //602
            });

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "cseg2",
              line: i,
              // forceSyncSourcing: true,
              value: transBody.line_lm2Purpose, //602
            });

            // log.debug("transBody.line_projectCode ", transBody.line_projectCode);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "cseg_local_code",
              line: i,
              value: lineData.localCode,
            });

            // log.debug("lineData.localCode ", lineData.localCode);

            newRecord.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "location",
              line: i,
              value: 103,
            });

            log.debug("value: 103");

            newRecord.commitLine({
              sublistId: "line",
            });

            log.debug(i + " line is created");
          } else {
            log.debug(
              "Amount is 0 so line can't be added",
              parseFloat(lineData.amount)
            );
            continue;
          }
        }

        newRecord.setValue({
          fieldId: "custbody_total_batch",
          value: linetotalAmnt,
        });

        if (linetotalAmnt > 0) {
          var savedDeposit = newRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true,
          });

          log.debug("savedDeposit", savedDeposit);
        } else {
          log.debug(transBody.forRecord + " depsocit can't be creted with ");
          return 0;
        }

        if (savedDeposit) {
          // load created deposit to sourced in child adjustment deposit.
          var savedCashDeposit = record.load({
            type: "customtransaction_cd_101",

            id: savedDeposit,

            isDynamic: true,
          });

          var savedCDBatchId = savedCashDeposit.getValue({
            fieldId: "custbody_batch_id",
          });

          log.debug("batch id of saved deposit is "+savedCDBatchId);

          //   updateCopeform(savedDeposit, sourceRecordList,transBody.forRecord);

          // log.debug("saved depsoit is " + savedDeposit);

          //update the deposit no on cope transmittal forms.
          // for (var index = 0; index < sourceRecordList.length; index++) {
          //   log.debug("record is update for " + sourceRecordList[index]);

          //   var copeForm = record.load({
          //     type: "customtransaction108",
          //     id: sourceRecordList[index],
          //   });

          //   // log.debug("copeForm", copeForm);
          //   log.debug("transBody.forRecord", transBody.forRecord);

          //   copeForm.setValue({
          //     fieldId: transBody.forRecord,
          //     value: savedDeposit,
          //     // ignoreFieldChange: true,
          //   });

          //   var updatedRecord = copeForm.save();

          //   log.debug("update record is " + updatedRecord);
          // }

          //Run adjusment for cope transmittal form.
          for (var j = 0; j < transLines.length; j++) {
            var transmittalId = transLines[j].sourceRecord;
            if (transLines[j].adjustAmount > 0) {
              var adjustmentRecordList = [];
              if (transBody.forRecord == "custbody_qualifying_cd") {
                adjustmentRecordList.push({
                  Fields: {
                    CashDeposit: savedDeposit,
                    Record: "Non-Qualifying",
                    postingDate: transBody.postingDate,
                    PrimaryAttachment: transBody.PrimaryAttachment,
                    Memo: transBody.memo,
                    LocalCustomer: transLines[j].localCustomer,
                    AdjustmentAmount: transLines[j].adjustAmount,
                    TransmittalID: transLines[j].sourceRecord,
                    PaymentMethod: transBody.line_paymentMethod,
                    Year: transLines[j].year,
                    originBatchId : savedCDBatchId
                  },
                });

                createdAdjustmentTranList =
                  adjustment.CreateAdjustmentTransactions(adjustmentRecordList);

                log.debug(
                  "createdAdjustmentTranList",
                  createdAdjustmentTranList
                );
                log.debug("transLines[j].copeId", transmittalId);

                if (createdAdjustmentTranList.length > 0) {
                  record.submitFields({
                    type: "customtransaction108",
                    id: transmittalId,
                    values: {
                      custbody_adj_noqualifying_cash_deposit:
                        createdAdjustmentTranList[0].cashDeposit,
                      custbody_adj_nonqualifying_vendor_bill:
                        createdAdjustmentTranList[0].vendorBill,
                    },
                  });
                }
              } else {
                if (transBody.forRecord == "custbody_cd_non_qualifying") {
                  adjustmentRecordList.push({
                    Fields: {
                      CashDeposit: savedDeposit,
                      Record: "Qualifying",
                      postingDate: transBody.postingDate,
                      PrimaryAttachment: transBody.PrimaryAttachment,
                      Memo: transBody.memo,
                      LocalCustomer: transLines[j].localCustomer,
                      AdjustmentAmount: transLines[j].adjustAmount,
                      TransmittalID: transLines[j].sourceRecord,
                      PaymentMethod: transBody.line_paymentMethod,
                      Year: transLines[j].year,
                      originBatchId : savedCDBatchId
                    },
                  });

                  createdAdjustmentTranList =
                    adjustment.CreateAdjustmentTransactions(
                      adjustmentRecordList
                    );

                  log.debug(
                    "createdAdjustmentTranList",
                    createdAdjustmentTranList
                  );
                  log.debug("transLines[j].copeId", transmittalId);

                  if (createdAdjustmentTranList.length > 0) {
                    record.submitFields({
                      type: "customtransaction108",
                      id: transmittalId,
                      values: {
                        custbody_adj_qualifying_cash_deposit:
                          createdAdjustmentTranList[0].cashDeposit,
                        custbody_adjustment_qual_vb:
                          createdAdjustmentTranList[0].vendorBill,
                      },
                    });
                  }
                }
              }
            }
          } // end ajustmenet loop.
        }
      }

      // It return all data of custom form which is deafult for cash depsoit behalf on record id.
      function getAccount(recordId) {
        var recordFields = {
          glAccount: "custrecord_cope_gl_account",
          FndType: "custrecord_cope_fund_type",
          lineAccount: "custrecord_cope_line_account",
          department: "custrecord_cope_department",
          projectCode: "custrecord_cope_pro_code",
        };

        var accountRec = record.load({
          type: "customrecord_seiu_cope_gl_acc_managment",
          id: recordId,
        });

        var accountsFields = {
          glAccount: parseInt(
            accountRec.getValue({
              fieldId: recordFields.glAccount,
            })
          ),
          FndType: parseInt(
            accountRec.getValue({
              fieldId: recordFields.FndType,
            })
          ),
          lineAccount: parseInt(
            accountRec.getValue({
              fieldId: recordFields.lineAccount,
            })
          ),
          department: parseInt(
            accountRec.getValue({
              fieldId: recordFields.department,
            })
          ),
          projectCode: parseInt(
            accountRec.getValue({
              fieldId: recordFields.projectCode,
            })
          ),
          subsidiary: parseInt(
            accountRec.getValue({
              fieldId: "custrecord_cope_subsidiary",
            })
          ),
        };

        //   log.debug("account internal id is ", accountsFields);

        return accountsFields;
      }

      var depositDataArray = [];

      var transactionSearchObj = search.create({
        type: "transaction",
        filters: [
          ["type", "anyof", "Custom108"],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["custbody_status", "anyof", "4"],
          "AND",
          // ["custbody_seiu_cope_bank_rec_date", "within", "6/13/2022", "6/14/2022"],
          // "AND",
          ["custbody_qualifying_cd", "anyof", "@NONE@"],
          "AND",
          ["custbody_cd_non_qualifying", "anyof", "@NONE@"],
          "AND",
          ["custbody_cd_hold_acc", "anyof", "@NONE@"],
          "AND",
          ["custbody_seiu_cope_bank_rec_date", "isnotempty", ""],
        ],
        columns: [
          search.createColumn({
            name: "custbody_seiu_cope_bank_rec_date",
            summary: "GROUP",
            label: "Bank received date",
          }),
        ],
      });

      var searchResultCount = transactionSearchObj.runPaged().count;
      log.debug("transactionSearchObj result count", searchResultCount);
      transactionSearchObj.run().each(function (result) {
        // .run().each has a limit of 4,000 results

        // Store all data realted to ach payment.
        var achQualRecords = {
          body: {
            forRecord: "custbody_qualifying_cd",
            subsidiary: accountsData.qaulifyingAccount.subsidiary,
            account: accountsData.qaulifyingAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.qaulifyingAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.qaulifyingAccount.lineAccount,
            line_department: accountsData.qaulifyingAccount.department,
            line_projectCode: accountsData.qaulifyingAccount.projectCode,
            line_paymentMethod: copePaymentMethods.ach,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },

          line: [],
        };

        var achNonQualRecords = {
          body: {
            forRecord: "custbody_cd_non_qualifying",
            subsidiary: accountsData.nonQaulifyingAccount.subsidiary,
            account: accountsData.nonQaulifyingAccount.glAccount,
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.nonQaulifyingAccount.FndType,

            line_type: 2, // cash sale
            line_lineAccount: accountsData.nonQaulifyingAccount.lineAccount,
            line_department: accountsData.nonQaulifyingAccount.department,
            line_projectCode: accountsData.nonQaulifyingAccount.projectCode,
            line_paymentMethod: copePaymentMethods.ach,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },

          line: [],
        };
        var wireQalRecords = {
          body: {
            forRecord: "custbody_qualifying_cd",
            subsidiary: accountsData.qaulifyingAccount.subsidiary,
            account: accountsData.qaulifyingAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.qaulifyingAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.qaulifyingAccount.lineAccount,
            line_department: accountsData.qaulifyingAccount.department,
            line_projectCode: accountsData.qaulifyingAccount.projectCode,
            line_paymentMethod: copePaymentMethods.wire,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },

          line: [],
        };
        var wireNonQalRecords = {
          body: {
            forRecord: "custbody_cd_non_qualifying",
            subsidiary: accountsData.nonQaulifyingAccount.subsidiary,
            account: accountsData.nonQaulifyingAccount.glAccount,
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.nonQaulifyingAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.nonQaulifyingAccount.lineAccount,
            line_department: accountsData.nonQaulifyingAccount.department,
            line_projectCode: accountsData.nonQaulifyingAccount.projectCode,
            line_paymentMethod: copePaymentMethods.wire,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },

          line: [],
        };

        var checkQualRecords = {
          body: {
            forRecord: "custbody_qualifying_cd",
            subsidiary: accountsData.qaulifyingAccount.subsidiary,
            account: accountsData.qaulifyingAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.qaulifyingAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.qaulifyingAccount.lineAccount,
            line_department: accountsData.qaulifyingAccount.department,
            line_projectCode: accountsData.qaulifyingAccount.projectCode,
            line_paymentMethod: copePaymentMethods.check,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },
          line: [],
        };
        var checkNonQualRecords = {
          body: {
            forRecord: "custbody_cd_non_qualifying",
            subsidiary: accountsData.nonQaulifyingAccount.subsidiary,
            // // subsidiary: subsidiary,
            account: accountsData.nonQaulifyingAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.nonQaulifyingAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.nonQaulifyingAccount.lineAccount,
            line_department: accountsData.nonQaulifyingAccount.department,
            line_projectCode: accountsData.nonQaulifyingAccount.projectCode,
            line_paymentMethod: copePaymentMethods.check,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },
          line: [],
        };

        var achHoldRecord = {
          body: {
            forRecord: "custbody_cd_hold_acc",
            subsidiary: accountsData.holdAccount.subsidiary,
            account: accountsData.holdAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.holdAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.holdAccount.lineAccount,
            line_department: accountsData.holdAccount.department,
            line_projectCode: accountsData.holdAccount.projectCode,
            line_paymentMethod: copePaymentMethods.ach,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },
          line: [],
        };

        var wireHoldRecord = {
          body: {
            forRecord: "custbody_cd_hold_acc",
            subsidiary: accountsData.holdAccount.subsidiary,
            account: accountsData.holdAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.holdAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.holdAccount.lineAccount,
            line_department: accountsData.holdAccount.department,
            line_projectCode: accountsData.holdAccount.projectCode,
            line_paymentMethod: copePaymentMethods.wire,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },
          line: [],
        };

        var checkHoldRecord = {
          body: {
            forRecord: "custbody_cd_hold_acc",
            subsidiary: accountsData.holdAccount.subsidiary,
            account: accountsData.holdAccount.glAccount, // qual, non-qyal or hold acc.
            postingDate: "",
            PrimaryAttachment: "",
            memo: "",
            fundType: accountsData.holdAccount.FndType,
            line_type: 2, // cash sale
            line_lineAccount: accountsData.holdAccount.lineAccount,
            line_department: accountsData.holdAccount.department,
            line_projectCode: accountsData.holdAccount.projectCode,
            line_paymentMethod: copePaymentMethods.check,
            line_lm2code: 9,
            line_lm2Purpose: 105,
          },
          line: [],
        };

        var bankRecDate = result.getValue({
          name: "custbody_seiu_cope_bank_rec_date",
          summary: "GROUP",
        });

        // log.debug("counter",counter);

        // if(counter == 3){
        //   return true;
        // }
        getRusltBasedonDate(
          bankRecDate,
          achQualRecords,
          achNonQualRecords,
          wireQalRecords,
          wireNonQalRecords,
          checkQualRecords,
          checkNonQualRecords,
          achHoldRecord,
          wireHoldRecord,
          checkHoldRecord
        );

        if (achQualRecords.line.length > 0) {
          depositDataArray.push(achQualRecords);
        }
        if (achNonQualRecords.line.length > 0) {
          depositDataArray.push(achNonQualRecords);
        }
        if (wireQalRecords.line.length > 0) {
          depositDataArray.push(wireQalRecords);
        }
        if (wireNonQalRecords.line.length > 0) {
          depositDataArray.push(wireNonQalRecords);
        }
        if (checkQualRecords.line.length > 0) {
          depositDataArray.push(checkQualRecords);
        }
        if (checkNonQualRecords.line.length > 0) {
          depositDataArray.push(checkNonQualRecords);
        }
        // if (holdRecord.line.length > 0) {
        //   depositDataArray.push(holdRecord);
        // }
        if (achHoldRecord.line.length > 0) {
          depositDataArray.push(achHoldRecord);
        }
        if (wireHoldRecord.line.length > 0) {
          depositDataArray.push(wireHoldRecord);
        }
        if (checkHoldRecord.line.length) {
          depositDataArray.push(checkHoldRecord);
        }

        return true;
      });

      /*
     transactionSearchObj.id="customsearch1655113892126";
     transactionSearchObj.title=" script use search CTF to CD (copy)";
     var newSearchId = transactionSearchObj.save();
     */

      function getRusltBasedonDate(
        date,
        achQualRecords,
        achNonQualRecords,
        wireQalRecords,
        wireNonQalRecords,
        checkQualRecords,
        checkNonQualRecords,
        achHoldRecord,
        wireHoldRecord,
        checkHoldRecord
      ) {
        log.debug("Fetch cash depsit data on based ", date);
        var transactionSearchObj = search.create({
          type: "transaction",
          filters: [
            ["type", "anyof", "Custom108"],
            "AND",
            ["custbody_seiu_cope_bank_rec_date", "within", date, date],
            "AND",
            ["mainline", "is", "T"],
            "AND",
            ["custbody_status", "anyof", "4"],
            "AND",
            ["custbody_cd_hold_acc", "is", "@NONE@"],
            "AND",
            ["custbody_qualifying_cd", "is", "@NONE@"],
            "AND",
            ["custbody_cd_non_qualifying", "is", "@NONE@"],
          ],
          columns: [
            search.createColumn({
              name: "internalid",
              label: "Internal ID",
            }),
            search.createColumn({
              name: "custbody_local_customer",
              label: "Local Customer",
            }),
            search.createColumn({
              name: "custbody_local_non_qualifying_fund",
              label: "Local Non-Qualifying Funds",
            }),
            search.createColumn({
              name: "custbody_local_qualifying_funds",
              label: "Local Qualifying Funds",
            }),
            search.createColumn({
              name: "custbody_seiu_non_qualifying_funds",
              label: "SEIU Non-Qualifying Funds",
            }),
            search.createColumn({
              name: "custbody_seiu_qualifying_funds",
              label: "SEIU Qualifying Funds",
            }),
            search.createColumn({
              name: "amount",
              label: "Amount",
            }),
            search.createColumn({
              name: "custbody_ctf_payment_method_header",
              label: "Payment Method (Header)",
            }),
            search.createColumn({
              name: "custbody_seiu_cope_bank_rec_date",
              label: "Bank received date",
            }),
            search.createColumn({
              name: "custbody_cust_bank_hold_acc",
              label: "Bank hold Acc",
            }),
            search.createColumn({
              name: "custbody_seiu_pac_bank_acc",
              label: "PAC Bank Account",
            }),
            search.createColumn({
              name: "custbody_hold_acc_conf_no",
              label: "custbody_hold_acc_conf_no",
            }),
            search.createColumn({
              name: "custbody_non_qualifying_conf_no",
              label: "custbody_non_qualifying_conf_no",
            }),
            search.createColumn({
              name: "custbody_qualifying_conf_no",
              label: "custbody_qualifying_conf_no",
            }),
            search.createColumn({
              name: "custbody_seiu_support_docs",
              label: "Supporting Document",
            }),
            search.createColumn({ name: "custbodycope_year", label: "Year" }),
          ],
        });
        var searchResultCount = transactionSearchObj.runPaged().count;
        log.debug("transactionSearchObj result count", searchResultCount);

        var copeObjects = {
          copeId: "internalid",
          customer: "custbody_local_customer",
          localNonQualiyingFund: "custbody_local_non_qualifying_fund",
          localQualiyingFund: "custbody_local_qualifying_funds",
          seiuNonQualiyingFund: "custbody_seiu_non_qualifying_funds",
          seiuQualiyingFund: "custbody_seiu_qualifying_funds",
          totalAmount: "amount",
          paymentMethod: "custbody_ctf_payment_method_header",
          BankRecDate: "custbody_seiu_cope_bank_rec_date",
          holdAcc: "custbody_cust_bank_hold_acc",
          isPAc: "custbody_seiu_pac_bank_acc",
          attachment: "custbody_seiu_support_docs",
          year: "custbodycope_year",
          qualiConfirmationNo: "custbody_qualifying_conf_no",
          nonQualiConfirmationNo: "custbody_non_qualifying_conf_no",
          holdConfirmationNo: "custbody_hold_acc_conf_no",
        };

        var copeFromFields = {
          copeId: "internalid",
          customer: "custbody_local_customer",
          localNonQualiyingFund: "custbody_local_non_qualifying_fund",
          localQualiyingFund: "custbody_local_qualifying_funds",
          seiuNonQualiyingFund: "custbody_seiu_non_qualifying_funds",
          seiuQualiyingFund: "custbody_seiu_qualifying_funds",
          totalAmount: "amount",
          paymentMethod: "custbody_ctf_payment_method_header",
          BankRecDate: "custbody_seiu_cope_bank_rec_date",
          holdAcc: "custbody_cust_bank_hold_acc",
          isPAc: "custbody_seiu_pac_bank_acc",
          attachment: "custbody_seiu_support_docs",
          year: "custbodycope_year",
          qualiConfirmationNo: "custbody_qualifying_conf_no",
          nonQualiConfirmationNo: "custbody_non_qualifying_conf_no",
          holdConfirmationNo: "custbody_hold_acc_conf_no",
        };

        transactionSearchObj.run().each(function (result) {
          // .run().each has a limit of 4,000 results
          if (searchResultCount > 0) {
            for (var fieldId in copeFromFields) {
              var element = copeFromFields[fieldId];

              copeObjects[fieldId] = result.getValue(element);
            }
            // log.debug("cope objects are ", copeObjects);
            dataMap(
              copeObjects,
              achQualRecords,
              achNonQualRecords,
              wireQalRecords,
              wireNonQalRecords,
              checkQualRecords,
              checkNonQualRecords,
              achHoldRecord,
              wireHoldRecord,
              checkHoldRecord
            );
          }

          return true;
        });
      }

      function dataMap(
        searchResult,
        achQualRecords,
        achNonQualRecords,
        wireQalRecords,
        wireNonQalRecords,
        checkQualRecords,
        checkNonQualRecords,
        achHoldRecord,
        wireHoldRecord,
        checkHoldRecord
      ) {
        log.debug("Record data mapping process start");

        if (searchResult.copeId) {
          log.debug("serachresult id is", searchResult.copeId);
          var method = searchResult.paymentMethod;
          var isHold = searchResult.holdAcc;
          var bankRecDate = searchResult.BankRecDate;

          log.debug({
            title: "transmitall payment method " + method,
            details: transmittalpaymentMethods.ach,
          });

          if (!isHold) {
            log.debug({
              title: "hold value is ",
              details: isHold,
            });
            // work for other payment methods when record is not in hold stage.
            if (method == transmittalpaymentMethods.ach) {
              log.debug("Ach logic is called " + method);

              achQualRecords.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });

              achQualRecords.body.PrimaryAttachment = searchResult.attachment;
              achQualRecords.body.memo = "COPE " + searchResult.BankRecDate;
              //need to add the primary attachment in search.
              achNonQualRecords.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              achNonQualRecords.body.PrimaryAttachment =
                searchResult.attachment;
              achNonQualRecords.body.memo =
                "COPE " + searchResult.BankRecDate + " NQ";

              // log.debug(
              //   "searchResult.localNonQualiyingFund",
              //   searchResult.localNonQualiyingFund
              // );
              // log.debug(
              //   "searchResult.seiuNonQualiyingFund",
              //   searchResult.seiuNonQualiyingFund
              // );
              // return 0;

              achQualRecords.line.push({
                line_paymentMethod: method,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.localQualiyingFund,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Qualifying | " +
                  searchResult.BankRecDate +
                  " | ACH",
                adjustAmount:
                  searchResult.localQualiyingFund -
                  searchResult.seiuQualiyingFund,
                year: searchResult.year,
                confirmationNo: searchResult.qualiConfirmationNo,
              });

              achNonQualRecords.line.push({
                line_paymentMethod: method,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.localNonQualiyingFund,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Non-Qualifying | " +
                  searchResult.BankRecDate +
                  " | ACH",
                adjustAmount:
                  parseFloat(searchResult.localNonQualiyingFund) -
                  parseFloat(searchResult.seiuNonQualiyingFund),
                year: searchResult.year,
                confirmationNo: searchResult.nonQualiConfirmationNo,
              });

              return true;
            } else if (method == transmittalpaymentMethods.wire) {
              log.debug("Wire method is called " + method);

              wireQalRecords.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              wireQalRecords.body.PrimaryAttachment = searchResult.attachment;
              wireQalRecords.body.memo = "COPE " + searchResult.BankRecDate;

              //need to add the primary attachment in search.
              wireNonQalRecords.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              wireNonQalRecords.body.PrimaryAttachment =
                searchResult.attachment;
              wireNonQalRecords.body.memo =
                "GENUS " + searchResult.BankRecDate + " NQ";

              wireQalRecords.line.push({
                line_paymentMethod: copePaymentMethods.wire,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                localCustomer: searchResult.customer,
                amount: searchResult.localQualiyingFund,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Qualifying | " +
                  searchResult.BankRecDate +
                  " | WIRE",

                adjustAmount:
                  searchResult.localQualiyingFund -
                  searchResult.seiuQualiyingFund,
                year: searchResult.year,
                confirmationNo: searchResult.qualiConfirmationNo,
              });

              wireNonQalRecords.line.push({
                line_paymentMethod: copePaymentMethods.wire,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.localNonQualiyingFund,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Non-Qualifying | " +
                  searchResult.BankRecDate +
                  " | WIRE",
                adjustAmount:
                  searchResult.localNonQualiyingFund -
                  searchResult.seiuNonQualiyingFund,
                year: searchResult.year,
                confirmationNo: searchResult.nonQualiConfirmationNo,
              });

              return true;
            } else if (method == transmittalpaymentMethods.check) {
              log.debug("Check lodic called " + method);

              checkQualRecords.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              checkQualRecords.body.PrimaryAttachment = searchResult.attachment;
              checkQualRecords.body.memo = "COPE " + searchResult.BankRecDate;
              //need to add the primary attachment in search.
              checkNonQualRecords.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              checkNonQualRecords.body.PrimaryAttachment =
                searchResult.attachment;
              checkNonQualRecords.body.memo =
                "GENUS " + searchResult.BankRecDate + " NQ";

              checkQualRecords.line.push({
                line_paymentMethod: method,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.seiuQualiyingFund,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Qualifying | " +
                  searchResult.BankRecDate +
                  " | CHECK",
                adjustAmount:
                  searchResult.localQualiyingFund -
                  searchResult.seiuQualiyingFund,
                year: searchResult.year,
                confirmationNo: searchResult.qualiConfirmationNo,
              });

              checkNonQualRecords.line.push({
                line_paymentMethod: method,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.seiuNonQualiyingFund,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Non-Qualifying | " +
                  searchResult.BankRecDate +
                  " | CHECK",
                adjustAmount:
                  searchResult.localNonQualiyingFund -
                  searchResult.seiuNonQualiyingFund,
                year: searchResult.year,
                confirmationNo: searchResult.nonQualiConfirmationNo,
              });

              return true;
            } else {
              log.debug("else part execut");
              log.debug("no method found for ");
              return true;
            }
          } else {
            // if the record is created for hold account.

            log.debug({
              title: "hold value is ",
              details: isHold,
            });

            if (method == transmittalpaymentMethods.ach) {
              log.debug("Ach logic is called " + method);

              achHoldRecord.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });

              achHoldRecord.body.PrimaryAttachment = searchResult.attachment;
              achHoldRecord.body.memo = "HOLD " + searchResult.BankRecDate;
              //need to add the primary attachment in search.

              achHoldRecord.line.push({
                line_paymentMethod: method,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.totalAmount,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Hold | " +
                  searchResult.BankRecDate +
                  " | ACH",
                adjustAmount: 0,
                year: searchResult.year,
                confirmationNo: searchResult.holdConfirmationNo,
              });

              return true;
            } else if (method == transmittalpaymentMethods.wire) {
              log.debug("Wire method is called " + method);

              wireHoldRecord.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              wireHoldRecord.body.PrimaryAttachment = searchResult.attachment;
              wireHoldRecord.body.memo = "HOLD " + searchResult.BankRecDate;

              wireHoldRecord.line.push({
                line_paymentMethod: copePaymentMethods.wire,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                localCustomer: searchResult.customer,
                amount: searchResult.totalAmount,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Hold | " +
                  searchResult.BankRecDate +
                  "| WIRE",

                adjustAmount: 0,
                year: searchResult.year,
                confirmationNo: searchResult.holdConfirmationNo,
              });

              return true;
            } else if (method == transmittalpaymentMethods.check) {
              log.debug("Check lodic called " + method);

              checkHoldRecord.body.postingDate = format.parse({
                value: searchResult.BankRecDate,
                type: format.Type.DATE,
              });
              checkHoldRecord.body.PrimaryAttachment = searchResult.attachment;
              checkHoldRecord.body.memo = "HOLD " + searchResult.BankRecDate;

              checkHoldRecord.line.push({
                line_paymentMethod: method,
                entityName: getcustomerDetails(searchResult.customer)
                  .customerId,
                localCustomer: searchResult.customer,
                amount: searchResult.totalAmount,
                sourceRecord: searchResult.copeId,
                localCode: getcustomerDetails(searchResult.customer)
                  .customerCode,
                lineMemo:
                  "Contribution | " +
                  getcustomerDetails(searchResult.customer).displaylocalCode +
                  " | Hold | " +
                  searchResult.BankRecDate +
                  "| CHECK",
                adjustAmount: 0,
                year: searchResult.year,
                confirmationNo: searchResult.holdConfirmationNo,
              });

              return true;
            } else {
              log.debug("else part execut");
              log.debug("no method found for ");
              return true;
            }

            // var methods =
            //   method == copePaymentMethods.ach ||
            //   method == copePaymentMethods.check
            //     ? method
            //     : copePaymentMethods.wire;

            // holdRecord.body.postingDate = format.parse({
            //   value: searchResult.BankRecDate,
            //   type: format.Type.DATE,
            // });
            // holdRecord.body.PrimaryAttachment = searchResult.attachment;
            // holdRecord.body.memo = "HOLD " + searchResult.BankRecDate;
            // // holdRecord.body.line_paymentMethod = methods;

            // holdRecord.line.push({
            //   line_paymentMethod: methods,
            //   entityName: getcustomerDetails(searchResult.customer).customerId,
            //   localCustomer: searchResult.customer,
            //   amount: searchResult.totalAmount,
            //   sourceRecord: searchResult.copeId,
            //   localCode: getcustomerDetails(searchResult.customer).customerCode,
            //   lineMemo:
            //     "Contribution | " +
            //     getcustomerDetails(searchResult.customer).displaylocalCode +
            //     " | Hold | " +
            //     searchResult.BankRecDate,
            //   year: searchResult.year,
            // });
          }
        }

        log.debug(" data mapping process end");
      }

      log.debug("depositDataArray................", depositDataArray);

      if (depositDataArray.length > 0) {
        for (
          var bathDepositIndex = 0;
          bathDepositIndex < depositDataArray.length;
          bathDepositIndex++
        ) {
          var singleDateDeposit = depositDataArray[bathDepositIndex];

          // log.debug("singleDateDeposit call ", singleDateDeposit);

          createDeposit(singleDateDeposit);
        }
      }

      log.debug("scheduled script execustion end...");
    }
  }

  return {
    onRequest: onRequest,
  };
});
