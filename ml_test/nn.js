/**
 train : { error: 0.13800386938587228, iterations: 1000, time: 17797 }
 test  : { tp: 244, fn: 116, fp: 340, tn: 1413 }
    accuracy    :  0.7841930903928065
    precision   :  0.4178082191780822
    recall      :  0.6777777777777778
 */
// npm install synaptic
const _ = require('lodash');
const fs = require('fs');
const synaptic = require('synaptic');


// DATA (read, shuffle and split)
const filePath = './data/churn_data_for_nn.json';
let json_arr = JSON.parse(fs.readFileSync(filePath));
json_arr = shuffle(json_arr);
const data_slice_point = parseInt(json_arr.length * 0.7);
const trainingSet = json_arr.slice(0, data_slice_point);
const testSet = json_arr.slice(data_slice_point, json_arr.length);


// NN model
const Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;


function MultilayerPerceptron(input, hiddens, output) {
    // create the layers
    const inputLayer = new Layer(input);
    const hiddenLayers = [];
    for (let i = 0; i < hiddens.length; i++) {
        hiddenLayers[i] = new Layer(hiddens[i]);
    }
    const outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayers[0]);
    for (let i = 0; i < hiddens.length - 1; i++) {
        hiddenLayers[i].project(hiddenLayers[i + 1]);
    }
    hiddenLayers[hiddens.length - 1].project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: hiddenLayers,
        output: outputLayer
    });
}

// extend the prototype chain
MultilayerPerceptron.prototype = new Network();

// making model
const numOfFeatures = trainingSet[0].input.length;
const numOfTarget = trainingSet[0].output.length;
const model = new MultilayerPerceptron(numOfFeatures, [13, 9], numOfTarget);
const trainer = new Trainer(model);

// train
const train_result = trainer.train(trainingSet, {
    iterations: 1000,
    error: .01
});
console.log(train_result);

// test
const confusion_matrix = getConfusionMatrix(model, testSet);
console.log(confusion_matrix);
console.log("accuracy : ",
    (confusion_matrix['tp'] + confusion_matrix['tn']) / (confusion_matrix['tp'] + confusion_matrix['tn'] + confusion_matrix['fp'] + confusion_matrix['fn'] ));
console.log("precision : ",
    (confusion_matrix['tp']) / (confusion_matrix['tp'] + confusion_matrix['fp']));
console.log("recall : ",
    (confusion_matrix['tp']) / (confusion_matrix['tp'] + confusion_matrix['fn']));


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


function getConfusionMatrix(model, testSet) {
    let confusion_matrix = {
        'tp': 0,
        'fn': 0,
        'fp': 0,
        'tn': 0,
    };

    _.forEach(testSet, function (testData) {
        let actual = testData.output[0];
        let predict = Math.round(model.activate(testData.input)[0]);


        if (actual === 1 && predict === 1) {
            confusion_matrix['tp']++;
        } else if (actual === 1 && predict === 0) {
            confusion_matrix['fp']++;
        } else if (actual === 0 && predict === 1) {
            confusion_matrix['fn']++;
        } else if (actual === 0 && predict === 0) {
            confusion_matrix['tn']++;
        }
    });

    return confusion_matrix;
}