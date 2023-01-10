// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '445178186003-dp5f3lfoftk4nnhomsedk70r9j54dn63.apps.googleusercontent.com';
const API_KEY = 'AIzaSyD7JnbLKyJ8tV8bp_4oUWejdfeDunkzM0c';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
        handleAuthClick();
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').style.visibility = 'hidden';
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({
            prompt: 'consent'
        });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({
            prompt: ''
        });
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('content').innerText = '';
        document.getElementById('authorize_button').style.visibility = 'visible';
        document.getElementById('signout_button').style.visibility = 'hidden';
    }
}

async function GetData(StudentID) {
    let PointsResponse, StudentDataResponse;
    try {
        PointsResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1odCE3FBFdUptnrye4d7PptB7MWV9ELOjdhEN4KJorEk',
            range: 'PointsTally',
        });
        StudentDataResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1odCE3FBFdUptnrye4d7PptB7MWV9ELOjdhEN4KJorEk',
            range: 'StudentData',
        });
    } catch (err) {
        console.log(err.message);
        return;
    }
    const StudentDatarange = StudentDataResponse.result;
    if (!StudentDatarange || !StudentDatarange.values || StudentDatarange.values.length == 0) {
        console.log('No values found.');
        return;
    }
    const Pointsrange = PointsResponse.result;
    if (!Pointsrange || !Pointsrange.values || Pointsrange.values.length == 0) {
        console.log('No values found.');
        return;
    }
    let StudentName;
    for (let index = 0; index < StudentDatarange.values.length; index++) {
        const element = StudentDatarange.values[index];
        if (element[0] == StudentID){
            StudentName = element[1];
            break;
        }
    }
    //Student Number Not Found
    if (!StudentName){
        document.getElementById('content').innerText = "No Data";
    }
    console.log(StudentName)
    
    for (let index = 0; index < Pointsrange.values.length; index++) {
        const element = Pointsrange.values[index];
        if (element[0] == StudentName){
            document.getElementById('content').innerText = "Name: " + element[0] + " Points: " + element[3]
        }
    }
}

$("#GetUserData").click(() => {
    GetData($("#StudentID").val())
})