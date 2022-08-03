/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
/*******************************************************************************
 * 
 * 
 * 
 * *******************************************************************
 */
define(['N/record','N/ui/serverWidget'],

function(record,serverWidget) {

	// Function definition to be triggered before Load.

	function beforeLoad(context) {
		
	    var depositRecord = context.newRecord;
        var fundType = depositRecord.getValue('custbody_seiu_cd_fundtype')
      
        log.debug("fundType", fundType);
      
      if(fundType)
      {
		debugger;
		context.form.addButton({
				id: "custpage_bt_cope_adjustment",
				label: "Adjustment",
				functionName: "onButtonClick"
			});
		context.form.clientScriptModulePath = "./SEIU_CS_Cope_Adjustment.js";		
      }	
		
     
    }
   
	return {
		beforeLoad : beforeLoad
	};

});