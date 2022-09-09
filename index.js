/**
 * Create a calculator by:
 * 1. creating a <form /> with a specified id="my-calculator-id" that contains the input fields you need
 * 2. use a <output /> field for your calculated result
 * 3. add a <script/> section in the footer of the <body/> section in your html where you call makeCalculator().
 *    - The first argument is the id of your calculator form
 *    - The second argument is a callback function that receives two arguments: the input (object) and the output (text value). 
 *      This callback function should return a valid FHIR Observation that with a valueQuantity that contains the result.
 *
 * Example for BMI: 
 * 
 * <script>
 *    makeCalculator(
 *      "my-calculator-id",
 *      function (input, output) {
 *        const observation = {
 *          resourceType: "Observation",
 *          code: {
 *            text: "BMI"
 *          },
 *          valueQuantity: {
 *            value: parseFloat(output.value),
 *            unit: "kg/m²",
 *            code: "kg/m2",
 *            system: "http://unitsofmeasure.org"
 *          }
 *        };
 *        return observation;
 *      },
 *      { autoSave: true }
 *    );
 * </script>
 **/
console.debug(
  "******************************\n* Tiro.health Calc-connector *\n******************************"
);

function getFormInputOutput(event) {
  var formElement = event.currentTarget;
  if (!formElement instanceof HTMLFormElement) {
    console.warn(
      "Invalid submissions. Submission target is not a form but a",
      event.currentTarget
    );
    return;
  }
  var formData = new FormData(formElement);
  var inputData = Object.fromEntries(formData.entries());
  var output = Array.from(formElement.elements).find(
    (elem) => elem instanceof HTMLOutputElement
  );
  return [inputData, output];
}

function makeCalculator(calculatorId, callback, options = {}) {
  const { autoSave } = options;
  console.debug("> Creating calculator with options:", options);
  try {
    var url_string = window.location.href.toLocaleLowerCase();
    var url = new URL(url_string);
    var params = url.searchParams;
  } catch (err) {
    console.debug("Issues with Parsing URL Parameters");
  }
  console.debug("> Prepopulating fields with params", params);

  for (const [key, value] of params.entries()) {
    $(`form#calculator input[name=${key}]`).val(value);
  }
  $("#calculator").trigger("input");
  $("#calculator").on("submit", function (event) {
    event.preventDefault();
    var [input, output] = getFormInputOutput(event);
    var result = callback(input, output);
    if (window.parent) {
      console.debug("> Result submitted to parent.");
      window.parent.postMessage(result, "*");
    }
  });
  if (autoSave) {
    $("form#calculator").submit()
    console.debug("> AutoSave enabled.");
    $("form#calculator").on("input", function (event) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    });
  }
}
