let sheetData = [];
let jsonResult = null;

// 요소
const csvFile = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

const mappingSection = document.getElementById("mappingSection");

const companySelect = document.getElementById("companySelect");
const numberSelect = document.getElementById("numberSelect");
const nameSelect = document.getElementById("nameSelect");
const brithSelect = document.getElementById("brithSelect");

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

            if (typeof XLSX === "undefined") {
                throw new Error("엑셀/한셀 분석 라이브러리(SheetJS)가 로드되지 않았습니다. 페이지를 새로고침하거나 네트워크 연결을 확인해 주세요.");
            }

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

            alert("한셀 파일을 읽을 수 없습니다.\n오류 내용: " + err.message);

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
        brithSelect
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
    const birthIndex = Number(brithSelect.value);

    const soldiers = [];
    
    for (let i = 1; i < sheetData.length; i++) {

        const row = sheetData[i];

        if (!row) continue;

        const company = companySelect.value;

        const number = String(row[numberIndex] ?? "").trim();

        const name = String(row[nameIndex] ?? "").trim();

        const birth = String(row[birthIndex] ?? "")
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

            birth: birth,

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
