let sheetData = [];
let jsonResult = null;

// 요소
const csvFile = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

const mappingSection = document.getElementById("mappingSection");

const companySelect = document.getElementById("companySelect");
const numberSelect = document.getElementById("numberSelect");
const nameSelect = document.getElementById("nameSelect");
const phoneSelect = document.getElementById("phoneSelect");

const convertBtn = document.getElementById("convertBtn");

const resultSection = document.getElementById("resultSection");
const resultInfo = document.getElementById("resultInfo");

const previewSection = document.getElementById("previewSection");
const preview = document.getElementById("preview");

const downloadBtn = document.getElementById("downloadBtn");


// ---------------------------
// 한셀(.cell) 파일 열기
// ---------------------------
csvFile.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    fileName.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const data = new Uint8Array(e.target.result);

            const workbook = XLSX.read(data, {
                type: "array"
            });

            const sheetName = workbook.SheetNames[0];

            const sheet = workbook.Sheets[sheetName];

            sheetData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                defval: "",
                blankrows: false
            });

            if (sheetData.length < 2) {
                alert("데이터가 없습니다.");
                return;
            }

            createSelectOptions();

            mappingSection.style.display = "block";

        }
        catch (err) {

            console.error(err);

            alert("한셀 파일을 읽을 수 없습니다.");

        }

    };

    reader.readAsArrayBuffer(file);

});


// ---------------------------
// 콤보박스 생성
// ---------------------------
function createSelectOptions() {

    const selects = [
        numberSelect,
        nameSelect,
        phoneSelect
    ];

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    selects.forEach(select => {

        select.innerHTML = "";

        letters.forEach((letter, index) => {

            const option = document.createElement("option");

            option.value = index;
            option.textContent = letter;

            select.appendChild(option);

        });

    });

}

// ---------------------------
// JSON 변환
// ---------------------------
convertBtn.addEventListener("click", function () {

    const numberIndex = Number(numberSelect.value);
    const nameIndex = Number(nameSelect.value);
    const phoneIndex = Number(phoneSelect.value);

    const soldiers = [];
    
    for (let i = 1; i < sheetData.length; i++) {

        const row = sheetData[i];

        if (!row) continue;

        const company = companySelect.value;

        const number = String(row[numberIndex] ?? "").trim();

        const name = String(row[nameIndex] ?? "").trim();

        const phone = String(row[phoneIndex] ?? "")
            .replace(/\D/g, "");

        if (
            company === "" &&
            number === "" &&
            name === ""
        ) {
            continue;
        }

        soldiers.push({

            company: company,

            number: number.padStart(3, "0"),

            name: name,

            phone: phone,

            position: ""

        });

    }

    jsonResult = {
        soldiers: soldiers
    };

    preview.textContent = JSON.stringify(jsonResult, null, 2);

    resultInfo.textContent =
        `총 ${soldiers.length}명이 변환되었습니다.`;

    previewSection.style.display = "block";

    resultSection.style.display = "block";

});


// ---------------------------
// 다운로드
// ---------------------------
downloadBtn.addEventListener("click", function () {

    if (!jsonResult) return;

    const json = JSON.stringify(jsonResult, null, 2);

    const blob = new Blob(
        [json],
        {
            type: "application/json;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "data.json";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

});