(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "name",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "crn",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "subject",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "level",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "semester",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "days",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "startTime", // A time represented in seconds
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "endTime", // A time represented in seconds
            dataType: tableau.dataTypeEnum.int
        }];

        var tableSchema = {
            id: "utcClassData",
            alias: "UTC Class Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        $.getJSON("/tableauSource/data", function(resp) {
            var tableData = [];

            // Iterate over the JSON object
            for (var i = 0, len = resp.length; i < len; i++) {
                tableData.push({
                    "name": resp[i].name,
                    "crn": resp[i].crn,
                    "subject": resp[i].subject,
                    "level": resp[i].level,
                    "semester": resp[i].semester,
                    "days": resp[i].days,
                    "startTime": resp[i].startTime,
                    "endTime": resp[i].endTime
                });
            }

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "UTC Class Data"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();