const fs = require('fs');
const _ = require('lodash');

const csvFilePath = './WA_Fn-UseC_-Telco-Customer-Churn.csv';

const csv = fs.readFileSync(csvFilePath).toString();
const lines = csv.split('\r\n');

const keyNameString = lines.splice(0, 1);
const features = keyNameString[0].split(',');
console.log(features);
console.log(lines[1]);

let nn_data = [];

// Male : 0, Female :  1
// False : 0, True : 1 ('no service' is set to 'false')
// Month-to-month : 0, One year : 0.75 , Two year : 1
// PaymentMethod - auto : 1, check : 0
let features_tf = ['Partner', 'Dependents', 'PhoneService', 'MultipleLines', 'OnlineSecurity',
    'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies', 'PaperlessBilling', 'Churn'];

_.forEach(lines, function (line) {
    let attrs = line.split(',');

    let inputs = [];
    let outputs = [];
    _.forEach(attrs, function (attr, i) {
        let feat = features[i];
        let inputVal = undefined;

        if (feat === 'gender') {
            inputVal = attr === 'FeMale' ? 1 : 0;
        }

        else if (features_tf.indexOf(feat) > -1) {
            inputVal = attr === 'Yes' ? 1 : 0;
        }

        else if (feat === 'tenure') {
            inputVal = attr / 72;
        }

        else if (feat === 'InternetService') {
            if (attr === 'Fiber optic') {
                inputVal = 0.5;
            } else if (attr === 'DSL') {
                inputVal = 1;
            } else {
                inputVal = 0;
            }
        }

        else if (feat === 'Contract') {
            if (attr === 'Month-to-month') {
                inputVal = 0;
            } else if (attr === 'One year') {
                inputVal = 0.75;
            } else {
                inputVal = 1;
            }
        }

        else if (feat === 'PaymentMethod') {
            if (attr === 'Bank transfer (automatic)' || attr === 'Credit card (automatic)') {
                inputVal = 1;
            } else {
                inputVal = 0;
            }
        }

        else if (feat === 'MonthlyCharges') {
            inputVal = attr / 119;
        }

        else if (feat === 'TotalCharges') {
            inputVal = attr / 8690;
        }



        if (inputVal !== undefined && feat !== 'Churn') {
            inputs.push(inputVal);
        } else if (feat === 'Churn') {
            outputs.push(inputVal);
        }
    });
    nn_data.push({ 'input': inputs, 'output': outputs });
});


fs.writeFileSync('./churn_data_for_nn.json', JSON.stringify(nn_data));


