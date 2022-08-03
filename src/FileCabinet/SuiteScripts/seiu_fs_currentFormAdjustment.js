/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 *@author Sagar Kumar
 *@description create aadjusment for current form for if the current form main cash depsoit is already attached.
 **/
 define(["N/record", "N/search", "./SEIU_ML_Cope_Adjustment.js"], function (record, search, adjustment) {

    // get the customer data from localist custoemr id to set on line level.
    function getcustomerDetails(recordId) {
        var localList = record.load({
            type: "customrecord_localized",
            id: recordId,
        });

        var customerId = localList.getValue({
            fieldId: "custrecord_lz_customer",
        });

        return parseInt(customerId);
    }

    // create deposit and Vendor bill for adjustment the amount.
    function runAdjustment(context) {
        var currRecord = context.newRecord;
        var tranStatus = currRecord.getValue({
            fieldId: "custbody_status"
        });

        //cehcking the status is approved.
        if (tranStatus == 4) {

            var islink = false

            var custbody_local_non_qualifying_fund = currRecord.getValue({
                fieldId: "custbody_local_non_qualifying_fund"
            });

            var custbody_seiu_qualifying_funds = currRecord.getValue({
                fieldId: "custbody_seiu_qualifying_funds"
            });

            var custbody_seiu_non_qualifying_funds = currRecord.getValue({
                fieldId: "custbody_seiu_non_qualifying_funds"
            });

            var custbody_local_qualifying_funds = currRecord.getValue({
                fieldId: "custbody_local_qualifying_funds"
            });

            var adjustQualifyingFund=custbody_local_qualifying_funds-custbody_seiu_qualifying_funds;
            var adjustNONQualifyingFund=custbody_local_non_qualifying_fund-custbody_seiu_non_qualifying_funds;

            var qualifyingCD = currRecord.getValue({
                fieldId: "custbody_qualifying_cd"
            });

            var nonQualifyingCD = currRecord.getValue({
                fieldId: "custbody_cd_non_qualifying"
            });

            var holdCD = currRecord.getValue({
                fieldId: "custbody_cd_hold_acc"
            });

            var customerId = getcustomerDetails(currRecord.getValue({
                fieldId: "custbody_local_customer"
            }));

            var localCustomer = currRecord.getValue({
                fieldId: "custbody_local_customer"
            });

            var year = currRecord.getValue({
                fieldId: "custbodycope_year"
            });

            var custbody_adjustment_qual_vb = currRecord.getValue({
                fieldId: "custbody_adjustment_qual_vb"
            });

            var custbody_adj_qualifying_cash_deposit = currRecord.getValue({
                fieldId: "custbody_adj_qualifying_cash_deposit"
            });

            var custbody_adj_nonqualifying_vendor_bill = currRecord.getValue({
                fieldId: "custbody_adj_nonqualifying_vendor_bill"
            });

            var custbody_adj_noqualifying_cash_deposit = currRecord.getValue({
                fieldId: "custbody_adj_noqualifying_cash_deposit"
            });

            debugger;

            if (qualifyingCD && adjustQualifyingFund>0 && !custbody_adj_noqualifying_cash_deposit && !custbody_adj_nonqualifying_vendor_bill) {

                var cdObj = getCdData(qualifyingCD,customerId);

                var adjustmentRecordList = [];
                adjustmentRecordList.push({
                    Fields: {
                        CashDeposit: qualifyingCD,
                        Record: "Non-Qualifying",
                        postingDate: cdObj.postingDate,
                        PrimaryAttachment: cdObj.PrimaryAttachment,
                        Memo: cdObj.headerMemo,
                        LocalCustomer: localCustomer,
                        AdjustmentAmount: adjustQualifyingFund,
                        TransmittalID: currRecord.id,
                        PaymentMethod: cdObj.paymentMethod,
                        Year: year,
                        originBatchId : cdObj.cdBatchId
                    },
                });

                log.debug("adjustmentRecordList", adjustmentRecordList);
                createdAdjustmentTranList =
                    adjustment.CreateAdjustmentTransactions(adjustmentRecordList);

                log.debug("createdAdjustmentTranList", createdAdjustmentTranList);
                log.debug("transLines[j].copeId", currRecord.id);

                if (createdAdjustmentTranList.length > 0) {
                    // record.submitFields({
                    //     type: "customtransaction108",
                    //     id: currRecord.id,
                    //     values: {
                    //         "custbody_adj_noqualifying_cash_deposit": createdAdjustmentTranList[0].cashDeposit,
                    //         "custbody_adj_nonqualifying_vendor_bill": createdAdjustmentTranList[0].vendorBill,
                    //     },
                    // });

                    currRecord.setValue({
                        fieldId: "custbody_adj_noqualifying_cash_deposit",
                        value: createdAdjustmentTranList[0].cashDeposit
                    });

                    currRecord.setValue({
                        fieldId: "custbody_adj_nonqualifying_vendor_bill",
                        value: createdAdjustmentTranList[0].vendorBill
                    });
                }
                log.debug("Non-Qualifying process for adjutment done");
            }// end qualifying adjustment

            if (nonQualifyingCD && adjustNONQualifyingFund>0 && !custbody_adj_qualifying_cash_deposit && !custbody_adjustment_qual_vb) {

                var cdObj = getCdData(nonQualifyingCD,customerId);
                var adjustmentRecordList = [];
                adjustmentRecordList.push({
                    Fields: {
                        CashDeposit: nonQualifyingCD,
                        Record: "Qualifying",
                        postingDate: cdObj.postingDate,
                        PrimaryAttachment: cdObj.PrimaryAttachment,
                        Memo: cdObj.headerMemo,
                        LocalCustomer: localCustomer,
                        AdjustmentAmount: adjustQualifyingFund,
                        TransmittalID: currRecord.id,
                        PaymentMethod: cdObj.paymentMethod,
                        Year: year,
                        originBatchId : cdObj.cdBatchId
                    },
                });

                log.debug("adjustmentRecordList", adjustmentRecordList);
                createdAdjustmentTranList =
                    adjustment.CreateAdjustmentTransactions(adjustmentRecordList);

                log.debug("createdAdjustmentTranList", createdAdjustmentTranList);
                log.debug("transLines[j].copeId", currRecord.id);

                if (createdAdjustmentTranList.length > 0) {
                    // record.submitFields({
                    //     type: "customtransaction108",
                    //     id: currRecord.id,
                    //     values: {
                    //         "custbody_adj_qualifying_cash_deposit": createdAdjustmentTranList[0].cashDeposit,
                    //         "custbody_adjustment_qual_vb": createdAdjustmentTranList[0].vendorBill,
                    //     },
                    // });

                    currRecord.setValue({
                        fieldId: "custbody_adj_qualifying_cash_deposit",
                        value: createdAdjustmentTranList[0].cashDeposit
                    });

                    currRecord.setValue({
                        fieldId: "custbody_adjustment_qual_vb",
                        value: createdAdjustmentTranList[0].vendorBill
                    });

                }
                log.debug("Qualifying process done");
            }// end non-qualifying adjustment
        }
        log.debug("Adjustment call process end...");
        return true;
    }

    
    // provide important data from the main cash deposit which is attached during "submit to SEIU" status.
    function getCdData(depositId,customerId){
        var cdRecord = record.load({
            type: "customtransaction_cd_101",
            id: depositId
        });

        // var headerMemo = cdRecord.getValue({
        //     fieldId: "memo"
        // });

        // var postingDate = cdRecord.getValue({
        //     fieldId: "trandate"
        // });

        // var PrimaryAttachment = cdRecord.getValue({
        //     fieldId: "custbody_prim_attach"
        // });

        var transactionIndex = cdRecord.findSublistLineWithValue({
            sublistId: "line",
            fieldId: "entity",
            value: customerId
        });

        var method = 0;

        if (transactionIndex != -1) {

            method = cdRecord.getSublistValue({
                sublistId: "line",
                fieldId: "custcol_cd_pay_meth",
                line: transactionIndex
            });


        } else {
            customerId = "";
        }

       return {
            headerMemo : cdRecord.getValue({
                fieldId: "memo"
            }),
            postingDate : cdRecord.getValue({
                fieldId: "trandate"
            }),
            PrimaryAttachment : cdRecord.getValue({
                fieldId: "custbody_prim_attach"
            }),
            paymentMethod : method,
            cdBatchId : cdRecord.getValue({
                fieldId: "custbody_batch_id"
            })
        }
    }

    return {
        onAction: runAdjustment
    }
});


//