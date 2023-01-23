const StudentIDLinkURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmd5jBGrtYuCC1wOHTQL8xgYTPvvN7P4p9mtLdL8b2OSRmha8k7f7uzP5lwbqlms-C-sOWX7FiKeqi/pub?gid=1662341462&single=true&output=csv';
const PointsTallyURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmd5jBGrtYuCC1wOHTQL8xgYTPvvN7P4p9mtLdL8b2OSRmha8k7f7uzP5lwbqlms-C-sOWX7FiKeqi/pub?gid=1490874261&single=true&output=csv';

let enableScanning = true;
let currentCameraFacingMode = "environment";
const html5QrCode = new Html5Qrcode("reader");

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

function StartCam() {


    Html5Qrcode.getCameras()
        .then((devices) => {
            if (devices && devices.length) {
                html5QrCode
                    .start({
                            facingMode: currentCameraFacingMode
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
                                if (data == null) {
                                    $("#StudentName").text("Not Found")
                                    $("#GradeLevel").text("Not Found")
                                    $("#Points").text("Points: NA")
                                } else {
                                    studentID = decodedText;
                                    $("#StudentName").text(data.Name)
                                    $("#GradeLevel").text(data.GradeLevel)
                                    $("#Points").text("Points: " + ((data.Points) ? data.Points : "0"))
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
}

$("#clear").click(() => {
    clearData();
})

function clearData(){
    studentID = null;
    window.scrollTo(0, 0);
    $("#StudentID").text("Student ID");
    $("#StudentName").text("Student Name")
    $("#GradeLevel").text("Grade Level")
    $("#Points").text("Points: ")
}


$("#next").click(() => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSfTOZ4zApoVthqg5Edd1eDg2w4eEnEh_snqw16yQt6fM48F-w/viewform?usp=pp_url&entry.1337812519=0&entry.439262867=" + studentID, '_blank');
})

function SubmitPassword() {

    let today = new Date();

    if ($("#PasswordInput").val() == today.getDate()){
        $("#PasswordScreen").hide();
        StartCam();
    }
    else{
        $("#PasswordInput").val("")
    }

}

$("#ChangeCamera").click(() => {    

    currentCameraFacingMode = currentCameraFacingMode == "environment" ? "user" : "environment";

    html5QrCode.stop().then((ignore) => {
        StartCam()
    }).catch((err) => {
        // Stop failed, handle it.
    });
});

function RecordAttendance(Session) {
    if(!studentID) return;

    let Option;

    switch (Session) {
        case "8AM":
            Option = "8:30am+Service";
            break;
        case "11AM":
            Option = "11:00am+Service";
            break;
        case "YouthHub":
            Option = "Youth+Hub";
            break;
        case "Saturday":
            Option = "Saturday+Fellowship";
            break;
    }

    const url='https://docs.google.com/forms/d/e/1FAIpQLSfTOZ4zApoVthqg5Edd1eDg2w4eEnEh_snqw16yQt6fM48F-w/formResponse?usp=pp_url&entry.439262867='+studentID+'&entry.1776706079='+Option+'&entry.1337812519=0&submit=Submit';

    $("#iframeForm").attr("src",url);

    $("#Points").text("Attendance recorded")

    setTimeout(() => {
        clearData();
    }, 2000);

}
