
const StudentIDLinkURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmd5jBGrtYuCC1wOHTQL8xgYTPvvN7P4p9mtLdL8b2OSRmha8k7f7uzP5lwbqlms-C-sOWX7FiKeqi/pub?gid=1662341462&single=true&output=csv';
const PointsTallyURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmd5jBGrtYuCC1wOHTQL8xgYTPvvN7P4p9mtLdL8b2OSRmha8k7f7uzP5lwbqlms-C-sOWX7FiKeqi/pub?gid=1490874261&single=true&output=csv';

let enableScanning = true;

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

    var StudentData = {
        ID: StudentID,
        Name: "",
        GradeLevel: "",
        Points: 0,
    };

    let StudentName, Gradelevel;
    for (let element of StudentDataResponseArray) {
        if (element[0] == StudentID) {
            StudentName = element[1];
            Gradelevel = element[2];
            break;
        }
    }
    // Student Number Not Found
    if (!StudentName) {
        return null;
    }
    StudentData.Name = StudentName;
    StudentData.GradeLevel = Gradelevel;

    let Points;
    for (let element of PointsResponseArray) {
        if (element[0] == StudentName) {
            Points = element[3];
        }
    }
    StudentData.Points = Points;
    return StudentData;
}

let width = $('#reader').width();
let studentID;

$("#DataLoadingElement").hide();


    Html5Qrcode.getCameras()
    .then((devices) => {
        if (devices && devices.length) {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCode
                .start({
                        facingMode: "environment"
                    }, {
                        fps: 10, // Optional, frame per seconds for qr code scanning
                        qrbox: {
                            width: width / 2,
                            height: width / 2
                        }, // Optional, if you want bounded box UI
                    },
                    async (decodedText, decodedResult) => {
                        // do something when code is read
                        if (!enableScanning) return;
                        enableScanning = false;
                        window.scrollTo(0, document.body.scrollHeight);
                        $("#StudentID").text(decodedText);
                        $("#DataLoadingElement").show();
                        let data = await GetData(decodedText)
                        if (data == null){
                            $("#StudentName").text("Not Found")
                            $("#GradeLevel").text("Not Found")
                            $("#Points").text("Points: NA")
                        }
                        else{
                            studentID = decodedText;
                            $("#StudentName").text(data.Name)
                            $("#GradeLevel").text(data.GradeLevel)
                            $("#Points").text("Points: "+data.Points)
                        }
                        $("#DataLoadingElement").hide();
                        enableScanning = true;
                    },
                    (errorMessage) => {
                        // parse error, ignore it.
                    }
                )
                .catch((err) => {
                    // Start failed, handle it.
                });
        }
    })
    .catch((err) => {
        // handle err
    });


$("#clear").click(() =>{
    window.scrollTo(0, 0);
    $("#StudentID").text("Student ID");
    $("#StudentName").text("Student Name")
    $("#GradeLevel").text("Grade Level")
    $("#Points").text("Points: ")
})