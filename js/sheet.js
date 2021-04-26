const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let Twitter = require('twitter');
require('dotenv').config();

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), main);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const sheetId = process.env.sheet_id;

let tw = new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});

function main (auth) {
    const sheets = google.sheets({version: 'v4'});
    const stream = tw.stream('statuses/filter', {'track':'#ブルーリボン賞'});

    stream.on('data', data => {
        try {
            let at = data.created_at;
            let text = data.text;
            let name = data.user.name;
            let ary = [[at, name, text]];
            const request = {
                // The ID of the spreadsheet to update.
                spreadsheetId: sheetId,  // TODO: Update placeholder value.
            
                // The A1 notation of a range to search for a logical table of data.
                // Values are appended after the last row of the table.
                range: 'test_sheet',  // TODO: Update placeholder value.
            
                // How the input data should be interpreted.
                valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.
            
                // How the input data should be inserted.
                insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.
            
                resource: {
                  // TODO: Add desired properties to the request body.
                  values : ary
                },
            
                auth: auth,
              };

              try {
                sheets.spreadsheets.values.append(request).data;
                console.log("書き込みが正常に終了しました");
              } catch (err) {
                console.error(err);
              }

        } catch (error) {
            console.log(error);
        }
    });
  }
//   main();