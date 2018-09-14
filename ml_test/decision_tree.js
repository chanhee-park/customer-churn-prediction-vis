// 70 ~ 75 %
/**
 { tp: 47, tn: 1521, fn: 494, fp: 51 }
 accuracy   :  0.742 ( T/F 가리지 않고 정답 비율 )
 precision  :  0.479 ( 떠난다고 한 고객중 실제로 떠난 비율 )
 recall     :  0.086 ( 떠나는 고객이 떠날 거라고 맞추는 비율 )
 */

// npm install decision-tree
const _ = require('lodash');
const csv = require('csvtojson');
const DecisionTree = require('decision-tree');

const csvFilePath = './data/WA_Fn-UseC_-Telco-Customer-Churn.csv';

csv().fromFile(csvFilePath)
    .then((json_arr) => {
        // split data
        json_arr = shuffle(json_arr);
        const data_slice_point = parseInt(json_arr.length * 0.7);
        const training_data = json_arr.slice(0, data_slice_point);
        const test_data = json_arr.slice(data_slice_point, json_arr.length);

        // set features
        const class_name = "Churn";
        let features = _.keys(training_data[0]);
        features = remove(features, class_name);
        features = remove(features, "customerID");

        // make decision tree
        const dt = new DecisionTree(training_data, class_name, features);

        // get confusion matrix
        const confusion_matrix = getConfusionMatrix(dt, test_data, class_name);
        console.log(confusion_matrix);
        console.log("accuracy : ",
            (confusion_matrix['tp'] + confusion_matrix['tn']) / (confusion_matrix['tp'] + confusion_matrix['tn'] + confusion_matrix['fp'] + confusion_matrix['fn'] ));
        console.log("precision : ",
            (confusion_matrix['tp']) / (confusion_matrix['tp'] + confusion_matrix['fp']));
        console.log("recall : ",
            (confusion_matrix['tp']) / (confusion_matrix['tp'] + confusion_matrix['fn']));

        // show tree information
        // const treeModel = dt.toJSON();
        // console.log(treeModel)
    });


function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function remove(arr, value) {
    _.remove(arr, function (item) {
        return item === value;
    });
    return arr;
}

function getConfusionMatrix(dt, test_data, class_name) {
    let confusion_matrix = {
        'tp': 0,
        'tn': 0,
        'fn': 0,
        'fp': 0,
    };

    _.forEach(test_data, function (value) {
        let predicted_class = dt.predict(value);
        let actual_class = value[class_name];

        // console.log(predicted_class, actual_class);

        if (predicted_class === "Yes" && actual_class === "Yes") {
            confusion_matrix['tp']++;
        } else if (predicted_class === "Yes" && actual_class === "No") {
            confusion_matrix['fp']++;
        } else if (predicted_class === "No" && actual_class === "Yes") {
            confusion_matrix['fn']++;
        } else if (predicted_class === "No" && actual_class === "No") {
            confusion_matrix['tn']++;
        }
    });

    return confusion_matrix;
}