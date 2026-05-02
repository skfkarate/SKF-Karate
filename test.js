const studentDob = '2018-11-09';
let inputVerification = '09/11/2018';
const dateParts = inputVerification.split(/[\/\-]/);
if (dateParts.length === 3 && dateParts[0].length === 2 && dateParts[2].length === 4) {
  inputVerification = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
}
console.log(inputVerification === studentDob);
