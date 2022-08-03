/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@author Sagar Kumar.
 *@description Check the default department on PO and if approver is inactive find new Default department approver and set ther on make copy.
 */
define(["N/record","N/search"], function (record,search) {

  function beforeSubmit(context) {
    debugger;
    const currRecord = context.newRecord;

    // const currRecord = record.load({
    //     type:record.Type.PURCHASE_ORDER,
    //     id: 286307,
    //     isDynamic: true
    // });
    
    const totalItemLinse = currRecord.getLineCount({
      sublistId: "item",
    });

    if (totalItemLinse > 0) {
      for (
        let itemlineIndex = 0;
        itemlineIndex < totalItemLinse;
        itemlineIndex++
      ) {
        // const element = array[itemlineIndex];
        const depApproverId = currRecord.getSublistValue({
          sublistId: "item",
          fieldId: "custcol_nsts_gaw_col_approver",
          line: itemlineIndex,
        });

        if (depApproverId) {
          let isinactive =  checkEmployStatus(depApproverId);

          log.debug("isinactive",isinactive);

          if (isinactive == true) {
            const currentDepartment = currRecord.getSublistValue({
              sublistId: "item",
              fieldId: "department",
              line: itemlineIndex,
            });

            log.debug("currentDepartment",currentDepartment);
            
            let departmentRecord = record.load({
              type: record.Type.DEPARTMENT,
              id: currentDepartment,
            });

            let approver = departmentRecord.getValue({
              fieldId: "custrecord_nsts_gaw_deptapprover",
            });

            log.debug("approver",approver);

            let isApproverInactive  = checkEmployStatus(approver);

            if(isApproverInactive){
              throw("Approver is inactivate of department");
            }

            currRecord.setSublistValue({
              sublistId: "item",
              fieldId: "department",
              line: itemlineIndex,
              value: approver,
            });
          }
        }
      }
    }

    // /custcol_nsts_gaw_col_approver
  }

  function checkEmployStatus(depApproverId){
    let depApproverIdisinactive = search.lookupFields({
      type: "employee",
      id: depApproverId,
      columns: "isinactive",
    });

    log.debug({
      title: "depApproverIdisinactive",
      details: depApproverIdisinactive
    });

    return depApproverIdisinactive.isinactive;
  }

  return {
    // beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    // afterSubmit: afterSubmit,
  };
});
