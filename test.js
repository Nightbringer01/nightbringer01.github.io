
const StudentIDLinkURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmd5jBGrtYuCC1wOHTQL8xgYTPvvN7P4p9mtLdL8b2OSRmha8k7f7uzP5lwbqlms-C-sOWX7FiKeqi/pub?gid=1662341462&single=true&output=csv';
const PointsTallyURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmd5jBGrtYuCC1wOHTQL8xgYTPvvN7P4p9mtLdL8b2OSRmha8k7f7uzP5lwbqlms-C-sOWX7FiKeqi/pub?gid=1490874261&single=true&output=csv';

document.getElementById('GoToGForm').style.visibility = 'hidden';

async function GetData(StudentID) {
    let PointsResponse, StudentDataResponse;
    try {
        StudentDataResponse = await fetch(StudentIDLinkURL)
        .then((response) => {
          return response.text(); // data into json
        });
        
        PointsResponse = await fetch(PointsTallyURL)
        .then((response) => {
          return response.text(); // data into json
        });

    } catch (err) {
        console.log(err.message);
        return;
    }
 
    let StudentDataResponseArray = StudentDataResponse.split("\r\n").map(function (line) {
        return line.split(",");
    });
    let PointsResponseArray = PointsResponse.split("\r\n").map(function (line) {
        return line.split(",");
    });

    if (!StudentDataResponseArray || StudentDataResponseArray.length == 0) {
        console.log('No values found.');
        return;
    }
    if (!PointsResponseArray || PointsResponseArray.length == 0) {
        console.log('No values found.');
        return;
    }
    let StudentName;
    for (let element of StudentDataResponseArray) {
        if (element[0] == StudentID){
            StudentName = element[1];
            break;
        }
    }
    // Student Number Not Found
    if (!StudentName){
        document.getElementById('content').innerText = "No Data";
    }
    console.log(StudentName)
    
    for (let element of PointsResponseArray) {
        if (element[0] == StudentName){
            document.getElementById('content').innerText = "Name: " + element[0] + " Points: " + element[3]
        }
    }
}